import { atom } from 'nanostores';
import { isCartOpen, isTicketsAdded } from './cartStore';

import { loadClientJsons } from '@scripts/loadClientJsons';

const RESERVATION_KEY = 'reservations';

const clientJsons = { afisha: null, theater: null, dictionary: null };

let afishaItem;
let playItem;

let elemLoader;

let elemForm;
let elemPlayTitle;
let elemPlayDescription;
let elemDate;
let elemTime;
let elemAddress;
let elemStageName;
let elemPlace;
let elemPriceBlocks;
let elemPriceCounters;
let elemBookButton;

export function initTicketBookForm() {
	let ticketBtns = document.getElementsByClassName('tickets-book-button');
	for (let btn of ticketBtns) {
		btn.disabled = false;
		btn.addEventListener('click', event => openForm(event, btn));
	}

	elemForm = document.querySelector('.ticket-layer');

	let btn = document.querySelector('#ticket-form-close-button');
	if (!btn) console.log('CLOSE BUTTON not found');
	else btn.addEventListener('click', () => resetTicketForm());

	btn = document.querySelector('#ticket-form-book-antrepriza');
	if (!btn) console.log('BOOK ANTREPRIZA not found');
	else btn.addEventListener('click', () => handleAddToCart());

	btn = document.querySelector('#ticket-form-book-kontramarka');
	if (!btn) console.log('BOOK KONTRAMARKA not found');
	else btn.addEventListener('click', () => handleToKontramarka());

	elemLoader = document.querySelector('.layer-on-parent.ticket-form-loader');

	elemBookButton = document.querySelector('.ticket-form-book-button');
	elemBookButton.disabled = true;

	elemPlayTitle = document.querySelector('.play-name');
	elemPlayDescription = document.querySelector('.play-descr');
	elemDate = document.querySelector('.play-date');
	elemTime = document.querySelector('.play-time');
	elemAddress = document.querySelector('.play-address');
	elemStageName = document.querySelector('.play-stage-name');
	elemPlace = document.querySelector('.play-place');
	elemPriceBlocks = document.querySelectorAll('.price-flex');

	elemPriceCounters = document.querySelectorAll('.count-input');
	for (let counter of elemPriceCounters) {
		counter.addEventListener('change', () => {
			elemBookButton.disabled = getTicketsCount() === 0;
		});
	}
}

function openForm(event, button) {
	isTicketsAdded.set(false);

	elemForm.classList.add('show');

	elemLoader.classList.add('show');

	const handleThen = () => {
		let aDate = button.getAttribute('data-date');
		let aTime = button.getAttribute('data-time');

		afishaItem = clientJsons.afisha.find(item => item.date === aDate && item.time === aTime);
		if (!afishaItem) {
			alert('Afisha Error!');
		}
		playItem = clientJsons.theater.plays.find(item => afishaItem.play_id == item.id);
		if (!playItem) {
			alert('Play Error!');
		}
		if (afishaItem && playItem) {
			elemPlayTitle.innerHTML = playItem.title[currLang];
			elemPlayDescription.innerHTML = getPlayDescription();
			elemDate.innerHTML = getPlayDate();
			elemTime.innerHTML = getPlayTime();
			elemAddress.innerHTML = getAddress();
			elemStageName.innerHTML = getStageName();
			elemPlace.innerHTML = getPlaceInfo();
			updatePrices();
		}
	};

	const handleFinally = () => {
		elemLoader.classList.remove('show');
	};

	loadClientJsons(clientJsons, handleThen, handleFinally);
}

function closeForm() {
	elemForm.classList.remove('show');

	elemPlayTitle.innerHTML = '';
	elemPlayDescription.innerHTML = '';
	elemDate.innerHTML = '';
	elemTime.innerHTML = '';
	elemAddress.innerHTML = '';
	elemStageName.innerHTML = '';
	elemPlace.innerHTML = '';
	elemPriceCounters.forEach(element => (element.value = '0'));
	elemBookButton.disabled = true;
}

function resetTicketForm() {
	closeForm();
}

function handleToKontramarka() {
	closeForm();
	window.open(playItem.url_kontramarka, '_blank');
}

function handleAddToCart() {
	let reservations;
	let value = window.localStorage.getItem(RESERVATION_KEY);
	if (value) reservations = JSON.parse(value);
	else reservations = [];

	let reservation = reservations.find(
		item => item.date === afishaItem.date && item.time === afishaItem.time && item.play_id === afishaItem.play_id
	);
	if (reservation) {
		reservation.tickets.forEach(price_type => (price_type.count += getTicketCount(price_type.type)));
	} else {
		let newTickets = [];
		clientJsons.theater.prices.forEach(price => newTickets.push({ type: price.type, count: getTicketCount(price.type) }));
		let newReservation = { date: afishaItem.date, time: afishaItem.time, play_id: afishaItem.play_id, tickets: newTickets };
		reservations.push(newReservation);
	}
	window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(reservations));

	closeForm();
	isCartOpen.set(true);
	isTicketsAdded.set(true);
}

function updatePrices() {
	elemPriceBlocks.forEach(element => {
		element.style.display = afishaItem.prices.includes(element.dataset['type']) ? 'flex' : 'none';
	});
}

function getPlayDescription() {
	let playLang = playItem.lang['ru'].toLowerCase() === 'немецкий' ? 'de' : 'ru';
	return playItem.genre[currLang] + ', ' + playItem.age + ', ' + clientJsons.dictionary.play_lang[playLang][currLang];
}

function getPlayDate() {
	let playDate = new Date(afishaItem.date);
	let options = {
		year: 'numeric',
		month: 'long',
		day: '2-digit',
	};
	// weekday: 'short'
	return playDate.toLocaleDateString(currLang, options);
}
function getPlayTime() {
	let playDate = new Date(afishaItem.date + 'T' + afishaItem.time);
	return afishaItem.time + ', ' + playDate.toLocaleDateString(currLang, { weekday: 'long' });
}

function getAddress() {
	if (afishaItem.address) {
		return afishaItem.address;
	} else {
		return clientJsons.theater.stageAddress.full_string;
	}
}
function getStageName() {
	if (afishaItem.address) {
		return afishaItem.address;
	} else {
		return clientJsons.theater.stageAddress.name;
	}
}

function getPlaceInfo() {
	return clientJsons.dictionary.free_place[currLang];
}

function getTicketCount(price_type) {
	let elCounter = document.querySelector('#count-' + price_type);
	if (!elCounter) console.log('COUNT-element: NOT FOUND!');
	return Number(elCounter.value);
}

function getTicketsCount() {
	let count = 0;
	for (let counter of elemPriceCounters) {
		count += Number(counter.value);
	}
	return count;
}
