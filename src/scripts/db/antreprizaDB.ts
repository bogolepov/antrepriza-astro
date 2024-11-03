import { getAntreprizaDB } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { TPlay } from './baseTypes';
import { validatePlayStructure, checkEqualPlays } from './baseTypes';

let plays: Array<TPlay>;
let srcPlays: Array<TPlay>;

export async function readPlays() {
	plays = [];
	srcPlays = [];
	const querySnapshotPlays = await getDocs(collection(getAntreprizaDB(), 'plays'));
	querySnapshotPlays.forEach(doc => {
		const play: TPlay = doc.data() as TPlay;
		plays.push(validatePlayStructure(play));
	});
	srcPlays = JSON.parse(JSON.stringify(plays));
}

let program;
async function readProgram() {
	const querySnapshotProgram = await getDocs(collection(getAntreprizaDB(), 'program'));
	querySnapshotProgram.forEach(doc => {
		const events = doc.data();
		program.push(events);
	});
}

export function getPlays(): Array<TPlay> {
	if (!srcPlays) readPlays();
	return plays;
}
export function getProgram() {
	if (!program) readProgram();
	return program;
}

export async function savePlays(currPlays: Array<TPlay>) {
	console.log('+++ SAVE');

	// save to AntreprizaDB
	//

	srcPlays = JSON.parse(JSON.stringify(currPlays));
}

export function changedPlays(currPlays: Array<TPlay>) {
	if (currPlays.length !== srcPlays.length) return true;

	let equalPlays = currPlays.filter(play => srcPlays.find(srcPlay => play.id === srcPlay.id && checkEqualPlays(play, srcPlay)));
	return equalPlays.length !== currPlays.length;
}
