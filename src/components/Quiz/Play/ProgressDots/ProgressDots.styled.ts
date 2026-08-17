import styled from 'styled-components/native';

export const DotsRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

interface DotProps {
  active: boolean;
  completed: boolean;
  activeColor?: string;
}

export const Dot = styled.View<DotProps>`
  width: ${({ active }) => (active ? 24 : 8)}px;
  height: 8px;
  border-radius: ${({ active }) => (active ? 12 : 4)}px;
  background-color: ${({ active, activeColor, completed, theme }) => {
    if (completed || active) return activeColor || theme.accent;
    return 'rgba(255, 255, 255, 0.2)';
  }};
  opacity: ${({ active, completed }) => (active || completed ? 1 : 0.5)};
`;

export const CompactProgressWrap = styled.View`
  width: 100%;
  max-width: 150px;
  align-items: center;
  gap: 6px;
`

export const CompactProgressTrack = styled.View`
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.16);
`

export const CompactProgressFill = styled.View<{ activeColor: string }>`
  height: 100%;
  min-width: 8px;
  border-radius: 999px;
  background-color: ${({ activeColor }) => activeColor};
`

export const CompactProgressText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 11px;
  line-height: 13px;
  font-weight: 800;
  font-variant: tabular-nums;
`
