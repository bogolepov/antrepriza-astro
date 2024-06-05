import '@styles/cart.css';
import '@styles/loader.css';

import { useRef, useState } from 'react';

export default function FinalReservationForm({ lang, dictionary, isShow, handleClose, handleMakeReservation }) {
	const userName = useRef(null);
	const userEmail = useRef(null);
	const [userNameError, setUserNameError] = useState('');
	const [userEmailError, setUserEmailError] = useState('');

	const MODE_FORM_EDITING = 0;
	const MODE_EMAIL_SENDING = 1;
	const MODE_EMAIL_SENT = 2;
	const MODE_EMAIL_ERROR = 3;

	const [mode, setMode] = useState(MODE_FORM_EDITING);

	const handleFinalFormSubmit = event => {
		event.preventDefault();

		const handleResult = isOk => {
			if (isOk) {
				resetForm();
				setMode(MODE_EMAIL_SENT);
			} else {
				setMode(MODE_EMAIL_ERROR);
			}
		};

		let [name, email] = validateForm();
		if (name && email) {
			setMode(MODE_EMAIL_SENDING);
			handleMakeReservation(name, email, handleResult);
		}
	};

	const handleFinalFormClose = () => {
		resetForm();
		handleClose();
	};

	const handleMessageButton = () => {
		if (mode === MODE_EMAIL_SENT) {
			handleFinalFormClose();
		} else if (mode === MODE_EMAIL_ERROR) {
			//
		}
		setMode(MODE_FORM_EDITING);
	};

	function resetForm() {
		setUserNameError(null);
		setUserEmailError(null);
		userName.current.value = '';
		userEmail.current.value = '';
	}

	function validateForm() {
		const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
		let errorNumbers = 2;

		let name = userName.current.value.trim().replace(/\s+/g, ' ');
		if (!name) setUserNameError(dictionary['err__empty_name'][lang]);
		else if (name.length < 2) setUserNameError(dictionary['err__name_to_short'][lang]);
		else errorNumbers--;

		let email = userEmail.current.value.trim().replace(/\s+/g, ' ');
		if (!email) setUserEmailError(dictionary['err__empty_email'][lang]);
		else if (!EMAIL_REGEX.test(email) || email.length < 5 || email.length > 64)
			setUserEmailError(dictionary['err__email_not_correct'][lang]);
		else errorNumbers--;

		if (errorNumbers === 0) return [name, email];
		else return [null, null];
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
							{mode === MODE_EMAIL_SENDING && (
								<div className='layer-on-parent show not_transparent'>
									<div className='antrepriza-loader'></div>
								</div>
							)}
							{(mode === MODE_EMAIL_SENT || mode === MODE_EMAIL_ERROR) && (
								<div className='layer-on-parent show not_transparent message'>
									<p>{mode === MODE_EMAIL_SENT ? dictionary.msg_email_sent[lang] : dictionary.msg_email_error[lang]}</p>
									<button onClick={handleMessageButton}>OK</button>
								</div>
							)}
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
