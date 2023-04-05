import Config from '../../src/types/config';

export const TEST_CONFIG_NO_PLAYLIST: Config = {
	ADD_TO_PLAYLIST: false,
	ADD_TO_QUEUE: false,
	AUTH_SERVER_PORT: 8080,
	BOT_USERNAME: 'testUsername',
	CHAT_FEEDBACK: true,
	COMMAND_PREFIX: '!rs',
	HOST: 'unittest',
	SPOTIFY_CLIENT_SECRET: 'spottySecret',
	SUBSCRIBERS_ONLY: false,
	TWITCH_CHANNEL: 'myChannel',
	TWITCH_TOKEN: 'twitchToken',
	SPOTIFY_CLIENT_ID: 'spottyClient',
	LOG_LEVEL: 'verbose',
};

export const TEST_CONFIG_WITH_PLAYLIST: Config = {
	...TEST_CONFIG_NO_PLAYLIST,
	ADD_TO_PLAYLIST: true,
	SPOTIFY_PLAYLIST_ID: 'spottyPlaylist',
};

export const getConfigMockImplementation = <T>(
	name: keyof Config,
	configObj: Config = TEST_CONFIG_WITH_PLAYLIST
): T => {
	return configObj[name] as T;
};
