export function getPlayName(play, lang) {
	const playLang = play.lang_id.toLowerCase();
	if (lang === 'ru' && playLang !== 'ru') {
		return play.title[playLang];
	} else return play.title[lang];
}

export function getPlayAltName(play, lang) {
	const playLang = play.lang_id.toLowerCase();
	if (lang === 'ru' && playLang !== 'ru') {
		return play.alt_title[playLang];
	} else return play.alt_title[lang];
}

export function needMarker(play, lang) {
	if (lang !== 'ru' && play.lang_marker) return true;
	return false;
}
