let jsonAfisha;
let jsonTheater;

let afishaItem;
let playItem;

let elemPlayTitle;
let elemDate;
let elemAddress;
let elemGenre;
let elemPlayLang;

function initTicketBookForm() {
	console.log('Init TICKET buttons');
	let ticketBtns = document.getElementsByClassName('tickets-book-button');
	for (let btn of ticketBtns) {
		btn.disabled = false;
		btn.addEventListener('click', event => openForm(event, btn));
	}

	elemPlayTitle = document.querySelector('.play-name');
	elemDate = document.querySelector('.play-date');
	elemAddress = document.querySelector('.play-stage');
	elemGenre = document.querySelector('.play-genre');
	elemPlayLang = document.querySelector('.play-language');
}

function openForm(event, button) {
	console.log('click: ' + button.getAttribute('data-date') + ' ' + button.getAttribute('data-time'));
	const form = document.querySelector('.ticket-layer');
	form.classList.add('show');

	afisha_prepare()
		.then(() => theater_prepare())
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
				elemDate.innerHTML = getPlayDate();
				elemGenre.innerHTML = getGenre();
				elemPlayLang.innerHTML = playItem.lang[currLang];
			}
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
}

function afisha_prepare() {
	return new Promise(function (resolve, reject) {
		if (jsonAfisha) resolve();
		else {
			fetch(`/data/afisha.json`)
				.then(response => response.json())
				.then(jsonData => {
					jsonAfisha = jsonData;
					resolve();
				})
				.catch(error => reject(error));
		}
	});
}

function theater_prepare() {
	return new Promise(function (resolve, reject) {
		if (jsonTheater) resolve();
		else {
			fetch(`/data/theater.json`)
				.then(response => response.json())
				.then(jsonData => {
					jsonTheater = jsonData;
					resolve();
				})
				.catch(error => reject(error));
		}
	});
}

function getPlayDate() {
	return afishaItem.date + ' ' + afishaItem.time;
}

function getAddress() {
	if (afishaItem.address) {
		return afishaItem.address;
	} else {
		return jsonTheater.stageAddress.full_string + ' (' + jsonTheater.stageAddress.name + ')';
	}
}

function getGenre() {
	return playItem.genre[currLang] + ', ' + playItem.age;
}
