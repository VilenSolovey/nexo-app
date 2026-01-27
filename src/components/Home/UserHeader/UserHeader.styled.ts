import { Appearance } from "react-native"
import styled from "styled-components/native"
import { Theme } from "@nexo/constants/theme"


export const HeaderRow = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

export const UserLeft = styled.View`
  flex-direction: row;
  align-items: center;
`

export const Avatar = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 30px;
  background-color: #fff;
  border-width: 1px;
  border-color: #eee;
`

export const NameWrap = styled.View`
  margin-left: 12px;
`

export const CoinsWrap = styled.View`
  align-items: center;
`

export const CoinsLabel = styled.Text`
  font-size: 12px;
  color: ${Theme.textSecondary};
`

export const CoinsPill = styled.View`
  margin-top: 6px;
  background-color: ${Theme.text};
  padding: 6px 10px;
  border-radius: 20px;
`

export const CoinsText = styled.Text`
  font-weight: bold;
  color: ${Theme.background};
`

export const LevelPill = styled.View`
  margin-top: 8px;
  background-color: #fff;
  padding: 6px 10px;
  border-radius: 20px;
  border-width: 1px;
  border-color: #eee;
  align-self: flex-end;
`

export const LevelText = styled.Text`
  font-weight: 700;
  color: ${Theme.background};
`