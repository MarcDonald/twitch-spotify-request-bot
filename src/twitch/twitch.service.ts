import { Client, ChatUserstate, client } from 'tmi.js';

import { requestTrack } from '../spotify/spotify.service';
import Config from '../types/config';
import { NoTrackIDError } from '../types/errors';
import { getTrackIdFromLink, SPOTIFY_LINK_START } from '../utils';

interface TwitchOptions {
	channels: string[];
	identity?: {
		username: string;
		password: string;
	};
}

export default class TwitchService {
	private twitchClient: Client | null = null;

	constructor(private readonly config: Config) {}

	public async connectToChat() {
		let twitchOptions: TwitchOptions = {
			channels: [this.config.TWITCH_CHANNEL],
		};

		if (this.config.CHAT_FEEDBACK) {
			if (this.config.TWITCH_TOKEN && this.config.BOT_USERNAME) {
				twitchOptions = {
					...twitchOptions,
					identity: {
						username: this.config.BOT_USERNAME,
						password: this.config.TWITCH_TOKEN,
					},
				};
			} else {
				console.error(
					'Error: Chat feedback enabled but there is no TWITCH_TOKEN or BOT_USERNAME in the config.ts'
				);
				process.exit(-1);
			}
		}

		this.twitchClient = client(twitchOptions);

		this.twitchClient.on('connected', (_addr: string, _port: number) => {
			console.log(`Connected to ${this.config.TWITCH_CHANNEL}'s chat`);
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

		if (
			this.config.COMMAND_PREFIX &&
			msg.startsWith(this.config.COMMAND_PREFIX)
		) {
			if (this.config.SUBSCRIBERS_ONLY) {
				console.log(this.config.SUBSCRIBERS_ONLY);
				if (!userState.subscriber) {
					return;
				}
			}

			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
			msg = msg.substring(`${this.config.COMMAND_PREFIX} `.length);
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
		try {
			const trackId = getTrackIdFromLink(message);
			await requestTrack(trackId);
		} catch (e) {
			if (e instanceof NoTrackIDError) {
				console.error('Unable to parse track ID from message');
				this.chatFeedback(
					target,
					'Fail (invalid message): Unable to parse track ID from message'
				);
			} else {
				console.error('Unable to add track', e);
				this.chatFeedback(target, 'Fail: Unable to add track');
			}
		}
	}

	private chatFeedback(target: string, message: string) {
		if (this.config.CHAT_FEEDBACK) {
			this.twitchClient?.say(target, message);
		}
	}
}
