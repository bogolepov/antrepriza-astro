import { z } from 'zod/v4';

export const ContactFormSchema = z.object({
	lang: z.string(),
	name: z.string(),
	email: z.string(),
	subject: z.string(),
	topic: z.string(),
	message: z.string(),
	now: z.number(),
});

export type TContactForm = z.infer<typeof ContactFormSchema>;
