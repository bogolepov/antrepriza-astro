import { z } from 'zod/v4';

export const TicketItemSchema = z.object({
	type: z.string(),
	count: z.number(),
});

export const ReservationItemSchema = z.object({
	email: z.string(),
	lang: z.string(),
	name: z.string(),
	order_id: z.string(),
	when: z.string(),
	tickets: z.array(TicketItemSchema),
});

export const EventReservationSchema = z.object({
	reservations: z.array(ReservationItemSchema),
	stage_sid: z.string(),
	play_sid: z.string(),
	date: z.string(),
	time: z.string(),
	play_id: z.number().optional(),
});

export const NamedEventReservationSchema = EventReservationSchema.extend({
	event_sid: z.string(),
});

export const ReservationsPanelPacketSchema = z.object({
	events: z.array(NamedEventReservationSchema),
	hash: z.string(),
});

export type TTicketItem = z.infer<typeof TicketItemSchema>;
export type TReservationItem = z.infer<typeof ReservationItemSchema>;
export type TEventReservation = z.infer<typeof EventReservationSchema>;
export type TNamedEventReservation = z.infer<typeof NamedEventReservationSchema>;
export type TReservationsPanelPacket = z.infer<typeof ReservationsPanelPacketSchema>;

export function extractReservationsPanelPacketFromJson(json_data: string): TReservationsPanelPacket | undefined {
	const result = ReservationsPanelPacketSchema.safeParse(JSON.parse(json_data));
	if (result.success) return result.data as TReservationsPanelPacket;
	else return undefined;
}

export type TDoReservation = {
	date: string;
	time: string;
	play_id: number;
	play_sid: string;
	stage_sid: string;
	tickets: TTicketItem[];
};

export type TNetlifyDataReservations = {
	lang: string;
	name: string;
	email: string;
	reservations: TDoReservation[];
	amount: number;
	when: string;
};
