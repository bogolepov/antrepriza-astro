import { ref } from 'vue';
import { EAuthRole } from '@scripts/auth';
import type { TStage, TPlay, TWhatsappNote, TPerformance, TRepetition, TEventTickets } from '@scripts/db/baseTypes';
import {
	getPerformances,
	getPlays,
	getRepetitions,
	getStages,
	getWhatsappNotes,
	getTickets,
} from '@scripts/db/antreprizaDB';
import {
	extractSubscribersPanelPacketFromJson,
	type TSubscriberPanel,
	type TSubscribersPanelPacket,
} from '@scripts/adminpanel/types/subscription';
import { ENetlifyAction, netlifyFunction } from '@scripts/adminpanel/netlifyFunction';
import { getCRC32 } from '@scripts/utils';

// -----------------------------------------------------
export const showMenu = ref(true);
export const smallScreen = ref(false);
export const isDemo = ref(true);

export function setAuthRole(role: EAuthRole) {
	if (role === EAuthRole.DEMO) isDemo.value = true;
	else isDemo.value = false;
}

// -----------------------------------------------------
//                whatsapp notes
// -----------------------------------------------------
let gotPlays: boolean = false;
export const plays = ref<Array<TPlay>>([]);
export async function initPlays() {
	if (gotPlays) return;
	plays.value = await getPlays();
	gotPlays = true;
	initOptionListPlays();
}
export function commitPlays() {
	updateOptionListPlays();
}

let gotStages: boolean = false;
export const stages = ref<Array<TStage>>([]);
export async function initStages() {
	if (gotStages) return;
	stages.value = await getStages();
	gotStages = true;
	initOptionListStages();
}
export function commitStages() {
	updateOptionListStages();
}

let gotPerformances: boolean = false;
export const performances = ref<Array<TPerformance>>([]);
export async function initPerformances() {
	if (gotPerformances) return;
	await initPlays();
	await initStages();
	performances.value = await getPerformances();
	gotPerformances = true;
}

let gotRepetitions: boolean = false;
export const repetitions = ref<Array<TRepetition>>([]);
export async function initRepetitions() {
	if (gotRepetitions) return;
	await initPlays();
	await initStages();
	await initPerformances();
	repetitions.value = await getRepetitions();
	gotRepetitions = true;
}

let gotWhatsappNotes: boolean = false;
export const whatsappNotes = ref<Array<TWhatsappNote>>([]);
export async function initWhatsappNotes() {
	if (gotWhatsappNotes) return;
	await initPlays();
	await initStages();
	await initPerformances();
	await initRepetitions();
	whatsappNotes.value = await getWhatsappNotes();
	gotWhatsappNotes = true;
}

let gotTickets: boolean = false;
export const tickets = ref<Array<TEventTickets>>([]);
export async function initTickets() {
	if (gotTickets) return;
	await initPlays();
	await initStages();
	await initPerformances();
	tickets.value = await getTickets();
	gotTickets = true;
}

let gotSubscribers: boolean = false;
export const subscribers = ref<Array<TSubscriberPanel>>([]);
export function getSubscribers() {
	if (gotSubscribers) return;

	const handleResult = (isOk: boolean, message: string, packet: TSubscribersPanelPacket) => {
		if (isOk) {
			if (packet && packet.hash === getCRC32(packet.emails)) {
				subscribers.value = packet.emails;
				console.log('vue:');
				console.log(subscribers.value);
				gotSubscribers = true;
			}
		} else console.error('*VUE*  getSubscribers() error: ', message);
	};
	netlifyFunction(ENetlifyAction.GET_SUBSCRIBERS, handleResult);
}

// export function updateWhatsappNotes(notes: TWhatsappNote[]) {
// 	whatsappNotes.value = [];
// 	notes.forEach(note => whatsappNotes.value.push({ text: play.name.ru, value: play.sid, duration: play.duration }));
// }

// -----------------------------------------------------
//         option lists for plays/stages
// -----------------------------------------------------
type TPlayOption = {
	text: string;
	value: string;
	duration: number;
};
type TStageOption = {
	text: string;
	value: string;
	fixed: boolean;
};
export const optionListStages = ref<TStageOption[]>([]);
export const optionListPlays = ref<TPlayOption[]>([]);

function initOptionListPlays() {
	if (optionListPlays.value.length) return;
	optionListPlays.value = [];
	plays.value.forEach(play =>
		optionListPlays.value.push({ text: play.name.ru, value: play.sid, duration: play.duration })
	);
}
function updateOptionListPlays() {
	optionListPlays.value = [];
	plays.value.forEach(play =>
		optionListPlays.value.push({ text: play.name.ru, value: play.sid, duration: play.duration })
	);
}

function initOptionListStages() {
	if (optionListStages.value.length) return;
	optionListStages.value = [];
	stages.value.forEach(stage =>
		optionListStages.value.push({ text: stage.name.ru, value: stage.sid, fixed: stage.fixed })
	);
}
function updateOptionListStages() {
	optionListStages.value = [];
	stages.value.forEach(stage =>
		optionListStages.value.push({ text: stage.name.ru, value: stage.sid, fixed: stage.fixed })
	);
}
