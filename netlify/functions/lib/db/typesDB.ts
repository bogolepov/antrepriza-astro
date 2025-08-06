import type { ESubscriptionState } from '@scripts/types/subscription';

export type EmailDocDB = {
	lang: string;
	obj: string;
	sid: number;
	usid: number;
	state: ESubscriptionState;
};
