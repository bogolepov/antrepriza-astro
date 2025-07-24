import { EMAIL_REGEX, MAX_EMAIL_LENGTH, MIN_EMAIL_LENGTH, PHONE_REGEX } from './consts';

export function onlyNumbers(text: string): string {
	return text?.replace(/[^0-9]/g, '');
}

export function getRandomIntInclusive(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function validPhoneNumberFormat(phone: string): boolean {
	// const PHONE_REGEX = /^[0\+]{1}[0-9]{7,16}$/;
	return !phone?.length || PHONE_REGEX.test(phone);
}

export function validEmailAddressFormat(email: string): boolean {
	// const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	// const EMAIL_REGEX: RegExp = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
	if (email && email.length >= MIN_EMAIL_LENGTH && email.length <= MAX_EMAIL_LENGTH && EMAIL_REGEX.test(email))
		return true;
	return false;
}

export function getEmailAddressError(email: string): string {
	if (!email || !email.length) return 'err__empty_email';
	if (email.length > MAX_EMAIL_LENGTH) return 'err__email_too_long';
	if (!EMAIL_REGEX.test(email)) return 'err__email_not_correct';
	return '';
}
