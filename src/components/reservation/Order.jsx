export default function Order({ lang, play, handleAddTicket, handleRemoveTicket }) {
	console.log(play);
	return (
		<li className='ticket-order'>
			{play.date} {play.time}
			{play.tickets.map(ticket_type => {
				return ticket_type.count > 0 ? (
					<div>
						{ticket_type.type} {ticket_type.count}
					</div>
				) : null;
			})}
		</li>
	);
}
