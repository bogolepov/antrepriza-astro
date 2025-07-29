import dictionary from '@data/dictionary.json';
import { getCurrentPageLang, getEmailAddressError, validEmailAddressFormat } from '@scripts/utils';

let messageTimer: ReturnType<typeof setTimeout>;
function resetMessageTimer() {
	if (!messageTimer) return;

	clearTimeout(messageTimer);
	messageTimer = undefined;

	const elemMessage = document.querySelector('.newsletter-message');
	if (!elemMessage) return;
	elemMessage.classList.remove('showed');
	elemMessage.classList.add('fast-hidden');
}

function showNewsletterMessage(text, isError) {
	const elemMessage = document.querySelector<HTMLInputElement>('.newsletter-message');
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
			messageTimer = undefined;
		},
		isError ? 5000 : 3000
	);
}

export async function submitNewsletterForm(event) {
	event.preventDefault();

	resetMessageTimer();

	const lang = getCurrentPageLang();

	const form = document.querySelector('#newsletter-form');
	const emailInput = form.querySelector<HTMLInputElement>('.newsletter__input');
	const emailInputLoader = form.querySelector<HTMLInputElement>('.newsletter-input-loader');

	let emailAddress = emailInput?.value.trim().replace(/\s+/g, ' '); // remove all ' '
	if (!validEmailAddressFormat(emailAddress)) {
		const err = getEmailAddressError(emailAddress);
		if (err.length) showNewsletterMessage(dictionary[err][lang], true);
		return;
	}

	let nlph = form.querySelector<HTMLInputElement>('#newsletter-phone');
	if (nlph) {
		let date = Number(nlph.innerText);
		if (Number(nlph.value) !== date + 9 || Math.trunc(date / 10).toString() !== nlph.innerText.slice(0, -1)) {
			emailInput.value = '';
			return;
		}
	}

	const emailData = { lang, email: emailAddress };
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(emailData),
	};

	const handleResult = (message, isOk) => {
		emailInput.value = '';
		emailInputLoader.style.display = 'none';
		emailInputLoader.innerText = '';
		showNewsletterMessage(message, !isOk);
	};

	let isOk;
	emailInputLoader.innerText = emailInput.value;
	emailInputLoader.style.display = 'block';
	fetch('/.netlify/functions/newsSubscription', options)
		.then(response => {
			isOk = response.ok;
			return response.json();
		})
		.then(data => {
			// console.log(data.message);
			if (isOk) handleResult(data.message, true);
			else throw new Error(data.message);
		})
		.catch(err => handleResult(err.message, false));
}
