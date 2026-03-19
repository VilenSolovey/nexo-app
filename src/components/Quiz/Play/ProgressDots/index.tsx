import React from 'react';
import { DotsRow, Dot } from './ProgressDots.styled';
import { Theme } from '@nexo/constants/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
  activeColor?: string;
}

export function ProgressDots({ total, current, activeColor = Theme.accent }: ProgressDotsProps) {
  return (
    <DotsRow>
      {Array.from({ length: total }).map((_, i) => (
        <Dot
          key={i}
          active={i === current}
          completed={i < current}
          activeColor={i === current ? activeColor : undefined}
        />
      ))}
    </DotsRow>
  );
}
