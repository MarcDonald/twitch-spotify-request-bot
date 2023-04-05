import { ZodError } from 'zod';

import { configSchema } from './config';

const validEnvWithoutPlaylist = {
	ADD_TO_PLAYLIST: 'false',
	ADD_TO_QUEUE: 'true',
	AUTH_SERVER_PORT: '8080',
	BOT_USERNAME: 'botname',
	CHAT_FEEDBACK: 'false',
	COMMAND_PREFIX: '!sr',
	HOST: 'localhost',
	SPOTIFY_CLIENT_ID: 'abc123',
	SPOTIFY_CLIENT_SECRET: 'def456',
	SUBSCRIBERS_ONLY: 'false',
	TWITCH_CHANNEL: 'myaccount',
	TWITCH_TOKEN: 'ghi789',
	LOG_LEVEL: 'chat',
};

const validEnvWithPlaylist = {
	ADD_TO_PLAYLIST: 'true',
	ADD_TO_QUEUE: 'true',
	AUTH_SERVER_PORT: '8080',
	BOT_USERNAME: 'botname',
	CHAT_FEEDBACK: 'false',
	COMMAND_PREFIX: '!sr',
	HOST: 'localhost',
	SPOTIFY_CLIENT_ID: 'abc123',
	SPOTIFY_CLIENT_SECRET: 'def456',
	SPOTIFY_PLAYLIST_ID: '6rqhFgbbKwnb9MLmUQDhG6',
	SUBSCRIBERS_ONLY: 'false',
	TWITCH_CHANNEL: 'myaccount',
	TWITCH_TOKEN: 'ghi789',
	LOG_LEVEL: 'chat',
};

describe('configSchema', () => {
	it('parse when valid schema is passed in (with playlist)', () => {
		expect(configSchema.parse(validEnvWithPlaylist)).toEqual({
			ADD_TO_PLAYLIST: true,
			ADD_TO_QUEUE: true,
			AUTH_SERVER_PORT: 8080,
			BOT_USERNAME: 'botname',
			CHAT_FEEDBACK: false,
			COMMAND_PREFIX: '!sr',
			HOST: 'localhost',
			SPOTIFY_CLIENT_ID: 'abc123',
			SPOTIFY_CLIENT_SECRET: 'def456',
			SPOTIFY_PLAYLIST_ID: '6rqhFgbbKwnb9MLmUQDhG6',
			SUBSCRIBERS_ONLY: false,
			TWITCH_CHANNEL: 'myaccount',
			TWITCH_TOKEN: 'ghi789',
			LOG_LEVEL: 'chat',
		});
	});

	it('parse when valid schema is passed in (without playlist)', () => {
		expect(configSchema.parse(validEnvWithoutPlaylist)).toEqual({
			ADD_TO_PLAYLIST: false,
			ADD_TO_QUEUE: true,
			AUTH_SERVER_PORT: 8080,
			BOT_USERNAME: 'botname',
			CHAT_FEEDBACK: false,
			COMMAND_PREFIX: '!sr',
			HOST: 'localhost',
			SPOTIFY_CLIENT_ID: 'abc123',
			SPOTIFY_CLIENT_SECRET: 'def456',
			SUBSCRIBERS_ONLY: false,
			TWITCH_CHANNEL: 'myaccount',
			TWITCH_TOKEN: 'ghi789',
			LOG_LEVEL: 'chat',
		});
	});

	it('should not parse when ADD_TO_PLAYLIST is true but no SPOTIFY_PLAYLIST_ID is provided', async () => {
		// arrange
		const invalidEnv = {
			...validEnvWithoutPlaylist,
			ADD_TO_PLAYLIST: 'true',
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
						path: ['SPOTIFY_PLAYLIST_ID'],
						message: 'Required',
					},
				])
			);
		}
	});

	it('should not parse when ADD_TO_PLAYLIST is true but SPOTIFY_PLAYLIST_ID is too small', async () => {
		// arrange
		const invalidEnv = {
			...validEnvWithoutPlaylist,
			ADD_TO_PLAYLIST: 'true',
			SPOTIFY_PLAYLIST_ID: 'abc',
		};

		// act
		const result = configSchema.safeParse(invalidEnv);

		// assert
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toEqual(
				new ZodError([
					{
						code: 'too_small',
						minimum: 22,
						type: 'string',
						inclusive: true,
						exact: true,
						message: 'String must contain exactly 22 character(s)',
						path: ['SPOTIFY_PLAYLIST_ID'],
					},
				])
			);
		}
	});

	it('not parse when required field is missing', () => {
		// arrange
		const invalidEnv = {
			...validEnvWithPlaylist,
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
			...validEnvWithPlaylist,
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
						code: 'invalid_union_discriminator',
						options: ['false', 'true'],
						path: ['ADD_TO_PLAYLIST'],
						message: "Invalid discriminator value. Expected 'false' | 'true'",
					},
				])
			);
		}
	});
});
