import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import {
  AchievementCard,
  CardCopy,
  CardDescription,
  CardHeader,
  CardMeta,
  CardMetaRow,
  CardTitle,
  ClaimButton,
  ClaimButtonText,
  IconContainer,
  ProgressFill,
  ProgressTrackSmall,
  StatusBadge,
  StatusBadgeText,
  TierChip,
  TierChipText,
  TiersRow,
  UnlockDate,
} from '@nexo/components/Achievements.styled'
import type { AchievementViewModel } from '@nexo/types/achievement.types'

function formatDate(value: string | number | null) {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
  })
}

type AchievementCardItemProps = {
  item: AchievementViewModel
  syncing?: boolean
  claimingKey: string | null
  onClaim: (item: AchievementViewModel) => void
}

export function AchievementCardItem({
  item,
  syncing,
  claimingKey,
  onClaim,
}: AchievementCardItemProps) {
  const lastUnlockedDate =
    item.tiers
      .filter((tier) => tier.unlockedAt)
      .map((tier) => tier.unlockedAt)
      .filter((value): value is string | number => value !== null)
      .sort()
      .at(-1) ?? null
  const unlockedDate = formatDate(lastUnlockedDate)
  const claimKey = item.claimableTier ? `${item.id}:${item.claimableTier.id}` : null
  const statusVariant = item.completed ? 'completed' : item.unlocked ? 'unlocked' : 'locked'

  return (
    <AchievementCard $unlocked={item.unlocked}>
      <IconContainer $background={`${item.accentColor ?? Theme.primary}20`}>
        <Ionicons name={item.icon as any} size={22} color={item.accentColor ?? Theme.primary} />
      </IconContainer>

      <CardCopy>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <StatusBadge $variant={statusVariant}>
            <StatusBadgeText $variant={statusVariant}>
              {item.completed ? 'Повністю' : `${item.unlockedTierCount}/${item.totalTiers} етап`}
            </StatusBadgeText>
          </StatusBadge>
        </CardHeader>

        <CardDescription>{item.description}</CardDescription>

        <TiersRow>
          {item.tiers.map((tier) => {
            const tierVariant = tier.claimed ? 'claimed' : tier.unlocked ? 'unlocked' : 'locked'

            return (
              <TierChip key={tier.id} $variant={tierVariant}>
                <TierChipText $variant={tierVariant}>{tier.title}</TierChipText>
              </TierChip>
            )
          })}
        </TiersRow>

        <CardMetaRow>
          <CardMeta>
            {item.nextTier
              ? `Далі: ${item.nextTier.title} • ${item.current}/${item.nextTier.target}`
              : `Усі ${item.totalTiers} етапи відкрито`}
          </CardMeta>
          <CardMeta>
            Забрано {item.claimedTierCount}/{item.totalTiers}
          </CardMeta>
        </CardMetaRow>

        <ProgressTrackSmall>
          <ProgressFill
            $width={`${Math.max(item.nextTier ? item.progressToNext : 100, 4)}%`}
            $background={item.accentColor ?? Theme.primary}
          />
        </ProgressTrackSmall>

        {item.claimableTier ? (
          <ClaimButton
            onPress={() => onClaim(item)}
            disabled={claimingKey === claimKey || syncing}
            $disabledVisual={claimingKey === claimKey || syncing}
            activeOpacity={0.9}
          >
            <Ionicons name="gift-outline" size={16} color={Theme.background} />
            <ClaimButtonText>
              {claimingKey === claimKey
                ? 'Забираємо...'
                : `Забрати +${item.claimableTier.rewardCoins}`}
            </ClaimButtonText>
          </ClaimButton>
        ) : null}

        {unlockedDate ? <UnlockDate>Останнє відкриття {unlockedDate}</UnlockDate> : null}
      </CardCopy>
    </AchievementCard>
  )
}
