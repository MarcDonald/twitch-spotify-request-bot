const spotifyServiceDef = require('./spotify.service');
const spotifyService = spotifyServiceDef();
const twitchServiceDef = require('./twitch.service');

const runApp = async () => {
  spotifyService.authorize();
  const twitchService = twitchServiceDef(spotifyService);
  await twitchService.connectToChat();
};

runApp();
