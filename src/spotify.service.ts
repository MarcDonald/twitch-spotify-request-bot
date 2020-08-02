import SpotifyWebApi from 'spotify-web-api-node';
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_ACCESS_TOKEN,
  SPOTIFY_PLAYLIST_ID,
} from './config.json';

export default class SpotifyService {
  private spotifyApi: SpotifyWebApi;

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      redirectUri: 'http://localhost',
    });
  }

  private getAuthorizationUrl() {
    const scopes = ['playlist-read-private', 'playlist-modify-private'];

    const authorizeUrl = this.spotifyApi.createAuthorizeURL(scopes, '');
    return authorizeUrl;
  }

  public async authorize() {
    if (!SPOTIFY_ACCESS_TOKEN) {
      const authUrl = this.getAuthorizationUrl();
      console.log(authUrl);
      process.exit(1);
    }
    this.spotifyApi.setAccessToken(SPOTIFY_ACCESS_TOKEN);
  }

  public async addTrackToPlaylist(trackId: string) {
    try {
      await this.spotifyApi.addTracksToPlaylist(SPOTIFY_PLAYLIST_ID, [
        `spotify:track:${trackId}`,
      ]);
      console.log(`Added ${trackId}`);
    } catch (e) {
      console.error(`Error adding track ${e}`);
    }
  }
}
