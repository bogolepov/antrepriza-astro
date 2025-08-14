import { z } from 'zod/v4';

// --------------------- reservation in DB --------------

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
});

export type TTicketItem = z.infer<typeof TicketItemSchema>;
export type TReservationItem = z.infer<typeof ReservationItemSchema>;
export type TEventReservation = z.infer<typeof EventReservationSchema>;
export type TNamedEventReservation = z.infer<typeof NamedEventReservationSchema>;
export type TReservationsPanelPacket = z.infer<typeof ReservationsPanelPacketSchema>;

// --------------------- to do reservation --------------

export const DoReservationItemSchema = z.object({
	date: z.string(),
	time: z.string(),
	play_id: z.number(),
	play_sid: z.string(),
	stage_sid: z.string(),
	tickets: z.array(TicketItemSchema),
});

export const DoReservationPacketSchema = z.object({
	lang: z.string(),
	name: z.string(),
	email: z.string(),
	reservations: z.array(DoReservationItemSchema),
	amount: z.number(),
	when: z.string(),
});

export type TDoReservationItem = z.infer<typeof DoReservationItemSchema>;
export type TDoReservationPacket = z.infer<typeof DoReservationPacketSchema>;
