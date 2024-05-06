import '@styles/ticket_form.css';

export default function FinalReservationForm({ lang, isShow, handleClose }) {
	return (
		<>
			<div className={'ticket-layer layer-on-window flex-center' + (isShow ? ' show' : '')}>
				<div className='ticket-form-wrapper'>
					<button className='close__button' onClick={handleClose}>
						&#10006;
					</button>
					<div className='ticket-form'>
						<h1> Hello </h1>
					</div>
				</div>
			</div>
		</>
	);
}
