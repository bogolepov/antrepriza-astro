import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen } from './cartStore';

import { loadClientJsons } from '@scripts/loadClientJsons';

import '@styles/antrepriza.css';
import '@styles/cart.css';
import '@styles/loader.css';

import Order from '@components/react/reservation/Order';

const clientJsons = { afisha: null, theater: null, dictionary: null };

export default function Cart({ lang, tickets, handleCloseClick, handleAddTicket, handleRemoveTicket }) {
	const $isCartOpen = useStore(isCartOpen);
	const [isJsonsLoaded, setIsJsonsLoaded] = useState(false);

	const handleThen = () => {
		setIsJsonsLoaded(true);
	};
	const handleFinally = () => {};

	if (!isJsonsLoaded) loadClientJsons(clientJsons, handleThen, handleFinally);

	// TODO: useMemo for tickets
	tickets.sort((play1, play2) => Date.parse(play1.date + 'T' + play1.time) - Date.parse(play2.date + 'T' + play2.time));

	return (
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
						<h5 className='cart-title'>{clientJsons.dictionary.my_reservations[lang]}</h5>
						<div className='order-list-wrapper'>
							<ul className='order-list'>
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
							{tickets.length > 0 && <button className='cart-book-button'>{clientJsons.dictionary.btn_reservation[lang]}</button>}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
