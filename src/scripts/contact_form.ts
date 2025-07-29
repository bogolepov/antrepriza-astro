import { LANG_LIST } from './consts';
import { ContactFormSchema, type TContactForm } from './types/contactForm';
import { validEmailAddressFormat } from './utils';
import dictionary from '@data/dictionary.json';

export const MSG_MIN_LENGTH = 10;
export const MSG_MAX_LENGTH = 2000;

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

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	};

	let isOk: boolean;
	fetch('/.netlify/functions/contactForm', options)
		.then(response => {
			isOk = response.ok;
			return response.json();
		})
		.then(data => {
			// console.log(data.message);
			if (isOk) handleSendResult(true, data.message);
			else throw new Error(data.message);
		})
		.catch(err => handleSendResult(false, err.message));
}

export function validationContactFormJson(json_data: string): TContactForm | undefined {
	console.log(json_data);
	const result = ContactFormSchema.safeParse(JSON.parse(json_data));
	if (result.success) {
		const contactForm: TContactForm = result.data;
		return contactForm;
	} else {
		// console.error('Ошибка валидации:', z.treeifyError(result.error));
		return undefined;
	}
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
