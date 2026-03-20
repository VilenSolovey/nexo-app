import React from 'react'
import {
  FilterChip,
  FilterChipText,
  FilterScroll,
  Section,
  SectionHeader,
  SectionMeta,
  SectionTitle,
} from '@nexo/components/Achievements.styled'

export type AchievementFilter = 'all' | 'unlocked' | 'in-progress' | 'locked'

const FILTERS: { id: AchievementFilter; label: string }[] = [
  { id: 'all', label: 'Усі' },
  { id: 'unlocked', label: 'Відкриті' },
  { id: 'in-progress', label: 'У процесі' },
  { id: 'locked', label: 'Закриті' },
]

type AchievementFiltersProps = {
  activeFilter: AchievementFilter
  syncing?: boolean
  onChange: (filter: AchievementFilter) => void
}

export function AchievementFilters({
  activeFilter,
  syncing,
  onChange,
}: AchievementFiltersProps) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Фільтр</SectionTitle>
        <SectionMeta>{syncing ? 'Синхронізація...' : ''}</SectionMeta>
      </SectionHeader>

      <FilterScroll>
        {FILTERS.map((filter) => {
          const active = filter.id === activeFilter

          return (
            <FilterChip
              key={filter.id}
              $active={active}
              onPress={() => onChange(filter.id)}
              activeOpacity={0.9}
            >
              <FilterChipText $active={active}>{filter.label}</FilterChipText>
            </FilterChip>
          )
        })}
      </FilterScroll>
    </Section>
  )
}
