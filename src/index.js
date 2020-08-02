const tmi = require('tmi.js');
const {
  TWITCH_CHANNEL,
  TWITCH_BOT_USERNAME,
  TWITCH_BOT_PASSWORD,
} = require('../config.json');
const messageUtils = require('./messageUtils');
const spotifyServiceDef = require('./spotify.service');
const spotifyService = spotifyServiceDef();

const twitchOptions = {
  identify: {
    username: TWITCH_BOT_USERNAME,
    password: TWITCH_BOT_PASSWORD,
  },
  channels: [TWITCH_CHANNEL],
};

const onTwitchMessageHandler = async (target, context, msg, self) => {
  if (self) {
    return;
  }

  if (msg.startsWith(messageUtils.SPOTIFY_LINK_START)) {
    const trackId = messageUtils.getTrackIdFromLink(msg);
    if (trackId) {
      spotifyService.addTrackToPlaylist(trackId);
    } else {
      console.error('No track ID');
    }
  }
};

const onTwitchConnectedHandler = (addr, port) => {
  console.log(`Connected to ${addr}:${port}`);
};

const runApp = async () => {
  spotifyService.authorize();
  const twitchClient = new tmi.client(twitchOptions);

  await twitchClient.on('message', onTwitchMessageHandler);
  await twitchClient.on('connected', onTwitchConnectedHandler);

  twitchClient.connect();
};

runApp();
