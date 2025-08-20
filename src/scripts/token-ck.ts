import { ENetlifyEndpoint, netlify, type TNetlifyFrom, type TNetlifyTo } from './netlify';

export const ACCESS_COOKIE_NAME = '__Host_at';
export const REFRESH_COOKIE_NAME = '__Host_rt';
export const COOKIE_PATH_ADMIN = '/'; // '/admin';

function getCookie(cookies: string, key: string): undefined | string {
	if (!cookies) return undefined;
	let cookie = cookies.split(';').find(item => item.split('=')[0].trim() === key);
	return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
}

function removeCookie(name: string) {
	document.cookie = `${name}=; Path=${COOKIE_PATH_ADMIN}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export function getCookieAccessToken(): string {
	return getCookie(document.cookie, ACCESS_COOKIE_NAME);
}
export function getHeaderCookieAccessToken(cookies: string): string {
	return getCookie(cookies, ACCESS_COOKIE_NAME);
}
export function getHeaderCookieRefreshToken(cookies: string): string {
	return getCookie(cookies, REFRESH_COOKIE_NAME);
}

export function logoutCookie() {
	removeCookie(ACCESS_COOKIE_NAME);

	const handleResponse = (response: TNetlifyFrom<never>): void => {};
	const dataTo: TNetlifyTo = { packet: undefined };
	netlify(ENetlifyEndpoint.NETLIFY_ADMIN_LOGOUT, dataTo, handleResponse);
}
