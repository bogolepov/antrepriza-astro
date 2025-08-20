import type { Handler } from '@netlify/functions';
import { makeHandlerResponse } from './lib/utils';
import dictionaryServer from '@data/dictionary_server.json';
import { LANG_RU } from '@scripts/consts';
import { AuthPacketSchema, type TAuthPacket } from '@scripts/types/auth';
import { extractSchemaFromJson } from '@scripts/utils';
import { authUser } from './utils/users';
import { createAccessCookie, createRefreshCookie } from './utils/cookie-jwt';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	const packet: TAuthPacket = extractSchemaFromJson(AuthPacketSchema, event.body);
	if (!packet) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);

	const { name, message } = packet;

	let user = authUser(name, message);
	if (user) {
		if (user.roles.length) {
			const accessCookie = createAccessCookie(user);
			const refreshCookie = createRefreshCookie(user);
			let handlerResponse = makeHandlerResponse(200, '');
			handlerResponse.multiValueHeaders = {
				'Set-Cookie': [accessCookie, refreshCookie],
				'Cache-Control': ['private'],
			};
			return handlerResponse;
		} else return makeHandlerResponse(500, 'Некорректный аккаунт на сервере. Обратитесь к администратору сайта.');
	} else return makeHandlerResponse(401, 'Неверный логин или пароль');
};
