import React, { useEffect, useState } from 'react';
import Cart from '@components/reservation/Cart';
import CartButton from '@components/reservation/CartButton';

const RESERVATION_KEY = 'reservations';

export default function Reservation({ lang }) {
	const [reservations, setReservations] = useState([]);
	const [isCartShow, setIsCartShow] = useState(false);

	let handleCartButtonClick = () => {
		setIsCartShow(prev => !prev);
	};

	let handleAddOneTicket = play => {};
	let handleRemoveOneTicket = play => {};

	useEffect(() => {
		setReservations(loadReservationsFromStorage());
	}, []);

	function loadReservationsFromStorage() {
		let loadedReservations;
		let lsValue = window.localStorage.getItem(RESERVATION_KEY);
		if (lsValue) loadedReservations = JSON.parse(lsValue);
		else loadedReservations = [];

		window.addEventListener('storage', e => {
			if (e.key === RESERVATION_KEY) {
				setReservations(JSON.parse(e.newValue));
			}
		});

		return loadedReservations;
	}

	function saveReservationsToStorage() {
		window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(reservations));
	}

	function calcTicketsCount() {
		let count = 0;
		reservations.forEach(reservation => {
			reservation.tickets.forEach(ticket_type => (count += ticket_type.count));
		});
		return count;
	}

	return (
		<>
			<Cart
				lang={lang}
				tickets={reservations}
				isShow={isCartShow}
				handleCloseClick={handleCartButtonClick}
				handleAddTicket={handleAddOneTicket}
				handleRemoveTicket={handleRemoveOneTicket}
			></Cart>
			<CartButton count={calcTicketsCount()} handleClick={handleCartButtonClick}></CartButton>
		</>
	);
}
