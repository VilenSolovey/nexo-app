import { styled } from 'styled-components/native';

export const Panel = styled.View`
  background-color: ${({ theme }) => theme.cardBackground};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.cardBorder};
  padding-vertical: 12px;
`;

export const PanelContent = styled.View`
  padding-horizontal: 20px;
  gap: 12px;
  flex-direction: row;
`;

export const PowerUpButton = styled.TouchableOpacity<{ $disabled?: boolean }>`
  align-items: center;
  gap: 4px;
  position: relative;
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`;

export const PowerUpIcon = styled.View<{ $used: boolean; $disabled?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ $used, $disabled }) =>
    $used || $disabled ? 'rgba(255,255,255,0.1)' : 'rgba(111,219,202,0.2)'};
  justify-content: center;
  align-items: center;
  border-width: 2px;
  border-color: ${({ $used, $disabled, theme }) =>
    $used || $disabled ? theme.cardBorder : theme.accent};
  opacity: ${({ $used, $disabled }) => ($used || $disabled ? 0.5 : 1)};
`;

export const PowerUpLabel = styled.Text<{ $used: boolean; $disabled?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $used, $disabled, theme }) => ($used || $disabled ? theme.textTertiary : theme.text)};
`;

export const CountBadge = styled.View`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  padding-horizontal: 5px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.primary};
  border-width: 2px;
  border-color: ${({ theme }) => theme.cardBackground};
`;

export const CountBadgeText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 10px;
  font-weight: 800;
`;
