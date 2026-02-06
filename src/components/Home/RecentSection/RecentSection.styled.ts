import { Appearance } from "react-native"
import styled from "styled-components/native"
import { Theme } from "@nexo/constants/theme"
import { QuizCard, StatusPill } from "@nexo/components/Home/HomeLayout";


export const NameWrap = styled.View`
  margin-left: 12px;
`;

export const SectionHeader = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${Theme.text};
`;

export const SeeAll = styled.Text`
  color: ${Theme.primary};
  font-weight: 600;
`;

export const QuizTitle = styled.Text`
  font-weight: 700;
  color: ${Theme.text};
`;

export const QuizLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const QuizIcon = styled.View<{ type?: 'trial' | 'spark' }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: ${({ type }) =>
    type === 'trial' ? 'rgba(111, 219, 202, 0.2)' : 'rgba(255, 107, 53, 0.2)'};
`;

export const StatusDone = styled(StatusPill)`
  background-color: #dff5e4;
`;

export const StatusIncomplete = styled(StatusPill)`
  background-color: #fff3df;
`;

export const StatusText = styled.Text`
  font-weight: 700;
`;

export const RecentCard = styled(QuizCard)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-vertical: 6px;
  shadow-color: #000;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  shadow-offset: 0px 4px;
  elevation: 2;
`;
