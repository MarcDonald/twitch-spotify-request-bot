import { RefinementCtx, z } from 'zod';

const stringToBool = (value: string, ctx: RefinementCtx) => {
	if (value?.toLowerCase() === 'true') {
		return true;
	} else if (value?.toLowerCase() === 'false') {
		return false;
	} else {
		ctx.addIssue({
			code: 'invalid_type',
			expected: 'boolean',
			received: 'string',
		});
	}
};

export const configSchema = z.object({
	TWITCH_CHANNEL: z.string(),
	SPOTIFY_CLIENT_ID: z.string(),
	SPOTIFY_CLIENT_SECRET: z.string(),
	SPOTIFY_PLAYLIST_ID: z.string(),
	TWITCH_TOKEN: z.string(),
	BOT_USERNAME: z.string(),
	CHAT_FEEDBACK: z.string().transform(stringToBool),
	ADD_TO_QUEUE: z.string().transform(stringToBool),
	ADD_TO_PLAYLIST: z.string().transform(stringToBool),
	SUBSCRIBERS_ONLY: z.string().transform(stringToBool),
	COMMAND_PREFIX: z.string(),
	AUTH_SERVER_PORT: z.coerce.number(),
	HOST: z.string(),
});

export type Config = z.infer<typeof configSchema>;

export default Config;
