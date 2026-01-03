import { z } from 'zod/v4';
import * as consts from '@scripts/consts';

let pageLang;
export function getCurrentPageLang(): string | undefined {
	if (pageLang) return pageLang;

	let path = window.location.pathname.toLowerCase();
	for (let lang of consts.LANG_LIST) {
		if (path.includes(`/${lang}/`)) {
			pageLang = lang;
			return lang;
		}
	}
	return undefined;
}

export function capitalLetter(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

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
	return !phone?.length || consts.PHONE_REGEX.test(phone);
}

export function validEmailAddressFormat(email: string): boolean {
	// const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	// const EMAIL_REGEX: RegExp = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
	if (
		email &&
		email.length >= consts.MIN_EMAIL_LENGTH &&
		email.length <= consts.MAX_EMAIL_LENGTH &&
		consts.EMAIL_REGEX.test(email)
	)
		return true;
	return false;
}

export function getEmailAddressError(email: string): string {
	if (!email || !email.length) return 'err__empty_email';
	if (email.length > consts.MAX_EMAIL_LENGTH) return 'err__email_too_long';
	if (!consts.EMAIL_REGEX.test(email)) return 'err__email_not_correct';
	return '';
}

export function getCRC32(obj: Object): string {
	const generateHash = string => {
		let hash: number = 0;
		for (const char of string) {
			hash = (hash << 5) - hash + char.charCodeAt(0);
			hash |= 0; // Constrain to 32bit integer
		}
		return hash;
	};
	return generateHash(JSON.stringify(obj)).toString(16).replace('-', '');
}

// month: '1', '2', ... , '12', '01', '02', ... , '12'
export function getMonthName(monthNumber: string): string {
	let nMonth: number = +monthNumber;
	if (!nMonth) console.error('getMonthName: ' + monthNumber + ' - ERROR!');
	if (nMonth > 12) console.error('getMonthName: ' + monthNumber + ' - ERROR overflow!');
	if (nMonth) nMonth--;
	return new Date(2024, nMonth, 1).toLocaleString('ru', { month: 'long' });
}

export function extractSchemaFromJson<T extends z.ZodTypeAny>(schema: T, json_data: string): z.infer<T> | undefined {
	try {
		const parsed = JSON.parse(json_data);
		const result = schema.safeParse(parsed);
		if (result.success) {
			return result.data;
		}
	} catch {
		// JSON.parse ошибка или несовпадение схемы
	}
	return undefined;
}

export function generateRandomString(length) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Символы для генерации
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export function generateBase64RandomUriString(length) {
	const randomBytes = new Uint8Array(length);
	crypto.getRandomValues(randomBytes);

	// Преобразование байтов в строку base64
	const base64String = btoa(String.fromCharCode(...randomBytes));

	// URL-кодирование, чтобы сделать её полностью безопасной для URI (некоторые символы base64 могут быть несовместимы с URL)
	return encodeURIComponent(base64String).replace(/%25/g, '%'); // Очистка двойного кодирования
}
