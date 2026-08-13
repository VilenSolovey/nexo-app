import React from "react"
import { TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import { NexonsIcon } from "@nexo/components/Currency/NexonsIcon"
import { QuizTypeIcon } from "@nexo/components/Quiz/QuizTypeIcon"
import {
  SectionHeader,
  SectionTitle,
  RecentCard,
  QuizLeft,
  QuizIcon,
  NameWrap,
  QuizTitle,
  RecentMetaRow,
  MetaChip,
  MetaChipText,
  TypeBadge,
  TypeBadgeText,
  SeeAll,
} from "@nexo/components/Home/RecentSection/RecentSection.styled"

import { Paragraph } from "@nexo/components/Home/HomeLayout"
import type { RecentItem } from "@nexo/types/quiz.types"

const quizTypeLabels: Record<RecentItem['type'], string> = {
  trial: 'TRIAL',
  spark: 'SPARK',
}

type Props = {
  items: RecentItem[]
  title?: string
  onSeeAll?: () => void
}

function RecentQuizCard({
  item,
}: {
  item: RecentItem
}) {
  const theme = useAppTheme()
  const completedDate = new Date(item.completedAt * 1000).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
  })
  const typeLabel = quizTypeLabels[item.type]

  const reward = item.rewardEarned ?? item.reward ?? 0

  return (
    <RecentCard $type={item.type}>
      <QuizLeft>
        <QuizIcon type={item.type}>
          <QuizTypeIcon type={item.type} size={58} />
        </QuizIcon>
        <NameWrap>
          <TypeBadge $type={item.type}>
            <TypeBadgeText $type={item.type}>{typeLabel}</TypeBadgeText>
          </TypeBadge>
          <QuizTitle numberOfLines={2}>{item.title}</QuizTitle>
          <Paragraph numberOfLines={1}>{item.category}</Paragraph>
          <RecentMetaRow>
            <MetaChip>
              <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
              <MetaChipText>{completedDate}</MetaChipText>
            </MetaChip>
            <MetaChip>
              <NexonsIcon size={16} />
              <MetaChipText>+{reward}</MetaChipText>
            </MetaChip>
            <MetaChip>
              <Ionicons name="repeat-outline" size={13} color={theme.textSecondary} />
              <MetaChipText>{item.attempts} спр.</MetaChipText>
            </MetaChip>
          </RecentMetaRow>
        </NameWrap>
      </QuizLeft>
    </RecentCard>
  )
}

export const RecentSection: React.FC<Props> = ({ items, title = "Останні пройдені виклики", onSeeAll }) => {
  return (
    <>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        {onSeeAll ? (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync()
              onSeeAll()
            }}
          >
            <SeeAll>Вся історія</SeeAll>
          </TouchableOpacity>
        ) : null}
      </SectionHeader>
      {items.length === 0 && (
         <Paragraph style={{ alignSelf: "center", marginTop: 20, fontSize: 16 }}>
           Тут з’являться результати пройдених викликів
         </Paragraph>
      )}

      {items.map((item) => (
        <RecentQuizCard
          key={item.id}
          item={item}
        />
      ))}
    </>
  )
}
