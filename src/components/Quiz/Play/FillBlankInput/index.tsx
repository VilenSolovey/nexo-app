import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@nexo/constants/theme';
import { Container, Label, Input, HintBox, HintText } from './FillBlankInput.styled';

interface FillBlankInputProps {
  value: string;
  onChange: (text: string) => void;
  type: string; 
  showHint: boolean;
  hint?: string;
}

export function FillBlankInput({ value, onChange, type, showHint, hint }: FillBlankInputProps) {
  const normalized = String(type || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const isFill = normalized === 'fill_blank' || normalized.includes('fill');

  return (
    <Container>
      <Label>
        {isFill ? 'Заповніть пропуск:' : 'Введіть вашу відповідь:'}
      </Label>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Ваша відповідь..."
        placeholderTextColor={Theme.textTertiary}
        autoCapitalize="sentences"
        autoCorrect={false}
      />
      {showHint && hint && (
        <HintBox>
          <Ionicons name="bulb" size={20} color={Theme.warning} />
          <HintText>{hint}</HintText>
        </HintBox>
      )}
    </Container>
  );
}
