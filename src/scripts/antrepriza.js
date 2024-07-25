// import { CNF_MODE, THEME_LIST, THEME_DARK, THEME_LIGHT } from '@scripts/consts';
import * as consts from '@scripts/consts';

/* --------------------------------------------------- */
/* ------------------- NoJS flag --------------------- */
/* ----- remove NoJS flag, because JS isn't out ------ */
/* --------------------------------------------------- */
export function removeNoJS() {
	let elements = document.getElementsByClassName('no-js');
	for (let element of elements) {
		element.classList.remove('no-js');
	}
}

/* --------------------------------------------------- */
/* ------------------ LANG OF PAGE ------------------- */
/* --------------------------------------------------- */
export function saveLangOfPage() {
	let path = window.location.pathname.toLowerCase();
	for (let lang of consts.LANG_LIST) {
		if (path.includes(`/${lang}/`)) {
			localStorage.setItem(consts.CNF_LANG, lang);
			return;
		}
	}
}

/* --------------------------------------------------- */
/* ------------------- THEME MODE -------------------- */
/* --------------------------------------------------- */
let themeCheckboxes;

export function initThemeMode() {
	let mode = localStorage.getItem(consts.CNF_MODE);
	if (!mode || !consts.THEME_LIST.includes(mode)) mode = consts.THEME_DARK;

	document.body.dataset.theme = mode;

	themeCheckboxes = document.querySelectorAll('.theme-checkbox');
	themeCheckboxes.forEach(elem => {
		elem.checked = mode === consts.THEME_DARK;

		elem.addEventListener('click', event => {
			themeCheckboxes.forEach(item => {
				if (item != event.target) item.checked = event.target.checked;
			});

			let newMode = event.target.checked ? consts.THEME_DARK : consts.THEME_LIGHT;
			document.body.dataset.theme = newMode;
			localStorage.setItem(consts.CNF_MODE, newMode);
		});
	});
}
