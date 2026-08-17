import React, { useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { Theme } from "@nexo/constants/theme"
import { Motion } from "@nexo/constants/motion"
import { getLevelProgress } from "@nexo/utils/level"
import {
  LevelCard,
  LevelCardHeader,
  LevelEyebrow,
  LevelTitle,
  LevelTitleWrap,
  LevelProgressTrack,
  LevelProgressFill,
  LevelMetaRow,
  LevelMetaText,
  LevelBadge,
  LevelBadgeText,
} from "@nexo/components/Home/LevelProgressCard/LevelProgressCard.styled"

type Props = {
  level?: number
  exp?: number
}

export const LevelProgressCard: React.FC<Props> = ({ level = 1, exp = 0 }) => {
  const progress = getLevelProgress(exp, level)
  const progressWidth = useSharedValue(6)
  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }))

  useEffect(() => {
    progressWidth.value = withTiming(Math.max(progress.progress * 100, 6), {
      duration: Motion.duration.slow,
    })
  }, [progress.progress, progressWidth])

  return (
    <LevelCard>
      <LevelCardHeader>
        <LevelTitleWrap>
          <LevelEyebrow>ПРОГРЕС РІВНЯ</LevelEyebrow>
          <LevelTitle>Ти близько до {progress.level + 1} рівня</LevelTitle>
        </LevelTitleWrap>

        <LevelBadge>
          <Ionicons name="sparkles-outline" size={14} color={Theme.exp} />
          <LevelBadgeText>{progress.level} рівень</LevelBadgeText>
        </LevelBadge>
      </LevelCardHeader>

      <LevelProgressTrack>
        <LevelProgressFill style={animatedFillStyle} />
      </LevelProgressTrack>

      <LevelMetaRow>
        <LevelMetaText>{progress.expIntoLevel}/{progress.nextLevelExp - progress.levelStartExp} EXP</LevelMetaText>
        <LevelMetaText>{progress.expRemaining} EXP до нового рівня</LevelMetaText>
      </LevelMetaRow>
    </LevelCard>
  )
}
