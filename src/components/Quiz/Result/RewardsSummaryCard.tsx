import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import {
  RewardsCard,
  RewardsTitle,
  RewardsReducedNote,
  RewardsContainer,
  RewardItem,
  RewardValue,
  RewardOriginal,
  RewardLabel,
} from '@nexo/components/Quiz/Result/QuizResult.styled'

type Props = {
  coins: number
  exp: number
  originalCoins: number
  originalExp: number
  isReducedReward: boolean
}

export function RewardsSummaryCard({
  coins,
  exp,
  originalCoins,
  originalExp,
  isReducedReward,
}: Props) {
  return (
    <RewardsCard>
      <RewardsTitle>🎉 Винагороди отримано!</RewardsTitle>
      {isReducedReward && (
        <RewardsReducedNote>Знижено через повторну спробу</RewardsReducedNote>
      )}
      <RewardsContainer>
        <RewardItem>
          <Ionicons name="cash" size={32} color={Theme.coin} />
          <RewardValue>+{coins}</RewardValue>
          {isReducedReward && <RewardOriginal>з {originalCoins}</RewardOriginal>}
          <RewardLabel>Nexons</RewardLabel>
        </RewardItem>
        <RewardItem>
          <Ionicons name="star" size={32} color={Theme.exp} />
          <RewardValue>+{exp}</RewardValue>
          {isReducedReward && <RewardOriginal>з {originalExp}</RewardOriginal>}
          <RewardLabel>EXP</RewardLabel>
        </RewardItem>
      </RewardsContainer>
    </RewardsCard>
  )
}
