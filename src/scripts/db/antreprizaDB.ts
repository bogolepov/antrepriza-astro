import { getAntreprizaDB } from './firebase';
import { collection, getDocs, getDoc, setDoc, doc } from 'firebase/firestore';
import type { TPlay, TStage, IItem, TPerformance, TRepetition, TWhatsappNote, TEventTickets } from './baseTypes';
import { EItemType, EWhatsappNoteType } from './baseTypes';
import {
	validatePlayStructure,
	validateStageStructure,
	validatePerformanceStructure,
	validateRepetitionStructure,
	checkEqualItems,
} from './baseTypes';
import { ONE_DAY } from '@scripts/consts';

export const COLLECTION_THEATER: string = 'theater';
export const COLLECTION_TICKETS: string = 'tickets';
export const COLLECTION_EMAILS: string = 'emails';
const DOC_THEATER_PLAYS: string = 'plays';
const DOC_THEATER_STAGES: string = 'stages';
const DOC_THEATER_PERFORMANCES: string = 'performances';
const DOC_THEATER_REPETITIONS: string = 'repetitions';
const DOC_THEATER_WHATSAPP_NOTES: string = 'whatsapp_notes';
export const DOC_THEATER_SUBSCRIBERS: string = 'subscribers';
export const COLLECTION_SUBSCRIBERS_EMAILS: string = 'emails';
const DOC_NEWS_EMAILS: string = 'news';

// let program;
// async function readProgram() {
// 	const querySnapshotProgram = await getDocs(collection(getAntreprizaDB(), 'program'));
// 	querySnapshotProgram.forEach(doc => {
// 		const events = doc.data();
// 		program.push(events);
// 	});
// }

// export function getProgram() {
// 	if (!program) readProgram();
// 	return program;
// }

// ---------------------------------------
//                  PLAYS
// ---------------------------------------

let plays: Array<TPlay> = [];
let srcPlays: Array<TPlay> = [];

export async function readPlays() {
	const docRef = doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_PLAYS);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists() && docSnap.data().plays) {
		plays = docSnap.data().plays;
		plays.forEach(play => validatePlayStructure(play));
		// srcPlays = JSON.parse(JSON.stringify(plays));
		srcPlays = structuredClone(plays);
	} else {
		plays = [];
		srcPlays = [];
	}
}

export async function getPlays(): Promise<TPlay[]> {
	if (!srcPlays || !srcPlays.length) await readPlays();
	return plays;
}

export async function savePlays(currPlays: Array<TPlay>, handleResult) {
	await setDoc(doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_PLAYS), { plays: currPlays }, { merge: false });
	srcPlays = structuredClone(currPlays);
	// srcPlays = JSON.parse(JSON.stringify(currPlays));
	await handleResult();
}

// ---------------------------------------
//                  STAGES
// ---------------------------------------
let stages: Array<TStage> = [];
let srcStages: Array<TStage> = [];

export async function readStages() {
	// console.log('readStages:');

	const docRef = doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_STAGES);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists() && docSnap.data().stages) {
		stages = docSnap.data().stages;
		stages.forEach(stage => validateStageStructure(stage));
		srcStages = JSON.parse(JSON.stringify(stages));
	} else {
		// console.log('empty stages');
		stages = [];
		srcStages = [];
	}
}

export async function getStages(): Promise<TStage[]> {
	if (!srcStages || !srcStages.length) await readStages();
	return stages;
}

export async function saveStages(currStages: Array<TStage>, handleResult) {
	// console.log(currStages);
	await setDoc(doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_STAGES), { stages: currStages });
	srcStages = JSON.parse(JSON.stringify(currStages));
	await handleResult();
}

// ---------------------------------------
//              PERFORMANCES
// ---------------------------------------
let performances: Array<TPerformance> = [];
let srcPerformances: Array<TPerformance> = [];

export async function readPerformances() {
	// console.log('readPerformances:');
	const docRef = doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_PERFORMANCES);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists() && docSnap.data().events) {
		performances = docSnap.data().events;
		performances.forEach(performance => validatePerformanceStructure(performance));
		srcPerformances = JSON.parse(JSON.stringify(performances));
	} else {
		// console.log('empty performance');
		performances = [];
		srcPerformances = [];
	}
}

export async function getPerformances(): Promise<TPerformance[]> {
	if (!srcPerformances || !performances.length) await readPerformances();
	return performances;
}

export async function savePerformances(currPerformances: Array<TPerformance>) {
	// console.log(currPerformances);
	await setDoc(doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_PERFORMANCES), { events: currPerformances });
	srcPerformances = JSON.parse(JSON.stringify(currPerformances));
}

// ---------------------------------------
//              REPETITIONS
// ---------------------------------------
let repetitions: Array<TRepetition> = [];
let srcRepetitions: Array<TRepetition> = [];

export async function readRepetitions() {
	// console.log('readRepetitions:');
	const docRef = doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_REPETITIONS);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists() && docSnap.data().events) {
		repetitions = docSnap.data().events;
		repetitions.forEach(repetition => validateRepetitionStructure(repetition));
		srcRepetitions = JSON.parse(JSON.stringify(repetitions));
	} else {
		// console.log('empty repetition');
		repetitions = [];
		srcRepetitions = [];
	}
}

export async function getRepetitions(): Promise<TRepetition[]> {
	if (!srcRepetitions || !srcRepetitions.length) await readRepetitions();
	return repetitions;
}

export async function saveRepetitions(currRepetitions: Array<TRepetition>) {
	await setDoc(doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_REPETITIONS), { events: currRepetitions });
	srcRepetitions = JSON.parse(JSON.stringify(currRepetitions));
}

// ---------------------------------------
//              WHATSAPP NOTES
// ---------------------------------------
let whatsappNotes: Array<TWhatsappNote> = [];
let srcWhatsappNotes: Array<TWhatsappNote> = [];

export async function readWhatsappNotes() {
	const docRef = doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_WHATSAPP_NOTES);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists() && docSnap.data().notes) {
		whatsappNotes = docSnap.data().notes;
		const actualDate = new Date(Date.now() - ONE_DAY);
		const onlyNumberActualDate =
			actualDate.getFullYear().toString() +
			(actualDate.getMonth() + 1).toString().padStart(2, '0') +
			actualDate.getDate().toString().padStart(2, '0');

		whatsappNotes = whatsappNotes.filter(note => {
			if (note.note_type === EWhatsappNoteType.PRE_NOTE || note.note_type === EWhatsappNoteType.POST_NOTE) return true;

			if (note.sid?.length > 0) {
				const eventData: string[] = note.sid.split('_');
				return Number(eventData[1]) > Number(onlyNumberActualDate);
			} else return false;
		});
		srcWhatsappNotes = JSON.parse(JSON.stringify(whatsappNotes));
	} else {
		whatsappNotes = [];
		srcWhatsappNotes = [];
	}
}

export async function getWhatsappNotes(): Promise<TWhatsappNote[]> {
	if (!srcWhatsappNotes || !srcWhatsappNotes.length) await readWhatsappNotes();
	return whatsappNotes;
}

export async function saveWhatsappNotes(currWhatsappNotes: Array<TWhatsappNote>) {
	await setDoc(doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_WHATSAPP_NOTES), { notes: currWhatsappNotes });
	srcWhatsappNotes = JSON.parse(JSON.stringify(currWhatsappNotes));
}

// ---------------------------------------
//                  RESERVATIONS
// ---------------------------------------

// let program;
// async function readProgram() {
// 	const querySnapshotProgram = await getDocs(collection(getAntreprizaDB(), 'program'));
// 	querySnapshotProgram.forEach(doc => {
// 		const events = doc.data();
// 		program.push(events);
// 	});
// }

// export function getProgram() {
// 	if (!program) readProgram();
// 	return program;
// }

let tickets: TEventTickets[];
export async function readTickets() {
	tickets = [];
	const querySnapshotTickets = await getDocs(collection(getAntreprizaDB(), COLLECTION_TICKETS));
	querySnapshotTickets.forEach(doc => {
		tickets.push({ event_sid: doc.id.trim(), reservations: doc.data().reservations });
	});
}

export async function getTickets(): Promise<TEventTickets[]> {
	if (!tickets) await readTickets();
	return tickets;
}

// ---------------------------------------
//                  <T>
// ---------------------------------------
function getSrcItems<T>(type: EItemType): T[] | undefined {
	switch (type) {
		case EItemType.PLAY:
			return srcPlays;
		case EItemType.STAGE:
			return srcStages;
		case EItemType.PERFORMANCE:
			return srcPerformances;
		case EItemType.REPETITION:
			return srcRepetitions;
		default:
			return undefined;
	}
}

export function changedItems<T extends IItem>(currItems: T[], type: EItemType): boolean {
	const srcItems = getSrcItems<T>(type);
	if (!srcItems) {
		console.error('changedItems: type ERROR !!!');
		return false;
	}

	if (currItems.length !== srcItems.length) return true;

	let equalItems = currItems.filter(item =>
		srcItems.find(srcItem => item.id === srcItem.id && checkEqualItems(item, srcItem, type))
	);
	return equalItems.length !== currItems.length;
}

// ---------------------------------------
// ---------------------------------------
export function changedWhatsappNotes(currNotes: TWhatsappNote[]): boolean {
	if (currNotes.length !== srcWhatsappNotes.length) return true;

	let equalNotes = currNotes.filter(note =>
		srcWhatsappNotes.find(srcNote => {
			if (srcNote.note_type !== note.note_type) return false;
			if (note.note_type === EWhatsappNoteType.PRE_NOTE || note.note_type === EWhatsappNoteType.POST_NOTE)
				return note.text === srcNote.text;
			else if (note.note_type === EWhatsappNoteType.PERFORMANCE || note.note_type === EWhatsappNoteType.REPETITION)
				return note.sid === srcNote.sid && note.text === srcNote.text;
			else return false;
		})
	);
	return equalNotes.length !== currNotes.length;
}
