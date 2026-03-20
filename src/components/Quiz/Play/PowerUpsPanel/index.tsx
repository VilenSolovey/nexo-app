import React from 'react';
import { ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@nexo/constants/theme';
import { Panel, PowerUpButton, PowerUpIcon, PowerUpLabel } from './PowerUpsPanel.styled';

interface PowerUp {
  id: string;
  name: string;
  icon: string;
}

interface PowerUpsPanelProps {
  availablePowerUps: PowerUp[];
  usedPowerUps: string[];
  onUsePowerUp: (id: string) => void;
}

export function PowerUpsPanel({ availablePowerUps, usedPowerUps, onUsePowerUp }: PowerUpsPanelProps) {
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
          return (
            <PowerUpButton key={powerUp.id} onPress={() => onUsePowerUp(powerUp.id)} disabled={used}>
              <PowerUpIcon $used={used}>
                <Ionicons
                  name={powerUp.icon as any}
                  size={20}
                  color={used ? Theme.textTertiary : Theme.accent}
                />
              </PowerUpIcon>
              <PowerUpLabel $used={used}>{powerUp.name.split(' ')[0]}</PowerUpLabel>
            </PowerUpButton>
          );
        })}
      </ScrollView>
    </Panel>
  );
}
