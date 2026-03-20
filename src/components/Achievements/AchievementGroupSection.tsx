import React from 'react'
import { ACHIEVEMENT_CATEGORY_LABELS } from '@nexo/constants/achievements'
import {
  Section,
  SectionHeader,
  SectionMeta,
  SectionTitle,
} from '@nexo/components/Achievements.styled'
import type { AchievementCategory, AchievementViewModel } from '@nexo/types/achievement.types'
import { AchievementCardItem } from './AchievementCardItem'

type AchievementGroupSectionProps = {
  category: AchievementCategory
  items: AchievementViewModel[]
  syncing?: boolean
  claimingKey: string | null
  onClaim: (item: AchievementViewModel) => void
}

export function AchievementGroupSection({
  category,
  items,
  syncing,
  claimingKey,
  onClaim,
}: AchievementGroupSectionProps) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>{ACHIEVEMENT_CATEGORY_LABELS[category]}</SectionTitle>
        <SectionMeta>{items.length} шт.</SectionMeta>
      </SectionHeader>

      {items.map((item) => (
        <AchievementCardItem
          key={item.id}
          item={item}
          syncing={syncing}
          claimingKey={claimingKey}
          onClaim={onClaim}
        />
      ))}
    </Section>
  )
}
