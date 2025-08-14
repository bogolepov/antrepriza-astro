import { z } from 'zod/v4';

export enum ENetlifyAction {
	GET_SUBSCRIBERS = 'nf_get_subscribers', // response: TSubscribersPanelPacket
	GET_RESERVATIONS = 'nf_get_reservations',
}

export const PanelRequestSchema = z.object({
	action: z.enum(ENetlifyAction),
});

export type TPanelRequest = z.infer<typeof PanelRequestSchema>;
