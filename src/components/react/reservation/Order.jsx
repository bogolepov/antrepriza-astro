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
	const getStageName = () => {
		let stage = jsons.theater.stages.find(item => item.sid === play.stage_sid);
		if (stage) return stage.name[lang];
		return null;
	};

	const playName = useMemo(getPlayName, []);
	const playDate = useMemo(getPlayDate, []);
	const playStageName = useMemo(getStageName, []);
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
			<div className='order-flex play'>
				<div className='cart-icon cart-icon-order'>
					<svg xmlns='http://www.w3.org/2000/svg' className='svg_icon' viewBox='0 0 16 16'>
						<path d='M4 4.85v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Z'></path>
						<path d='M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9V4.5Z'></path>
					</svg>
				</div>
				<div>
					<h6 className='play-name'>{playName}</h6>
					{playStageName && <div className='play-stage'>{jsons.dictionary.stage[lang] + ' - ' + playStageName.toUpperCase()}</div>}
					<div className='play-date'>
						{playDate}, {play.time}
					</div>
				</div>
			</div>
			{play.tickets.map(ticket_type => {
				return ticket_type.count > 0 ? (
					<div className='order-flex wrap' key={ticket_type.type}>
						{/* <div className='item-name'>{`${ticketTypes.get(ticket_type.type).title}, ${ticketTypes.get(ticket_type.type).price}€`}</div> */}
						<div className='item-name font-opacity0'>{ticketTypes.get(ticket_type.type).title}</div>
						<div className='item-price-flex'>
							<div className='item-count-change'>
								<button
									className='count-change-button left'
									onClick={() => {
										handleRemoveTicket(play, ticket_type.type, ticket_type.count);
									}}
								>
									-
								</button>
								<span className='count-change-number'>{ticket_type.count}</span>
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
					</div>
				) : null;
			})}
		</li>
	);
}
