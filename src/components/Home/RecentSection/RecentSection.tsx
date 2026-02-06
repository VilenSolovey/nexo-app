import React from "react"
import { FlatList, Pressable, TouchableOpacity } from "react-native"
import * as Haptics from "expo-haptics"
import {
  SectionHeader,
  SectionTitle,
  RecentCard,
  QuizLeft,
  QuizIcon,
  NameWrap,
  QuizTitle,
  StatusDone,
  StatusIncomplete,
  StatusText,
} from "@nexo/components/Home/RecentSection/RecentSection.styled"

import { Paragraph } from "@nexo/components/Home/HomeLayout"
import type { RecentItem } from "@nexo/types/quiz.types"

type Props = {
  items: RecentItem[]
  onSeeAll?: () => void
  onPressItem?: (id: string) => void
}

export const RecentSection: React.FC<Props> = ({ items, onSeeAll, onPressItem }) => {
  return (
    <>
      <SectionHeader>
        <SectionTitle>Recent</SectionTitle>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync()
            onSeeAll?.()
          }}
        >
        </TouchableOpacity>
        
      </SectionHeader>
      {items.length === 0 && (
         <Paragraph style={{ alignSelf: "center", marginTop:20, fontSize: 16 }}>Немає недавніх вікторин</Paragraph>
      )}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        style={{ width: "100%" }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync()
              onPressItem?.(item.id)
            }}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
          >
            <RecentCard>
              <QuizLeft>
                <QuizIcon type={item.type} />
                <NameWrap>
                  <QuizTitle>{item.title}</QuizTitle>
                  <Paragraph>
                    {item.questionsCount} questions · {item.category}
                    {typeof item.reward === "number" ? ` · +${item.reward}` : ""}
                  </Paragraph>
                  
                </NameWrap>
              </QuizLeft>
            </RecentCard>
            
          </Pressable>
        )}
      />
    </>
  )
}
