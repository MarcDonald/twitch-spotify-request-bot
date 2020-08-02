const SpotifyWebApi = require('spotify-web-api-node');
const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_ACCESS_TOKEN,
  SPOTIFY_PLAYLIST_ID,
} = require('../config.json');

module.exports = () => {
  const spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://localhost',
  });

  const getAuthorizationUrl = () => {
    const scopes = ['playlist-read-private', 'playlist-modify-private'];

    const authorizeUrl = spotifyApi.createAuthorizeURL(scopes);
    return authorizeUrl;
  };

  const authorize = () => {
    if (!SPOTIFY_ACCESS_TOKEN) {
      const authUrl = getAuthorizationUrl();
      console.log(authUrl);
      process.exit(1);
    }
    spotifyApi.setAccessToken(SPOTIFY_ACCESS_TOKEN);
  };

  const addTrackToPlaylist = async (trackId) => {
    try {
      await spotifyApi.addTracksToPlaylist(SPOTIFY_PLAYLIST_ID, [
        `spotify:track:${trackId}`,
      ]);
      console.log(`Added ${trackId}`);
    } catch (e) {
      console.error(`Error adding track ${e}`);
    }
  };

  return {
    authorize,
    addTrackToPlaylist,
  };
};
