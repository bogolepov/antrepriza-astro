let jsonAfisha;
let jsonTheater;
let jsonDictionary;
const JSONs = [jsonAfisha, jsonTheater, jsonDictionary];

export function loadClientJsons(jsonContainer, handleThen, handleFinally, handleCatch) {
	if (!jsonContainer) {
		console.error('loadClientJsons: param jsonContainer is undefined');
		return;
	}

	json_prepare('/data/afisha.json', 0)
		.then(() => json_prepare('/data/theater.json', 1))
		.then(() => json_prepare('/data/dictionary_client.json', 2))
		.then(() => {
			jsonContainer.afisha = jsonAfisha;
			jsonContainer.theater = jsonTheater;
			jsonContainer.dictionary = jsonDictionary;
			if (handleThen) handleThen();
		})
		.catch(() => {
			if (handleCatch) handleCatch();
		})
		.finally(() => {
			if (handleFinally) handleFinally();
		});
}

function json_prepare(jsonName, jsonIndex) {
	return new Promise(function (resolve, reject) {
		if (JSONs[jsonIndex]) resolve();
		else {
			fetch(jsonName)
				.then(response => response.json())
				.then(jsonData => {
					JSONs[jsonIndex] = jsonData;
					if (jsonIndex === 0) jsonAfisha = jsonData;
					else if (jsonIndex === 1) jsonTheater = jsonData;
					else if (jsonIndex === 2) jsonDictionary = jsonData;
					resolve();
				})
				.catch(error => reject(error));
		}
	});
}
