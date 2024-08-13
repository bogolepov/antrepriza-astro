// import { CNF_MODE, THEME_LIST, THEME_DARK, THEME_LIGHT } from '@scripts/consts';
import * as consts from '@scripts/consts';

let dictionary;

/* --------------------------------------------------- */
/* ------------------- INIT PAGE  -------------------- */
/* --------------------------------------------------- */
let currLang;
// let lostVisibilityMoment;

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
	let path = window.location.pathname.toLowerCase();
	for (let lang of consts.LANG_LIST) {
		if (path.includes(`/${lang}/`)) {
			currLang = lang;
			localStorage.setItem(consts.CNF_LANG, lang);
			return;
		}
	}
}

function initScrollFocusedToCenter() {
	Element.prototype.documentOffsetTop = function () {
		return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
	};

	Element.prototype.scrollIntoViewCenter = function () {
		window.scrollTo(0, this.documentOffsetTop() - window.innerHeight / 2);
	};

	window.addEventListener('keyup', event => {
		if ('Tab' == event.code) document.activeElement.scrollIntoViewCenter();
	});
}

export function initPage() {
	removeNoJS();
	saveLangOfPage();

	// initScrollFocusedToCenter();
	// loadPageState();
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

	themeSwitcher.addEventListener('change', () => {
		let newMode = themeSwitcher.checked ? consts.THEME_DARK : consts.THEME_LIGHT;
		// document.body.dataset.theme = newMode;
		localStorage.setItem(consts.CNF_MODE, newMode);
	});

	themeSwitcher.checked = mode === consts.THEME_DARK;
	themeSwitcher.dispatchEvent(new Event('change'));

	let themeSwitcherItems = document.querySelectorAll('.theme-switcher-label');
	themeSwitcherItems.forEach(item => {
		item.addEventListener('keydown', event => {
			if (event.code === 'Enter' || event.code === 'Space') {
				event.preventDefault();
				themeSwitcher.checked = !themeSwitcher.checked;
				themeSwitcher.dispatchEvent(new Event('change'));
			}
		});
	});
}

/* --------------------------------------------------- */
/* ------------- Header Submenu Listener ------------- */
/* --------------------------------------------------- */
let currExpandMenu;

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
		// burgerSwitcher.checked = false;
		// closeAllBurgerItems();
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
/* ------------------ Feedback form ------------------ */
/* --------------------------------------------------- */
const X_DATE = Date.now;
let dialogFeedback;

export function initFeedbackDialog() {
	dialogFeedback = document.querySelector('.modal-layer.d-feedback');

	dialogFeedback.querySelector('.close__button')?.addEventListener('click', () => closeFeedbackDialog());
	dialogFeedback.querySelector('#feedback-submit-button')?.addEventListener('click', submitFeedbackForm);

	let elemPhone = dialogFeedback.querySelector('.x-phone');
	if (elemPhone) {
		elemPhone.classList.remove('x-phone');
		elemPhone.classList.add('xxx');
	}
	let elemX = dialogFeedback.querySelector('.xxx');
	if (elemX) elemX.value = X_DATE.toString();
}

export function openFeedbackForm() {
	dialogFeedback?.classList.add('show');
}

function dictionary_prepare() {
	return new Promise(function (resolve, reject) {
		if (dictionary) resolve();
		else {
			fetch('/data/dictionary_client.json')
				.then(response => response.json())
				.then(jsonData => {
					dictionary = jsonData;
					resolve();
				})
				.catch(error => reject(error));
		}
	});
}

export async function submitFeedbackForm(event) {
	event.preventDefault();

	const form = dialogFeedback.querySelector('.feedback-form');
	const formLoader = dialogFeedback.querySelector('.loader.d-feedback');
	const formResult = dialogFeedback.querySelector('.layer-on-parent.question-form-result-wrapper');
	if (!formResult) console.error("Can't find question-form-result");
	const formResultMessage = dialogFeedback.querySelector('.question-form-result-message');
	const formResultButton = dialogFeedback.querySelector('.question-form-result-button');
	const closeButton = dialogFeedback.querySelector('.close__button');

	const formData = new FormData(form);
	const formDataObject = {};

	let newValue;
	formData.forEach((value, key) => {
		newValue = value.trim().replace(/\s+/g, ' ');
		if (key === 'subject') newValue = newValue.replace('{topic}', formData.get('topic'));
		// if (key === 'phone') newValue = '12345';
		formData.set(key, newValue);
		formDataObject[key] = newValue;
	});

	const validationErrors = validateForm(formDataObject);
	if (validationErrors.length === 1 && validationErrors[0].message === 'spam') {
		closeFeedbackDialog();
		return;
	}

	displayErrors(validationErrors);
	if (validationErrors.length > 0) return;

	formLoader.classList.add('show');
	closeButton.disabled = true;

	const onResultClick = () => {
		formResult.classList.remove('show');
		formResultButton.removeEventListener('click', onResultClick);
		formResultMessage.textContent = '';
		formResultButton.classList.remove('ok');
		formResultButton.classList.remove('error');
		closeButton.disabled = false;
		closeFeedbackDialog();
	};

	const handleResult = isOk => {
		let resMessage;
		if (isOk) {
			formResultButton.classList.add('ok');
			resMessage = dictionary ? dictionary['contact_form__result_ok'][currLang] : currLang == 'ru' ? 'Отправлено!' : 'Gesendet!';
		} else {
			formResultButton.classList.add('error');
			resMessage = dictionary ? dictionary['contact_form__result_error'][currLang] : currLang == 'ru' ? 'Ошибка...' : 'Unerfolgreich...';
			console.error(error);
		}

		formResultMessage.textContent = resMessage;
		formLoader.classList.remove('show');
		formResult.classList.add('show');
		formResultButton.addEventListener('click', onResultClick);
	};

	let now = new Date();

	const questionData = {
		lang: currLang,
		subject: formDataObject.subject,
		phone: formDataObject.topic + formDataObject.name,
		topic: formDataObject.topic,
		name: formDataObject.name,
		email: formDataObject.email,
		message: formDataObject.message,
		now: now.getTime(),
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(questionData),
	};

	let isOk;
	dictionary_prepare().finally(() => {
		fetch('/.netlify/functions/feedbackForm', options)
			.then(response => {
				isOk = response.ok;
				return response.json();
			})
			.then(data => {
				// console.log(data.message);
				if (isOk) handleResult(true);
				else throw new Error(data.message);
			})
			.catch(() => handleResult(false));
	});
}

function validateForm(formData) {
	const { subject, phone, name, email, message } = formData;

	const errors = [];

	if (!subject || !subject.includes(' - ')) {
		errors.push({ field: 'subject', message: 'spam' });
		return errors;
	}
	if (!phone || phone !== X_DATE.toString()) {
		errors.push({ field: 'phone', message: 'spam' });
		return errors;
	}

	if (!name) errors.push({ field: 'name', message: 'err__empty_name' });
	else if (name.length < 2) errors.push({ field: 'name', message: 'err__name_to_short' });

	if (!email) errors.push({ field: 'email', message: 'err__empty_email' });
	else if (!consts.EMAIL_REGEX.test(email) || email.length < 5 || email.length > 64)
		errors.push({ field: 'email', message: 'err__email_not_correct' });

	if (!message) errors.push({ field: 'message', message: 'err__empty_message' });
	else if (message.length < 10) errors.push({ field: 'message', message: 'err__message_to_short' });

	return errors;
}

function closeFeedbackDialog() {
	dialogFeedback.classList.remove('show');

	resetErrorElements();
	const elemTopics = dialogFeedback.querySelector('#topic');
	if (elemTopics) elemTopics.value = elemTopics.item(0).text;
	const elemInputs = dialogFeedback.querySelectorAll('.form-input.qff');
	elemInputs?.forEach(element => {
		element.value = '';
	});
}

function resetErrorElements() {
	// find all elements showing error messages
	const errorElements = dialogFeedback.querySelectorAll('.form-error');

	// clean all error messages after last time
	errorElements?.forEach(element => {
		element.textContent = '';
	});
}

function displayErrors(errors) {
	resetErrorElements();

	// if no errors
	if (errors.length < 1) return;

	dictionary_prepare().then(() => {
		// to show all error messages
		errors.forEach(error => {
			const { field, message } = error;
			const errorElement = dialogFeedback.querySelector(`[data-for="${field}"]`);
			errorElement.textContent = dictionary[message][currLang];
			const errorInput = dialogFeedback.querySelector(`.form-input[name="${field}"]`);

			const onInput = () => {
				errorElement.textContent = '';
				errorInput.removeEventListener('input', onInput);
			};
			errorInput.addEventListener('input', onInput);
		});
	});
}

/* --------------------------------------------------- */
/* ---------------- Subscription form ---------------- */
/* --------------------------------------------------- */
let messageTimer = -1;
function resetMessageTimer() {
	if (messageTimer === -1) return;

	clearTimeout(messageTimer);
	messageTimer = -1;

	const elemMessage = document.querySelector('.newsletter-message');
	if (!elemMessage) return;
	elemMessage.classList.remove('showed');
	elemMessage.classList.add('fast-hidden');
}

function showNewsletterMessage(text, isError) {
	const elemMessage = document.querySelector('.newsletter-message');
	if (!elemMessage) return;
	elemMessage.innerText = text;
	if (isError) elemMessage.classList.add('is-error');
	else elemMessage.classList.remove('is-error');

	elemMessage.classList.remove('fast-hidden');
	elemMessage.classList.remove('hidden');
	elemMessage.classList.add('showed');
	messageTimer = setTimeout(
		() => {
			elemMessage.classList.remove('showed');
			elemMessage.classList.add('hidden');
			clearTimeout(messageTimer);
			messageTimer = -1;
		},
		isError ? 5000 : 3000
	);
}

export async function submitNewsletterForm(event) {
	event.preventDefault();

	resetMessageTimer();

	const form = document.querySelector('#newsletter-form');
	const emailInput = form.querySelector('.newsletter__input');
	const emailInputLoader = form.querySelector('.newsletter-input-loader');

	let emailAddress = emailInput.value.trim().replace(/\s+/g, ' '); // remove all ' '

	let errorType = 0;
	if (!emailAddress) errorType = 1;
	else if (!consts.EMAIL_REGEX.test(emailAddress) || emailAddress.length < 5 || emailAddress.length > 64) errorType = 2;
	else {
		let nlph = document.querySelector('#newsletter-phone');
		if (nlph) {
			let date = Number(nlph.innerText);
			if (Number(nlph.value) !== date + 9 || Math.trunc(date / 10).toString() != nlph.innerText.slice(0, -1)) {
				emailInput.value = '';
				return;
			}
		}
	}

	if (errorType) {
		dictionary_prepare().then(() => {
			if (errorType === 1) showNewsletterMessage(dictionary['err__empty_email'][currLang], true);
			else if (errorType === 2) showNewsletterMessage(dictionary['err__email_not_correct'][currLang], true);
		});
		return;
	}

	const emailData = { lang: currLang, email: emailAddress };
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(emailData),
	};

	const handleResult = isOk => {
		emailInput.value = '';
		emailInputLoader.style.display = 'none';
		emailInputLoader.innerText = '';

		if (dictionary) {
			if (isOk) {
				showNewsletterMessage(dictionary.newsletter_subscribed[currLang], false);
			} else {
				showNewsletterMessage(dictionary.newsletter__result_error[currLang], true);
			}
		}
	};

	let isOk;
	emailInputLoader.innerText = emailInput.value;
	emailInputLoader.style.display = 'block';
	dictionary_prepare().finally(() => {
		// console.log('call netlify function');
		fetch('/.netlify/functions/newsSubscription', options)
			.then(response => {
				isOk = response.ok;
				return response.json();
			})
			.then(data => {
				// console.log(data.message);
				if (isOk) handleResult(true);
				else throw new Error(data.message);
			})
			.catch(() => handleResult(false));
	});
}

function showNewsletterServiceMessage(message, isOk) {
	let elemStatus = document.querySelector('.newsletter-service .service-status');
	if (!elemStatus) return;

	let elemStatusMessage = elemStatus.querySelector('.status-message');
	if (elemStatusMessage) {
		elemStatusMessage.innerText = isOk ? message : dictionary.error__lang[currLang] + ': ' + message;
		elemStatus.style.display = 'block';
	}
}

export async function newsletterService() {
	let params = new URLSearchParams(document.location.search);

	let sid = Number(params.get('sid'));
	if (!sid) sid = 0;
	let usid = Number(params.get('usid'));
	if (!usid) usid = 0;

	if (!sid && !usid) {
		dictionary_prepare().then(() => {
			showNewsletterServiceMessage(dictionary.err__incorrect_data[currLang], false);
		});
		return;
	}

	let elemLoader = document.querySelector('.newsletter-loader');
	elemLoader.classList.add('show');

	const newsletterData = { lang: currLang, sid: sid, usid: usid };
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(newsletterData),
	};

	const handleResult = (message, isOk) => {
		elemLoader.classList.remove('show');
		if (dictionary) {
			if (!message) {
				if (isOk) message = 'OK';
				else message = 'Sorry...';
			}
			showNewsletterServiceMessage(message, isOk);
		}
	};

	let isOk;
	let resMessage;
	dictionary_prepare().finally(() => {
		fetch('/.netlify/functions/newsSubscription', options)
			.then(response => {
				isOk = response.ok;
				return response.json();
			})
			.then(data => {
				resMessage = data.message;
				// console.log(data.message);
				if (isOk) handleResult(resMessage, true);
				else throw new Error();
			})
			.catch(() => handleResult(resMessage, false));
	});
}
