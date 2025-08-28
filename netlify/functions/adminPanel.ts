import type { Handler, HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { makeHandlerResponse } from './lib/utils';
import { getSubscriptionsList } from './lib/db/apanel/subscription';
import type { TSubscribersPanelPacket, TSubscriberPanel } from '@scripts/adminpanel/types/subscription';
import { ENetlifyAction, type TPanelRequest } from '@scripts/adminpanel/types/netlify-db';
import { getEventsReservationsList } from './lib/db/apanel/reservation';
import type { TNamedEventReservation, TReservationsPanelPacket } from '@scripts/types/reservation';
import { UserRole, type UserAccessPayload } from '@scripts/types/user-auth';
import { withAuth } from './utils/auth';
import { checkAccess } from './utils/roles';

async function internalHandler(
	event: HandlerEvent,
	context: HandlerContext,
	user: UserAccessPayload,
	data: TPanelRequest
): Promise<HandlerResponse> {
	let hasAccess: boolean = false;
	if (data.action === ENetlifyAction.GET_SUBSCRIBERS || data.action === ENetlifyAction.GET_RESERVATIONS) {
		hasAccess = checkAccess(user.roles, UserRole.ADMIN);
		if (!hasAccess) return makeHandlerResponse(403, 'Недостаточно прав.');
	}

	switch (data.action) {
		case ENetlifyAction.GET_SUBSCRIBERS:
			const subList: TSubscriberPanel[] = await getSubscriptionsList();
			const subPacket: TSubscribersPanelPacket = { emails: subList };
			return makeHandlerResponse(200, undefined, subPacket);
		case ENetlifyAction.GET_RESERVATIONS:
			const reservList: TNamedEventReservation[] = await getEventsReservationsList();
			const reservPacket: TReservationsPanelPacket = { events: reservList };
			return makeHandlerResponse(200, undefined, reservPacket);
		default:
			const check: never = data.action;
			return makeHandlerResponse(400, 'Необычный запрос: ' + data.action);
	}
}

export const handler: Handler = async (event, context) => {
	return await withAuth(event, context, internalHandler);
};
