import React, { useMemo, useState, useEffect } from 'react';
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SHOP_ITEMS } from '@nexo/constants/shop';
import { Theme } from '@nexo/constants/theme';

import { useAuth } from '@nexo/contexts/AuthProvider';
import { doc, updateDoc, arrayRemove, increment } from 'firebase/firestore';
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
  const [usedQuestionPowerUps, setUsedQuestionPowerUps] = useState<string[]>([]);
  const [usedQuizPowerUps, setUsedQuizPowerUps] = useState<string[]>([]);
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const userInventory = useMemo(() => userProfile?.inventory ?? [], [userProfile?.inventory]);
  const userConsumables = useMemo(
    () => userProfile?.consumables ?? {},
    [userProfile?.consumables],
  );
  const [coinsBoostMultiplier, setCoinsBoostMultiplier] = useState(1);
  const [expBoostMultiplier, setExpBoostMultiplier] = useState(1);
  const [luckyCharmActive, setLuckyCharmActive] = useState(false);

 
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
  const currentHint = currentQuestion?.hint ?? currentQuestion?.explanation ?? undefined
  const availablePowerUps = React.useMemo(
    () =>
      SHOP_ITEMS.filter((item) => item.type !== 'cosmetic')
        .map((item) => {
          const count = Number(userConsumables[item.id] ?? 0) + (userInventory.includes(item.id) ? 1 : 0)

          return {
            id: item.id,
            name: item.name,
            icon: item.icon,
            count,
          }
        })
        .filter((item) => item.count > 0),
    [userConsumables, userInventory],
  );
  const unavailablePowerUps = useMemo(() => {
    const disabled: string[] = []

    if (!currentHint) {
      disabled.push('hint_reveal')
    }

    const supportsFiftyFifty =
      (normalizedQuestionType === 'multiple_choice' || normalizedQuestionType === 'single_answer') &&
      Array.isArray(currentQuestion?.options) &&
      currentQuestion.options.length > 2

    if (!supportsFiftyFifty) {
      disabled.push('fifty_fifty')
    }

    return disabled
  }, [currentHint, currentQuestion?.options, normalizedQuestionType])

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
    if (!userId) return;

    const currentCount = Number(userConsumables[powerUpId] ?? 0)
    const hasLegacyConsumable = userInventory.includes(powerUpId)

    if (currentCount <= 0 && !hasLegacyConsumable) {
      Alert.alert('Предмет недоступний', 'Спочатку купіть цей предмет у магазині.')
      return
    }

    if (unavailablePowerUps.includes(powerUpId)) {
      if (powerUpId === 'fifty_fifty') {
        Alert.alert('Недоступно', '50/50 працює тільки на питаннях з варіантами відповіді.')
      } else if (powerUpId === 'hint_reveal') {
        Alert.alert('Недоступно', 'Для цього питання окремої підказки немає.')
      }
      return
    }

    const isQuizScopedPowerUp = ['double_coins', 'double_exp', 'lucky_charm'].includes(powerUpId)
    const alreadyUsed = isQuizScopedPowerUp
      ? usedQuizPowerUps.includes(powerUpId)
      : usedQuestionPowerUps.includes(powerUpId)

    if (alreadyUsed) {
      Alert.alert('Вже використано', 'Цей предмет уже активований у поточному квізі.')
      return
    }

    try {
      switch (powerUpId) {
        case 'hint_reveal':
          if (currentHint) {
            if (normalizedQuestionType === 'fill_blank') {
              setShowHint(true);
            } else {
              Alert.alert(
                luckyCharmActive ? 'Посилена підказка' : 'Підказка',
                currentHint,
              );
            }
          } else {
            Alert.alert('Підказка', 'Для цього питання окремої підказки поки немає.')
          }
          break;
          
        case 'fifty_fifty':
          if (
            (normalizedQuestionType === 'multiple_choice' || normalizedQuestionType === 'single_answer') &&
            currentQuestion.options
          ) {
            const correctAnswer = getCorrectAnswerValue(currentQuestion);
            const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
            const incorrectOptions = currentQuestion.options.filter((opt: string) => !correctAnswers.includes(opt));
            const removeCount = luckyCharmActive ? 3 : 2;
            const toRemove = incorrectOptions.slice(0, removeCount);
            setRemovedOptions(toRemove);
          }
          break;
          
        case 'skip_question':
          handleNext(true);
          break;

        case 'time_freeze':
          setTimeLeft((prev) => prev + 30);
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

        case 'double_coins':
          setCoinsBoostMultiplier(2);
          Alert.alert('Бустер активовано', 'Монети за цей квіз будуть подвоєні.')
          break;

        case 'double_exp':
          setExpBoostMultiplier(2);
          Alert.alert('Бустер активовано', 'EXP за цей квіз буде подвоєний.')
          break;

        case 'lucky_charm':
          setLuckyCharmActive(true);
          Alert.alert('Талісман активовано', 'Підказки і 50/50 стануть сильнішими в цьому квізі.')
          break;

      }


      const userRef = doc(db, 'users', userId);
      await updateDoc(
        userRef,
        currentCount > 0
          ? {
              [`consumables.${powerUpId}`]: increment(-1),
            }
          : {
              inventory: arrayRemove(powerUpId),
            },
      );
      
      await refreshUserProfile();
      if (isQuizScopedPowerUp) {
        setUsedQuizPowerUps((prev) => [...prev, powerUpId]);
      } else {
        setUsedQuestionPowerUps((prev) => [...prev, powerUpId]);
      }
      
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
      setUsedQuestionPowerUps([]);
    }
  };
  

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowHint(false);
      setRemovedOptions([]);
      setUsedQuestionPowerUps([]);
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
        coinsBoostMultiplier: String(coinsBoostMultiplier),
        expBoostMultiplier: String(expBoostMultiplier),
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
            hint={currentHint}
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

        <PowerUpsPanel
          availablePowerUps={availablePowerUps}
          usedPowerUps={[...usedQuestionPowerUps, ...usedQuizPowerUps]}
          unavailablePowerUps={unavailablePowerUps}
          onUsePowerUp={usePowerUp}
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
