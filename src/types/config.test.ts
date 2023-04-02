import { ZodError } from 'zod';

import { configSchema } from './config';

const validEnv = {
	ADD_TO_PLAYLIST: 'true',
	ADD_TO_QUEUE: 'true',
	AUTH_SERVER_PORT: '8080',
	BOT_USERNAME: 'botname',
	CHAT_FEEDBACK: 'false',
	COMMAND_PREFIX: '!sr',
	HOST: 'localhost',
	SPOTIFY_CLIENT_ID: 'abc123',
	SPOTIFY_CLIENT_SECRET: 'def456',
	SPOTIFY_PLAYLIST_ID: 'jkl012',
	SUBSCRIBERS_ONLY: 'false',
	TWITCH_CHANNEL: 'myaccount',
	TWITCH_TOKEN: 'ghi789',
};
describe('configSchema', () => {
	it('parse when valid schema is passed in', () => {
		expect(configSchema.parse(validEnv)).toEqual({
			ADD_TO_PLAYLIST: true,
			ADD_TO_QUEUE: true,
			AUTH_SERVER_PORT: 8080,
			BOT_USERNAME: 'botname',
			CHAT_FEEDBACK: false,
			COMMAND_PREFIX: '!sr',
			HOST: 'localhost',
			SPOTIFY_CLIENT_ID: 'abc123',
			SPOTIFY_CLIENT_SECRET: 'def456',
			SPOTIFY_PLAYLIST_ID: 'jkl012',
			SUBSCRIBERS_ONLY: false,
			TWITCH_CHANNEL: 'myaccount',
			TWITCH_TOKEN: 'ghi789',
		});
	});

	it('not parse when required field is missing', () => {
		// arrange
		const invalidEnv = {
			...validEnv,
			TWITCH_CHANNEL: undefined,
		};

		// act
		const result = configSchema.safeParse(invalidEnv);

		// assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toEqual(
				new ZodError([
					{
						code: 'invalid_type',
						expected: 'string',
						received: 'undefined',
						path: ['TWITCH_CHANNEL'],
						message: 'Required',
					},
				])
			);
		}
	});

	it('not parse when boolean field is not a valid boolean', () => {
		// arrange
		const invalidEnv = {
			...validEnv,
			ADD_TO_PLAYLIST: 'not a boolean',
		};

		// act
		const result = configSchema.safeParse(invalidEnv);

		// assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toEqual(
				new ZodError([
					{
						code: 'invalid_type',
						expected: 'boolean',
						received: 'string',
						path: ['ADD_TO_PLAYLIST'],
						message: 'Expected boolean, received string',
					},
				])
			);
		}
	});
});
