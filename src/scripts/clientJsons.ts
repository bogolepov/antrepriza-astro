export const enum EJsonType {
	AFISHA_JSON,
	THEATER_JSON,
	DICTIONARY_JSON,
}

const jsonMap = new Map<EJsonType, any>();

export interface IClientJsons {
	afisha: any;
	theater: any;
	dictionary: any;
}

export function getClientJson(type: EJsonType): any {
	return jsonMap.get(type);
}

export function loadClientJsons(
	jsonContainer: IClientJsons,
	handleThen?: () => void,
	handleFinally?: () => void,
	handleCatch?: () => void
) {
	console.log('loadClientJsons !!!');

	if (!jsonContainer) {
		console.error('loadClientJsons: param jsonContainer is undefined');
		return;
	}

	json_prepare('/data/afisha.json', EJsonType.AFISHA_JSON)
		.then(() => json_prepare('/data/theater.json', EJsonType.THEATER_JSON))
		.then(() => json_prepare('/data/dictionary_client.json', EJsonType.DICTIONARY_JSON))
		.then(() => {
			jsonContainer.afisha = jsonMap.get(EJsonType.AFISHA_JSON);
			jsonContainer.theater = jsonMap.get(EJsonType.THEATER_JSON);
			jsonContainer.dictionary = jsonMap.get(EJsonType.DICTIONARY_JSON);
			if (handleThen) handleThen();
		})
		.catch(() => {
			if (handleCatch) handleCatch();
		})
		.finally(() => {
			if (handleFinally) handleFinally();
		});
}

function json_prepare(jsonName: string, jsonType: EJsonType) {
	return new Promise(function (resolve, reject) {
		if (jsonMap.has(jsonType)) resolve();
		else {
			fetch(jsonName)
				.then(response => response.json())
				.then(jsonData => {
					jsonMap.set(jsonType, jsonData);
					resolve();
				})
				.catch(error => reject(error));
		}
	});
}
