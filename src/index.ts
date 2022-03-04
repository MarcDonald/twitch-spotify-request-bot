import * as path from 'path';

import { SpotifyService } from './spotify';
import { TwitchService } from './twitch';

// Required for pkg to recognise these files as assets
path.join(__dirname, '../.env');
path.join(__dirname, '../.env.types');

const runApp = async () => {
  const spotifyService = new SpotifyService();
  await spotifyService.authorize(async () => {
    const twitchService = new TwitchService(spotifyService);
    await twitchService.connectToChat();
  });
};

runApp().then();
