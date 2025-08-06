import type { HandlerResponse } from '@netlify/functions';

export function makeHandlerResponse(resCode: number, resMessage: string): HandlerResponse {
	if (resCode >= 400) console.error('resMessage: ' + resCode + ', ' + resMessage);
	return {
		statusCode: resCode,
		body: JSON.stringify({
			message: resMessage,
		}),
	};
}

export function makePanelResponse(resCode: number, message: string, packet: any): HandlerResponse {
	if (resCode >= 400) console.error('resMessage: ' + resCode + ', ' + message);
	return {
		statusCode: resCode,
		body: JSON.stringify({ message, packet }),
	};
}

export function fromHtmlToPlainText(str: string): string {
	return str.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function nonBreakingSpace(str: string): string {
	return str.replaceAll(' ', '&nbsp;');
}
