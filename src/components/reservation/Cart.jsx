import '@styles/antrepriza.css';
import '@styles/cart.css';

import Order from '@components/reservation/Order';

export default function Cart({ lang }) {
	return (
		<div className='ticket-cart'>
			<h4 className='cart-titel'>Meine Bestellungen</h4>
			<Order date='14.04.2024'></Order>
			<Order date='21.04.2024'></Order>
		</div>
	);
}
