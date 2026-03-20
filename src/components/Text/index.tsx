import styled from "styled-components/native"

type ParagraphProps = {
  bold?: boolean
  white?: boolean
  underline?: boolean
  marginTop?: number
  marginBottom?: number
  paddedTop?: boolean
  paddedBottom?: boolean
  italic?: boolean
}

export const BoldTitle = styled.Text<{ padded?: boolean }>`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  line-height: 36px;
  margin-bottom: ${({ padded = true }) => (padded ? 20 : 0)}px;
`

export const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  line-height: 32px;
`

export const BigTitle = styled.Text`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  line-height: 40px;
`

export const SubTitle = styled.Text<{ padded?: boolean; white?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ white = false, theme }) => (white ? "#FFFFFF" : theme.text)};
  line-height: 26px;
  margin-bottom: ${({ padded = true }) => (padded ? 8 : 0)}px;
`

export const SmallTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  line-height: 24px;
  text-align: left;
`

export const Paragraph = styled.Text<ParagraphProps>`
  font-size: 15px;
  font-weight: ${({ bold = false }) => (bold ? "600" : "400")};
  color: ${({ white = false, theme }) => (white ? "#FFFFFF" : theme.text)};
  line-height: 22px;
  margin-top: ${({ marginTop, paddedTop }: ParagraphProps) =>
    marginTop ? `${marginTop}px` : paddedTop ? "20px" : "0px"};
  margin-bottom: ${({ marginBottom, paddedBottom }: ParagraphProps) =>
    marginBottom ? `${marginBottom}px` : paddedBottom ? "20px" : "0px"};
  text-decoration: ${({ underline }: ParagraphProps) => (underline ? "underline" : "none")};
  font-style: ${({ italic = false }) => (italic ? "italic" : "normal")};
`

export const Caption = styled.Text`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 16px;
`

export const SmallCaption = styled.Text`
  font-size: 10px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 14px;
`

export const RegularText = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.text};
  line-height: 20px;
`

export const BoldText = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  line-height: 20px;
`

export const SemiBoldText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  line-height: 20px;
`

export const BigText = styled.Text`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.text};
  line-height: 26px;
  text-align: center;
`

export const ErrorText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.warning};
  line-height: 20px;
  text-align: center;
  margin-top: 10px;
`

export const LinkText = styled.Text<{ white?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ white = false, theme }) => (white ? "#FFFFFF" : theme.primary)};
  text-decoration-line: underline;
  text-align: center;
`

export const AccentText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  line-height: 20px;
`
