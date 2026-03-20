import React, { useMemo, useState } from 'react'
import { Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ACHIEVEMENT_CATEGORY_ORDER } from '@nexo/constants/achievements'
import { Theme } from '@nexo/constants/theme'
import {
  FeedbackCard,
  FeedbackText,
  Screen,
} from '@nexo/components/Achievements.styled'
import {
  AchievementFilter,
  AchievementFilters,
} from '@nexo/components/Achievements/AchievementFilters'
import { AchievementGroupSection } from '@nexo/components/Achievements/AchievementGroupSection'
import { AchievementsHeader } from '@nexo/components/Achievements/AchievementsHeader'
import { AchievementsHero } from '@nexo/components/Achievements/AchievementsHero'
import { AlmostThereSection } from '@nexo/components/Achievements/AlmostThereSection'
import { RefreshableScreen } from '@nexo/components/RefreshableScreen'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useAchievements } from '@nexo/hooks/useAchievements'
import type { AchievementViewModel } from '@nexo/types/achievement.types'

type AchievementFilterPredicate = (item: AchievementViewModel, filter: AchievementFilter) => boolean

const passesFilter: AchievementFilterPredicate = (item, filter) => {
  if (filter === 'all') return true
  if (filter === 'unlocked') return item.unlocked
  if (filter === 'locked') return !item.unlocked
  return !item.completed && item.current > 0
}

export default function AchievementsScreen() {
  const { userProfile, refreshUserProfile } = useAuth()
  const userId = userProfile?.uid ?? userProfile?.id
  const {
    groupedAchievements,
    almostThere,
    summary,
    loading,
    syncing,
    claimingKey,
    error,
    refetch,
    claimReward,
  } = useAchievements(userId, userProfile)
  const [activeFilter, setActiveFilter] = useState<AchievementFilter>('all')

  const filteredGroups = useMemo(
    () =>
      ACHIEVEMENT_CATEGORY_ORDER.map((category) => ({
        category,
        items:
          groupedAchievements.find((group) => group.category === category)?.items.filter((item) =>
            passesFilter(item, activeFilter),
          ) ?? [],
      })).filter((group) => group.items.length > 0),
    [activeFilter, groupedAchievements],
  )

  const handleClaim = async (item: AchievementViewModel) => {
    if (!item.claimableTier) return

    try {
      const reward = await claimReward(item.id, item.claimableTier.id)
      await refreshUserProfile()
      Alert.alert(
        'Нагороду отримано',
        `+${reward.rewardCoins} Nexons${reward.rewardExp ? ` і +${reward.rewardExp} EXP` : ''}`,
      )
    } catch (claimError: any) {
      await Promise.all([refetch(), refreshUserProfile()])
      Alert.alert('Не вдалося забрати нагороду', claimError?.message ?? 'Спробуйте ще раз')
    }
  }

  return (
    <RefreshableScreen onRefresh={refetch} refreshing={loading}>
      <Screen>
        <AchievementsHeader />

        <AchievementsHero summary={summary} />

        <AlmostThereSection items={almostThere} />

        <AchievementFilters
          activeFilter={activeFilter}
          syncing={syncing}
          onChange={setActiveFilter}
        />

        {error ? (
          <FeedbackCard>
            <Ionicons name="alert-circle-outline" size={18} color={Theme.warning} />
            <FeedbackText>{error}</FeedbackText>
          </FeedbackCard>
        ) : null}

        {!loading && filteredGroups.length === 0 ? (
          <FeedbackCard>
            <Ionicons name="layers-outline" size={18} color={Theme.textSecondary} />
            <FeedbackText>Під цей фільтр поки нічого не підпадає.</FeedbackText>
          </FeedbackCard>
        ) : null}

        {filteredGroups.map((group) => (
          <AchievementGroupSection
            key={group.category}
            category={group.category}
            items={group.items}
            syncing={syncing}
            claimingKey={claimingKey}
            onClaim={handleClaim}
          />
        ))}
      </Screen>
    </RefreshableScreen>
  )
}
