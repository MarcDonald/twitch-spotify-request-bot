'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getConfigMockImplementation = exports.TEST_CONFIG_WITH_PLAYLIST = exports.TEST_CONFIG_NO_PLAYLIST = void 0;
exports.TEST_CONFIG_NO_PLAYLIST = {
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
exports.TEST_CONFIG_WITH_PLAYLIST = Object.assign(
	Object.assign({}, exports.TEST_CONFIG_NO_PLAYLIST),
	{ ADD_TO_PLAYLIST: true, SPOTIFY_PLAYLIST_ID: 'spottyPlaylist' }
);
const getConfigMockImplementation = (
	name,
	configObj = exports.TEST_CONFIG_WITH_PLAYLIST
) => {
	return configObj[name];
};
exports.getConfigMockImplementation = getConfigMockImplementation;
