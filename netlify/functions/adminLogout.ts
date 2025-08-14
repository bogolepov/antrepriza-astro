import type { Handler } from '@netlify/functions';
import { makeMessagePacketResponse } from './lib/utils';
import { createAccessCookie, createRefreshCookie } from './utils/cookie-jwt';

export const handler: Handler = async (event, context) => {
	const accessCookie = createAccessCookie(undefined);
	const refreshCookie = createRefreshCookie(undefined);
	let handlerResponse = makeMessagePacketResponse(200, '', undefined);
	handlerResponse.multiValueHeaders = {
		'Set-Cookie': [accessCookie, refreshCookie],
		'Cache-Control': ['private'],
	};
	return handlerResponse;
};
