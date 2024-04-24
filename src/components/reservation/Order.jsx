export default function Order({ lang, play, handleAddTicket, handleRemoveTicket }) {
	console.log(play);
	return (
		<div className='ticket-order'>
			{play.date} {play.time}
			{play.tickets.map(ticket_type => {
				if (ticket_type.count > 0)
					return (
						<div>
							{ticket_type.type} {ticket_type.count}
						</div>
					);
				else return <></>;
			})}
		</div>
	);
}
