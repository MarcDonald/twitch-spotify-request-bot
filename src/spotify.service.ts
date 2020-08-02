import SpotifyWebApi from 'spotify-web-api-node';
import AuthServer from './auth-server';
import config from './config.json';
import SpotifyAuth from './spotify-auth';
import fs from 'fs';

export default class SpotifyService {
  private spotifyApi: SpotifyWebApi;
  private spotifyAuth: SpotifyAuth;

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: config.SPOTIFY_CLIENT_ID,
      clientSecret: config.SPOTIFY_CLIENT_SECRET,
      redirectUri: 'http://localhost:8000/spotifyAuth',
    });

    if (!fs.existsSync('./spotify-auth-store.json')) {
      fs.writeFileSync(
        './spotify-auth-store.json',
        JSON.stringify(new SpotifyAuth('', ''))
      );
    }
    this.spotifyAuth = JSON.parse(
      fs.readFileSync('./spotify-auth-store.json', 'utf8')
    );
  }

  private getAuthorizationUrl() {
    const scopes = ['playlist-read-private', 'playlist-modify-private'];

    const authorizeUrl = this.spotifyApi.createAuthorizeURL(scopes, '');
    return authorizeUrl;
  }

  public async authorize(onAuth: Function) {
    if (!this.spotifyAuth.refreshToken) {
      await this.performNewAuthorization(onAuth);
    } else {
      await this.refreshToken(onAuth);
    }
  }

  private async performNewAuthorization(onAuth: Function) {
    const authUrl = this.getAuthorizationUrl();
    console.log('Click the following link and give this app permissions');
    console.log(authUrl);
    new AuthServer().waitForCode((code: string) => {
      this.spotifyApi.authorizationCodeGrant(code, async (error, data) => {
        if (error) {
          console.error(error);
          process.exit(-1);
        }
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        this.writeNewSpotifyAuth(accessToken, refreshToken);
        this.spotifyApi.setAccessToken(accessToken);
        this.spotifyApi.setRefreshToken(refreshToken);
        await onAuth();
      });
    });
  }

  private async refreshToken(onAuth: Function) {
    this.spotifyApi.setRefreshToken(this.spotifyAuth.refreshToken);
    this.spotifyApi.refreshAccessToken(async (err, data) => {
      if (err) {
        console.error(err);
        process.exit(-1);
      }
      const accessToken = data.body['access_token'];
      this.spotifyApi.setAccessToken(accessToken);
      this.writeNewSpotifyAuth(accessToken, this.spotifyAuth.refreshToken);
      await onAuth();
    });
  }

  private writeNewSpotifyAuth(accessToken: string, refreshToken: string) {
    const newSpotifyAuth = new SpotifyAuth(accessToken, refreshToken);
    fs.writeFile(
      './spotify-auth-store.json',
      JSON.stringify(newSpotifyAuth),
      (err) => {
        if (err) console.error(err);
      }
    );
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
