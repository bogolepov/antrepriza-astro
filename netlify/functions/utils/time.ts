import dictionaryServer from '@data/dictionary_server.json';
import { LANG_RU } from '@scripts/consts';

export const getHello = (hour: number, lang: string): string => {
	if (hour < 6 && lang === LANG_RU) return dictionaryServer.hello[lang];
	else if (hour < 12) return dictionaryServer.good_morning[lang];
	else if (hour < 18) return dictionaryServer.good_afternoon[lang];
	else return dictionaryServer.good_evening[lang];
};
