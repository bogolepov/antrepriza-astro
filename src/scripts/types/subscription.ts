import { z } from 'zod/v4';

export const SUBSCRIPTION_OBJ_LENGTH: number = 19;

export enum ESubscriptionState {
	REG_INIT = 'init',
	REG_CONFIRM = 'confirm',
	REG_DELETE = 'delete',
}

export const SubscriberSchema = z.object({
	lang: z.string(),
	state: z.enum(ESubscriptionState),
	email: z.string(),
	obj: z.string(),
	sid: z.number(),
	usid: z.number(),
});

export const SubscriptionPacketSchema = SubscriberSchema.extend({
	check: z.string(),
});

export const SubscribersDBSchema = z.object({
	users: z.array(SubscriberSchema),
});

export type TSubscriber = z.infer<typeof SubscriberSchema>;
export type TSubscriptionPacket = z.infer<typeof SubscriptionPacketSchema>;
export type TSubscribersDB = z.infer<typeof SubscribersDBSchema>;

export function initSubscriptionPacket(
	lang: string,
	state: ESubscriptionState,
	email: string,
	obj: string,
	sid: number,
	usid: number
): TSubscriptionPacket {
	const packet: TSubscriptionPacket = { lang, state, email: '', obj: '', sid: 0, usid: 0, check: '' };
	switch (state) {
		case ESubscriptionState.REG_INIT:
			packet.email = email;
			return packet;
		case ESubscriptionState.REG_CONFIRM:
			packet.obj = obj;
			packet.sid = sid;
			return packet;
		case ESubscriptionState.REG_DELETE:
			packet.obj = obj;
			packet.usid = usid;
			return packet;
		default:
			return packet;
	}
}
