import * as path from 'path';

import * as dotenv from 'dotenv';

import SpotifyService from './spotify/spotify.service';
import TwitchService from './twitch/twitch.service';
import { configSchema } from './types/config';
import { envDirectory } from './utils';

// Required for pkg to recognise these files as assets
path.join(__dirname, '../.env');
dotenv.config({ path: envDirectory });

const runApp = async () => {
	const config = configSchema.safeParse(process.env);
	if (config.success) {
		const spotifyService = new SpotifyService(config.data);
		await spotifyService.authorize(async () => {
			const twitchService = new TwitchService(config.data, spotifyService);
			await twitchService.connectToChat();
		});
	} else {
		console.error(`Invalid .env file`);
		config.error.errors.forEach((error) => {
			console.error(`${error.path} - ${error.message}`);
		});
	}
};

runApp().then();
