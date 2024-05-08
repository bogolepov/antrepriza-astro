import '@styles/antrepriza.css';
import '@styles/cart.css';

import { useRef, useState } from 'react';

export default function FinalReservationForm({ lang, dictionary, isShow, handleClose, handleSubmit }) {
	const userName = useRef(null);
	const userEmail = useRef(null);
	const [userNameError, setUserNameError] = useState('');
	const [userEmailError, setUserEmailError] = useState('');

	const handleFinalFormSubmit = event => {
		event.preventDefault();

		if (validateForm()) handleSubmit();
	};

	const handleFinalFormClose = () => {
		closeForm();
		handleClose();
	};

	function closeForm() {
		setUserNameError(null);
		setUserEmailError(null);
		userName.current.value = '';
		userEmail.current.value = '';
	}

	function validateForm() {
		const emailRegex = /^[a-zA-Z0–9._-]+@[a-zA-Z0–9.-]+\.[a-zA-Z]{2,4}$/;
		let errorNumbers = 2;

		let name = userName.current.value.trim().replace(/\s+/g, ' ');
		if (!name) setUserNameError(dictionary['err__empty_name'][lang]);
		else if (name.length < 2) setUserNameError(dictionary['err__name_to_short'][lang]);
		else errorNumbers--;

		let email = userEmail.current.value.trim().replace(/\s+/g, ' ');
		if (!email) setUserEmailError(dictionary['err__empty_email'][lang]);
		else if (!emailRegex.test(email) || email.length < 5 || email.length > 64)
			setUserEmailError(dictionary['err__email_not_correct'][lang]);
		else errorNumbers--;

		return errorNumbers === 0;
	}

	if (!dictionary) return <></>;
	return (
		<>
			<div className={'modal-layer modal-layer-reservation layer-on-window flex-center' + (isShow ? ' show' : '')}>
				<div className='modal-dialog'>
					<button className='close__button' onClick={handleFinalFormClose}>
						&#10006;
					</button>
					<div className='form final-reservation-form'>
						<form method='POST' className='final-reservation-form' onSubmit={handleFinalFormSubmit}>
							<div className='form-label required font-opacity0'>{dictionary.name[lang]}</div>
							<input
								className='form-input'
								type='text'
								name='name'
								ref={userName}
								placeholder={dictionary.name_hint[lang]}
								autoComplete='on'
								onChange={() => setUserNameError(null)}
							/>
							{userNameError && userNameError.length > 0 && <div className='form-error'>{userNameError}</div>}
							<div className='form-label required font-opacity0'>{dictionary.email[lang]}</div>
							<input
								className='form-input'
								type='text'
								name='email'
								ref={userEmail}
								placeholder={dictionary.email_hint[lang]}
								autoComplete='on'
								onChange={() => setUserEmailError(null)}
							/>
							{userEmailError && userEmailError.length > 0 && <div className='form-error'>{userEmailError}</div>}

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
