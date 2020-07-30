const tmi = require('tmi.js');
const SpotifyWebApi = require('spotify-web-api-node');
const {
  TWITCH_CHANNEL,
  TWITCH_BOT_USERNAME,
  TWITCH_BOT_PASSWORD,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_ACCESS_TOKEN,
  SPOTIFY_PLAYLIST_ID,
} = require('../config.json');

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost',
});

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

  if (msg.startsWith('https://open.spotify.com/track/')) {
    try {
      const startOfId = 'https://open.spotify.com/track/'.length;
      const endOfId = msg.indexOf('?');
      const trackId = msg.substring(startOfId, endOfId);
      await spotifyApi.addTracksToPlaylist(SPOTIFY_PLAYLIST_ID, [
        `spotify:track:${trackId}`,
      ]);
      console.log(`Added ${trackId}`);
    } catch (e) {
      console.error(`Error adding track ${e}`);
    }
  }
};

const onTwitchConnectedHandler = (addr, port) => {
  console.log(`Connected to ${addr}:${port}`);
};

const getSpotifyAuthorizationUrl = () => {
  const scopes = ['playlist-read-private', 'playlist-modify-private'];

  const authorizeUrl = spotifyApi.createAuthorizeURL(scopes);
  console.log(authorizeUrl);
};

const runApp = async () => {
  if (!SPOTIFY_ACCESS_TOKEN) {
    getSpotifyAuthorizationUrl();
    process.exit(1);
  }
  spotifyApi.setAccessToken(SPOTIFY_ACCESS_TOKEN);

  const twitchClient = new tmi.client(twitchOptions);

  await twitchClient.on('message', onTwitchMessageHandler);
  await twitchClient.on('connected', onTwitchConnectedHandler);

  twitchClient.connect();
};

runApp();
