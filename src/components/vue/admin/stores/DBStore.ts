import { ENetlifyEndpoint, netlify, type TNetlifyFrom, type TNetlifyTo } from '@scripts/netlify';
import { getCookieAccessToken } from '@scripts/token-ck';
import {
	ReservationsPanelPacketSchema,
	type TNamedEventReservation,
	type TReservationsPanelPacket,
} from '@scripts/types/reservation';
import { extractSchemaFromJson } from '@scripts/utils';
import { defineStore } from 'pinia';
import { ref, toRaw } from 'vue';
import { useAuthStore } from './AuthStore';
import { ENetlifyAction, type TPanelRequest } from '@scripts/adminpanel/types/netlify-db';
import {
	SubscribersPanelPacketSchema,
	type TSubscriberPanel,
	type TSubscribersPanelPacket,
} from '@scripts/adminpanel/types/subscription';

export interface IExtNamedEventReservation extends TNamedEventReservation {
	first_in_month?: boolean;
	totalTickets?: number;
}

const enum ETypeMessage {
	UPDATE_SUBSCRIBERS = 'upd_subscribers',
	UPDATE_RESERVATIONS = 'upd_reservations',
	NEED_SYNCHRONIZATION = 'need_synchronization',
	READY_SYNCHRONIZATION = 'ready_synchronization',
}
interface DbChannelMessage {
	type: ETypeMessage;
	subscribers?: TSubscriberPanel[];
	reservations?: IExtNamedEventReservation[];
	id?: `${string}-${string}-${string}-${string}-${string}`;
}

export const useDbStore = defineStore('DbStore', () => {
	const dbChannel = new BroadcastChannel('db_store_');
	const id = crypto.randomUUID();

	let gotReservations: boolean = false;
	let gotSubscribers: boolean = false;
	const reservations = ref<IExtNamedEventReservation[]>([]);
	const subscribers = ref<TSubscriberPanel[]>([]);

	const getReservationsNetlify = async (update: boolean = false) => {
		if (!update && gotReservations) return;

		const handleResponse = (response: TNetlifyFrom<TReservationsPanelPacket>): void => {
			if (response.ok) {
				const verifiedPacket = extractSchemaFromJson(ReservationsPanelPacketSchema, JSON.stringify(response.packet));
				if (verifiedPacket) {
					reservations.value = verifiedPacket.events;
					gotReservations = true;
					dbChannel.postMessage({ type: ETypeMessage.UPDATE_RESERVATIONS, reservations: verifiedPacket.events });
				}
			} else {
				if (response.status === 401 && !getCookieAccessToken()) useAuthStore().logOut();
			}
		};

		const packet: TPanelRequest = { action: ENetlifyAction.GET_RESERVATIONS };
		const dataTo: TNetlifyTo = { packet, need_auth: true };
		netlify(ENetlifyEndpoint.NETLIFY_ADMIN_PANEL, dataTo, handleResponse);
	};

	const getSubscribersNetlify = async (update: boolean = false) => {
		if (!update && gotSubscribers) return;

		const handleResponse = (response: TNetlifyFrom<TSubscribersPanelPacket>): void => {
			if (response.ok) {
				const verifiedPacket = extractSchemaFromJson(SubscribersPanelPacketSchema, JSON.stringify(response.packet));
				if (verifiedPacket) {
					subscribers.value = verifiedPacket.emails;
					gotSubscribers = true;
					dbChannel.postMessage({ type: ETypeMessage.UPDATE_SUBSCRIBERS, subscribers: verifiedPacket.emails });
				}
			} else {
				if (response.status === 401 && !getCookieAccessToken()) useAuthStore().logOut();
			}
		};

		const packet: TPanelRequest = { action: ENetlifyAction.GET_SUBSCRIBERS };
		const dataTo: TNetlifyTo = { packet, need_auth: true };
		netlify(ENetlifyEndpoint.NETLIFY_ADMIN_PANEL, dataTo, handleResponse);
	};

	const $reset = () => {
		gotReservations = false;
		gotSubscribers = false;
		reservations.value = [];
		subscribers.value = [];
	};

	dbChannel.onmessage = event => {
		const msg = event.data as DbChannelMessage;
		if (!msg?.type) return;
		switch (msg.type) {
			case ETypeMessage.UPDATE_RESERVATIONS:
				reservations.value = msg?.reservations ?? [];
				gotReservations = msg?.reservations ? true : false;
				return;
			case ETypeMessage.UPDATE_SUBSCRIBERS:
				subscribers.value = msg?.subscribers ?? [];
				gotSubscribers = msg?.subscribers ? true : false;
				return;
			case ETypeMessage.NEED_SYNCHRONIZATION:
				if (id !== msg.id) {
					const answer: DbChannelMessage = { type: ETypeMessage.READY_SYNCHRONIZATION, id: msg.id };
					if (gotReservations) answer.reservations = toRaw(reservations.value);
					if (gotSubscribers) answer.subscribers = toRaw(subscribers.value);
					dbChannel.postMessage(answer);
				}
				return;
			case ETypeMessage.READY_SYNCHRONIZATION:
				if (msg.id === id) {
					if (!gotSubscribers && msg?.subscribers) {
						subscribers.value = msg?.subscribers;
						gotSubscribers = true;
					}
					if (!gotReservations && msg?.reservations) {
						reservations.value = msg?.reservations;
						gotReservations = true;
					}
				}
				return;
			default:
				const check: never = msg.type;
				return;
		}
	};

	function _loadState() {
		dbChannel.postMessage({ type: ETypeMessage.NEED_SYNCHRONIZATION, id });
	}
	_loadState();

	return { reservations, subscribers, getReservationsNetlify, getSubscribersNetlify, $reset };
});
