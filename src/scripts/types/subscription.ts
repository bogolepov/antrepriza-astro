import { act } from 'react';
import { email, number, z } from 'zod/v4';

export const SUBSCRIPTION_KEY_LENGTH: number = 10;

export enum ESubscriptionAction {
	REG_INIT = 'init',
	REG_CONFIRM = 'confirm',
	REG_DELETE = 'delete',
}

export const SubscriptionPacketSchema = z.object({
	lang: z.string(),
	action: z.enum(ESubscriptionAction),
	email: z.string(),
	key: z.string(),
	sid: z.number(),
	usid: z.number(),
	check: z.string(),
});

export type TSubscriptionPacket = z.infer<typeof SubscriptionPacketSchema>;

export function initSubscriptionPacket(lang: string, action: ESubscriptionAction): TSubscriptionPacket {
	return { lang, action, email: '', key: '', sid: 0, usid: 0, check: '' };
}
// export function initSubscriptionPacket(lang: string, action: ESubscriptionAction): TSubscriptionPacket;
// export function initSubscriptionPacket(
// 	lang: string,
// 	action: ESubscriptionAction,
// 	email?: string,
// 	key?: string,
// 	sid?: number,
// 	usid?: number,
// 	check?: string
// ): TSubscriptionPacket {
// 	return { lang, action, email, key, sid, usid, check };
// }
