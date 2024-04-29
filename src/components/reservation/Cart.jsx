import { useStore } from '@nanostores/react';
import { isCartOpen } from './cartStore';

// import { loadClientJsons } from '@scripts/loadClientJsons';

import '@styles/antrepriza.css';
import '@styles/cart.css';

import Order from '@components/reservation/Order';

// const clientJsons = { afisha: null, theater: null, dictionary: null };

export default function Cart({ lang, tickets, handleCloseClick, handleAddTicket, handleRemoveTicket }) {
	const $isCartOpen = useStore(isCartOpen);

	// loadClientJsons(clientJsons);

	tickets.sort((play1, play2) => Date.parse(play1.date + 'T' + play1.time) - Date.parse(play2.date + 'T' + play2.time));
	return (
		<div className={'ticket-cart' + ($isCartOpen ? ' show' : '')}>
			<button className='close-cart__button' onClick={handleCloseClick}>
				&#10006;
			</button>
			<div className='cart-content'>
				{/* <h4 className='cart-titel'>{clientJsons.dictionary.my_reservations[lang]}</h4> */}
				<h4 className='cart-titel'>Meine Bestellungen</h4>
				<div className='order-list-wrapper'>
					<ul className='order-list'>
						{tickets.map((play, index) => (
							<Order key={index} lang={lang} play={play} handleAddTicket={handleAddTicket} handleRemoveTicket={handleRemoveTicket} />
						))}
					</ul>
				</div>
				<div className='cart-footer'>{tickets.length > 0 && <button className='cart-book-button'>Забронировать</button>}</div>
			</div>
		</div>
	);
}
