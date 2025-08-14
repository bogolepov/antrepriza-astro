import { ESubscriptionState } from '@scripts/types/subscription';
import { z } from 'zod/v4';

export const SUBSCRIPTION_OBJ_LENGTH: number = 19;

export const SubscriberPanelSchema = z.object({
	state: z.enum(ESubscriptionState),
	email: z.string(),
});

export const SubscribersPanelPacketSchema = z.object({
	emails: z.array(SubscriberPanelSchema),
});

export type TSubscriberPanel = z.infer<typeof SubscriberPanelSchema>;
export type TSubscribersPanelPacket = z.infer<typeof SubscribersPanelPacketSchema>;
