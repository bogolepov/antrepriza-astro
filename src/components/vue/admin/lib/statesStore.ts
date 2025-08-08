import { ref } from 'vue';
import { EAuthRole } from '@scripts/auth';
import { type TSubscriberPanel, type TSubscribersPanelPacket } from '@scripts/adminpanel/types/subscription';
import { ENetlifyAction, netlifyFunction } from '@scripts/adminpanel/netlifyFunction';
import { getCRC32 } from '@scripts/utils';
import {
	extractReservationsPanelPacketFromJson,
	type TNamedEventReservation,
	type TReservationsPanelPacket,
} from '@scripts/types/reservation';
import { ESubscriptionState } from '@scripts/types/subscription';

import theater from '@data/theater.json';
import playsJSON from '@data/plays.json';
import afishaJSON from '@data/afisha.json';
import pricesJSON from '@data/prices.json';
import type { IPerformanceJson, IPlayJson, IPriceJson, IStageJson } from '@scripts/adminpanel/types/json-files';

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
export const isDemo = ref(true);

export function setAuthRole(role: EAuthRole) {
	if (role === EAuthRole.DEMO) isDemo.value = true;
	else isDemo.value = false;
}

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
export async function getReservationsNetlify() {
	if (gotReservations) return;

	const handleResult = (isOk: boolean, message: string, packet: TReservationsPanelPacket) => {
		if (isOk) {
			const verifiedPacket = extractReservationsPanelPacketFromJson(JSON.stringify(packet));
			if (verifiedPacket && packet.hash === getCRC32(packet.events)) {
				reservations.value = packet.events;
				gotReservations = true;
			} else console.error('*VUE*  getReservations() : INVALID PACKET');
		} else console.error('*VUE*  getReservations() error: ', message);
	};

	netlifyFunction(ENetlifyAction.GET_RESERVATIONS, handleResult);
}

let gotSubscribers: boolean = false;
export const subscribers = ref<TSubscriberPanel[]>([]);
export function getSubscribersNetlify() {
	if (gotSubscribers) return;

	const handleResult = (isOk: boolean, message: string, packet: TSubscribersPanelPacket) => {
		if (isOk) {
			if (packet && packet.hash === getCRC32(packet.emails)) {
				subscribers.value = packet.emails;
				gotSubscribers = true;
			}
		} else console.error('*VUE*  getSubscribers() error: ', message);
	};
	netlifyFunction(ENetlifyAction.GET_SUBSCRIBERS, handleResult);
}
