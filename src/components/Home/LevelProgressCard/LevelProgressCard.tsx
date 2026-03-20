import React from "react"
import { Ionicons } from "@expo/vector-icons"
import { Theme } from "@nexo/constants/theme"
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

  return (
    <LevelCard>
      <LevelCardHeader>
        <LevelTitleWrap>
          <LevelEyebrow>LEVEL PROGRESS</LevelEyebrow>
          <LevelTitle>Ти близько до Lv {progress.level + 1}</LevelTitle>
        </LevelTitleWrap>

        <LevelBadge>
          <Ionicons name="sparkles-outline" size={14} color={Theme.exp} />
          <LevelBadgeText>Lv {progress.level}</LevelBadgeText>
        </LevelBadge>
      </LevelCardHeader>

      <LevelProgressTrack>
        <LevelProgressFill style={{ width: `${Math.max(progress.progress * 100, 6)}%` }} />
      </LevelProgressTrack>

      <LevelMetaRow>
        <LevelMetaText>{progress.expIntoLevel}/{progress.nextLevelExp - progress.levelStartExp} EXP</LevelMetaText>
        <LevelMetaText>{progress.expRemaining} EXP до нового рівня</LevelMetaText>
      </LevelMetaRow>
    </LevelCard>
  )
}
