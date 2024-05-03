import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';

import { Cart, getPrice } from '@components/react/reservation/Cart';
import CartButton from '@components/react/reservation/CartButton';
import { isCartOpen, isTicketsAdded } from './cartStore';

const RESERVATION_KEY = 'reservations';

export default function Reservation({ lang }) {
	const [reservations, setReservations] = useState([]);
	const [totalAmount, setTotalAmount] = useState(0);

	const $isCartOpen = useStore(isCartOpen);
	const $isTicketsAdded = useStore(isTicketsAdded);

	let handleCartButtonClick = () => {
		if (totalAmount === 0 && $isCartOpen === false) setTotalAmount(calcTotalAmount(reservations));
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
		setTotalAmount(calcTotalAmount(updReservations));
		window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(updReservations));
	};

	let handleRemoveOneTicket = (play, ticketType, typeCount) => {
		if (calcTicketsAtPlay(play) === 1) {
			const updReservations = reservations.filter(
				play_item => play_item.date !== play.date || play_item.time !== play.time || play_item.play_id !== play.play_id
			);
			// remove this play from reservations
			setReservations(updReservations);
			setTotalAmount(calcTotalAmount(updReservations));
			window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(updReservations));
		} else {
			const updReservations = reservations.map(play_item => {
				if (play_item.date === play.date && play_item.time === play.time && play_item.play_id === play.play_id) {
					//
					return {
						...play_item,
						tickets: play_item.tickets.map(ticket_type => {
							if (ticket_type.type === ticketType) {
								return { ...ticket_type, count: typeCount > 1 ? ticket_type.count - 1 : 0 };
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
			setTotalAmount(calcTotalAmount(updReservations));
			window.localStorage.setItem(RESERVATION_KEY, JSON.stringify(updReservations));
		}
	};

	useEffect(() => {
		let loadedReservations = loadReservationsFromStorage();
		setReservations(loadedReservations);
		setTotalAmount(calcTotalAmount(loadedReservations));
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
				let updReservations = JSON.parse(e.newValue);
				setReservations(updReservations);
				setTotalAmount(calcTotalAmount(updReservations));
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

	function calcTotalAmount(myReservations) {
		let amount = 0;
		myReservations.map(item => {
			item.tickets.map(ticket_type => {
				amount += ticket_type.count * getPrice(ticket_type.type);
			});
		});
		return amount;
	}

	return (
		<>
			<Cart
				lang={lang}
				tickets={reservations}
				totalAmount={totalAmount}
				handleCloseClick={handleCartButtonClick}
				handleAddTicket={handleAddOneTicket}
				handleRemoveTicket={handleRemoveOneTicket}
			></Cart>
			<CartButton handleCount={calcTicketsCount} handleClick={handleCartButtonClick}></CartButton>
		</>
	);
}
