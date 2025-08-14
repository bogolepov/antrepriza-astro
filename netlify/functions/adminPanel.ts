import type { Handler } from '@netlify/functions';
import { makeMessagePacketResponse } from './lib/utils';
import dictionaryServer from '@data/dictionary_server.json';
import { LANG_RU } from '@scripts/consts';
import { getSubscriptionsList } from './lib/db/apanel/subscription';
import type { TSubscribersPanelPacket, TSubscriberPanel } from '@scripts/adminpanel/types/subscription';
import { extractSchemaFromJson } from '@scripts/utils';
import { ENetlifyAction, PanelRequestSchema, type TPanelRequest } from '@scripts/adminpanel/types/netlify-db';
import { getEventsReservationsList } from './lib/db/apanel/reservation';
import type { TNamedEventReservation, TReservationsPanelPacket } from '@scripts/types/reservation';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body)
		return makeMessagePacketResponse(400, dictionaryServer.nf__invalid_request[LANG_RU], undefined);

	const request: TPanelRequest = extractSchemaFromJson(PanelRequestSchema, event.body);
	if (!request) return makeMessagePacketResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU], undefined);

	console.log(event.headers);

	switch (request.action) {
		case ENetlifyAction.GET_SUBSCRIBERS:
			const subList: TSubscriberPanel[] = await getSubscriptionsList();
			const subPacket: TSubscribersPanelPacket = { emails: subList };
			return makeMessagePacketResponse(200, '', subPacket);
		case ENetlifyAction.GET_RESERVATIONS:
			const reservList: TNamedEventReservation[] = await getEventsReservationsList();
			const reservPacket: TReservationsPanelPacket = { events: reservList };
			return makeMessagePacketResponse(200, '', reservPacket);
		default:
			return makeMessagePacketResponse(400, 'Необычный запрос: ' + request.action, undefined);
	}
};
