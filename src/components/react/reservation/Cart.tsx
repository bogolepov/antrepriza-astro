import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen } from './cartStore';

import type { TDoReservationPacket, TDoReservationItem } from '@scripts/types/reservation';

import '@styles/cart.css';
import '@styles/loader.css';

import dictionary from '@data/dictionary.json';

import Order from '@components/react/reservation/Order';
import FinalReservationForm from '@components/react/reservation/FinalReservationForm';
import { ENetlifyEndpoint, netlify, type TNetlifyFrom, type TNetlifyTo } from '@scripts/netlify';

interface ICart {
	lang: string;
	tickets: TDoReservationItem[];
	totalAmount: number;
	handleCloseClick: () => void;
	handleAddTicket: (play: TDoReservationItem, ticket_type: string) => void;
	handleRemoveTicket: (play: TDoReservationItem, ticket_type: string, count: number) => void;
	handleReservationDone: () => void;
}
export function Cart({
	lang,
	tickets,
	totalAmount,
	handleCloseClick,
	handleAddTicket,
	handleRemoveTicket,
	handleReservationDone,
}: ICart) {
	const $isCartOpen = useStore(isCartOpen);
	const [isFinalFormOpen, setIsFinalFormOpen] = useState(false);

	const handleFinalFormOpen = () => {
		setIsFinalFormOpen(true);
	};
	const handleFinalFormClose = () => {
		setIsFinalFormOpen(false);
	};

	const handleFinalFormSubmit = async (
		name: string,
		email: string,
		handleResult: (isOk: boolean, errMessage: string) => void
	) => {
		// console.log('Name: ' + name + ', email: ' + email);

		const now = new Date();
		let dateOptions: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		};
		let bookTime: string = now.toLocaleDateString(lang, dateOptions);

		const validTickets: TDoReservationItem[] = JSON.parse(JSON.stringify(tickets));
		validTickets.forEach(event => {
			event.tickets = event.tickets.filter(t => t.count > 0);
		});

		const packet: TDoReservationPacket = {
			lang,
			name,
			email,
			reservations: validTickets,
			amount: totalAmount,
			when: bookTime,
		};

		const handleResponse = (response: TNetlifyFrom<never>): void => {
			if (response.ok) {
				handleResult(true, null);
				handleReservationDone();
			} else {
				handleResult(false, response.message);
			}
		};

		const dataTo: TNetlifyTo = { packet };
		netlify(ENetlifyEndpoint.NETLIFY_MAKE_RESERVATION, dataTo, handleResponse);
	};

	return (
		<>
			<div className={'ticket-cart' + ($isCartOpen ? ' show' : '')} inert={$isCartOpen ? undefined : ''}>
				<button className='close-cart__button' onClick={handleCloseClick}>
					&#10006;
				</button>
				<div className='cart-content'>
					<div className='cart-title'>{dictionary.my_reservations[lang]}</div>
					<div className='order-list-wrapper'>
						{tickets.length === 0 && <div className='cart-empty'>{dictionary.empty_reservation_list[lang]}</div>}
						<ul>
							{tickets.map((play, index) => (
								<Order
									key={play.date + 'T' + play.time}
									lang={lang}
									play={play}
									handleAddTicket={handleAddTicket}
									handleRemoveTicket={handleRemoveTicket}
								/>
							))}
						</ul>
					</div>
					<div className='cart-footer'>
						{tickets.length > 0 && (
							<>
								<div className='order-flex'>
									<div className='item-name'>{dictionary.total_amount[lang]}</div>
									<div className='item-amount'>{totalAmount}€</div>
								</div>
								<button className='pink-button' onClick={handleFinalFormOpen}>
									{dictionary.btn_cart_book[lang]}
								</button>
							</>
						)}
					</div>
				</div>
			</div>
			<FinalReservationForm
				lang={lang}
				isShow={isFinalFormOpen}
				handleClose={handleFinalFormClose}
				handleMakeReservation={handleFinalFormSubmit}
			></FinalReservationForm>
		</>
	);
}
