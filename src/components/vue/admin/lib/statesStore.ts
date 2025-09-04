import { ref } from 'vue';
import {
	SubscribersPanelPacketSchema,
	type TSubscriberPanel,
	type TSubscribersPanelPacket,
} from '@scripts/adminpanel/types/subscription';
import { ENetlifyAction, type TPanelRequest } from '@scripts/adminpanel/types/netlify-db';
import { extractSchemaFromJson } from '@scripts/utils';
import {
	ReservationsPanelPacketSchema,
	type TNamedEventReservation,
	type TReservationsPanelPacket,
} from '@scripts/types/reservation';
import { ESubscriptionState } from '@scripts/types/subscription';
import type { IPerformanceJson, IPlayJson, IPriceJson, IStageJson } from '@scripts/adminpanel/types/json-files';
import { ENetlifyEndpoint, netlify, type TNetlifyFrom, type TNetlifyTo } from '@scripts/netlify';
import type { UserRole } from '@scripts/types/user-auth';
import { getCookieAccessToken } from '@scripts/token-ck';

import theater from '@data/theater.json';
import playsJSON from '@data/plays.json';
import afishaJSON from '@data/afisha.json';
import pricesJSON from '@data/prices.json';

// ------------------- JSON files ----------------------

const jsonPlays: IPlayJson[] = playsJSON;
export function getPlays(): IPlayJson[] {
	return jsonPlays;
}

const jsonStages: IStageJson[] = theater.stages;
export function getStages(): IStageJson[] {
	return jsonStages;
}

const afisha: IPerformanceJson[] = afishaJSON;
export function getPerformances(): IPerformanceJson[] {
	return afisha;
}

const jsonPrices: IPriceJson[] = pricesJSON;
export function getPrices(): IPriceJson[] {
	return jsonPrices;
}

// -----------------------------------------------------
export const showMenu = ref(true);
export const smallScreen = ref(false);

export const authRoles = ref<UserRole[]>([]);
export const authName = ref<string>('');
export const loggedOut = ref<boolean>(true);

export const isActualPerformancesTickets = ref(true);
export const isActualPerformancesAfisha = ref(true);
export const subscriptionState = ref<ESubscriptionState | 'all'>(ESubscriptionState.REG_CONFIRM);

// -----------------------------------------------------

export interface IExtNamedEventReservation extends TNamedEventReservation {
	first_in_month?: boolean;
	totalTickets?: number;
}

let gotReservations: boolean = false;
export const reservations = ref<IExtNamedEventReservation[]>([]);
export async function getReservationsNetlify(update: boolean = false) {
	if (!update && gotReservations) return;

	const handleResponse = (response: TNetlifyFrom<TReservationsPanelPacket>): void => {
		if (response.ok) {
			const verifiedPacket = extractSchemaFromJson(ReservationsPanelPacketSchema, JSON.stringify(response.packet));
			if (verifiedPacket) {
				reservations.value = verifiedPacket.events;
				gotReservations = true;
			}
		} else {
			// console.error('*VUE*  getReservations() error: ', response.message);
			if (response.status === 401 && !getCookieAccessToken()) loggedOut.value = true;
		}
	};

	const packet: TPanelRequest = { action: ENetlifyAction.GET_RESERVATIONS };
	const dataTo: TNetlifyTo = { packet, need_auth: true };
	netlify(ENetlifyEndpoint.NETLIFY_ADMIN_PANEL, dataTo, handleResponse);
}

let gotSubscribers: boolean = false;
export const subscribers = ref<TSubscriberPanel[]>([]);
export function getSubscribersNetlify(update: boolean = false) {
	if (!update && gotSubscribers) return;

	const handleResponse = (response: TNetlifyFrom<TSubscribersPanelPacket>): void => {
		if (response.ok) {
			const verifiedPacket = extractSchemaFromJson(SubscribersPanelPacketSchema, JSON.stringify(response.packet));
			if (verifiedPacket) {
				subscribers.value = verifiedPacket.emails;
				gotSubscribers = true;
			}
		} else {
			// console.error('*VUE*  getSubscribers() error: ', response.message);
			if (response.status === 401 && !getCookieAccessToken()) loggedOut.value = true;
		}
	};

	const packet: TPanelRequest = { action: ENetlifyAction.GET_SUBSCRIBERS };
	const dataTo: TNetlifyTo = { packet, need_auth: true };

	netlify(ENetlifyEndpoint.NETLIFY_ADMIN_PANEL, dataTo, handleResponse);
}

export function resetDataLogout() {
	gotReservations = false;
	gotSubscribers = false;
	reservations.value = [];
	subscribers.value = [];
}
