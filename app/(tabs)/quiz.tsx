import React, { useState } from 'react';
import { QuizType } from '@nexo/types/quiz.types';
import { useAllQuizzes } from '@nexo/hooks/useAllQuizzes';
import { QuizLayout } from '@nexo/components/Quiz/QuizLayout';
import { QuizSearchBar } from '@nexo/components/Quiz/QuizSearchBar';
import { QuizFilterTabs } from '@nexo/components/Quiz/QuizFilterTabs';
import { QuizCard } from '@nexo/components/Quiz/QuizCard';
import { Header, HeaderTitle, ScrollContent, LoadingText } from '@nexo/components/Quiz/Quiz.styled';

export default function QuizzesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  console.log('Search Query:', searchQuery);
  const [selectedType, setSelectedType] = useState<QuizType | 'all'>('all');
  const { quizzes, loading, error } = useAllQuizzes()

  const handleQuizPress = (quizId: string) => {
    // TODO: Navigate to quiz screen
    console.log('Quiz pressed:', quizId)
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesType = selectedType === `all` || quiz.type === selectedType;
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

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

      <ScrollContent>
        {loading ? (
          <LoadingText>Завантажується...</LoadingText>
        ) : error ? (
          <LoadingText>Помилка: {error}</LoadingText>
        ) : quizzes.length === 0 ? (
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
    </QuizLayout>
  );
}
