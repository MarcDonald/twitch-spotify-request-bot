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

const baseSchema = z.object({
	TWITCH_CHANNEL: z.string(),
	SPOTIFY_CLIENT_ID: z.string(),
	SPOTIFY_CLIENT_SECRET: z.string(),
	TWITCH_TOKEN: z.string(),
	BOT_USERNAME: z.string(),
	CHAT_FEEDBACK: z.string().transform(stringToBool),
	ADD_TO_QUEUE: z.string().transform(stringToBool),
	SUBSCRIBERS_ONLY: z.string().transform(stringToBool),
	COMMAND_PREFIX: z.string(),
	AUTH_SERVER_PORT: z.coerce.number(),
	HOST: z.string(),
	LOG_LEVEL: z.union([
		z.literal('verbose'),
		z.literal('log'),
		z.literal('chat'),
	]),
	ADD_TO_PLAYLIST: z.string().transform(stringToBool),
});

const noPlaylistSchema = baseSchema.extend({
	ADD_TO_PLAYLIST: z.literal('false').transform(stringToBool),
	SPOTIFY_PLAYLIST_ID: z.string().optional(),
});

const playlistSchema = baseSchema.extend({
	ADD_TO_PLAYLIST: z.literal('true').transform(stringToBool),
	SPOTIFY_PLAYLIST_ID: z.string().length(22),
});

export const configSchema = z.discriminatedUnion('ADD_TO_PLAYLIST', [
	noPlaylistSchema,
	playlistSchema,
]);

export type Config = z.infer<typeof configSchema>;

export default Config;
