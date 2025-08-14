import { z } from 'zod/v4';

export const MSG_MIN_LENGTH = 10;
export const MSG_MAX_LENGTH = 2000;

export const ContactFormSchema = z.object({
	lang: z.string(),
	name: z.string(),
	email: z.string(),
	subject: z.string(),
	topic: z.string(),
	message: z.string().min(MSG_MIN_LENGTH).max(MSG_MAX_LENGTH),
	now: z.number(),
});

export type TContactForm = z.infer<typeof ContactFormSchema>;
