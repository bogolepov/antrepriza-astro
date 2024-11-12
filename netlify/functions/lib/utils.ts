import fs from 'fs';

export function fromHtmlToPlainText(str: string): string {
	return str.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function nonBreakingSpace(str: string): string {
	return str.replaceAll(' ', '&nbsp;');
}

let dictionaryServer;
export function getJsonDictionary() {
	if (dictionaryServer) return dictionaryServer;
	try {
		let data = fs.readFileSync('./public/data/dictionary_server.json');
		dictionaryServer = JSON.parse(data.toString());
		return dictionaryServer;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}

let theater;
export function getJsonTheater() {
	if (theater) return theater;
	try {
		let data = fs.readFileSync('./public/data/theater.json');
		theater = JSON.parse(data.toString());
		return theater;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}

export function onlyNumbers(text: string): string {
	return text?.replace(/[^0-9]/g, '');
}

export function getRandomIntInclusive(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}
