import { z } from 'zod/v4';

export const SUBSCRIPTION_OBJ_LENGTH: number = 19;

export enum ESubscriptionAction {
	REG_INIT = 'init',
	REG_CONFIRM = 'confirm',
	REG_DELETE = 'delete',
}

export const SubscriptionPacketSchema = z.object({
	lang: z.string(),
	action: z.enum(ESubscriptionAction),
	email: z.string(),
	obj: z.string(),
	sid: z.number(),
	usid: z.number(),
	check: z.string(),
});

export type TSubscriptionPacket = z.infer<typeof SubscriptionPacketSchema>;

export function initSubscriptionPacket(
	lang: string,
	action: ESubscriptionAction,
	email: string,
	obj: string,
	sid: number,
	usid: number
): TSubscriptionPacket {
	const packet: TSubscriptionPacket = { lang, action, email: '', obj: '', sid: 0, usid: 0, check: '' };
	switch (action) {
		case ESubscriptionAction.REG_INIT:
			packet.email = email;
			return packet;
		case ESubscriptionAction.REG_CONFIRM:
			packet.obj = obj;
			packet.sid = sid;
			return packet;
		case ESubscriptionAction.REG_DELETE:
			packet.obj = obj;
			packet.usid = usid;
			return packet;
		default:
			return packet;
	}
}
