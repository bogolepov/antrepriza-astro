import { ref } from 'vue';
import { EAuthRole } from '@scripts/auth';
import type { TStage, TPlay, TWhatsappNote, TPerformance, TRepetition } from '@scripts/db/baseTypes';
import { getPerformances, getPlays, getRepetitions, getStages, getWhatsappNotes } from '@scripts/db/antreprizaDB';

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
export const plays = ref<Array<TPlay>>([]);
export async function initPlays() {
	if (plays.value.length) return;
	plays.value = await getPlays();
	initOptionListPlays();
}
export function commitPlays() {
	updateOptionListPlays();
}

export const stages = ref<Array<TStage>>([]);
export async function initStages() {
	if (stages.value.length) return;
	stages.value = await getStages();
	initOptionListStages();
}
export function commitStages() {
	updateOptionListStages();
}

export const performances = ref<Array<TPerformance>>([]);
export async function initPerformances() {
	if (performances.value.length) return;
	performances.value = await getPerformances();
}

export const repetitions = ref<Array<TRepetition>>([]);
export async function initRepetitions() {
	if (repetitions.value.length) return;
	repetitions.value = await getRepetitions();
}

export const whatsappNotes = ref<Array<TWhatsappNote>>([]);
export async function initWhatsappNotes() {
	if (whatsappNotes.value.length) return;
	whatsappNotes.value = await getWhatsappNotes();
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
	plays.value.forEach(play => optionListPlays.value.push({ text: play.name.ru, value: play.sid, duration: play.duration }));
}
function updateOptionListPlays() {
	optionListPlays.value = [];
	plays.value.forEach(play => optionListPlays.value.push({ text: play.name.ru, value: play.sid, duration: play.duration }));
}

function initOptionListStages() {
	if (optionListStages.value.length) return;
	optionListStages.value = [];
	stages.value.forEach(stage => optionListStages.value.push({ text: stage.name.ru, value: stage.sid, fixed: stage.fixed }));
}
function updateOptionListStages() {
	optionListStages.value = [];
	stages.value.forEach(stage => optionListStages.value.push({ text: stage.name.ru, value: stage.sid, fixed: stage.fixed }));
}
