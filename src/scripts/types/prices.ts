import { type TMultiText } from './base';

export type TTicketType = string;
export type TPrice = {
	type: TTicketType;
	value: number;
	text: TMultiText;
	text_short: TMultiText;
};
