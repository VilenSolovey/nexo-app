import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@nexo/constants/theme';
import { Container, TFButton, TFText } from './TrueFalseOptions.styled';

interface TrueFalseOptionsProps {
  selectedOption: boolean | null;
  onSelect: (value: boolean) => void;
}

export function TrueFalseOptions({ selectedOption, onSelect }: TrueFalseOptionsProps) {
  return (
    <Container>
      <TFButton $selected={selectedOption === true} onPress={() => onSelect(true)}>
        <Ionicons
          name="checkmark-circle"
          size={32}
          color={selectedOption === true ? Theme.success : Theme.textSecondary}
        />
        <TFText $selected={selectedOption === true}>Правда</TFText>
      </TFButton>

      <TFButton $selected={selectedOption === false} onPress={() => onSelect(false)}>
        <Ionicons
          name="close-circle"
          size={32}
          color={selectedOption === false ? Theme.error : Theme.textSecondary}
        />
        <TFText $selected={selectedOption === false}>Неправда</TFText>
      </TFButton>
    </Container>
  );
}
