import type { UserAccessPayload, UserRefreshPayload } from '@scripts/types/user-auth';
import type { TAuthUser } from './users';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME } from '@netlify/types/const';
import { ENV, getEnv } from './env';
import jwt from 'jsonwebtoken';
import { ACCESS_COOKIE_NAME, COOKIE_PATH_ADMIN, REFRESH_COOKIE_NAME } from '@scripts/token-ck';

function cookie(k: string, v: string, opts: Record<string, string | number | boolean>) {
	const segs = [`${k}=${v}`];
	if (opts.Path) segs.push(`Path=${opts.Path}`);
	if (opts.HttpOnly) segs.push('HttpOnly');
	if (opts.Secure) segs.push('Secure');
	if (opts.SameSite) segs.push(`SameSite=${opts.SameSite}`);
	if (opts.MaxAge) segs.push(`Max-Age=${opts.MaxAge}`);
	if (opts.Domain) segs.push(`Domain=${opts.Domain}`);
	return segs.join('; ');
}

export function createAccessCookie(user: TAuthUser): string {
	if (!user) return `${ACCESS_COOKIE_NAME}=; Path=${COOKIE_PATH_ADMIN}; Secure; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

	const plAccess: UserAccessPayload = { name: user.name, roles: user.roles };
	const accessToken = jwt.sign(plAccess, getEnv(ENV.JWT_ACCESS_SECRET), { expiresIn: ACCESS_TOKEN_TIME });
	return cookie(ACCESS_COOKIE_NAME, accessToken, {
		Path: COOKIE_PATH_ADMIN,
		SameSite: 'Strict',
		Secure: true,
		MaxAge: ACCESS_TOKEN_TIME,
	});
}

export function createRefreshCookie(user: TAuthUser): string {
	if (!user)
		return `${REFRESH_COOKIE_NAME}=; Path=${COOKIE_PATH_ADMIN}; Secure; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

	const plRefresh: UserRefreshPayload = {
		name: user.name,
		roles: user.roles,
		id: user.id,
	};
	const refreshToken = jwt.sign(plRefresh, getEnv(ENV.JWT_REFRESH_SECRET), { expiresIn: REFRESH_TOKEN_TIME });
	return cookie(REFRESH_COOKIE_NAME, refreshToken, {
		Path: COOKIE_PATH_ADMIN,
		HttpOnly: true,
		SameSite: 'Strict',
		Secure: true,
		MaxAge: REFRESH_TOKEN_TIME,
	});
}
