import styled from 'styled-components/native';

export const DotsRow = styled.View`
  flex-direction: row;
  flex-wrap: nowrap;
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
  width: ${(p: DotProps) => (p.active ? 24 : 8)}px;
  height: 8px;
  border-radius: ${(p: DotProps) => (p.active ? 12 : 4)}px;
  background-color: ${(p: DotProps) => {
    if (p.completed || p.active) return p.activeColor || p.theme.accent;
    return 'rgba(255, 255, 255, 0.2)';
  }};
  opacity: ${(p: DotProps) => (p.active || p.completed ? 1 : 0.5)};
`;
