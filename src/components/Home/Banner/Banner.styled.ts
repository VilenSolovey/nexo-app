import { Appearance } from "react-native"
import styled from "styled-components/native"
import { Theme } from "@nexo/constants/theme"


export const Container = styled.View`
	width: 95%;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	background-color: ${Theme.shopCard};
	padding: 22px;
	border-radius: 16px;
 	border-width: 1px;
  	border-color: rgba(94, 234, 212, 0.18);
`;

export const Left = styled.View`
	flex: 1;
	padding-right: 16px;
`;

export const Title = styled.Text`
	font-size: 18px;
	font-weight: 700;
	color: ${Theme.text};
`;

export const Subtitle = styled.Text`
	font-size: 14px;
	margin-top: 6px;
	color: ${Theme.textSecondary};
`;

export const Cta = styled.View`
	padding: 10px 18px;
	border-radius: 10px;
	align-items: center;
	border-width: 1px;
	border-color: ${Theme.primary};
	background-color: transparent;
`;

export const CtaText = styled.Text`
  color: ${Theme.primary};
  font-weight: 800;
`;

