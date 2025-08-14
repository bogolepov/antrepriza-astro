import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';

import { Cart } from '@components/react/reservation/Cart';
import CartButton from '@components/react/reservation/CartButton';
import { isCartOpen, isTicketsAdded } from './cartStore';

import { FROZEN_BOOK_TIME, STORE_RESERVATION_KEY } from '@scripts/consts';
import type { TDoReservationItem } from '@scripts/types/reservation';

import prices from '@data/prices.json';
export function getPrice(price_type) {
	return prices.find(price => price.type === price_type).value;
}

export default function Reservation({ lang }) {
	const [reservations, setReservations] = useState([]);
	const [totalAmount, setTotalAmount] = useState(0);

	const $isCartOpen = useStore(isCartOpen);
	const $isTicketsAdded = useStore(isTicketsAdded);

	let handleCartButtonClick = (): void => {
		if (totalAmount === 0 && $isCartOpen === false) setTotalAmount(calcTotalAmount(reservations));
		isCartOpen.set(!$isCartOpen);
	};

	let handleAddOneTicket = (play: TDoReservationItem, ticketType: string) => {
		const updReservations = reservations.map(play_item => {
			if (play_item.date === play.date && play_item.time === play.time && play_item.play_sid === play.play_sid) {
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
		updateReservations(updReservations);
	};

	let handleRemoveOneTicket = (play, ticketType, typeCount) => {
		if (calcTicketsAtPlay(play) === 1) {
			const updReservations = reservations.filter(
				play_item => play_item.date !== play.date || play_item.time !== play.time || play_item.play_id !== play.play_id
			);
			// remove this play from reservations
			updateReservations(updReservations);
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
			updateReservations(updReservations);
		}
	};

	let handleReservationDone = () => {
		updateReservations([]);
	};

	useEffect(() => {
		let loadedReservations: TDoReservationItem[] = loadReservationsFromStorage();
		updateReservations(loadedReservations);
	}, [$isTicketsAdded]);

	function loadReservationsFromStorage(): TDoReservationItem[] {
		let loadedReservations: TDoReservationItem[];
		let lsValue = window.localStorage.getItem(STORE_RESERVATION_KEY);
		if (lsValue) loadedReservations = JSON.parse(lsValue);
		else loadedReservations = [];

		// other windows (not CURRENT!!!) listen, if localStorage with key STORE_RESERVATION_KEY was changed,
		// then counter od CartButton and reservations-state will be updated
		window.addEventListener('storage', e => {
			if (e.key === STORE_RESERVATION_KEY) {
				let updReservations: TDoReservationItem[] = JSON.parse(e.newValue);
				updateReservations(updReservations);
			}
		});

		return loadedReservations;
	}

	function saveReservationsToStorage(updReservations: TDoReservationItem[]) {
		window.localStorage.setItem(STORE_RESERVATION_KEY, JSON.stringify(updReservations));
	}

	function updateReservations(updReservations: TDoReservationItem[]) {
		// validate reservations
		updReservations.sort(
			(play1, play2) => Date.parse(play1.date + 'T' + play1.time) - Date.parse(play2.date + 'T' + play2.time)
		);
		updReservations = updReservations.filter(
			play => Date.parse(play.date + 'T' + play.time) - FROZEN_BOOK_TIME > Date.now()
		);

		// update
		setReservations(updReservations);
		setTotalAmount(calcTotalAmount(updReservations));
		saveReservationsToStorage(updReservations);
	}

	let calcTicketsCount = (): number => {
		let count: number = 0;
		reservations.forEach(play => (count += calcTicketsAtPlay(play)));
		return count;
	};

	function calcTicketsAtPlay(play: TDoReservationItem): number {
		let playCount: number = 0;
		play.tickets.forEach(ticket_type => (playCount += ticket_type.count));
		return playCount;
	}

	function calcTotalAmount(myReservations: TDoReservationItem[]): number {
		let amount: number = 0;
		myReservations.map(item => {
			item.tickets.map(ticket_type => {
				amount += ticket_type.count * getPrice(ticket_type.type);
			});
		});
		return amount;
	}

	return (
		<>
			<CartButton handleCount={calcTicketsCount} handleClick={handleCartButtonClick}></CartButton>
			<Cart
				lang={lang}
				tickets={reservations}
				totalAmount={totalAmount}
				handleCloseClick={handleCartButtonClick}
				handleAddTicket={handleAddOneTicket}
				handleRemoveTicket={handleRemoveOneTicket}
				handleReservationDone={handleReservationDone}
			></Cart>
		</>
	);
}
