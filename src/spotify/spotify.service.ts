import 'dotenv/config';

import fs from 'fs';

import env from 'env-smart';
import SpotifyWebApi from 'spotify-web-api-node';

import { SpotifyAuth, waitForCode } from '../auth';
import { envDirectory } from '../utils';

env.load({ directory: envDirectory });

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  AUTH_SERVER_PORT,
  ADD_TO_QUEUE,
  ADD_TO_PLAYLIST,
  SPOTIFY_PLAYLIST_ID,
  HOST,
} = process.env;

export default class SpotifyService {
  private spotifyApi: SpotifyWebApi;
  private spotifyAuth: SpotifyAuth;

  constructor() {
    let redirectUri;
    if (process.env.PORT) {
      redirectUri = `${HOST}/spotifyAuth`;
    } else {
      redirectUri = `${HOST}:${AUTH_SERVER_PORT}/spotifyAuth`;
    }
    this.spotifyApi = new SpotifyWebApi({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      redirectUri: `${redirectUri}`,
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

  public async authorize(onAuth: () => void) {
    console.log('Authorizing with Spotify');
    try {
      if (!this.spotifyAuth.refreshToken) {
        console.log('No credentials found, performing new authorization');
        await this.performNewAuthorization(onAuth);
      } else {
        console.log('Spotify credentials found');
        this.spotifyApi.setAccessToken(this.spotifyAuth.accessToken);
        this.spotifyApi.setRefreshToken(this.spotifyAuth.refreshToken);
        await onAuth();
      }
    } catch (e) {
      console.error(`Error authorizing with Spotify ${e}`);
      process.exit(-1);
    }
  }

  public async addTrack(
    trackId: string,
    chatFeedback: (message: string) => void
  ) {
    const addSong = async () => {
      console.log(`Attempting to add ${trackId}`);
      const songInfo = await this.spotifyApi.getTrack(trackId);
      if (ADD_TO_QUEUE) {
        try {
          await this.addToQueue(trackId, songInfo?.body.name);
          chatFeedback(`Success: ${songInfo?.body.name} added to queue`);
        } catch (e) {
          if (e.message === 'Not Found') {
            console.error(
              'Unable to add song to queue - Song may not exist or you may not have the Spotify client open and active'
            );
          } else {
            console.error(`Error: Unable to add song to queue - ${e.message}`);
          }
          chatFeedback(`Fail: ${songInfo?.body.name} not added to queue`);
        }
      }

      if (ADD_TO_PLAYLIST) {
        try {
          await this.addToPlaylist(trackId, songInfo?.body.name);
          chatFeedback(`Success: ${songInfo?.body.name} added to playlist`);
        } catch (e) {
          if (e.message === 'Duplicate Track') {
            chatFeedback(
              `Fail (duplicate): ${songInfo?.body.name} already in the playlist`
            );
          } else {
            chatFeedback(`Fail: ${songInfo?.body.name} not added to playlist`);
          }
        }
      }
    };

    try {
      if (this.hasTokenExpired()) {
        console.log('Spotify token expired, refreshing...');
        await this.refreshToken(addSong);
      } else {
        await addSong();
      }
    } catch (e) {
      console.error(`Error adding track ${e}`);
      if (e.body?.error?.message === 'invalid id') {
        chatFeedback('Fail (invalid ID): Link contains an invalid ID');
      } else {
        chatFeedback('Fail: Error occurred adding track');
      }
    }
  }

  private async addToQueue(trackId: string, songName: string) {
    await this.spotifyApi.addToQueue(this.createTrackURI(trackId));
    console.log(`Added ${songName} to queue`);
  }

  private async addToPlaylist(trackId: string, songName: string) {
    if (SPOTIFY_PLAYLIST_ID) {
      if (await this.doesPlaylistContainTrack(trackId, SPOTIFY_PLAYLIST_ID)) {
        console.log(`${songName} is already in the playlist`);
        throw new Error('Duplicate Track');
      } else {
        await this.spotifyApi.addTracksToPlaylist(SPOTIFY_PLAYLIST_ID, [
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

  private createTrackURI = (trackId: string): string =>
    `spotify:track:${trackId}`;

  private async doesPlaylistContainTrack(trackId: string, playlistId: string) {
    const playlistInfo = await this.spotifyApi.getPlaylist(playlistId);

    let i;
    for (i = 0; i < playlistInfo.body.tracks.items.length; i++) {
      if (playlistInfo.body.tracks.items[i].track.id === trackId) {
        return true;
      }
    }
    return false;
  }

  public getAuthorizationUrl() {
    const scopes = [
      'user-modify-playback-state',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private',
    ];

    return this.spotifyApi.createAuthorizeURL(scopes, '');
  }

  private async performNewAuthorization(onAuth: () => void) {
    const authUrl = this.getAuthorizationUrl();
    console.log(
      'Click or go to the following link and give this app permissions'
    );
    console.log(`\n${authUrl}\n`);
    waitForCode((code: string) => {
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

  private async refreshToken(onAuth: () => void) {
    try {
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
    } catch (e) {
      console.error(`Error refreshing access token ${e}`);
      process.exit(-1);
    }
  }

  private calculateExpireTime = (expiresIn: number): number =>
    new Date().getTime() / 1000 + expiresIn;

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
