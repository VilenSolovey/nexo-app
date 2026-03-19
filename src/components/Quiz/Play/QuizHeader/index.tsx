import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@nexo/constants/theme';
import {
  Header,
  HeaderSide,
  QuitButton,
  ProgressContainer,
  TimerWrap,
  TimerBadge,
  TimerText,
} from './QuizHeader.styled';
import { ProgressDots } from '@nexo/components/Quiz/Play/ProgressDots';

interface QuizHeaderProps {
  currentIndex: number
  total: number
  onQuit: () => void
  timeLeft: number
}

export function QuizHeader({ currentIndex, total, onQuit, timeLeft }: QuizHeaderProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <Header>
      <HeaderSide>
        <QuitButton onPress={onQuit}>
          <Ionicons name="close" size={22} color={Theme.error} />
        </QuitButton>
      </HeaderSide>

      <ProgressContainer>
        <ProgressDots total={total} current={currentIndex} />
      </ProgressContainer>

      <TimerWrap>
        <TimerBadge>
          <Ionicons name="time-outline" size={16} color={Theme.accent} />
          <TimerText>{formattedTime}</TimerText>
        </TimerBadge>
      </TimerWrap>
    </Header>
  );
}
