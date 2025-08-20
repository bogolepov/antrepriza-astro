import type { HandlerResponse } from '@netlify/functions';
import { type TBodyFromNetlify } from '@scripts/netlify';

export function makeHandlerResponse<T>(resCode: number, message: string, packet: T = undefined): HandlerResponse {
	const bodyObj: TBodyFromNetlify<T> = {};
	if (message) bodyObj.message = message;
	if (packet) bodyObj.packet = packet;
	const response: HandlerResponse = {
		statusCode: resCode,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(bodyObj),
	};
	return response;
}

export function fromHtmlToPlainText(str: string): string {
	return str.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function nonBreakingSpace(str: string): string {
	return str.replaceAll(' ', '&nbsp;');
}
