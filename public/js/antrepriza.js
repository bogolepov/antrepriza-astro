'use strict';

const CNF_LANG = 'LANG';
const CNF_MODE = 'MODE';

const LANG_RU = 'ru';
const LANG_DE = 'de';
const MODE_DARK = 'dark';
const MODE_LIGHT = 'light';

const LANG_LIST = [LANG_RU, LANG_DE];
const MODE_LIST = [MODE_LIGHT, MODE_DARK];

let currLang;
let currMode;

/* --------------------------------------------------- */
/* -------------------- LANGUAGE --------------------- */
/* --------------------------------------------------- */

function selectRoot() {
	let userLang = localStorage.getItem(CNF_LANG) || navigator.language || navigator.userLanguage;
	if (userLang && (userLang = userLang.toLowerCase()) && userLang.includes(LANG_DE)) {
		currLang = LANG_DE;
	} else {
		currLang = LANG_RU;
	}
	window.location.replace(`/${currLang}/`);
}

function initLangEnv() {
	currLang = getCurrentPageLang();
	let linksRu = document.getElementsByClassName('link-ru');
	let linksDe = document.getElementsByClassName('link-de');
	let linkRu = replaceLangPath(window.location.href, currLang, LANG_RU);
	let linkDe = replaceLangPath(window.location.href, currLang, LANG_DE);

	for (let link of linksRu) {
		link.href = linkRu;
	}

	for (let link of linksDe) {
		link.href = linkDe;
	}

	if (currLang) {
		let langText = document.getElementById('language-text');
		langText.innerText = currLang.toUpperCase();
		localStorage.setItem(CNF_LANG, currLang);
	}
}

function changeLangToRussian() {
	localStorage.setItem(CNF_LANG, LANG_RU);
}
function changeLangToGerman() {
	localStorage.setItem(CNF_LANG, LANG_DE);
}

function getSystemValidLang() {
	let sysLang = navigator.language || navigator.userLanguage;
	if (!sysLang) return;

	sysLang = sysLang.toLowerCase();
	for (let lang of LANG_LIST) {
		if (sysLang.includes(lang)) return lang;
	}
}

function getCurrentPageLang() {
	let page = window.location.pathname;
	for (let lang of LANG_LIST) {
		if (page.includes(`/${lang}`)) {
			return lang;
		}
	}
}

function replaceLangPath(path, prevLang, newLang) {
	if (path.includes(`/${prevLang}`)) {
		return path.replace(`/${prevLang}`, `/${newLang}`);
	}
}

function isLangValid(lang) {
	if (lang == LANG_DE || lang == LANG_RU) return true;
	else return false;
}

/* --------------------------------------------------- */
/* ------------------- COLOR MODE -------------------- */
/* --------------------------------------------------- */
let themeCheckboxes;

function initColorMode() {
	themeCheckboxes = document.getElementsByClassName('theme-checkbox');

	let mode = getUserMode();
	if (!mode && window.matchMedia) {
		mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? MODE_DARK : MODE_LIGHT;

		// listener of the scheme changing on the system
		// !!! it will work only if user has never changed scheme himself
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
			if (!getUserMode()) {
				document.body.dataset.theme = event.matches ? MODE_DARK : MODE_LIGHT;
				for (let checkbox of themeCheckboxes) checkbox.checked = event.matches;
			}
		});
	} else mode = mode ? mode : MODE_LIGHT;

	document.body.dataset.theme = mode;

	// set correct state to button of mode changing
	// and add a listener for click-event
	for (let checkbox of themeCheckboxes) {
		checkbox.checked = mode === MODE_DARK;
		checkbox.addEventListener('click', () => {
			for (let tmpCheckbox of themeCheckboxes) {
				if (tmpCheckbox != checkbox) tmpCheckbox.checked = checkbox.checked;
			}

			let newMode = checkbox.checked ? MODE_DARK : MODE_LIGHT;
			document.body.dataset.theme = newMode;
			localStorage.setItem(CNF_MODE, newMode);
		});
	}
}

function getUserMode() {
	let userMode = localStorage.getItem(CNF_MODE);
	if (userMode) {
		for (let mode of MODE_LIST) {
			if (userMode.includes(mode)) {
				return mode;
			}
		}
	}
}

/* --------------------------------------------------- */
/* ------------- Header Submenu Listener ------------- */
/* --------------------------------------------------- */
let currExpandMenu;

function initHeaderSubMenuListener() {
	let mobileHeader = document.getElementById('header-mobile');
	if (mobileHeader) {
		mobileHeader.addEventListener('click', function (event) {
			let btn = event.target.closest('.submenu-symbol-button');
			if (btn) {
				let item = event.target.closest('.burger-item');
				if (item) item.classList.toggle('submenu-opened');
				return;
			}

			btn = event.target.closest('.header-burger-button');
			if (btn) {
				let item = event.target.closest('.header-burger');
				item.classList.toggle('burger-menu-opened');
				btn.blur();
				return;
			}
		});
	}
}
