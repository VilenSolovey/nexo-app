import React from "react"
import { Avatar } from "@nexo/components/Home/Avatar"
import { HomeTitle, Paragraph } from "@nexo/components/Home/HomeLayout"

import { HeaderRow, UserLeft, NameWrap, CoinsWrap, CoinsLabel, CoinsPill, CoinsText, LevelPill, LevelText } from "@nexo/components/Home/UserHeader/UserHeader.styled"

type Props = {
  name?: string
  coins?: number
  level?: number
  avatarSeed?: string
}
export const UserHeader: React.FC<Props> = ({ name = "Guest", coins = 0, level, avatarSeed }) => {

  return (
    <HeaderRow>
      <UserLeft>
      <Avatar seed={avatarSeed ?? name ?? "guest"} size={55} />
        <NameWrap>
          <HomeTitle>Привіт, {name}</HomeTitle>
          <Paragraph>Готовий перемагати?</Paragraph>
        </NameWrap>
      </UserLeft>

      <CoinsWrap>
        <CoinsLabel>Nexons</CoinsLabel>
        <CoinsPill>
          <CoinsText>{coins}</CoinsText>
        </CoinsPill>
        <LevelPill>
          <LevelText>Lv {level ?? 1}</LevelText>
        </LevelPill>
        
      </CoinsWrap>
    </HeaderRow>
  )
}
