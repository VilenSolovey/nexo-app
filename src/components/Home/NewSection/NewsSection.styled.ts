import { Appearance } from "react-native"
import styled from "styled-components/native"


export const NewsWrap = styled.View`
  width: 100%;
  margin-top: 16px;
`;

export const NewsScroll = styled.ScrollView`
  margin-top: 12px;
`;

export const NewsCard = styled.View<{ $type?: string }>`
  width: 280px;
  height: 160px;
  margin-right: 12px;
  padding: 16px;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  position: relative;

  background-color: ${({ $type, theme }) =>
    $type === 'spark'
      ? 'rgba(104, 186, 127, 0.20)'
      : $type === 'trial'
      ? 'rgba(165, 243, 252, 0.16)'
      : theme.card};
  border-width: 1px;
  border-color: ${({ $type }) =>
    $type === 'spark'
      ? 'rgba(104, 186, 127, 0.45)'
      : $type === 'trial'
      ? 'rgba(165, 243, 252, 0.40)'
      : 'rgba(0,0,0,0.06)'};

  shadow-color: #000;
  shadow-opacity: 0.06;
  shadow-radius: 10px;
  shadow-offset: 0px 4px;
  elevation: 2;
`;

export const NewsCardCorner = styled.View<{ $type?: string }>`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background-color: ${({ $type }) =>
    $type === 'spark'
      ? 'rgba(104, 186, 127, 0.25)'
      : $type === 'trial'
      ? 'rgba(165, 243, 252, 0.25)'
      : 'rgba(0,0,0,0.06)'};
`;

export const NewsCardCornerText = styled.Text<{ $type?: string }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $type, theme }) =>
    $type === 'spark' || $type === 'trial' ? '#1b1b1b' : theme.text};
`;

export const NewsCardTitle = styled.Text`
  font-size: 20px;
  line-height: 26px;
  font-weight: 800;
  text-align: center;
  color: ${({ theme }) => theme.text};
  padding: 0 6px;
`;

export const NewsBadgesRow = styled.View`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const NewsBadge = styled.View<{ $type?: string }>`
  padding: 6px 10px;
  border-radius: 999px;
  background-color: ${({ $type, theme }) =>
    $type === 'spark'
      ? 'rgba(104, 186, 127, 0.20)'
      : $type === 'trial'
      ? 'rgba(165, 243, 252, 0.20)'
      : theme.background};
`;

export const NewsBadgeText = styled.Text<{ $type?: string }>`
  font-weight: 700;
  font-size: 12px;
  color: ${({ $type, theme }) =>
    $type === 'spark'
      ? '#abccb6ff'
      : $type === 'trial'
      ? '#b9eff7ff'
      : theme.text};
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

export const SeeAll = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-weight: 600;
`;

export const SectionHeader = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
`;
