function initTicketButtonsOnPage() {
	console.log('Init TICKET buttons');
	let ticketBtns = document.getElementsByClassName('tickets-book-button');
	for (let btn of ticketBtns) {
		btn.disabled = false;
		btn.addEventListener('click', event => openForm(event, btn));
	}
}

function openForm(event, button) {
	console.log('click: ' + button.getAttribute('data-date') + ' ' + button.getAttribute('data-time'));
	const form = document.querySelector('.ticket-layer');
	form.classList.add('show');
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
