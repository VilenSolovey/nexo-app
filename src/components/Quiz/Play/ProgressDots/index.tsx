import React from 'react';
import { useAppTheme } from '@nexo/contexts/AppThemeProvider';
import {
  CompactProgressFill,
  CompactProgressText,
  CompactProgressTrack,
  CompactProgressWrap,
  DotsRow,
  Dot,
} from './ProgressDots.styled';

interface ProgressDotsProps {
  total: number;
  current: number;
  activeColor?: string;
}

const MAX_DOTS_BEFORE_COMPACT = 16;

export function ProgressDots({ total, current, activeColor }: ProgressDotsProps) {
  const theme = useAppTheme();
  const color = activeColor ?? theme.accent;
  const safeTotal = Math.max(0, total);
  const safeCurrent = Math.min(Math.max(0, current), Math.max(0, safeTotal - 1));
  const progressPercent = safeTotal > 0 ? ((safeCurrent + 1) / safeTotal) * 100 : 0;

  if (safeTotal > MAX_DOTS_BEFORE_COMPACT) {
    return (
      <CompactProgressWrap>
        <CompactProgressTrack>
          <CompactProgressFill
            activeColor={color}
            style={{ width: `${progressPercent}%` }}
          />
        </CompactProgressTrack>
        <CompactProgressText>
          {safeCurrent + 1}/{safeTotal}
        </CompactProgressText>
      </CompactProgressWrap>
    );
  }

  return (
    <DotsRow>
      {Array.from({ length: safeTotal }).map((_, i) => (
        <Dot
          key={i}
          active={i === safeCurrent}
          completed={i < safeCurrent}
          activeColor={i === safeCurrent ? color : undefined}
        />
      ))}
    </DotsRow>
  );
}
