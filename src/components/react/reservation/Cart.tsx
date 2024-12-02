import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen } from './cartStore';

import { type IClientJsons, loadClientJsons } from '@scripts/clientJsons';

import '@styles/cart.css';
import '@styles/loader.css';

import Order from '@components/react/reservation/Order';
import FinalReservationForm from '@components/react/reservation/FinalReservationForm';

const clientJsons: IClientJsons = { afisha: null, theater: null, dictionary: null };

export function getPrice(price_type) {
	if (clientJsons.theater === null) return 0;
	return clientJsons.theater.prices.find(price => price.type === price_type).value;
}

export function Cart({ lang, tickets, totalAmount, handleCloseClick, handleAddTicket, handleRemoveTicket, handleReservationDone }) {
	const $isCartOpen = useStore(isCartOpen);
	const [isJsonsLoaded, setIsJsonsLoaded] = useState(false);
	const [isFinalFormOpen, setIsFinalFormOpen] = useState(false);

	const handleThen = () => {
		setIsJsonsLoaded(true);
	};
	const handleFinally = () => {};

	const handleFinalFormOpen = () => {
		setIsFinalFormOpen(true);
	};
	const handleFinalFormClose = () => {
		setIsFinalFormOpen(false);
	};

	const handleFinalFormSubmit = async (name, email, handleResult) => {
		// console.log('Name: ' + name + ', email: ' + email);

		const now = new Date();
		const emailData = { lang: lang, name: name, email: email, reservations: tickets, amount: totalAmount, now: now.getTime() };

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
					handleResult(true);
					handleReservationDone();
				} else throw new Error(data.message);
			})
			.catch(() => handleResult(false));
	};

	if (!isJsonsLoaded) loadClientJsons(clientJsons, handleThen, handleFinally);

	return (
		<>
			<div className={'ticket-cart' + ($isCartOpen ? ' show' : '')}>
				<button className='close-cart__button' onClick={handleCloseClick}>
					&#10006;
				</button>
				<div className='cart-content'>
					{!isJsonsLoaded && (
						<div className='loader-wrapper'>
							<div className='layer-on-parent show not_transparent'>
								<div className='antrepriza-loader'></div>
							</div>
						</div>
					)}
					{isJsonsLoaded && (
						<>
							<div className='cart-title'>{clientJsons.dictionary.my_reservations[lang]}</div>
							<div className='order-list-wrapper'>
								{tickets.length === 0 && <div className='cart-empty'>{clientJsons.dictionary.empty_reservation_list[lang]}</div>}
								<ul>
									{tickets.map((play, index) => (
										<Order
											key={play.date + 'T' + play.time}
											lang={lang}
											jsons={clientJsons}
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
											<div className='item-name'>{clientJsons.dictionary.total_amount[lang]}</div>
											<div className='item-amount'>{totalAmount}€</div>
										</div>
										<button className='pink-button' onClick={handleFinalFormOpen}>
											{clientJsons.dictionary.btn_cart_book[lang]}
										</button>
									</>
								)}
							</div>
						</>
					)}
				</div>
			</div>
			<FinalReservationForm
				lang={lang}
				dictionary={clientJsons.dictionary}
				isShow={isFinalFormOpen}
				handleClose={handleFinalFormClose}
				handleMakeReservation={handleFinalFormSubmit}
			></FinalReservationForm>
		</>
	);
}
