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

// if (
// 	messageData &&
// 	messageData.subject &&
// 	messageData.subject.includes(' - ') &&
// 	messageData.topic &&
// 	messageData.name &&
// 	messageData.name.length >= 2 &&
// 	messageData.email &&
// 	Consts.EMAIL_REGEX.test(messageData.email) &&
// 	messageData.email.length >= 5 &&
// 	messageData.email.length <= 64 &&
// 	messageData.message &&
// 	messageData.message.length >= 10 &&
// 	messageData.now
// )
// 	return true;
// else return false;
