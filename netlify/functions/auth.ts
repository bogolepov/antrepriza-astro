import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { ZodSchema } from 'zod';
import type { UserPayload, UserRole } from '@scripts/types/user-auth';
import { ENV, getEnv } from '@netlify/utils/env';
import { hasRequiredRole } from '@netlify/utils/roles';
import { validateWithSchema } from '@netlify/utils/validate';

export type AuthHandler<T> = (
	event: HandlerEvent,
	context: HandlerContext,
	user: UserPayload,
	data?: T
) => Promise<{ statusCode: number; body: string } | any>;

interface AuthOptions<T> {
	role: UserRole;
	schema: ZodSchema<T>; // схема для body
}

export function withAuth<T>(handler: AuthHandler<T>, options: AuthOptions<T>): Handler {
	return async (event: HandlerEvent, context: HandlerContext) => {
		try {
			const header = event.headers.authorization || event.headers.Authorization || '';
			const token = header.startsWith('Bearer ') ? header.slice(7) : null;
			if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'token_missing' }) };

			const secret = getEnv(ENV.JWT_ACCESS_SECRET);
			let decoded: UserPayload;
			try {
				decoded = jwt.verify(token, secret) as UserPayload;
			} catch (err) {
				return { statusCode: 401, body: JSON.stringify({ error: 'token_invalid' }) };
			}

			if (!hasRequiredRole(decoded.roles as UserRole[], options.role)) {
				return { statusCode: 403, body: JSON.stringify({ error: 'forbidden' }) };
			}

			// Валидация body через zod (если передана схема)
			let parsedData: T | undefined;
			try {
				parsedData = validateWithSchema(options.schema, event.body);
			} catch (e: any) {
				if (e.message === 'invalid_json') {
					return { statusCode: 400, body: JSON.stringify({ error: 'invalid_json' }) };
				}
				if (e.message === 'validation_error') {
					return { statusCode: 400, body: JSON.stringify({ error: 'validation_error', details: e.details }) };
				}
				throw e;
			}

			return await handler(event, context, decoded, parsedData);
		} catch (err: any) {
			return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
		}
	};
}
