import * as path from 'path';

import * as dotenv from 'dotenv';

import { initSpotify } from './spotify/spotify.service';
import TwitchService from './twitch/twitch.service';
import { Config, configSchema } from './types/config';
import { envDirectory } from './utils';

// Required for pkg to recognise these files as assets
path.join(__dirname, '../.env');
dotenv.config({ path: envDirectory });

const configParseResult = configSchema.safeParse(process.env);
if (!configParseResult.success) {
	console.error(`Invalid .env file`);
	configParseResult.error.errors.forEach((error) => {
		console.error(`${error.path} - ${error.message}`);
	});
	process.exit(-1);
}

export const CONFIG = configParseResult.data;

export const getConfig = <T>(name: keyof Config): T => {
	return CONFIG[name] as T;
};

const runApp = async () => {
	await initSpotify();
	const twitchService = new TwitchService(configParseResult.data);
	await twitchService.connectToChat();
};

runApp().then();
