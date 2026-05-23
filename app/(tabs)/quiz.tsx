import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { QuizType, Quiz } from '@nexo/types/quiz.types';
import { useAllQuizzes } from '@nexo/hooks/useAllQuizzes';
import { QuizLayout } from '@nexo/components/Quiz/Discovery/QuizLayout';
import { QuizSearchBar } from '@nexo/components/Quiz/Discovery/QuizSearchBar';
import { QuizFilterTabs } from '@nexo/components/Quiz/Discovery/QuizFilterTabs';
import { QuizCard } from '@nexo/components/Quiz/Discovery/QuizCard';
import { QuizStartModal } from '@nexo/components/Quiz/Discovery/QuizStartModal';
import { useAuth } from '@nexo/contexts/AuthProvider';
import { useUserQuizProgress } from '@nexo/hooks/useUserQuizProgress';
import { Header, HeaderTitle, ScrollContent, LoadingText } from '@nexo/components/Quiz/Discovery/Quiz.styled';
import { RefreshControl } from 'react-native'
import { Theme } from '@nexo/constants/theme'
import { shouldShowQuizInRecent } from '@nexo/utils/quiz-progress';

export default function QuizzesScreen() {
  const { userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedType, setSelectedType] = useState<QuizType | 'all'>('all');
  const { quizzes, loading: quizzesLoading, error: quizzesError, refetch: refetchQuizzes } = useAllQuizzes(userId)
  const {
    progressMap,
    loading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useUserQuizProgress(userId)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isInitialDataReady, setIsInitialDataReady] = useState(false)

  const handleQuizPress = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setShowModal(true);
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQuiz(null);
  }

  const pullToRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchQuizzes?.(),
        refetchProgress?.(),
      ])
    } finally {
      setIsRefreshing(false)
    }
  } 

  const filteredQuizzes = quizzes.filter(quiz => {
    const progress = progressMap.get(quiz.id)
    const shouldHideFromAvailable = shouldShowQuizInRecent({
      progress,
      createdAt: quiz.createdAt,
    })
    const matchesType = selectedType === `all` || quiz.type === selectedType;
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch && !shouldHideFromAvailable;
  });

  useEffect(() => {
    if (!quizzesLoading && !progressLoading) {
      setIsInitialDataReady(true)
    }
  }, [progressLoading, quizzesLoading])

  const shouldShowInitialLoading = !isInitialDataReady && (quizzesLoading || progressLoading)
  const resolvedError = quizzesError ?? progressError

  useFocusEffect(
    React.useCallback(() => {
      refetchQuizzes()
      refetchProgress()
    }, [refetchProgress, refetchQuizzes]),
  )

  return (
    <QuizLayout>
      <Header>
        <HeaderTitle>Вікторини</HeaderTitle>
      </Header>

      <QuizSearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <QuizFilterTabs 
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      <ScrollContent
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={pullToRefresh}
            tintColor={Theme.primary}
            colors={[Theme.primary]}
          />
        }
      >
        {shouldShowInitialLoading ? (
          <LoadingText>Завантажується...</LoadingText>
        ) : resolvedError ? (
          <LoadingText>Помилка: {resolvedError}</LoadingText>
        ) : filteredQuizzes.length === 0 ? (
          <LoadingText>Немає доступних вікторин</LoadingText>
        ) : (
          filteredQuizzes.map((quiz) => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz}
              onPress={handleQuizPress}
            />
         ))
        
        )
      }
      </ScrollContent>
      
      <QuizStartModal
        visible={showModal}
        quiz={selectedQuiz}
        progress={selectedQuiz ? progressMap.get(selectedQuiz.id) ?? null : null}
        onClose={handleCloseModal}
      />
    </QuizLayout>
  );
}
