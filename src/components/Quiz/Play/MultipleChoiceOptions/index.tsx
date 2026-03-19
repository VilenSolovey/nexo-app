import React from 'react';
import {
  OptionsContainer,
  OptionButton,
  RadioCircle,
  RadioInner,
  OptionText,
} from './MultipleChoiceOptions.styled';

interface MultipleChoiceOptionsProps {
  options: string[];
  removedOptions: string[];
  selectedOption: string | null;
  selectedOptions: string[];
  multiSelect?: boolean;
  onSelect: (option: string) => void;
}

export function MultipleChoiceOptions({
  options,
  removedOptions,
  selectedOption,
  selectedOptions,
  multiSelect = false,
  onSelect,
}: MultipleChoiceOptionsProps) {
  const displayOptions = options.filter((opt) => !removedOptions.includes(opt));

  return (
    <OptionsContainer>
      {displayOptions.map((option, index) => {
        const selected = multiSelect
          ? selectedOptions.includes(option)
          : selectedOption === option;

        return (
          <OptionButton key={index} $selected={selected} onPress={() => onSelect(option)}>
            <RadioCircle $selected={selected}>
              {selected && <RadioInner />}
            </RadioCircle>
            <OptionText $selected={selected}>{option}</OptionText>
          </OptionButton>
        );
      })}
    </OptionsContainer>
  );
}
