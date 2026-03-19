import styled from 'styled-components/native';
import { Theme } from '@nexo/constants/theme';

export const Container = styled.View`
  flex-direction: row;
  gap: 12px;
`;

export const TFButton = styled.TouchableOpacity<{ $selected: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${Theme.cardBackground};
  border-radius: 16px;
  padding: 24px;
  border-width: 2px;
  border-color: ${({ $selected }) => $selected ? Theme.accent : Theme.cardBorder};
  gap: 12px;
`;

export const TFText = styled.Text<{ $selected: boolean }>`
  font-size: 18px;
  font-weight: bold;
  color: ${({ $selected }) => $selected ? Theme.text : Theme.textSecondary};
`;
