import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';

import Cart from '@components/reservation/Cart';
import CartButton from '@components/reservation/CartButton';
import { isCartOpen, isTicketsAdded } from './cartStore';

const RESERVATION_KEY = 'reservations';

export default function Reservation({ lang }) {
	const [reservations, setReservations] = useState([]);

	const $isCartOpen = useStore(isCartOpen);
	const $isTicketsAdded = useStore(isTicketsAdded);

	let handleCartButtonClick = () => {
		isCartOpen.set(!$isCartOpen);
	};

	let handleAddOneTicket = (play, ticketType) => {
		const updReservations = reservations.map(play_item => {
			if (play_item.date === play.date && play_item.time === play.time && play_item.play_id === play.play_id) {
				//
				return {
					...play_item,
					tickets: play_item.tickets.map(ticket_type => {
						if (ticket_type.type === ticketType && ticket_type.count < 10) {
							return { ...ticket_type, count: ticket_type.count + 1 };
						} else {
							return ticket_type;
						}
					}),
				};
			} else {
				// no changes
				return play_item;
			}
		});
		setReservations(updReservations);
		window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(updReservations));
	};

	let handleRemoveOneTicket = (play, ticketType, typeCount) => {
		if (calcTicketsAtPlay(play) === 1) {
			const updReservations = reservations.filter(
				play_item => play_item.date !== play.date || play_item.time !== play.time || play_item.play_id !== play.play_id
			);
			// remove this play from reservations
			setReservations(updReservations);
			window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(updReservations));
		} else {
			const updReservations = reservations.map(play_item => {
				if (play_item.date === play.date && play_item.time === play.time && play_item.play_id === play.play_id) {
					//
					return {
						...play_item,
						tickets:
							typeCount > 1
								? play_item.tickets.map(ticket_type => {
										if (ticket_type.type === ticketType) {
											return { ...ticket_type, count: ticket_type.count - 1 };
										} else {
											return ticket_type;
										}
								  })
								: // remove item with ticketType, because new count of this type tickets is 0
								  play_item.tickets.filter(ticket_type => ticket_type.type !== ticketType),
					};
				} else {
					// no changes
					return play_item;
				}
			});
			setReservations(updReservations);
			window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(updReservations));
		}
	};

	useEffect(() => {
		setReservations(loadReservationsFromStorage());
	}, [$isTicketsAdded]);

	function loadReservationsFromStorage() {
		let loadedReservations;
		let lsValue = window.localStorage.getItem(RESERVATION_KEY);
		if (lsValue) loadedReservations = JSON.parse(lsValue);
		else loadedReservations = [];

		// other windows (not CURRENT!!!) listen, if localStorage with key RESERVATION_KEY was changed,
		// then counter od CartButton and reservations-state will be updated
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

	let calcTicketsCount = () => {
		let count = 0;
		reservations.forEach(play => (count += calcTicketsAtPlay(play)));
		return count;
	};

	function calcTicketsAtPlay(play) {
		let playCount = 0;
		play.tickets.forEach(ticket_type => (playCount += ticket_type.count));
		return playCount;
	}

	return (
		<>
			<Cart
				lang={lang}
				tickets={reservations}
				handleCloseClick={handleCartButtonClick}
				handleAddTicket={handleAddOneTicket}
				handleRemoveTicket={handleRemoveOneTicket}
			></Cart>
			<CartButton handleCount={calcTicketsCount} handleClick={handleCartButtonClick}></CartButton>
		</>
	);
}
