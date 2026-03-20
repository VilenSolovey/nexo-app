import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import {
  HeroBadge,
  HeroBadgeText,
  HeroCard,
  HeroLabel,
  HeroTitle,
  HeroTopCopy,
  HeroTopRow,
  NextAchievementCaption,
  NextAchievementCard,
  NextAchievementHeader,
  NextAchievementProgress,
  NextAchievementText,
  NextAchievementTitle,
  ProgressFill,
  ProgressTrack,
  StatCard,
  StatLabel,
  StatValue,
  StatsRow,
} from '@nexo/components/Achievements.styled'
import type { AchievementViewModel } from '@nexo/types/achievement.types'

type AchievementsHeroProps = {
  summary: {
    unlockedCount: number
    completedCount: number
    totalTiers: number
    unlockedTiers: number
    claimableCount: number
    completionRate: number
    nextAchievement: AchievementViewModel | null
  }
}

export function AchievementsHero({ summary }: AchievementsHeroProps) {
  return (
    <HeroCard
      colors={['#29473D', '#1D3129']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <HeroTopRow>
        <HeroTopCopy>
          <HeroLabel>Прогрес нагород</HeroLabel>
          <HeroTitle>
            {summary.unlockedTiers} з {summary.totalTiers}
          </HeroTitle>
        </HeroTopCopy>

        <HeroBadge>
          <Ionicons name="sparkles-outline" size={16} color={Theme.background} />
          <HeroBadgeText>{summary.completionRate}%</HeroBadgeText>
        </HeroBadge>
      </HeroTopRow>

      <StatsRow>
        <StatCard>
          <StatValue>{summary.unlockedCount}</StatValue>
          <StatLabel>Досягнень активовано</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{summary.claimableCount}</StatValue>
          <StatLabel>Нагороди чекають</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{summary.completedCount}</StatValue>
          <StatLabel>Закрито повністю</StatLabel>
        </StatCard>
      </StatsRow>

      {summary.nextAchievement ? (
        <NextAchievementCard>
          <NextAchievementHeader>
            <NextAchievementCaption>Наступна ціль</NextAchievementCaption>
            <NextAchievementProgress>
              {summary.nextAchievement.current}/
              {summary.nextAchievement.nextTier?.target ?? summary.nextAchievement.current}
            </NextAchievementProgress>
          </NextAchievementHeader>
          <NextAchievementTitle>{summary.nextAchievement.title}</NextAchievementTitle>
          <NextAchievementText>
            {summary.nextAchievement.nextTier
              ? `${summary.nextAchievement.nextTier.title}: ${summary.nextAchievement.description}`
              : 'Усі етапи вже відкрито'}
          </NextAchievementText>
          <ProgressTrack>
            <ProgressFill $width={`${Math.max(summary.nextAchievement.progressToNext, 6)}%`} />
          </ProgressTrack>
        </NextAchievementCard>
      ) : null}
    </HeroCard>
  )
}
