import styled from "styled-components/native"


export const Container = styled.View`
	width: 95%;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	background-color: ${({ theme }) => theme.shopCard};
	padding: 22px;
	border-radius: 16px;
 	border-width: 1px;
  	border-color: rgba(94, 234, 212, 0.18);
	shadow-color: ${({ theme }) => theme.primary};
	shadow-opacity: 0.16;
	shadow-radius: 20px;
	shadow-offset: 0px 12px;
	elevation: 5;
`;

export const Left = styled.View`
	flex: 1;
	padding-right: 16px;
`;

export const Title = styled.Text`
	font-size: 18px;
	font-weight: 700;
	color: ${({ theme }) => theme.text};
`;

export const Subtitle = styled.Text`
	font-size: 14px;
	margin-top: 6px;
	color: ${({ theme }) => theme.textSecondary};
`;

export const Cta = styled.View`
	padding: 10px 18px;
	border-radius: 10px;
	align-items: center;
	border-width: 1px;
	border-color: ${({ theme }) => theme.primary};
	background-color: rgba(94, 234, 212, 0.1);
`;

export const CtaText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-weight: 800;
`;
