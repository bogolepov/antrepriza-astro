import type { HandlerResponse } from '@netlify/functions';

export function makeHandlerResponse(resCode: number, resMessage: string): HandlerResponse {
	if (resCode >= 400) console.error('resMessage: ' + resCode + ', ' + resMessage);
	return {
		statusCode: resCode,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			message: resMessage,
		}),
	};
}

export function makeMessagePacketResponse<T>(resCode: number, message: string, packet: T): HandlerResponse {
	if (resCode >= 400) console.error('resMessage: ' + resCode + ', ' + message);
	return {
		statusCode: resCode,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ message, packet }),
	};
}

export function fromHtmlToPlainText(str: string): string {
	return str.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function nonBreakingSpace(str: string): string {
	return str.replaceAll(' ', '&nbsp;');
}
