import React from 'react';
import { ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@nexo/constants/theme';
import {
  CountBadge,
  CountBadgeText,
  Panel,
  PowerUpButton,
  PowerUpIcon,
  PowerUpLabel,
} from '@nexo/components/Quiz/Play/PowerUpsPanel/PowerUpsPanel.styled';

interface PowerUp {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface PowerUpsPanelProps {
  availablePowerUps: PowerUp[];
  usedPowerUps: string[];
  unavailablePowerUps?: string[];
  onUsePowerUp: (id: string) => void;
}

export function PowerUpsPanel({
  availablePowerUps,
  usedPowerUps,
  unavailablePowerUps = [],
  onUsePowerUp,
}: PowerUpsPanelProps) {
  if (availablePowerUps.length === 0) return null;

  return (
    <Panel>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {availablePowerUps.map((powerUp) => {
          const used = usedPowerUps.includes(powerUp.id);
          const unavailable = unavailablePowerUps.includes(powerUp.id);
          const disabled = used || unavailable;
          return (
            <PowerUpButton
              key={powerUp.id}
              onPress={() => onUsePowerUp(powerUp.id)}
              disabled={disabled}
              $disabled={disabled}
            >
              <CountBadge>
                <CountBadgeText>{powerUp.count}</CountBadgeText>
              </CountBadge>
              <PowerUpIcon $used={used} $disabled={unavailable}>
                <Ionicons
                  name={powerUp.icon as any}
                  size={20}
                  color={disabled ? Theme.textTertiary : Theme.accent}
                />
              </PowerUpIcon>
              <PowerUpLabel $used={used} $disabled={unavailable}>
                {powerUp.name.split(' ')[0]}
              </PowerUpLabel>
            </PowerUpButton>
          );
        })}
      </ScrollView>
    </Panel>
  );
}
