import React, { useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated"
import { Theme } from "@nexo/constants/theme"
import { Motion } from "@nexo/constants/motion"
import { AnimatedNumber } from "@nexo/components/Motion/AnimatedNumber"
import { getLevelProgress } from "@nexo/utils/level"
import {
  MiniFill,
  MiniTrack,
  OverviewCard,
  OverviewHeader,
  OverviewHint,
  OverviewTitle,
  StatLabel,
  StatPanel,
  StatSubText,
  StatTopRow,
  StatsRow,
  StatValue,
} from "@nexo/components/Home/ProgressOverview/ProgressOverview.styled"

type Props = {
  level?: number
  exp?: number
  streakDays?: number
}

const STREAK_GOAL = 7

export function ProgressOverview({ level = 1, exp = 0, streakDays = 0 }: Props) {
  const progress = getLevelProgress(exp, level)
  const normalizedStreak = Math.max(streakDays, 0)
  const streakProgress = Math.min(1, normalizedStreak / STREAK_GOAL)
  const expWidth = useSharedValue(6)
  const streakWidth = useSharedValue(6)
  const expPulse = useSharedValue(0)
  const streakPulse = useSharedValue(0)
  const expFillStyle = useAnimatedStyle(() => ({ width: `${expWidth.value}%` }))
  const streakFillStyle = useAnimatedStyle(() => ({ width: `${streakWidth.value}%` }))
  const expPulseStyle = useAnimatedStyle(() => ({
    opacity: 1 - expPulse.value * 0.18,
    transform: [{ scaleY: 1 + expPulse.value * 0.45 }],
  }))
  const streakPulseStyle = useAnimatedStyle(() => ({
    opacity: 1 - streakPulse.value * 0.18,
    transform: [{ scaleY: 1 + streakPulse.value * 0.45 }],
  }))

  useEffect(() => {
    expWidth.value = withTiming(Math.max(progress.progress * 100, 6), {
      duration: Motion.duration.slow,
    })
    streakWidth.value = withTiming(Math.max(streakProgress * 100, 6), {
      duration: Motion.duration.slow,
    })
    expPulse.value = withSequence(
      withTiming(1, { duration: Motion.duration.fast }),
      withTiming(0, { duration: Motion.duration.normal }),
    )
    streakPulse.value = withSequence(
      withTiming(1, { duration: Motion.duration.fast }),
      withTiming(0, { duration: Motion.duration.normal }),
    )
  }, [expPulse, expWidth, progress.progress, streakProgress, streakPulse, streakWidth])

  return (
    <OverviewCard>
      <OverviewHeader>
        <OverviewTitle>Твій ритм</OverviewTitle>
        <OverviewHint>рівень + серія</OverviewHint>
      </OverviewHeader>

      <StatsRow>
        <StatPanel $accent="exp">
          <StatTopRow>
            <StatLabel $accent="exp">РІВЕНЬ</StatLabel>
            <Ionicons name="sparkles-outline" size={16} color={Theme.exp} />
          </StatTopRow>
          <AnimatedNumber value={progress.level}>
            {(value) => <StatValue>{value} рівень</StatValue>}
          </AnimatedNumber>
          <StatSubText>{progress.expRemaining} EXP до {progress.level + 1} рівня</StatSubText>
          <MiniTrack>
            <MiniFill $accent="exp" style={[expFillStyle, expPulseStyle]} />
          </MiniTrack>
        </StatPanel>

        <StatPanel $accent="warning">
          <StatTopRow>
            <StatLabel $accent="warning">СЕРІЯ</StatLabel>
            <Ionicons name="flame-outline" size={16} color={Theme.warning} />
          </StatTopRow>
          <AnimatedNumber value={normalizedStreak}>
            {(value) => <StatValue>{value}</StatValue>}
          </AnimatedNumber>
          <StatSubText>
            {normalizedStreak >= STREAK_GOAL
              ? "Тижневий темп тримається"
              : `${STREAK_GOAL - normalizedStreak} дн. до серії 7`}
          </StatSubText>
          <MiniTrack>
            <MiniFill $accent="warning" style={[streakFillStyle, streakPulseStyle]} />
          </MiniTrack>
        </StatPanel>
      </StatsRow>
    </OverviewCard>
  )
}
