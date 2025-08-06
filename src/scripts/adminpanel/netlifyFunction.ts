import { z } from 'zod/v4';

export enum ENetlifyAction {
	GET_SUBSCRIBERS = 'nf_get_subscribers', // response: TSubscribersPanelPacket
}

export const PanelRequestSchema = z.object({
	action: z.enum(ENetlifyAction),
});
export const PanelResponseSchema = z.object({
	message: z.string(),
	packet: z.object(),
});

export type TPanelRequest = z.infer<typeof PanelRequestSchema>;
export type TPanelResponse = z.infer<typeof PanelResponseSchema>;

export function extractPanelRequestFromJson(json_data: string): TPanelRequest | undefined {
	console.log(json_data);
	const result = PanelRequestSchema.safeParse(JSON.parse(json_data));
	if (result.success) return result.data as TPanelRequest;
	else return undefined;
}

export function netlifyFunction(
	action: ENetlifyAction,
	handleResult: (isOk: boolean, message: string, packet: any) => void
): void {
	const request: TPanelRequest = { action };
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(request),
	};

	let isOk: boolean;
	fetch('/.netlify/functions/adminPanel', options)
		.then(response => {
			isOk = response.ok;
			return response.json();
		})
		.then(data => {
			console.log(data);
			if (isOk) handleResult(true, data.message, data.packet);
			else throw new Error(data.message);
		})
		.catch(err => handleResult(false, err.message, undefined));
}
