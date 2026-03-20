import styled from 'styled-components/native';

export const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  flex-direction: row;
  padding: 30px;
  background-color: ${({ theme }) => theme.background};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.cardBorder};
  gap: 12px;
`;

export const BackButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  padding-vertical: 16px;
  padding-horizontal: 24px;
  gap: 8px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`;

export const BackText = styled.Text`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

export const NextButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.accent};
  border-radius: 12px;
  padding-vertical: 16px;
  gap: 8px;
`;

export const NextText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.card};
`;
