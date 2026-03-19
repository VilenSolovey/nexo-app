import styled from 'styled-components/native';
import { Theme } from '@nexo/constants/theme';

export const OptionsContainer = styled.View`
  gap: 12px;
`;

export const OptionButton = styled.TouchableOpacity<{ $selected: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ $selected }) => $selected ? 'rgba(111,219,202,0.1)' : Theme.cardBackground};
  border-radius: 16px;
  padding: 16px;
  border-width: 2px;
  border-color: ${({ $selected }) => $selected ? Theme.accent : Theme.cardBorder};
`;

export const RadioCircle = styled.View<{ $selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${({ $selected }) => $selected ? Theme.accent : Theme.textSecondary};
  margin-right: 12px;
  justify-content: center;
  align-items: center;
`;

export const RadioInner = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${Theme.accent};
`;

export const OptionText = styled.Text<{ $selected: boolean }>`
  font-size: 16px;
  color: ${({ $selected }) => $selected ? Theme.accent : Theme.text};
  font-weight: ${({ $selected }) => $selected ? '600' : '400'};
  flex: 1;
`;
