let jsonAfisha;
let jsonTheater;
let jsonDictionary;
const JSONs = [jsonAfisha, jsonTheater, jsonDictionary];

let afishaItem;
let playItem;

let elemLoader;

let elemPlayTitle;
let elemPlayDescription;
let elemDate;
let elemTime;
let elemAddress;
let elemStageName;
let elemPlace;

function initTicketBookForm() {
	let ticketBtns = document.getElementsByClassName('tickets-book-button');
	for (let btn of ticketBtns) {
		btn.disabled = false;
		btn.addEventListener('click', event => openForm(event, btn));
	}

	elemLoader = document.querySelector('.layer-on-parent.ticket-form-loader');

	elemPlayTitle = document.querySelector('.play-name');
	elemPlayDescription = document.querySelector('.play-descr');
	elemDate = document.querySelector('.play-date');
	elemTime = document.querySelector('.play-time');
	elemAddress = document.querySelector('.play-address');
	elemStageName = document.querySelector('.play-stage-name');
	elemPlace = document.querySelector('.play-place');
}

function openForm(event, button) {
	const form = document.querySelector('.ticket-layer');
	form.classList.add('show');

	elemLoader.classList.add('show');
	json_prepare('/data/afisha.json', 0)
		.then(() => json_prepare('/data/theater.json', 1))
		.then(() => json_prepare('/data/dictionary_client.json', 2))
		.then(() => {
			let aDate = button.getAttribute('data-date');
			let aTime = button.getAttribute('data-time');

			afishaItem = jsonAfisha.find(item => item.date === aDate && item.time === aTime);
			if (!afishaItem) {
				alert('Afisha Error!');
			}
			playItem = jsonTheater.plays.find(item => afishaItem.play_id == item.id);
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
		})
		.finally(() => {
			elemLoader.classList.remove('show');
		});
}

function closeForm() {
	const form = document.querySelector('.ticket-layer');
	form.classList.remove('show');
}

function resetTicketForm(event) {
	closeForm();
}

function buttonToKontramarka(event) {
	closeForm();
	window.open(playItem.url_kontramarka, '_blank');
}

function buttonAddToCart(event) {
	closeForm();
}

function json_prepare(jsonName, jsonIndex) {
	return new Promise(function (resolve, reject) {
		if (JSONs[jsonIndex]) resolve();
		else {
			fetch(jsonName)
				.then(response => response.json())
				.then(jsonData => {
					JSONs[jsonIndex] = jsonData;
					if (jsonIndex == 0) jsonAfisha = jsonData;
					else if (jsonIndex == 1) jsonTheater = jsonData;
					else if (jsonIndex == 2) jsonDictionary = jsonData;
					resolve();
				})
				.catch(error => reject(error));
		}
	});
}

function updatePrices() {
	elemPrices = document.querySelectorAll('.price-flex');
	if (!elemPrices) {
		console.error('price-flex is not found!!!');
		return;
	}
	elemPrices.forEach(element => {
		element.style.display = afishaItem.prices.includes(element.dataset['type']) ? 'flex' : 'none';
	});
}

function getPlayDescription() {
	let playLang = playItem.lang['ru'].toLowerCase() === 'немецкий' ? 'de' : 'ru';
	return playItem.genre[currLang] + ', ' + playItem.age + ', ' + jsonDictionary.play_lang[playLang][currLang];
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
		return jsonTheater.stageAddress.full_string;
	}
}
function getStageName() {
	if (afishaItem.address) {
		return afishaItem.address;
	} else {
		return jsonTheater.stageAddress.name;
	}
}

function getPlaceInfo() {
	return jsonDictionary.free_place[currLang];
}
