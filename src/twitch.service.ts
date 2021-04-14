import tmi, { ChatUserstate } from 'tmi.js';
import {getTrackIdFromLink, SPOTIFY_LINK_START} from './messageUtils';
import SpotifyService from './spotify.service';
import 'dotenv/config'
import env from 'env-smart';
env.load();
import e from 'express';

interface TwitchOptions {
  channels: string[];
  identity?: {
    username: string;
    password: string;
  };
}

export default class TwitchService {
  private twitchClient: tmi.Client | null = null;

  constructor(private spotifyService: SpotifyService) {}

  public async connectToChat() {
    let twitchOptions: TwitchOptions = {
      channels: [process.env.TWITCH_CHANNEL],
    };

    if (process.env.CHAT_FEEDBACK) {
      if (process.env.TWITCH_TOKEN && process.env.BOT_USERNAME) {
        twitchOptions = {
          ...twitchOptions,
          identity: {
            username: process.env.BOT_USERNAME,
            password: process.env.TWITCH_TOKEN,
          },
        };
      } else {
        console.error(
          'Error: Chat feedback enabled but there is no TWITCH_TOKEN or BOT_USERNAME in the config'
        );
        process.exit(-1);
      }
    }

    this.twitchClient = tmi.client(twitchOptions);

    this.twitchClient.on('connected', (_addr: string, _port: number) => {
      console.log(`Connected to ${process.env.TWITCH_CHANNEL}'s chat`);
    });

    this.twitchClient.on(
      'message',
      async (
        target: string,
        userState: ChatUserstate,
        msg: string,
        self: boolean
      ) => await this.handleMessage(target, userState, msg, self)
    );

    try {
      await this.twitchClient.connect();
    } catch (e) {
      console.error(`Error connecting to Twitch - ${e}`);
      process.exit(-1);
    }
  }

  private async handleMessage(
    target: string,
    userState: ChatUserstate,
    msg: string,
    self: boolean
  ) {
    if (self) {
      return;
    }

    if (process.env.COMMAND_PREFIX && msg.startsWith(process.env.COMMAND_PREFIX)) {
      if (process.env.SUBSCRIBERS_ONLY) {
        if (!userState.subscriber) {
          return;
        }
      }

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      msg = msg.substring(`${process.env.COMMAND_PREFIX} `.length);
      if (msg.startsWith(SPOTIFY_LINK_START)) {
        await this.handleSpotifyLink(msg, target);
      } else {
        console.log('Command used but no Spotify link provided');
        this.chatFeedback(target, 'Fail (no link): No Spotify link detected');
      }
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    }
  }

  private async handleSpotifyLink(message: string, target: string) {
    const trackId = getTrackIdFromLink(message);
    if (trackId) {
      await this.spotifyService.addTrack(trackId, (chatMessage) => {
        this.chatFeedback(target, chatMessage);
      });
    } else {
      console.error('Unable to parse track ID from message');
      this.chatFeedback(
        target,
        'Fail (invalid message): Unable to parse track ID from message'
      );
    }
  }

  private chatFeedback(target: string, message: string) {
    if (process.env.CHAT_FEEDBACK) {
      this.twitchClient?.say(target, message);
    }
  }
}