import { ESubscriptionState } from '@scripts/types/subscription';
import { z } from 'zod/v4';

export const SUBSCRIPTION_OBJ_LENGTH: number = 19;

export const SubscriberPanelSchema = z.object({
	state: z.enum(ESubscriptionState),
	email: z.string(),
});

export const SubscriberListPanelSchema = z.object({
	emails: z.array(SubscriberPanelSchema),
});

export const SubscribersPanelPacketSchema = SubscriberListPanelSchema.extend({
	hash: z.string(),
});

export type TSubscriberPanel = z.infer<typeof SubscriberPanelSchema>;
export type TSubscriberListPanel = z.infer<typeof SubscriberListPanelSchema>;
export type TSubscribersPanelPacket = z.infer<typeof SubscribersPanelPacketSchema>;

export function extractSubscribersPanelPacketFromJson(json_data: string): TSubscribersPanelPacket | undefined {
	const result = SubscribersPanelPacketSchema.safeParse(JSON.parse(json_data));
	if (result.success) return result.data as TSubscribersPanelPacket;
	else return undefined;
}
