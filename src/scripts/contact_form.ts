import { LANG_LIST } from './consts';
import { ENetlifyEndpoint, netlify, type TNetlifyFrom, type TNetlifyTo } from './netlify';
import { MSG_MAX_LENGTH, MSG_MIN_LENGTH, type TContactForm } from './types/contactForm';
import { validEmailAddressFormat } from './utils';
import dictionary from '@data/dictionary.json';

export function validMessage(msg: string): boolean {
	return msg?.length >= MSG_MIN_LENGTH && msg?.length <= MSG_MAX_LENGTH;
}
export function getMessageError(message: string): string {
	if (!message || !message.length) return 'err__empty_message';
	if (message.length < MSG_MIN_LENGTH) return 'err__message_too_short';
	if (message.length > MSG_MAX_LENGTH) return 'err__message_too_long';
	return '';
}

export function sendContactForm(formData: TContactForm, handleSendResult: (isOk: boolean, msg: string) => void): void {
	formData.subject = codeSubject(formData);

	const handleResponse = (response: TNetlifyFrom<never>): void => {
		handleSendResult(response.ok, response.message);
	};

	const dataTo: TNetlifyTo = { packet: formData };
	netlify(ENetlifyEndpoint.NETLIFY_CONTACT_FORM, dataTo, handleResponse);
}

export function isValidContactForm(contactForm: TContactForm, emptySubject: boolean): boolean {
	if (
		LANG_LIST.includes(contactForm.lang) &&
		contactForm.name.length &&
		contactForm.topic.length > 3 &&
		validMessage(contactForm.message) &&
		validEmailAddressFormat(contactForm.email) &&
		contactForm.now > Date.parse('2025-01-01')
	) {
		if (emptySubject) return !contactForm.subject.length;
		else return contactForm.subject === codeSubject(contactForm);
	}

	return false;
}

function codeSubject(formData: TContactForm): string {
	return dictionary.contact_form_name[formData.lang] + ' - ' + formData.topic;
}
