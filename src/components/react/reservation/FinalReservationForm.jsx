import '@styles/ticket_form.css';

export default function FinalReservationForm({ lang, isShow, handleClose }) {
	if (!isShow) return <></>;

	return (
		<>
			<div class='ticket-layer layer-on-window flex-center show'>
				<div class='ticket-form-wrapper'>
					<button class='close__button' onClick={handleClose}>
						&#10006;
					</button>
					<div class='ticket-form'>
						<h1> Hello </h1>
					</div>
				</div>
			</div>
		</>
	);
}
