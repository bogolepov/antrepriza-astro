export const ONE_HOUR: number = 60 * 60 * 1000; // 1 hour in ms
export const ONE_DAY: number = 24 * ONE_HOUR; // 24 hours in ms
export const ONE_MONTH: number = 30 * ONE_DAY;
export const ONE_YEAR: number = 365 * ONE_DAY;
export const MINUTES_30: number = ONE_HOUR / 2; // 30 minutes in ms
export const FROZEN_BOOK_TIME: number = 2 * ONE_HOUR; // 2 hours in ms

export const THEME_DARK: string = 'dark';
export const THEME_LIGHT: string = 'light';
export const THEME_LIST: Array<string> = [THEME_LIGHT, THEME_DARK];

export const LANG_RU: string = 'ru';
export const LANG_DE: string = 'de';
export const LANG_LIST: Array<string> = [LANG_RU, LANG_DE];

export const PHONE_REGEX = /^[0\+]{1}[0-9]{7,16}$/;
// export const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const EMAIL_REGEX: RegExp = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
export const EMAIL_HASH_LENGTH: number = 8;
export const MIN_EMAIL_LENGTH: number = 5;
export const MAX_EMAIL_LENGTH: number = 64;

// localStorage keys
export const CNF_MODE: string = 'MODE';
export const CNF_LANG: string = 'LANG';

export const STORE_RESERVATION_KEY: string = 'reservations';
