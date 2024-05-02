import { useMemo } from 'react';

export default function Order({ lang, jsons, play, handleAddTicket, handleRemoveTicket }) {
	const getPlayName = () => {
		return jsons.theater.plays.find(item => item.id === play.play_id).title[lang];
	};
	const getPlayDate = () => {
		let playDate = new Date(play.date);
		let options = {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
		};
		return playDate.toLocaleDateString(lang, options);
	};

	const playName = useMemo(getPlayName, []);
	const playDate = useMemo(getPlayDate, []);
	const ticketTypes = useMemo(() => {
		let mapTypes = new Map();
		play.tickets.map(item => {
			let ticketType = jsons.theater.prices.find(price => price.type === item.type);
			mapTypes.set(item.type, { title: ticketType.text_short[lang], price: ticketType.value });
		});
		return mapTypes;
	}, []);

	return (
		<li className='ticket-order'>
			<h6 className='play-name'>{playName}</h6>
			<div className='play-date'>
				{playDate}, {play.time}
			</div>
			{play.tickets.map(ticket_type => {
				return ticket_type.count > 0 ? (
					<div className='order-flex' key={ticket_type.type}>
						{/* <div className='item-name'>{`${ticketTypes.get(ticket_type.type).title}, ${ticketTypes.get(ticket_type.type).price}€`}</div> */}
						<div className='item-name font-opacity0'>{ticketTypes.get(ticket_type.type).title}</div>
						<div className='item-count-change'>
							<button
								className='count-change-button left'
								onClick={() => {
									handleRemoveTicket(play, ticket_type.type, ticket_type.count);
								}}
							>
								-
							</button>
							<span>{ticket_type.count}</span>
							<button
								className='count-change-button right'
								onClick={() => {
									handleAddTicket(play, ticket_type.type);
								}}
							>
								+
							</button>
						</div>
						<div className='item-amount'>{ticket_type.count * ticketTypes.get(ticket_type.type).price}€</div>
					</div>
				) : null;
			})}
		</li>
	);
}
