import tmi, { ChatUserstate } from 'tmi.js';
import messageUtils from './messageUtils';
import SpotifyService from './spotify.service';
import { TWITCH_CHANNEL } from './config.json';

export default class TwitchService {
  constructor(private spotifyService: SpotifyService) {}

  public async connectToChat() {
    const twitchOptions = {
      channels: [TWITCH_CHANNEL],
    };
    const twitchClient = tmi.client(twitchOptions);

    twitchClient.on('connected', (_addr: string, _port: number) =>
      console.log(`Connected to ${TWITCH_CHANNEL}'s chat`)
    );

    twitchClient.on(
      'message',
      async (
        target: string,
        userState: ChatUserstate,
        msg: string,
        self: boolean
      ) => await this.handleMessage(target, userState, msg, self)
    );

    twitchClient.connect();
  }

  private async handleMessage(
    _target: string,
    _userState: ChatUserstate,
    msg: string,
    self: boolean
  ) {
    if (self) {
      return;
    }

    if (msg.startsWith(messageUtils.SPOTIFY_LINK_START)) {
      const trackId = messageUtils.getTrackIdFromLink(msg);
      if (trackId) {
        this.spotifyService.addTrackToPlaylist(trackId);
      } else {
        console.error('Unable to parse track ID from message');
      }
    }
  }
}