import styled from 'styled-components/native';

export const Card = styled.View`
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  shadow-color: #000;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  shadow-offset: 0px 8px;
  elevation: 3;
`;

export const CardHeader = styled.View`
  margin-bottom: 18px;
`;

export const TypeChip = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(111, 219, 202, 0.2);
  padding-horizontal: 14px;
  padding-vertical: 8px;
  border-radius: 999px;
  align-self: flex-start;
  border-width: 1px;
  border-color: rgba(111, 219, 202, 0.24);
`;

export const TypeChipText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.accent};
  font-weight: 700;
  margin-left: 8px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

export const QuestionText = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  line-height: 36px;
  letter-spacing: -0.3px;
`;
