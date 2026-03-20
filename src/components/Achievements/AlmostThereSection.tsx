import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import {
  AlmostCard,
  AlmostCopy,
  AlmostIconWrap,
  AlmostProgressText,
  AlmostProgressWrap,
  AlmostText,
  AlmostTitle,
  Section,
  SectionHeader,
  SectionMeta,
  SectionTitle,
} from '@nexo/components/Achievements.styled'
import type { AchievementViewModel } from '@nexo/types/achievement.types'

type AlmostThereSectionProps = {
  items: AchievementViewModel[]
}

export function AlmostThereSection({ items }: AlmostThereSectionProps) {
  if (items.length === 0) return null

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Майже відкрито</SectionTitle>
        <SectionMeta>Найближчі 3</SectionMeta>
      </SectionHeader>

      {items.map((item) => (
        <AlmostCard key={item.id}>
          <AlmostIconWrap $background={`${item.accentColor ?? Theme.primary}20`}>
            <Ionicons name={item.icon as any} size={18} color={item.accentColor ?? Theme.primary} />
          </AlmostIconWrap>

          <AlmostCopy>
            <AlmostTitle>{item.title}</AlmostTitle>
            <AlmostText>
              {item.nextTier
                ? `${item.nextTier.title}: ${item.current}/${item.nextTier.target}`
                : `${item.unlockedTierCount}/${item.totalTiers} етапи`}
            </AlmostText>
          </AlmostCopy>

          <AlmostProgressWrap>
            <AlmostProgressText>{item.progressToNext}%</AlmostProgressText>
          </AlmostProgressWrap>
        </AlmostCard>
      ))}
    </Section>
  )
}
