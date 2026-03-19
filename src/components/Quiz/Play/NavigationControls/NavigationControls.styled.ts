import styled from 'styled-components/native';
import { Theme } from '@nexo/constants/theme';

export const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  flex-direction: row;
  padding: 30px;
  background-color: ${Theme.background};
  border-top-width: 1px;
  border-top-color: ${Theme.cardBorder};
  gap: 12px;
`;

export const BackButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${Theme.cardBackground};
  border-radius: 12px;
  padding-vertical: 16px;
  padding-horizontal: 24px;
  gap: 8px;
  border-width: 1px;
  border-color: ${Theme.cardBorder};
`;

export const BackText = styled.Text`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: ${Theme.text};
`;

export const NextButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${Theme.accent};
  border-radius: 12px;
  padding-vertical: 16px;
  gap: 8px;
`;

export const NextText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${Theme.card};
`;
