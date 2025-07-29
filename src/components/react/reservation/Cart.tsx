import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen } from './cartStore';

import { type TTicketType } from '@scripts/types/prices';
import { type TNetlifyDataReservations, type TReservation } from '@scripts/types/reservation';

import '@styles/cart.css';
import '@styles/loader.css';

import dictionary from '@data/dictionary.json';

import Order from '@components/react/reservation/Order';
import FinalReservationForm from '@components/react/reservation/FinalReservationForm';

interface ICart {
	lang: string;
	tickets: TReservation[];
	totalAmount: number;
	handleCloseClick: () => void;
	handleAddTicket: (play: TReservation, ticket_type: TTicketType) => void;
	handleRemoveTicket: (play: TReservation, ticket_type: TTicketType, count: number) => void;
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
		let bookTime = now.toLocaleDateString(lang, dateOptions);

		const emailData: TNetlifyDataReservations = {
			lang: lang,
			name: name,
			email: email,
			reservations: tickets,
			amount: totalAmount,
			when: bookTime,
		};

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(emailData),
		};

		let isOk: boolean;
		await fetch('/.netlify/functions/makeReservation', options)
			.then(response => {
				isOk = response.ok;
				return response.json();
			})
			.then(data => {
				if (isOk) {
					handleResult(true, null);
					handleReservationDone();
				} else throw new Error(data.message);
			})
			.catch(err => {
				handleResult(false, err.message);
			});
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
