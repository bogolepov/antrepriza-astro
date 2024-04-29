export default function Order({ lang, play, handleAddTicket, handleRemoveTicket }) {
	// console.log(play);
	return (
		<li className='ticket-order'>
			{play.date} {play.time}
			{play.tickets.map(ticket_type => {
				return ticket_type.count > 0 ? (
					<div key={ticket_type.type}>
						{ticket_type.type}
						<button
							onClick={() => {
								handleRemoveTicket(play, ticket_type.type, ticket_type.count);
							}}
						>
							-
						</button>
						{ticket_type.count}
						<button
							onClick={() => {
								handleAddTicket(play, ticket_type.type);
							}}
						>
							+
						</button>
					</div>
				) : null;
			})}
		</li>
	);
}
