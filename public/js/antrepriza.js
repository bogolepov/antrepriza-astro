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

let dictionary;

/* --------------------------------------------------- */
/* ------------------- NoJS flag --------------------- */
/* ----- remove NoJS flag, because JS isn't out ------ */
/* --------------------------------------------------- */
function removeNoJS() {
	let elements = document.getElementsByClassName('no-js');
	for (let element of elements) {
		element.classList.remove('no-js');
	}
}

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

	if (currLang) {
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
	if (!mode) mode = MODE_DARK;

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

function closeAllBurgerItems() {
	let burgerItems = document.getElementsByClassName('burger-item');
	for (let item of burgerItems) {
		item.classList.remove('submenu-opened');
	}
}

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
				if (!item) return;

				if (item.classList.contains('burger-menu-opened')) {
					// close burger menu
					closeAllBurgerItems();
					item.classList.remove('burger-menu-opened');
				} else {
					// open burger menu
					item.classList.add('burger-menu-opened');
				}

				btn.blur();
				return;
			}

			if (event.target.nodeName == 'A' || event.target.closest('A')) {
				let burgerHeader = event.target.closest('.header-burger');
				if (burgerHeader) burgerHeader.classList.remove('burger-menu-opened');

				closeAllBurgerItems();

				btn = event.target.closest('.header-burger-button');
				if (btn) btn.blur();
				return;
			}
		});
	}
}

/* --------------------------------------------------- */
/* ------------- Header Submenu Listener ------------- */
/* --------------------------------------------------- */
let currentHoverBlock;

function initHoverModeForTouchScreen() {
	let blocks = document.getElementsByClassName('hover-block');
	for (let block of blocks) {
		block.addEventListener('pointerdown', event => {
			if (event.isPrimary && (event.pointerType == 'pen' || event.pointerType == 'touch') && currentHoverBlock != block) {
				if (currentHoverBlock) currentHoverBlock.removeAttribute('hover');
				currentHoverBlock = block;
				currentHoverBlock.setAttribute('hover', '');
			}
		});
		block.addEventListener('pointerenter', event => {
			if (event.pointerType == 'mouse' && currentHoverBlock != block) {
				if (currentHoverBlock) currentHoverBlock.removeAttribute('hover');
				currentHoverBlock = block;
				currentHoverBlock.setAttribute('hover', '');
			}
		});
		block.addEventListener('pointerleave', event => {
			if (event.pointerType == 'mouse' && currentHoverBlock == block) {
				currentHoverBlock.removeAttribute('hover');
				currentHoverBlock = null;
			}
		});
	}
}

/* --------------------------------------------------- */
/* ------------------- Contact form ------------------ */
/* --------------------------------------------------- */
async function submitQuestionForm(event) {
	event.preventDefault();

	const form = event.target;
	const btnSubmit = document.querySelector('.question__btn_send');
	const inputElements = document.querySelectorAll('.q-input');
	const formLoader = document.querySelector('.contact-form-loader');

	const formData = new FormData(form);
	const formDataObject = {};

	let newValue;
	formData.forEach((value, key) => {
		newValue = value.trim().replace(/\s+/g, ' ');
		if (key == 'subject') newValue = newValue.replace('{question-subject}', formData.get('question-subject'));
		formData.set(key, newValue);
		formDataObject[key] = newValue;
	});

	const validationErrors = validateForm(formDataObject);

	displayErrors(validationErrors);
	if (validationErrors.length > 0) return;

	// startSendAnimation();

	formLoader.classList.add('show');
	btnSubmit.disabled = true;
	inputElements.forEach(input => (input.disabled = true));

	fetch('/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(formData).toString(),
	})
		.then(() => {
			form.reset();
			formLoader.classList.remove('show');
			alert('Thank you for your submission');
		})
		.catch(error => alert(error))
		.finally(() => {
			btnSubmit.disabled = false;
			inputElements.forEach(input => (input.disabled = false));
			formLoader.classList.remove('show');
		});

	//sendFormData(form, btnSubmit, formDataObject);
}

function validateForm(formData) {
	const { name, email, message } = formData;

	const emailRegex = /^[a-zA-Z0–9._-]+@[a-zA-Z0–9.-]+\.[a-zA-Z]{2,4}$/;

	const errors = [];

	if (!name) errors.push({ field: 'name', message: 'err__empty_name' });
	else if (name.length < 2) errors.push({ field: 'name', message: 'err__name_to_short' });

	if (!email) errors.push({ field: 'email', message: 'err__empty_email' });
	else if (!emailRegex.test(email) || email.length < 5 || email.length > 64)
		errors.push({ field: 'email', message: 'err__email_not_correct' });

	if (!message) errors.push({ field: 'message', message: 'err__empty_message' });
	else if (message.length < 10) errors.push({ field: 'message', message: 'err__message_to_short' });

	return errors;
}

function displayErrors(errors) {
	// find all elements showing error messages
	const errorElements = document.querySelectorAll('.form__error');

	// clean all error messages after last time
	errorElements.forEach(element => {
		element.textContent = '';
	});

	// if no errors
	if (errors.length < 1) return;

	if (!dictionary) {
		fetch('/data/dictionary_client.json')
			.then(response => response.json())
			.then(jsonData => {
				dictionary = jsonData;
				if (dictionary) displayErrors(errors);
			});
	} else {
		// to show all error messages
		errors.forEach(error => {
			const { field, message } = error;
			const errorElement = document.querySelector(`[data-for="${field}"]`);
			errorElement.textContent = ' * ' + dictionary[message][currLang];
			const errorInput = document.querySelector(`.q-input[name="${field}"]`);

			const onInput = () => {
				errorElement.textContent = '';
				errorInput.removeEventListener('input', onInput);
			};
			errorInput.addEventListener('input', onInput);
		});
	}
}

async function sendFormData(form, btnSubmit, formDataObject) {
	const btnSubmitText = btnSubmit.textContent;
	try {
		btnSubmit.textContent = 'Loading...';
		btnSubmit.disabled = true;

		const response = await fetch('http://localhost:5000/send-email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formDataObject),
		});

		if (response.ok) {
			console.log('SEND EMAIL - OK');
			//
			form.reset();
		} else if (response.status == 422) {
			const errors = await response.json();
			console.log(errors);
			throw new Error('Validation error');
		} else {
			throw new Error(response.statusText);
		}
	} catch (error) {
		console.error(error.message);
	} finally {
		btnSubmit.textContent = btnSubmitText;
		btnSubmit.disabled = false;
	}
}
