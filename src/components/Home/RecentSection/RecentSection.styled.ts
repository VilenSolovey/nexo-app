import { styled } from "styled-components/native"
import { QuizCard, StatusPill } from "@nexo/components/Home/HomeLayout";


export const NameWrap = styled.View`
  flex: 1;
  margin-left: 12px;
  min-width: 0;
  gap: 5px;
`;

export const SectionHeader = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

export const SeeAll = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-weight: 700;
`;

export const QuizTitle = styled.Text`
  font-weight: 900;
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  line-height: 21px;
`;

export const QuizLeft = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: flex-start;
`;

export const QuizIcon = styled.View<{ type?: 'trial' | 'spark' }>`
  width: 66px;
  height: 66px;
  border-radius: 19px;
  align-items: center;
  justify-content: center;
  background-color: ${({ type }) =>
    type === 'trial' ? 'rgba(165, 243, 252, 0.08)' : 'rgba(94, 234, 212, 0.08)'};
  border-width: 1px;
  border-color: ${({ type }) =>
    type === 'trial' ? 'rgba(165, 243, 252, 0.16)' : 'rgba(94, 234, 212, 0.16)'};
`;

export const StatusDone = styled(StatusPill)`
  background-color: #dff5e4;
`;

export const StatusIncomplete = styled(StatusPill)`
  background-color: #fff3df;
`;

export const StatusText = styled.Text`
  font-weight: 700;
`;

export const RecentCard = styled(QuizCard)<{ $type?: 'trial' | 'spark' }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  min-height: 118px;
  margin-vertical: 6px;
  padding: 14px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ $type, theme }) =>
    $type === 'trial' ? 'rgba(165, 243, 252, 0.18)' : theme.cardBorder};
  shadow-color: #000;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  shadow-offset: 0px 4px;
  elevation: 2;
`;

export const TypeBadge = styled.View<{ $type?: 'trial' | 'spark' }>`
  align-self: flex-start;
  padding: 3px 7px;
  border-radius: 999px;
  background-color: ${({ $type }) =>
    $type === 'trial' ? 'rgba(165, 243, 252, 0.12)' : 'rgba(94, 234, 212, 0.12)'};
`

export const TypeBadgeText = styled.Text<{ $type?: 'trial' | 'spark' }>`
  color: ${({ $type, theme }) =>
    $type === 'trial' ? theme.accentAlt : theme.primary};
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
`

export const RecentMetaRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
`

export const MetaChip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 5px 7px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.06);
  border-width: 1px;
  border-color: ${({ theme }) => theme.cardBorder};
`

export const MetaChipText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 11px;
  font-weight: 800;
`
