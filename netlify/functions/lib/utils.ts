import type { HandlerResponse } from '@netlify/functions';
import fs from 'fs';

export function makeHandlerResponse(resCode: number, resMessage: string): HandlerResponse {
	if (resCode >= 400) console.error('resMessage: ' + resCode + ', ' + resMessage);
	return {
		statusCode: resCode,
		body: JSON.stringify({
			message: resMessage,
		}),
	};
}

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

let program;
export function getJsonAfisha() {
	if (program) return program;
	try {
		let data = fs.readFileSync('./public/data/afisha.json');
		program = JSON.parse(data.toString());
		return program;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}
