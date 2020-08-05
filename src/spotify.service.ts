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
      redirectUri: `http://localhost:${config.AUTH_SERVER_PORT}/spotifyAuth`,
    });

    if (!fs.existsSync('./spotify-auth-store.json')) {
      fs.writeFileSync(
        './spotify-auth-store.json',
        JSON.stringify(new SpotifyAuth('', '', new Date().getTime() / 1000))
      );
    }
    this.spotifyAuth = JSON.parse(
      fs.readFileSync('./spotify-auth-store.json', 'utf8')
    );
  }

  public async authorize(onAuth: Function) {
    console.log('Authorizing with Spotify');
    if (!this.spotifyAuth.refreshToken) {
      console.log('No credentials found, performing new authorization');
      await this.performNewAuthorization(onAuth);
    } else {
      console.log('Spotify credentials found');
      this.spotifyApi.setAccessToken(this.spotifyAuth.accessToken);
      this.spotifyApi.setRefreshToken(this.spotifyAuth.refreshToken);
      await onAuth();
    }
  }

  public async addTrack(trackId: string) {
    try {
      const addSong = async () => {
        console.log(`Attempting to add ${trackId}`);
        const songInfo = await this.spotifyApi.getTrack(trackId);
        if (config.ADD_TO_QUEUE) {
          await this.addToQueue(trackId, songInfo?.body.name);
        }
        if (config.ADD_TO_PLAYLIST) {
          await this.addToPlaylist(trackId, songInfo?.body.name);
        }
      };

      if (this.hasTokenExpired()) {
        console.log('Spotify token expired, refreshing...');
        await this.refreshToken(addSong);
      } else {
        await addSong();
      }
    } catch (e) {
      console.error(`Error adding track ${e}`);
    }
  }

  private async addToQueue(trackId: string, songName: string) {
    // @ts-ignore
    // TODO this is from a PR in the Spotify Web API Node package so doesn't show up in the @types
    await this.spotifyApi.addTrackToQueue(this.createTrackURI(trackId));
    console.log(`Added ${songName} to queue`);
  }

  private async addToPlaylist(trackId: string, songName: string) {
    if (config.SPOTIFY_PLAYLIST_ID) {
      if (await this.doesPlaylistContainTrack(trackId)) {
        console.log(`${songName} is already in playlist`);
      } else {
        await this.spotifyApi.addTracksToPlaylist(config.SPOTIFY_PLAYLIST_ID, [
          this.createTrackURI(trackId),
        ]);
        console.log(`Added ${songName} to playlist`);
      }
    } else {
      console.error(
        'Error: Cannot add to playlist - Please provide a playlist ID in the config file'
      );
    }
  }

  private createTrackURI(trackId: string): string {
    return `spotify:track:${trackId}`;
  }

  private async doesPlaylistContainTrack(trackId: string) {
    const playlistInfo = await this.spotifyApi.getPlaylist(
      config.SPOTIFY_PLAYLIST_ID
    );

    let i;
    for (i = 0; i < playlistInfo.body.tracks.items.length; i++) {
      if (playlistInfo.body.tracks.items[i].track.id === trackId) {
        return true;
      }
    }
    return false;
  }

  private getAuthorizationUrl() {
    const scopes = [
      'user-modify-playback-state',
      'playlist-read-private',
      'playlist-modify-private',
    ];

    const authorizeUrl = this.spotifyApi.createAuthorizeURL(scopes, '');
    return authorizeUrl;
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
        const expireTime = this.calculateExpireTime(data.body['expires_in']);
        this.writeNewSpotifyAuth(accessToken, refreshToken, expireTime);
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
      const expireTime = this.calculateExpireTime(data.body['expires_in']);
      this.writeNewSpotifyAuth(
        accessToken,
        this.spotifyAuth.refreshToken,
        expireTime
      );
      await onAuth();
    });
  }

  private calculateExpireTime(expiresIn: number): number {
    return new Date().getTime() / 1000 + expiresIn;
  }

  private writeNewSpotifyAuth(
    accessToken: string,
    refreshToken: string,
    expireTime: number
  ) {
    const newSpotifyAuth = new SpotifyAuth(
      accessToken,
      refreshToken,
      expireTime
    );
    this.spotifyAuth = newSpotifyAuth;
    fs.writeFile(
      './spotify-auth-store.json',
      JSON.stringify(newSpotifyAuth),
      (err) => {
        if (err) console.error(err);
      }
    );
  }

  private hasTokenExpired(): boolean {
    return new Date().getTime() / 1000 >= this.spotifyAuth.expireTime;
  }
}
