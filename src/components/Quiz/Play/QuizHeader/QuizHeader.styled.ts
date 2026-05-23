import styled from 'styled-components/native';

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 16px;
  padding-top: 16px;
  padding-bottom: 12px;
  column-gap: 10px;
`;

export const HeaderSide = styled.View`
  width: 86px;
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
  width: 86px;
  align-items: flex-end;
`

export const TimerBadge = styled.View`
  width: 86px;
  height: 44px;
  padding-horizontal: 10px;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.06);
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  column-gap: 6px;
`

export const TimerText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  font-variant: tabular-nums;
`
