import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { ENV, getEnv } from './utils/env';
import { authUserGoogle, type GoogleUserInfo } from './utils/users';
import { createAccessCookie, createRefreshCookie } from './utils/cookie-jwt';

// Тип для ответа от Google OAuth
interface GoogleTokenResponse {
	access_token: string;
	expires_in: number;
	refresh_token?: string;
	scope: string;
	token_type: string;
	id_token: string;
}

function errorResponse(code: number, errMessage: string, redirectUrl: string = '/admin/'): HandlerResponse {
	console.error(`AuthGoogle [2]: status - ${code}, message - "${errMessage}"`);
	return {
		statusCode: 302,
		headers: {
			Location: redirectUrl,
		},
	};
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
	const params = event.queryStringParameters || {};

	if (!params.code) return errorResponse(400, 'Missing authorization code');
	// if (!params.state) return errorResponse(400, 'Missing authorization state');
	// if (params.state != state) return errorResponse(400, 'Incorrect authorization state');

	const code = params.code;

	try {
		// 1. Обмен code на токены
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: getEnv(ENV.OAUTH_GOOGLE_CLIENT_ID) ?? '',
				client_secret: getEnv(ENV.OAUTH_GOOGLE_CLIENT_SECRET) ?? '',
				redirect_uri: getEnv(ENV.ROOT_URL)?.concat('/.netlify/functions/adminAuthGoogle2'),
				grant_type: 'authorization_code',
			}),
		});

		if (!tokenResponse.ok) {
			const err = await tokenResponse.text();
			return errorResponse(tokenResponse.status, `Token exchange failed: ${err}`);
		}

		const tokenData: GoogleTokenResponse = await tokenResponse.json();

		// 2. Получение информации о пользователе
		const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: { Authorization: `Bearer ${tokenData.access_token}` },
		});

		if (!userInfoRes.ok) {
			const err = await userInfoRes.text();
			return errorResponse(userInfoRes.status, `Userinfo fetch failed: ${err}`);
		}

		const userInfo: GoogleUserInfo = await userInfoRes.json();
		const authUser = authUserGoogle(userInfo);
		const accessCookie = createAccessCookie(authUser);
		const refreshCookie = createRefreshCookie(authUser);

		// const sessionData = JSON.stringify({ user: userInfo });
		// const sessionCookie = `session=${Buffer.from(sessionData).toString('base64')}; Path=/; HttpOnly; Secure; SameSite=Lax`;

		const response: HandlerResponse = {
			statusCode: 302,
			headers: {
				Location: '/admin/performances/',
			},
		};
		response.multiValueHeaders = {
			'Set-Cookie': [accessCookie, refreshCookie /*, sessionCookie*/],
			'Cache-Control': ['private'],
		};
		return response;
		// 	headers: { 'Content-Type': 'application/json' },
		// 	body: JSON.stringify({ user: userInfo, tokens: tokenData }, null, 2),
	} catch (err) {
		return errorResponse(500, `Server error: ${(err as Error).message}`);
	}
};
