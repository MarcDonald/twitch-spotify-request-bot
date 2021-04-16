import SpotifyService from './spotify.service';
import TwitchService from './twitch.service';
import * as path from 'path';

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
