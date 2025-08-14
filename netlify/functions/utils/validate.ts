import type { ZodSchema } from 'zod';

export function parseJson(body?: string) {
	if (!body) return {};
	try {
		return JSON.parse(body);
	} catch (err) {
		throw new Error('invalid_json');
	}
}

export function validateWithSchema<T>(schema?: ZodSchema<T>, body?: string): T | undefined {
	if (!schema) return undefined;
	const parsed = parseJson(body);
	const result = schema.safeParse(parsed);
	if (!result.success) {
		// выбрасываем объект, который обработчик сверху поймёт
		const e: any = new Error('validation_error');
		e.details = result.error.errors;
		throw e;
	}
	return result.data;
}
