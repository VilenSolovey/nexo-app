import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Theme } from '@nexo/constants/theme'
import {
  TimeBanner,
  TimeBannerText,
  AttemptBanner,
  AttemptBannerText,
  MasteredBanner,
  MasteredBannerText,
} from '@nexo/components/Quiz/Result/QuizResult.styled'

type Props = {
  variant: 'time' | 'attempt' | 'mastered'
  icon: string
  text: string
  iconColor?: string
}

export function ResultBanner({ variant, icon, text, iconColor }: Props) {
  if (variant === 'time') {
    return (
      <TimeBanner>
        <Ionicons name={icon as any} size={20} color={iconColor ?? '#fff'} />
        <TimeBannerText>{text}</TimeBannerText>
      </TimeBanner>
    )
  }

  if (variant === 'mastered') {
    return (
      <MasteredBanner>
        <Ionicons name={icon as any} size={20} color={iconColor ?? '#fff'} />
        <MasteredBannerText>{text}</MasteredBannerText>
      </MasteredBanner>
    )
  }

  return (
    <AttemptBanner>
      <Ionicons name={icon as any} size={20} color={iconColor ?? Theme.warning} />
      <AttemptBannerText>{text}</AttemptBannerText>
    </AttemptBanner>
  )
}
