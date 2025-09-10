import type { HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { makeHandlerResponse } from '@netlify/lib/utils';
import { getHeaderCookieAccessToken, getHeaderCookieRefreshToken } from '@scripts/token-ck';
import type { UserAccessPayload, UserRefreshPayload, UserRole } from '@scripts/types/user-auth';
import { ENV, getEnv } from './env';
import jwt from 'jsonwebtoken';
import { createAccessCookie, createRefreshCookie } from './cookie-jwt';
import type { TAuthUser } from './users';
import dictionaryServer from '@data/dictionary_server.json';
import { LANG_RU } from '@scripts/consts';
import { PanelRequestSchema, type TPanelRequest } from '@scripts/adminpanel/types/netlify-db';
import { extractSchemaFromJson } from '@scripts/utils';

export function serverLogout(resCode: number) {
	const accessCookie = createAccessCookie(undefined);
	const refreshCookie = createRefreshCookie(undefined);
	let handlerResponse = makeHandlerResponse(resCode, undefined);
	handlerResponse.multiValueHeaders = {
		'Set-Cookie': [accessCookie, refreshCookie],
		'Cache-Control': ['private'],
	};
	return handlerResponse;
}

export async function withAuth(
	event: HandlerEvent,
	context: HandlerContext,
	internalHandler: (
		event: HandlerEvent,
		context: HandlerContext,
		user: UserAccessPayload,
		data: TPanelRequest
	) => Promise<HandlerResponse>
) {
	if (!event || !event.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	if (!event.headers?.cookie) {
		console.error('NO cookie');
		return makeHandlerResponse(401, 'Недостаточно данных для запроса');
	}

	// check tokens

	let validAccessToken = false;
	let validRefreshToken = false;
	let userAccessPayload: UserAccessPayload;
	let userRefreshPayload: UserRefreshPayload;

	const accessToken = getHeaderCookieAccessToken(event.headers.cookie);
	if (accessToken) {
		const secret = getEnv(ENV.JWT_ACCESS_SECRET);
		try {
			userAccessPayload = jwt.verify(accessToken, secret) as UserAccessPayload;
			if (!userAccessPayload) throw new Error();
			validAccessToken = true;
		} catch (err) {
			return makeHandlerResponse(401, 'Невалидный токен');
		}
	}

	const now = Date.now();

	// no access token or access token is expired
	if (!userAccessPayload?.exp || userAccessPayload.exp <= now / 1000) {
		validAccessToken = false;

		// check refresh token:
		// not expired: new access token
		// expired: logout
		const refreshToken = getHeaderCookieRefreshToken(event.headers.cookie);
		try {
			if (!refreshToken) throw new Error();
			const refreshSecret = getEnv(ENV.JWT_REFRESH_SECRET);
			userRefreshPayload = jwt.verify(refreshToken, refreshSecret) as UserRefreshPayload;
			if (!userRefreshPayload) throw new Error();
			validRefreshToken = true;

			if (!userRefreshPayload?.exp || userRefreshPayload.exp <= now / 1000) {
				validRefreshToken = false;
				throw new Error();
			}
		} catch (err) {
			return serverLogout(401);
		}
	}

	const request: TPanelRequest = extractSchemaFromJson(PanelRequestSchema, event.body);
	if (!request) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);

	const userPayload = validAccessToken ? userAccessPayload : userRefreshPayload;
	const response = await internalHandler(event, context, userPayload, request);

	// new tokens, if need
	if (!validAccessToken && validRefreshToken) {
		const user: TAuthUser = {
			name: userRefreshPayload.name,
			roles: userRefreshPayload.roles,
		};

		const accessCookie = createAccessCookie(user);
		const refreshCookie = createRefreshCookie(user);
		response.multiValueHeaders = {
			'Set-Cookie': [accessCookie, refreshCookie],
			'Cache-Control': ['private'],
		};
	}

	return response;
}
