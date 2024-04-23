import React, { useState } from 'react';
import Cart from '@components/reservation/Cart';
import CartButton from '@components/reservation/CartButton';

let lsReservations = undefined;
const RESERVATION_KEY = 'reservations';

export default function Reservation({ lang }) {
	loadReservationsFromStorage();
	return (
		<>
			<Cart lang={lang}></Cart>
			<CartButton count={ticketsCount()}></CartButton>
		</>
	);
}

function loadReservationsFromStorage() {
	// JSON.stringify(obj))
	if (lsReservations == undefined) {
		let lsValue = window.localStorage.getItem(RESERVATION_KEY);
		if (lsValue) lsReservations = JSON.parse(lsValue);
		else lsReservations = [];

		window.addEventListener('storage', e => {
			if (e.key === RESERVATION_KEY) {
				// TODO: lsReservation = e.newValue ---- init render
			}
		});
	}
}

function saveReservationsToStorage() {
	window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(lsReservations));
}

function ticketsCount() {
	if (!lsReservations || lsReservations.constructor !== Array) return 0;

	let count = 0;
	lsReservations.forEach(reservation => (count += reservation.count));
	return count;
}
