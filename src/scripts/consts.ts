export const FROZEN_BOOK_TIME: number = 2 * 60 * 60 * 1000; // 2 hours in ms
export const ONE_DAY: number = 24 * 60 * 60 * 1000; // 24 hours in ms
export const MINUTES_30: number = 30 * 60 * 1000; // 30 minutes in ms

export const THEME_DARK: string = 'dark';
export const THEME_LIGHT: string = 'light';
export const THEME_LIST: Array<string> = [THEME_LIGHT, THEME_DARK];

export const LANG_RU: string = 'ru';
export const LANG_DE: string = 'de';
export const LANG_LIST: Array<string> = [LANG_RU, LANG_DE];

export const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// localStorage keys
export const CNF_MODE: string = 'MODE';
export const CNF_LANG: string = 'LANG';

export const STORE_RESERVATION_KEY: string = 'reservations';
