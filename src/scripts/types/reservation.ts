import { type TTicketType } from './prices';

export type TOrderItem = {
	type: TTicketType;
	count: number;
};

export type TReservation = {
	date: string;
	time: string;
	play_id: number;
	play_sid: string;
	stage_sid: string;
	tickets: TOrderItem[];
};

export type TNetlifyDataReservations = {
	lang: string;
	name: string;
	email: string;
	reservations: TReservation[];
	amount: number;
	when: string;
};
