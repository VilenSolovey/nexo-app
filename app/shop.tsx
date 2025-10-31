import React from "react"
import {
  HomeContainer,
  UserContainer,
  HomeTitle,
  Paragraph,
  QuizCard,
} from "@nexo/styles/home.styled"

export default function ShopScreen() {
  return (
    <HomeContainer>
      <UserContainer>
        <HomeTitle>Магазин</HomeTitle>
        <Paragraph>Купуй предмети, бустери та інше. Скоро.</Paragraph>
      </UserContainer>
        <QuizCard>
          <Paragraph>Контент для магазину.</Paragraph>
        </QuizCard>
    </HomeContainer>
  )
}
