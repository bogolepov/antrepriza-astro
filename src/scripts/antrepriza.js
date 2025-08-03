// import { CNF_MODE, THEME_LIST, THEME_DARK, THEME_LIGHT } from '@scripts/consts';
import * as consts from '@scripts/consts';
import { getCurrentPageLang } from './utils';

/* --------------------------------------------------- */
/* ------------------- INIT PAGE  -------------------- */
/* --------------------------------------------------- */
let currLang;

export function initPage() {
	currLang = getCurrentPageLang();
	removeNoJS();
	saveLangOfPage();
}

//  NoJS flag
// remove NoJS flag, because JS isn't out
function removeNoJS() {
	let elements = document.getElementsByClassName('no-js');
	for (let element of elements) {
		element.classList.remove('no-js');
	}
}

// LANG OF PAGE
function saveLangOfPage() {
	if (currLang) {
		localStorage.setItem(consts.CNF_LANG, currLang);
		return;
	}
}

/* --------------------------------------------------- */
/* ------------------- THEME MODE -------------------- */
/* --------------------------------------------------- */
let themeSwitcher;

export function initThemeMode() {
	let mode = localStorage.getItem(consts.CNF_MODE);
	if (!mode || !consts.THEME_LIST.includes(mode)) mode = consts.THEME_DARK;

	// document.body.dataset.theme = mode;

	themeSwitcher = document.querySelector('#theme-switcher');

	function updateTheme(newTheme) {
		document.documentElement.setAttribute('data-theme', newTheme);
	}

	themeSwitcher.addEventListener('change', event => {
		event.stopImmediatePropagation();
		event.preventDefault();
		let newMode = themeSwitcher.checked ? consts.THEME_DARK : consts.THEME_LIGHT;
		localStorage.setItem(consts.CNF_MODE, newMode);

		console.log(event.withoutTransition);

		if (document.startViewTransition)
			document.startViewTransition(() => {
				updateTheme(newMode);
			});
		else updateTheme(newMode);
	});

	themeSwitcher.checked = mode === consts.THEME_DARK;
	updateTheme(mode);

	const handleChange = event => {
		event.preventDefault();
		themeSwitcher.checked = !themeSwitcher.checked;
		themeSwitcher.dispatchEvent(new Event('change'));
	};

	let themeSwitcherItems = document.querySelectorAll('.theme-switcher-label');
	themeSwitcherItems.forEach(item => {
		item.addEventListener('keydown', event => {
			if (event.code === 'Enter' || event.code === 'Space') {
				handleChange(event);
			}
		});
		// we should use our click-function to avoid page jumping up, because labels for the switcher are there
		item.addEventListener('click', handleChange);
	});
}

/* --------------------------------------------------- */
/* ------------- Header Submenu Listener ------------- */
/* --------------------------------------------------- */
function closeAllBurgerItems() {
	let allOpenedSubmenus = document.querySelectorAll('.main-menu-item[data-state="opened"]');
	allOpenedSubmenus?.forEach(item => (item.dataset.state = ''));
}

export function initHeaderSubMenuListener() {
	let mobileMainMenu = document.querySelector('.main-menu.mobile');
	let handleClickMenuItem = function (event) {
		let elem = event.target.closest('.main-menu-item');
		if (elem) {
			if (elem.dataset.state === 'opened') elem.dataset.state = '';
			else elem.dataset.state = 'opened';
		}
	};
	if (mobileMainMenu) {
		let expandingMenuItems = mobileMainMenu.querySelectorAll('.menu-item-label:has(.submenu-icon)');
		expandingMenuItems?.forEach(item => item.addEventListener('click', handleClickMenuItem));

		let submenuButtons = mobileMainMenu.querySelectorAll('.submenu-icon');
		submenuButtons?.forEach(button => {
			button.tabIndex = 0;
			button.addEventListener('keydown', event => {
				if (event.code === 'Enter' || event.code === 'Space') {
					event.preventDefault();
					handleClickMenuItem(event);
				}
			});
		});
	}

	let burgerSwitcher = document.querySelector('#burger-button');

	burgerSwitcher.addEventListener('change', () => {
		if (burgerSwitcher.checked === false) {
			closeAllBurgerItems();
		}
	});

	window.addEventListener('blur', () => {
		burgerSwitcher.checked = false;
		closeAllBurgerItems();
	});
}

/* --------------------------------------------------- */
/* ----------- HOVER effects with JAVASCRIPT --------- */
/* --------------------------------------------------- */
let currentHoverBlock;

export function initHoverModeForTouchScreen() {
	let blocks = document.getElementsByClassName('hover-block');
	for (let block of blocks) {
		block.addEventListener('pointerdown', event => {
			if (
				event.isPrimary &&
				(event.pointerType === 'pen' || event.pointerType === 'touch') &&
				currentHoverBlock !== block
			) {
				if (currentHoverBlock) currentHoverBlock.removeAttribute('hover');
				currentHoverBlock = block;
				currentHoverBlock.setAttribute('hover', '');
			}
		});
		block.addEventListener('pointerenter', event => {
			if (event.pointerType === 'mouse' && currentHoverBlock !== block) {
				if (currentHoverBlock) currentHoverBlock.removeAttribute('hover');
				currentHoverBlock = block;
				currentHoverBlock.setAttribute('hover', '');
			}
		});
		block.addEventListener('pointerleave', event => {
			if (event.pointerType === 'mouse' && currentHoverBlock === block) {
				currentHoverBlock.removeAttribute('hover');
				currentHoverBlock = null;
			}
		});
	}
}

/* --------------------------------------------------- */
/* ------------------- Events Page ------------------- */
/* --------------------------------------------------- */
export function initEventsTab() {
	let params = new URLSearchParams(document.location.search);

	let stage = params.get('stage');
	if (!stage) return;

	stage = stage.toLowerCase();
	if (stage === 'west') {
		const checkbox = document.querySelector('#evs-tab-west');
		if (checkbox) checkbox.checked = true;
	}
	if (stage === 'ost') {
		const checkbox = document.querySelector('#evs-tab-ost');
		if (checkbox) checkbox.checked = true;
	}
}
