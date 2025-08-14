import { z } from 'zod/v4';

// export const AuthDataSchema = z.object({
// 	name: z.string(),
// 	message: z.string(),
// });
export const AuthPacketSchema = z.object({
	name: z.string(),
	message: z.string(),
});

export const AuthResponsePacketSchema = z.object({
	demo: z.boolean(),
});

// export type TAuthData = z.infer<typeof AuthDataSchema>;
export type TAuthPacket = z.infer<typeof AuthPacketSchema>;
export type TAuthResponsePacket = z.infer<typeof AuthResponsePacketSchema>;
