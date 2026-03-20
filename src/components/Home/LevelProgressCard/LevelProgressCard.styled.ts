import { Theme } from "@nexo/constants/theme"
import { styled } from "styled-components/native"

export const LevelCard = styled.View`
  width: 95%;
  margin-top: 12px;
  margin-bottom: 12px;
  padding: 15px 16px;
  border-radius: 16px;
  background-color: rgba(139, 92, 246, 0.12);
  border-width: 1px;
  border-color: rgba(139, 92, 246, 0.22);
`

export const LevelCardHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

export const LevelTitleWrap = styled.View`
  flex: 1;
`

export const LevelEyebrow = styled.Text`
  color: ${Theme.exp};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
`

export const LevelTitle = styled.Text`
  margin-top: 4px;
  color: ${Theme.text};
  font-size: 15px;
  font-weight: 800;
`

export const LevelBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 999px;
  background-color: rgba(30, 43, 37, 0.9);
  border-width: 1px;
  border-color: rgba(139, 92, 246, 0.2);
`

export const LevelBadgeText = styled.Text`
  color: ${Theme.text};
  font-size: 11px;
  font-weight: 800;
`

export const LevelProgressTrack = styled.View`
  width: 100%;
  height: 8px;
  margin-top: 12px;
  border-radius: 999px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.08);
`

export const LevelProgressFill = styled.View`
  height: 100%;
  border-radius: 999px;
  background-color: ${Theme.exp};
`

export const LevelMetaRow = styled.View`
  margin-top: 10px;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`

export const LevelMetaText = styled.Text`
  color: ${Theme.textSecondary};
  font-size: 11px;
  line-height: 15px;
`
