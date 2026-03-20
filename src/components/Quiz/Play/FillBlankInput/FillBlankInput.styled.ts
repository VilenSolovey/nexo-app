import styled from 'styled-components/native';

export const Container = styled.View`
  gap: 12px;
`;

export const Label = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSecondary};
`;

export const Input = styled.TextInput`
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  border-width: 2px;
  border-color: ${({ theme }) => theme.cardBorder};
  min-height: 60px;
`;

export const HintBox = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(251, 191, 36, 0.2);
  padding: 12px;
  border-radius: 12px;
  margin-top: 12px;
  gap: 8px;
`;

export const HintText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  flex: 1;
`;
