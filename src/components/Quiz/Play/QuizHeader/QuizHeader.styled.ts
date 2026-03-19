import styled from 'styled-components/native';
import { Theme } from '@nexo/constants/theme';

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 20px;
  padding-top: 16px;
  padding-bottom: 12px;
  column-gap: 12px;
`;

export const HeaderSide = styled.View`
  width: 72px;
  align-items: flex-start;
`

export const QuitButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(239, 68, 68, 0.2);
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: rgba(239, 68, 68, 0.28);
`;

export const ProgressContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const TimerWrap = styled.View`
  width: 72px;
  align-items: flex-end;
`

export const TimerBadge = styled.View`
  min-width: 72px;
  height: 44px;
  padding-horizontal: 12px;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.06);
  border-width: 1px;
  border-color: ${Theme.cardBorder};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  column-gap: 6px;
`

export const TimerText = styled.Text`
  color: ${Theme.text};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
`
