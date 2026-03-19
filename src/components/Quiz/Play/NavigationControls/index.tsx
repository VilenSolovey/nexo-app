import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@nexo/constants/theme';
import { Container, BackButton, BackText, NextButton, NextText } from './NavigationControls.styled';

interface NavigationControlsProps {
  currentIndex: number;
  isLastQuestion: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function NavigationControls({
  currentIndex,
  isLastQuestion,
  onBack,
  onNext,
}: NavigationControlsProps) {
  return (
    <Container>
      {currentIndex > 0 && (
        <BackButton onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={Theme.text} />
        </BackButton>
      )}
      <NextButton onPress={onNext}>
        <NextText>{isLastQuestion ? 'Завершити' : 'Далі'}</NextText>
      </NextButton>
    </Container>
  );
}
