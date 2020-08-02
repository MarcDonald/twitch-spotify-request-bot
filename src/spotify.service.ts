import SpotifyWebApi from 'spotify-web-api-node';
import AuthServer from './auth-server';
import config from './config.json';
import fs from 'fs';

export default class SpotifyService {
  private spotifyApi: SpotifyWebApi;

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: config.SPOTIFY_CLIENT_ID,
      clientSecret: config.SPOTIFY_CLIENT_SECRET,
      redirectUri: 'http://localhost:8000/spotifyAuth',
    });
  }

  private getAuthorizationUrl() {
    const scopes = ['playlist-read-private', 'playlist-modify-private'];

    const authorizeUrl = this.spotifyApi.createAuthorizeURL(scopes, '');
    return authorizeUrl;
  }

  public async authorize(onAuth: Function) {
    if (!config.SPOTIFY_REFRESH_TOKEN) {
      await this.performNewAuthorization();
    } else {
      await this.refreshToken();
    }
    await onAuth();
  }

  private async performNewAuthorization() {
    const authUrl = this.getAuthorizationUrl();
    console.log('Click the following link and give this app permissions');
    console.log(authUrl);
    new AuthServer().waitForCode((code: string) => {
      this.spotifyApi.authorizationCodeGrant(code, async (error, data) => {
        if (error) {
          console.error(error);
          process.exit(-1);
        }
        this.spotifyApi.setAccessToken(data.body['access_token']);
        this.spotifyApi.setRefreshToken(data.body['refresh_token']);
        const newConfig = {
          ...config,
          SPOTIFY_REFRESH_TOKEN: data.body['refresh_token'],
        };
        fs.writeFile('src/config.json', JSON.stringify(newConfig), (err) => {
          if (err) console.error(err);
        });
      });
    });
  }

  private async refreshToken() {
    this.spotifyApi.setRefreshToken(config.SPOTIFY_REFRESH_TOKEN);
    this.spotifyApi.refreshAccessToken();
  }

  public async addTrackToPlaylist(trackId: string) {
    try {
      await this.spotifyApi.addTracksToPlaylist(config.SPOTIFY_PLAYLIST_ID, [
        `spotify:track:${trackId}`,
      ]);
      console.log(`Added ${trackId}`);
    } catch (e) {
      console.error(`Error adding track ${e}`);
    }
  }
}
