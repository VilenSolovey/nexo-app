import styled from 'styled-components/native';

export const Container = styled.View`
  flex-direction: row;
  gap: 12px;
`;

export const TFButton = styled.TouchableOpacity<{ $selected: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  padding: 24px;
  border-width: 2px;
  border-color: ${({ $selected, theme }) => $selected ? theme.accent : theme.cardBorder};
  gap: 12px;
`;

export const TFText = styled.Text<{ $selected: boolean }>`
  font-size: 18px;
  font-weight: bold;
  color: ${({ $selected, theme }) => $selected ? theme.text : theme.textSecondary};
`;
