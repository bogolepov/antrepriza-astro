import * as consts from '@scripts/consts';

import { atom } from 'nanostores';
import { isCartOpen, isTicketsAdded } from '@react-components/reservation/cartStore';

import { loadClientJsons } from '@scripts/loadClientJsons';

const RESERVATION_KEY = 'reservations';

const clientJsons = { afisha: null, theater: null, dictionary: null };

let afishaItem;
let stage;
let playItem;

let currLang;

let afishaButton;

let elemTicketLayer;

let elemLoader;
let elemPlayTitle;
let elemPlayDescription;
let elemDate;
let elemTime;
let elemStageName;
let elemAddress;
let elemPlaceName;
let elemSeating;
let elemPriceBlocks;
let elemPriceCounters;
let elemAntreprizaButton;
let elemRadioAntrepriza;
let elemRadioDistributor;
let elemDistributorLabel;
let elemButtonDistributor;

let initStageName;
let defaultDistributorLabel;
let defaultDistribButtonText;

export function initTicketBookForm() {
	currLang = localStorage.getItem(consts.CNF_LANG);
	let ticketBtns = document.querySelectorAll('.pink-button.book-ticket.open-book-form');
	for (let btn of ticketBtns) {
		// btn.disabled = false;
		btn.addEventListener('click', event => openForm(event, btn));
	}

	elemTicketLayer = document.querySelector('.modal-layer-ticket');

	let btn = elemTicketLayer.querySelector('#ticket-form-close-button');
	if (!btn) console.error('CLOSE BUTTON not found');
	else btn.addEventListener('click', () => resetTicketForm());

	elemAntreprizaButton = elemTicketLayer.querySelector('#ticket-form-book-antrepriza');
	if (!elemAntreprizaButton) console.error('BOOK ANTREPRIZA not found');
	else elemAntreprizaButton.addEventListener('click', () => handleAddToCart());
	elemAntreprizaButton.disabled = true;

	elemButtonDistributor = elemTicketLayer.querySelector('#ticket-form-book-distributor');
	if (!elemButtonDistributor) console.log('BOOK DISTRIBUTOR not found');
	else elemButtonDistributor.addEventListener('click', () => handleToDistributor());

	elemLoader = elemTicketLayer.querySelector('.ticket-form-loader');

	elemPlayTitle = elemTicketLayer.querySelector('.play-name');
	elemPlayDescription = elemTicketLayer.querySelector('.play-descr');
	elemDate = elemTicketLayer.querySelector('.play-date');
	elemTime = elemTicketLayer.querySelector('.play-time');
	elemStageName = elemTicketLayer.querySelector('.play-stage-name');
	initStageName = elemStageName.innerHTML;
	elemAddress = elemTicketLayer.querySelector('.play-address');
	elemPlaceName = elemTicketLayer.querySelector('.play-place-name');
	elemSeating = elemTicketLayer.querySelector('.play-seating');
	elemPriceBlocks = elemTicketLayer.querySelectorAll('.price-flex');

	elemRadioAntrepriza = elemTicketLayer.querySelector('#antrepriza');
	elemRadioDistributor = elemTicketLayer.querySelector('#distributor');
	elemDistributorLabel = elemTicketLayer.querySelector('.distributor-label');
	defaultDistributorLabel = elemDistributorLabel.innerHTML;
	defaultDistribButtonText = elemButtonDistributor.querySelector('.button-text').innerHTML;

	elemPriceCounters = elemTicketLayer.querySelectorAll('.count-input');
	for (let counter of elemPriceCounters) {
		counter.addEventListener('change', () => {
			elemAntreprizaButton.disabled = getTicketsCount() === 0;
		});
	}
}

function canBook_ValidDate(button) {
	let playDate = button.getAttribute('data-date');
	let playTime = button.getAttribute('data-time');
	if (!playDate || playDate.length === 0 || !playTime || playTime.length === 0) return false;

	if (Date.parse(playDate + 'T' + playTime) <= Date.now()) {
		//(btn as HTMLElement).hidden = true;
		button.disabled = true;
		return false;
	}

	return true;
}

function openForm(event, button) {
	// check, the date
	if (!canBook_ValidDate(button)) return;

	afishaButton = button;

	isTicketsAdded.set(false);

	elemTicketLayer.classList.add('show');

	elemLoader.classList.add('show');

	const handleThen = () => {
		let aDate = afishaButton.getAttribute('data-date');
		let aTime = afishaButton.getAttribute('data-time');

		afishaItem = clientJsons.afisha.find(item => item.date === aDate && item.time === aTime);
		if (!afishaItem) {
			alert('Afisha Error!');
		}
		playItem = clientJsons.theater.plays.find(item => afishaItem.play_id == item.id);
		if (!playItem) {
			alert('Play Error!');
		}
		stage = clientJsons.theater.stages.find(stg => stg.sid === afishaItem.stage_sid);
		if (!stage) stage = afishaItem.stage;
		if (!stage) {
			console.error('No STAGE information!');
		}
		if (afishaItem && playItem) {
			elemPlayTitle.innerHTML = playItem.title[currLang];
			elemPlayDescription.innerHTML = getPlayDescription();
			elemDate.innerHTML = getPlayDate();
			elemTime.innerHTML = getPlayTime();
			if (stage.fix_stage) elemStageName.innerHTML = initStageName + stage.name[currLang].toUpperCase();
			else elemStageName.innerHTML = stage.name[currLang].toUpperCase();
			elemAddress.innerHTML = getAddress();
			let placeName = getPlaceName();
			if (placeName) {
				elemPlaceName.innerHTML = placeName;
				elemPlaceName.hidden = false;
			} else {
				elemPlaceName.hidden = true;
			}
			elemSeating.innerHTML = getSeatingInfo();
			updatePrices();

			if (afishaItem.distributor) {
				elemDistributorLabel.innerHTML = afishaItem.distributor.label[currLang];
				elemButtonDistributor.querySelector('.button-text').innerHTML = afishaItem.event_name[currLang];
				elemButtonDistributor.querySelector('picture').style.display = 'none';
				elemButtonDistributor.classList.remove('kontramarka');
				elemButtonDistributor.classList.remove('flex-center');
			} else {
				elemDistributorLabel.innerHTML = defaultDistributorLabel;
				elemButtonDistributor.querySelector('.button-text').innerHTML = defaultDistribButtonText;
				elemButtonDistributor.querySelector('picture').style.display = 'block';
				elemButtonDistributor.classList.add('kontramarka');
				elemButtonDistributor.classList.add('flex-center');
			}
		}
	};

	const handleFinally = () => {
		elemLoader.classList.remove('show');
	};

	loadClientJsons(clientJsons, handleThen, handleFinally);
}

function closeForm() {
	elemTicketLayer.classList.remove('show');

	elemPlayTitle.innerHTML = '';
	elemPlayDescription.innerHTML = '';
	elemDate.innerHTML = '';
	elemTime.innerHTML = '';
	elemAddress.innerHTML = '';
	elemPlaceName.innerHTML = '';
	elemSeating.innerHTML = '';
	elemPriceCounters.forEach(element => (element.value = '0'));
	elemAntreprizaButton.disabled = true;

	canBook_ValidDate(afishaButton);
	afishaButton = undefined;
}

function resetTicketForm() {
	closeForm();
}

function handleToDistributor() {
	closeForm();
	if (afishaItem.distributor) window.open(afishaItem.distributor.link, '_blank');
	else window.open(playItem.url_kontramarka, '_blank');
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
		// TODO:
		let newReservation = {
			date: afishaItem.date,
			time: afishaItem.time,
			play_id: afishaItem.play_id,
			stage_sid: stage.sid,
			tickets: newTickets,
		};
		reservations.push(newReservation);
	}
	window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(reservations));

	closeForm();
	isCartOpen.set(true);
	isTicketsAdded.set(true);
}

function updatePrices() {
	let nPrices = 0;
	elemPriceBlocks.forEach(element => {
		if (afishaItem.prices.includes(element.dataset['type'])) {
			element.style.display = 'flex';
			nPrices++;
		} else {
			element.style.display = 'none';
		}
	});
	if (nPrices) {
		elemRadioAntrepriza.checked = true;
	} else {
		elemRadioDistributor.checked = true;
	}
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
	if (stage && stage.address) return stage.address.full_string;
	else return '';
}
function getPlaceName() {
	if (stage && stage.show_place_name) return stage.place_name;
	else return null;
}

function getSeatingInfo() {
	return clientJsons.dictionary.free_place[currLang];
}

function getTicketCount(price_type) {
	let elCounter = document.querySelector('#count-' + price_type);
	if (!elCounter) console.error('COUNT-element: NOT FOUND!');
	return Number(elCounter.value);
}

function getTicketsCount() {
	let count = 0;
	for (let counter of elemPriceCounters) {
		count += Number(counter.value);
	}
	return count;
}
