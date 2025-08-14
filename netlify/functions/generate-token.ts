import type { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { ENV, getEnv } from '@netlify/utils/env';
import { getRolesForLogin } from '@netlify/utils/roles';
import { z } from 'zod';
import { parseJson } from '@netlify/utils/validate';
import type { UserPayload } from '@scripts/types/user-auth';

const bodySchema = z.object({
	login: z.string().min(1),
	expiresInSeconds: z.number().int().positive().optional(),
});

export const handler: Handler = async event => {
	try {
		if (event.httpMethod !== 'POST') {
			return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
		}

		const apiKey = getEnv(ENV.GENERATE_API_KEY);
		const headerKey = (event.headers['x-api-key'] || event.headers['X-API-KEY'] || '').toString();
		if (!headerKey || headerKey !== apiKey) {
			return { statusCode: 401, body: JSON.stringify({ error: 'bad_api_key' }) };
		}

		let body: any;
		try {
			body = parseJson(event.body);
		} catch {
			return { statusCode: 400, body: JSON.stringify({ error: 'invalid_json' }) };
		}

		const parsed = bodySchema.safeParse(body);
		if (!parsed.success) {
			return { statusCode: 400, body: JSON.stringify({ error: 'validation_error', details: parsed.error.errors }) };
		}

		const { login, expiresInSeconds } = parsed.data;
		const roles = getRolesForLogin(login);
		if (!roles.length) return { statusCode: 401, body: JSON.stringify({ error: 'refresh_invalid_account' }) };

		const payload: UserPayload = { name: login, roles };
		const secret = getEnv(ENV.JWT_ACCESS_SECRET);

		const accessExpires = expiresInSeconds ? `${expiresInSeconds}s` : '1h';
		const token = jwt.sign(payload, secret, { expiresIn: accessExpires });

		// Опционально: можно вернуть refresh token
		const refreshSecret = process.env.REFRESH_SECRET;
		let refreshToken: string | undefined;
		if (refreshSecret) {
			refreshToken = jwt.sign({ login }, refreshSecret, { expiresIn: '7d' });
		}

		return { statusCode: 200, body: JSON.stringify({ token, refreshToken }) };
	} catch (err: any) {
		return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
	}
};
