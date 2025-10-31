import React from "react"
import { Pressable, TouchableOpacity } from "react-native"
import * as Haptics from "expo-haptics"
import {
  NewsWrap,
  SectionHeader,
  SectionTitle,
  SeeAll,
  NewsScroll,
  NewsCard,
  NewsCardCorner,
  NewsCardCornerText,
  NewsCardTitle,
  NewsBadgesRow,
  NewsBadge,
  NewsBadgeText,
} from "@nexo/components/Home/NewSection/NewsSection.styled"

import type { NewsItem } from "@nexo/types/quiz.types"

type Props = {
  items: NewsItem[]
  onSeeAll?: () => void
  onPressItem?: (id: string) => void
}

export const NewsSection: React.FC<Props> = ({ items, onSeeAll, onPressItem }) => {
  return (
    <NewsWrap>
      <SectionHeader>
        <SectionTitle>Нові Квізи</SectionTitle>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync()
            onSeeAll?.()
          }}
        >
          <SeeAll>See all</SeeAll>
        </TouchableOpacity>
      </SectionHeader>
      <NewsScroll horizontal showsHorizontalScrollIndicator={false}>
        {items.map((n) => {
          const type = n.category?.toLowerCase()
          const variant = type === "spark" ? "spark" : type === "trial" ? "trial" : undefined
          return (
            <Pressable
              key={n.id}
              onPress={() => {
                Haptics.selectionAsync()
                onPressItem?.(n.id)
              }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
            >
              <NewsCard $type={variant}>
                {variant ? (
                  <NewsCardCorner $type={variant}>
                    <NewsCardCornerText $type={variant}>{variant.toUpperCase()}</NewsCardCornerText>
                  </NewsCardCorner>
                ) : null}
                <NewsCardTitle numberOfLines={2}>{n.title}</NewsCardTitle>
                <NewsBadgesRow>
                  <NewsBadge $type={variant}>
                    <NewsBadgeText $type={variant}>{n.questions} Пт</NewsBadgeText>
                  </NewsBadge>
                  <NewsBadge $type={variant}>
                    <NewsBadgeText $type={variant}>{n.category}</NewsBadgeText>
                  </NewsBadge>
                  {typeof n.reward === "number" ? (
                    <NewsBadge $type={variant}>
                      <NewsBadgeText $type={variant}>+ {n.reward}</NewsBadgeText>
                    </NewsBadge>
                  ) : (
                    <NewsBadge $type={variant}>
                      <NewsBadgeText $type={variant}>No reward</NewsBadgeText>
                    </NewsBadge>
                  )}
                </NewsBadgesRow>
              </NewsCard>
            </Pressable>
          )
        })}
      </NewsScroll>
    </NewsWrap>
  )
}
