import { getAntreprizaDB } from './firebase';
import { collection, getDocs, getDoc, setDoc, doc } from 'firebase/firestore';
import type { TPlay, TStage } from './baseTypes';
import { validatePlayStructure, validateStageStructure, checkEqualPlays, checkEqualStages } from './baseTypes';

const COLLECTION_THEATER: string = 'theater';
const DOC_THEATER_PLAYS: string = 'plays';
const DOC_THEATER_STAGES: string = 'stages';

let program;
async function readProgram() {
	const querySnapshotProgram = await getDocs(collection(getAntreprizaDB(), 'program'));
	querySnapshotProgram.forEach(doc => {
		const events = doc.data();
		program.push(events);
	});
}

export function getProgram() {
	if (!program) readProgram();
	return program;
}

// ---------------------------------------
//                  PLAYS
// ---------------------------------------

// export async function readPlays() {
// 	plays = [];
// 	srcPlays = [];
// 	const querySnapshotPlays = await getDocs(collection(getAntreprizaDB(), 'plays'));
// 	querySnapshotPlays.forEach(doc => {
// 		const play: TPlay = doc.data() as TPlay;
// 		plays.push(validatePlayStructure(play));
// 	});
// 	srcPlays = JSON.parse(JSON.stringify(plays));
// }

let plays: Array<TPlay>;
let srcPlays: Array<TPlay>;

export async function readPlays() {
	const docRef = doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_PLAYS);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists() && docSnap.data().plays) {
		plays = docSnap.data().plays;
		plays.forEach(play => validatePlayStructure(play));
		srcPlays = JSON.parse(JSON.stringify(plays));
	} else {
		plays = [];
		srcPlays = [];
	}
}

export function getPlays(): Array<TPlay> {
	if (!srcPlays) readPlays();
	return plays;
}

export async function savePlays(currPlays: Array<TPlay>) {
	await setDoc(doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_PLAYS), { plays: currPlays });
	srcPlays = JSON.parse(JSON.stringify(currPlays));
}

export function changedPlays(currPlays: Array<TPlay>) {
	if (currPlays.length !== srcPlays.length) return true;

	let equalPlays = currPlays.filter(play => srcPlays.find(srcPlay => play.id === srcPlay.id && checkEqualPlays(play, srcPlay)));
	return equalPlays.length !== currPlays.length;
}

// ---------------------------------------
//                  STAGES
// ---------------------------------------
let stages: Array<TStage>;
let srcStages: Array<TStage>;

export async function readStages() {
	console.log('readStages:');

	const docRef = doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_STAGES);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists() && docSnap.data().stages) {
		stages = docSnap.data().stages;
		stages.forEach(stage => validateStageStructure(stage));
		srcStages = JSON.parse(JSON.stringify(stages));
	} else {
		console.log('empty stages');

		stages = [];
		srcStages = [];
	}
}

export function getStages(): Array<TStage> {
	if (!srcStages) readStages();
	return stages;
}

export async function saveStages(currStages: Array<TStage>) {
	console.log(currStages);

	await setDoc(doc(getAntreprizaDB(), COLLECTION_THEATER, DOC_THEATER_STAGES), { stages: currStages });
	srcStages = JSON.parse(JSON.stringify(currStages));
}

export function changedStages(currStages: Array<TStage>) {
	if (currStages.length !== srcStages.length) return true;

	let equalStages = currStages.filter(stage => srcStages.find(srcStage => stage.id === srcStage.id && checkEqualStages(stage, srcStage)));
	return equalStages.length !== currStages.length;
}
