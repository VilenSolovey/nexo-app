import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@nexo/constants/theme';
import { Card, CardHeader, TypeChip, TypeChipText, QuestionText } from './QuestionCard.styled';

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Множинний вибір',
  true_false: 'Правда/Неправда',
  fill_blank: 'Заповнити пропуск',
  single_answer: 'Одна відповідь',
};

const TYPE_ICONS: Record<string, string> = {
  multiple_choice: 'list',
  true_false: 'checkmark-done',
  fill_blank: 'create',
  single_answer: 'text',
};

const COMPACT_QUESTION_LENGTH = 120;
const DENSE_QUESTION_LENGTH = 190;

interface QuestionCardProps {
  question: string;
  type: string;
}

export function QuestionCard({ question, type }: QuestionCardProps) {
  const normalized = String(type || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const iconName = TYPE_ICONS[normalized] ?? TYPE_ICONS[type] ?? 'text';
  const label = TYPE_LABELS[normalized] ?? TYPE_LABELS[type] ?? String(type);
  const compact = question.length > COMPACT_QUESTION_LENGTH;
  const dense = question.length > DENSE_QUESTION_LENGTH;

  return (
    <Card>
      <CardHeader>
        <TypeChip>
          <Ionicons name={iconName as any} size={16} color={Theme.accent} />
          <TypeChipText>{label}</TypeChipText>
        </TypeChip>
      </CardHeader>
      <QuestionText $compact={compact} $dense={dense}>{question}</QuestionText>
    </Card>
  );
}
