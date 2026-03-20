import React, { useState, useEffect } from 'react';
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '@nexo/constants/theme';

import { useAuth } from '@nexo/contexts/AuthProvider';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@nexo/services/firebase';
import { getQuizById } from '@nexo/services/quiz.service';
import { getQuizProgress } from '@nexo/services/progress.service';
import { isQuizCompleted, MAX_QUIZ_ATTEMPTS } from '@nexo/utils/quiz-progress';
import { getQuizDurationSeconds } from '@nexo/utils/quiz-time';
import { QuizHeader } from '@nexo/components/Quiz/Play/QuizHeader';
import { PowerUpsPanel } from '@nexo/components/Quiz/Play/PowerUpsPanel';
import { QuestionCard } from '@nexo/components/Quiz/Play/QuestionCard';
import { MultipleChoiceOptions } from '@nexo/components/Quiz/Play/MultipleChoiceOptions';
import { TrueFalseOptions } from '@nexo/components/Quiz/Play/TrueFalseOptions';
import { FillBlankInput } from '@nexo/components/Quiz/Play/FillBlankInput';
import { NavigationControls } from '@nexo/components/Quiz/Play/NavigationControls';
import { SafeArea, ScrollContent } from '@nexo/components/Quiz/Play/QuizPlay.styled';

export default function QuizPlayScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userProfile, refreshUserProfile } = useAuth();
  const userId = userProfile?.uid ?? userProfile?.id;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedOption, setSelectedOption] = useState<string | boolean | string[] | null>(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [usedPowerUps, setUsedPowerUps] = useState<string[]>([]);
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const userInventory = userProfile?.inventory || [];
 
  const [quiz, setQuiz] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const currentSavedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestionIndex === quiz?.questions?.length - 1;
  const totalQuizTime = quiz ? getQuizDurationSeconds(quiz) : 0;
  const normalizedQuestionType = String(currentQuestion?.type || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');

  const getCorrectAnswerValue = (question: any) => {
    if (question?.correctAnswer !== undefined) {
      return question.correctAnswer;
    }

    if (
      Array.isArray(question?.correctOptionIndexes) &&
      Array.isArray(question?.options)
    ) {
      return question.correctOptionIndexes
        .map((index: number) => question.options[index])
        .filter((value: string | undefined) => value !== undefined);
    }

    if (
      Array.isArray(question?.options) &&
      typeof question?.correctOptionIndex === 'number'
    ) {
      return question.options[question.correctOptionIndex];
    }

    return undefined;
  };

  const isAnswerProvided = (answer: any) => {
    if (typeof answer === 'boolean') return true;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === 'string') return answer.trim().length > 0;
    return answer !== undefined && answer !== null;
  };

  const isCorrectAnswer = (question: any, userAnswer: any) => {
    const correctAnswer = getCorrectAnswerValue(question);

    if (correctAnswer === undefined || userAnswer === undefined || userAnswer === null) {
      return false;
    }

    const normalizedType = String(question?.type || '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    if (normalizedType === 'multiple_choice') {
      const selectedAnswers = Array.isArray(userAnswer) ? [...userAnswer].sort() : [userAnswer];
      const normalizedCorrectAnswers = Array.isArray(correctAnswer)
        ? [...correctAnswer].sort()
        : [correctAnswer];

      if (selectedAnswers.length !== normalizedCorrectAnswers.length) {
        return false;
      }

      return selectedAnswers.every((answer, index) => answer === normalizedCorrectAnswers[index]);
    }

    if (normalizedType === 'fill_blank' || normalizedType === 'single_answer') {
      return String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
    }

    return userAnswer === correctAnswer;
  };

  const answersRef = React.useRef<Record<string, any>>({});
  answersRef.current = answers;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getQuizById(String(id))
      .then(setQuiz)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!quiz?.id || !userId) return;

    getQuizProgress(userId, quiz.id)
      .then((progress) => {
        if (!isQuizCompleted(progress?.attempts ?? 0)) return;

        Alert.alert(
          'Квіз вже завершено',
          `Для цього квізу вже використано ${MAX_QUIZ_ATTEMPTS} спроби.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/quiz'),
            },
          ],
        );
      })
      .catch((progressError) => {
        console.error('Failed to load quiz progress:', progressError);
      });
  }, [quiz?.id, userId, router]);

  useEffect(() => {
    if (!currentQuestion) return;

    const savedAnswer = answers[currentQuestion.id];

    if (normalizedQuestionType === 'fill_blank') {
      setFillBlankAnswer(typeof savedAnswer === 'string' ? savedAnswer : '');
      setSelectedOption(null);
      return;
    }

    setFillBlankAnswer('');
    setSelectedOption(savedAnswer ?? null);
  }, [answers, currentQuestion]);

  const usePowerUp = async (powerUpId: string) => {
    
    if (!userProfile?.uid) return;

    try {
      switch (powerUpId) {
        case 'hint_reveal':
          setShowHint(true);
          break;
          
        case 'fifty_fifty':
          if (normalizedQuestionType === 'multiple_choice' && currentQuestion.options) {
            const correctAnswer = getCorrectAnswerValue(currentQuestion);
            const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
            const incorrectOptions = currentQuestion.options.filter((opt: string) => !correctAnswers.includes(opt));
            const toRemove = incorrectOptions.slice(0, 2);
            setRemovedOptions(toRemove);
          }
          break;
          
        case 'skip_question':
          
          handleNext(true);
          break;
          
        case 'answer_reveal':
          {
            const answer = getCorrectAnswerValue(currentQuestion);
            const answerText = Array.isArray(answer) ? answer.join(', ') : String(answer);

            Alert.alert(
              '💡 Правильна відповідь',
              answerText,
              [{ text: 'Зрозуміло' }]
            );
          }
          break;
      }


      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        inventory: arrayRemove(powerUpId),
      });
      
      await refreshUserProfile();
      setUsedPowerUps([...usedPowerUps, powerUpId]);
      
    } catch (error) {
      console.error('PowerUp error:', error);
    }
  };

  const handleAnswer = (answer: any) => {
    if (normalizedQuestionType === 'multiple_choice') {
      setAnswers(prev => {
        const currentSelection = Array.isArray(prev[currentQuestion.id]) ? prev[currentQuestion.id] : [];
        const nextAnswer = currentSelection.includes(answer)
          ? currentSelection.filter((item: string) => item !== answer)
          : [...currentSelection, answer];

        return {
          ...prev,
          [currentQuestion.id]: nextAnswer
        };
      });
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    setSelectedOption(answer);
  };

  const handleNext = (isSkipped = false) => {
    let finalAnswer;
    if (isSkipped) {
      finalAnswer = getCorrectAnswerValue(currentQuestion);
    } else if (normalizedQuestionType === 'fill_blank') {
      finalAnswer = fillBlankAnswer;
    } else if (normalizedQuestionType === 'multiple_choice') {
      finalAnswer = Array.isArray(currentSavedAnswer) ? currentSavedAnswer : [];
    } else {
      finalAnswer = selectedOption;
    }

    if (!isAnswerProvided(finalAnswer) && !isSkipped) {
      Alert.alert('Увага', 'Будь ласка, оберіть або введіть відповідь');
      return;
    }

    const mergedAnswers = { ...answers, [currentQuestion.id]: finalAnswer };
    setAnswers(mergedAnswers);
    answersRef.current = mergedAnswers;

    if (isLastQuestion) {
      finishQuiz(mergedAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowHint(false);
      setRemovedOptions([]);
    }
  };
  

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowHint(false);
      setRemovedOptions([]);
    }
  };

  const getCurrentDraftAnswer = () => {
    if (!currentQuestion) return undefined;

    if (normalizedQuestionType === 'fill_blank') {
      return fillBlankAnswer.trim().length > 0 ? fillBlankAnswer : undefined;
    }

    if (normalizedQuestionType === 'multiple_choice') {
      return Array.isArray(currentSavedAnswer) && currentSavedAnswer.length > 0
        ? currentSavedAnswer
        : undefined;
    }

    return selectedOption ?? undefined;
  };

  const buildAnswersSnapshot = () => {
    if (!currentQuestion) return answers;

    const draftAnswer = getCurrentDraftAnswer();
    if (!isAnswerProvided(draftAnswer)) {
      return answers;
    }

    return {
      ...answers,
      [currentQuestion.id]: draftAnswer,
    };
  };

  const countCorrectAnswers = (finalAnswers: Record<string, any>) => {
    let correctCount = 0;

    quiz.questions.forEach((q: any) => {
      const userAnswer = finalAnswers[q.id];
      if (userAnswer === undefined || userAnswer === null) return;
      if (isCorrectAnswer(q, userAnswer)) correctCount++;
    });

    return correctCount;
  };

  const openResultScreen = (params: {
    finalAnswers: Record<string, any>
    timeExpired?: boolean
    quitEarly?: boolean
    forceFailed?: boolean
  }) => {
    const { finalAnswers, timeExpired = false, quitEarly = false, forceFailed = false } = params;
    const correctCount = countCorrectAnswers(finalAnswers);
    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = !forceFailed && percentage === 100;
    const timeSpent = Math.max(totalQuizTime - timeLeft, 0);

    router.replace({
      pathname: '/quiz.result',
      params: {
        quizId: quiz.id,
        correct: String(correctCount),
        total: String(totalQuestions),
        passed: passed ? 'true' : 'false',
        timeExpired: timeExpired ? 'true' : 'false',
        quitEarly: quitEarly ? 'true' : 'false',
        timeSpent: String(timeSpent),
      },
    });
  };

  const finishQuiz = (finalAnswers: Record<string, any>) => {
    openResultScreen({ finalAnswers });
  };

  const handleQuit = () => {
    Alert.alert(
      'Вийти з вікторини?',
      'Це буде зараховано як завершена спроба без нагороди.',
      [
        { text: 'Продовжити', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: () => {
            const finalAnswers = buildAnswersSnapshot();
            openResultScreen({
              finalAnswers,
              quitEarly: true,
              forceFailed: true,
            });
          },
        },
      ]
    );
  };

  const renderQuestion = () => {
    switch (normalizedQuestionType) {
      case 'single_answer':
        return (
          <MultipleChoiceOptions
            options={currentQuestion.options ?? []}
            removedOptions={removedOptions}
            selectedOption={typeof currentSavedAnswer === 'string' ? currentSavedAnswer : null}
            selectedOptions={[]}
            multiSelect={false}
            onSelect={handleAnswer}
          />
        );

      case 'multiple_choice':
        return (
          <MultipleChoiceOptions
            options={currentQuestion.options ?? []}
            removedOptions={removedOptions}
            selectedOption={null}
            selectedOptions={Array.isArray(currentSavedAnswer) ? currentSavedAnswer : []}
            multiSelect
            onSelect={handleAnswer}
          />
        );

      case 'true_false':
        return (
          <TrueFalseOptions
            selectedOption={selectedOption as boolean | null}
            onSelect={handleAnswer}
          />
        );

   
      case 'fill_blank':
        return (
          <FillBlankInput
            value={fillBlankAnswer}
            onChange={setFillBlankAnswer}
            type={currentQuestion.type}
            showHint={showHint}
            explanation={currentQuestion.explanation}
          />
        );

      default:
        return null;
    }
  };
  useEffect(() => {
    if (!quiz) return;
    const totalTime = getQuizDurationSeconds(quiz);
    setTimeLeft(totalTime);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          openResultScreen({
            finalAnswers: answersRef.current,
            timeExpired: true,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz]);
  
    if (loading) {
      return (
        <LinearGradient colors={[Theme.background, Theme.card]} style={{ flex: 1 }}>
          <SafeArea>
            <Text>Завантаження...</Text>
          </SafeArea>
        </LinearGradient>
      )
    }

  return (
    <LinearGradient colors={[Theme.background, Theme.card]} style={{ flex: 1 }}>
      <SafeArea>

        <QuizHeader
          currentIndex={currentQuestionIndex}
          total={quiz.questions.length}
          onQuit={handleQuit}
          timeLeft={timeLeft}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollContent>
            <QuestionCard
              question={currentQuestion.question}
              type={currentQuestion.type}
            />

            {renderQuestion()}
          </ScrollContent>
        </KeyboardAvoidingView>

        <NavigationControls
          currentIndex={currentQuestionIndex}
          isLastQuestion={isLastQuestion}
          onBack={handleBack}
          onNext={() => handleNext(false)}
        />
      </SafeArea>
    </LinearGradient>
  );
}
