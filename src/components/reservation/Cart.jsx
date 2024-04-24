import '@styles/antrepriza.css';
import '@styles/cart.css';

import Order from '@components/reservation/Order';

export default function Cart({ lang, tickets, isShow, handleCloseClick, handleAddTicket, handleRemoveTicket }) {
	tickets.sort((play1, play2) => Date.parse(play1.date + 'T' + play1.time) - Date.parse(play2.date + 'T' + play2.time));
	return (
		<div className={'ticket-cart' + (isShow ? ' show' : '')}>
			<button className='close-cart__button' onClick={handleCloseClick}>
				&#10006;
			</button>
			<div className='cart-content'>
				<h4 className='cart-titel'>Meine Bestellungen</h4>
				<div className='order-list'>
					{tickets.map((play, index) => (
						<Order key={index} lang={lang} play={play} handleAddTicket={handleAddTicket} handleRemoveTicket={handleRemoveTicket} />
					))}
				</div>
				<div className='cart-footer'>
					<button className='cart-book-button'>Забронировать</button>
				</div>
			</div>
		</div>
	);
}
