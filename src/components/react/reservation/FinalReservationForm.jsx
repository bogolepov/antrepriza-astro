import '@styles/antrepriza.css';
import '@styles/cart.css';

export default function FinalReservationForm({ lang, dictionary, isShow, handleClose, handleSubmit }) {
	const handleFinalFormSubmit = () => {
		handleSubmit();
	};
	if (!dictionary) return <></>;

	return (
		<>
			<div className={'modal-layer modal-layer-reservation layer-on-window flex-center' + (isShow ? ' show' : '')}>
				<div className='modal-dialog'>
					<button className='close__button' onClick={handleClose}>
						&#10006;
					</button>
					<div className='form final-reservation-form'>
						<form method='POST' className='final-reservation-form' onSubmit={handleFinalFormSubmit}>
							<div className='q-label'>
								<span className='font-opacity0'>{dictionary.name[lang]}</span>
								<span className='form__error' data-for='name'></span>
							</div>
							<input className='q-input' type='text' name='name' placeholder={dictionary.name_hint[lang]} autoComplete='on' />
							<div className='q-label'>
								<span className='font-opacity0'>{dictionary.email[lang]}</span>
								<span className='form__error' data-for='email'></span>
							</div>
							<input className='q-input' type='text' name='email' placeholder={dictionary.email_hint[lang]} autoComplete='on' />
							<div className='pink-button-div'>
								<button className='pink-button' type='submit'>
									{dictionary.btn_reservation[lang]}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
