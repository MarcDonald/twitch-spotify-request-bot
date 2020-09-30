import SpotifyService from './spotify.service';
import TwitchService from './twitch.service';

const runApp = async () => {
  const spotifyService = new SpotifyService();
  await spotifyService.authorize(async () => {
    const twitchService = new TwitchService(spotifyService);
    await twitchService.connectToChat();
  });
};

runApp().then();
