import SpotifyService from './spotify.service';
import TwitchService from './twitch.service';

const runApp = async () => {
  const spotifyService = new SpotifyService();
  spotifyService.authorize();

  const twitchService = new TwitchService(spotifyService);
  await twitchService.connectToChat();
};

runApp();
