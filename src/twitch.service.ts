import tmi, { ChatUserstate } from 'tmi.js';
import messageUtils from './messageUtils';
import SpotifyService from './spotify.service';
import { TWITCH_CHANNEL, COMMAND_PREFIX } from './config.json';

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

    if (COMMAND_PREFIX && msg.startsWith(COMMAND_PREFIX)) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      msg = msg.substring(`${COMMAND_PREFIX} `.length);
      if (msg.startsWith(messageUtils.SPOTIFY_LINK_START)) {
        this.handleSpotifyLink(msg);
      } else {
        console.log('Command used but no Spotify link provided');
      }
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    }
  }

  private async handleSpotifyLink(message: string) {
    const trackId = messageUtils.getTrackIdFromLink(message);
    if (trackId) {
      await this.spotifyService.addTrack(trackId);
    } else {
      console.error('Unable to parse track ID from message');
    }
  }
}
