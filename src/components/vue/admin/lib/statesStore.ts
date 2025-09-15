import { ref } from 'vue';
import type { IPerformanceJson, IPlayJson, IPriceJson, IStageJson } from '@scripts/adminpanel/types/json-files';

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
