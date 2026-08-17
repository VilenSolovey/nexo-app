import { styled } from "styled-components/native"


export const HeaderRow = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`

export const UserLeft = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  min-width: 0;
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
  flex: 1;
  margin-left: 12px;
  min-width: 0;
  justify-content: center;
`

export const GreetingText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 700;
`

export const NameText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 17px;
  font-weight: 800;
  line-height: 21px;
`

export const StorePill = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: 7px;
  background-color: ${({ theme }) => theme.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
  padding: 8px 10px;
  border-radius: 999px;
  min-height: 38px;
`

export const CoinsGroup = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  max-width: 76px;
`

export const CoinsText = styled.Text`
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  max-width: 48px;
`

export const StoreDivider = styled.View`
  width: 1px;
  height: 18px;
  background-color: ${({ theme }) => theme.cardBorder};
`

export const StoreText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-size: 12px;
  font-weight: 800;
`
