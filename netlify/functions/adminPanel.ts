import type { Handler } from '@netlify/functions';
import { makePanelResponse } from './lib/utils';
import dictionaryServer from '@data/dictionary_server.json';
import { LANG_RU } from '@scripts/consts';
import { getSubscriptionsList } from './lib/db/apanel/subscription';
import type { TSubscriberPanel, TSubscribersPanelPacket } from '@scripts/adminpanel/types/subscription';
import { getCRC32 } from '@scripts/utils';
import { ENetlifyAction, extractPanelRequestFromJson, type TPanelRequest } from '@scripts/adminpanel/netlifyFunction';
import { getEventsReservationsList } from './lib/db/apanel/reservation';
import type { TNamedEventReservation, TReservationsPanelPacket } from '@scripts/types/reservation';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makePanelResponse(400, dictionaryServer.nf__invalid_request[LANG_RU], undefined);

	const request: TPanelRequest = extractPanelRequestFromJson(event.body);
	if (!request) return makePanelResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU], undefined);

	switch (request.action) {
		case ENetlifyAction.GET_SUBSCRIBERS:
			const subList: TSubscriberPanel[] = await getSubscriptionsList();
			const subPacket: TSubscribersPanelPacket = { emails: subList, hash: getCRC32(subList) };
			return makePanelResponse(200, '', subPacket);
		case ENetlifyAction.GET_RESERVATIONS:
			const reservList: TNamedEventReservation[] = await getEventsReservationsList();
			const reservPacket: TReservationsPanelPacket = { events: reservList, hash: getCRC32(reservList) };
			return makePanelResponse(200, '', reservPacket);
		default:
			return makePanelResponse(500, 'Необычный запрос: ' + request.action, undefined);
	}
};
