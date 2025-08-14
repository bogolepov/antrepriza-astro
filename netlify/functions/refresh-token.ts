import type { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { ENV, getEnv } from '@netlify/utils/env';
import { getRolesForLogin } from '@netlify/utils/roles';
import { parseJson } from '@netlify/utils/validate';

export const handler: Handler = async event => {
	try {
		if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };

		let body: any;
		try {
			body = parseJson(event.body);
		} catch {
			return { statusCode: 400, body: JSON.stringify({ error: 'invalid_json' }) };
		}

		const { refreshToken } = body || {};
		if (!refreshToken) return { statusCode: 400, body: JSON.stringify({ error: 'missing_refresh_token' }) };

		const refreshSecret = getEnv(ENV.JWT_REFRESH_SECRET);
		let decoded: any;
		try {
			decoded = jwt.verify(refreshToken, refreshSecret) as { login: string };
		} catch (e) {
			return { statusCode: 401, body: JSON.stringify({ error: 'refresh_invalid' }) };
		}

		// Создаём новый access token
		const jwtSecret = getEnv(ENV.JWT_ACCESS_SECRET);
		const roles = getRolesForLogin(decoded.login);
		if (!roles.length) return { statusCode: 401, body: JSON.stringify({ error: 'refresh_invalid_account' }) };
		const token = jwt.sign({ login: decoded.login, roles }, jwtSecret, { expiresIn: '1h' });

		return { statusCode: 200, body: JSON.stringify({ token }) };
	} catch (err: any) {
		return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
	}
};
