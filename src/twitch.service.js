const tmi = require('tmi.js');
const messageUtils = require('./messageUtils');
const {
  TWITCH_CHANNEL,
  TWITCH_BOT_USERNAME,
  TWITCH_BOT_PASSWORD,
} = require('../config.json');

const twitchOptions = {
  identify: {
    username: TWITCH_BOT_USERNAME,
    password: TWITCH_BOT_PASSWORD,
  },
  channels: [TWITCH_CHANNEL],
};

module.exports = (spotifyService) => {
  const onTwitchMessageHandler = async (target, context, msg, self) => {
    if (self) {
      return;
    }

    if (msg.startsWith(messageUtils.SPOTIFY_LINK_START)) {
      const trackId = messageUtils.getTrackIdFromLink(msg);
      if (trackId) {
        spotifyService.addTrackToPlaylist(trackId);
      } else {
        console.error('Unable to parse track ID from message');
      }
    }
  };

  const onTwitchConnectedHandler = (addr, port) => {
    console.log(`Connected to ${addr}:${port}`);
  };

  const connectToChat = async () => {
    const twitchClient = new tmi.client(twitchOptions);

    await twitchClient.on('message', onTwitchMessageHandler);
    await twitchClient.on('connected', onTwitchConnectedHandler);

    twitchClient.connect();
  };

  return {
    connectToChat,
  };
};
