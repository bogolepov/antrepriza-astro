import type { Handler } from '@netlify/functions';
import { makePanelResponse } from './lib/utils';
import dictionaryServer from '@data/dictionary_server.json';
import { LANG_RU } from '@scripts/consts';
import { getSubscriptionsList } from './lib/db/apanel/subscription';
import type { TSubscriberPanel, TSubscribersPanelPacket } from '@scripts/adminpanel/types/subscription';
import { getCRC32 } from '@scripts/utils';
import { ENetlifyAction, extractPanelRequestFromJson, type TPanelRequest } from '@scripts/adminpanel/netlifyFunction';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makePanelResponse(400, dictionaryServer.nf__invalid_request[LANG_RU], undefined);

	const request: TPanelRequest = extractPanelRequestFromJson(event.body);
	if (!request) return makePanelResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU], undefined);

	switch (request.action) {
		case ENetlifyAction.GET_SUBSCRIBERS:
			const list: TSubscriberPanel[] = await getSubscriptionsList();
			const packet: TSubscribersPanelPacket = { emails: list, hash: getCRC32(list) };
			return makePanelResponse(200, '', packet);
		default:
			return makePanelResponse(500, 'Необычный запрос: ' + request.action, undefined);
	}
};
