import env from 'env-smart';
import tmi, { ChatUserstate } from 'tmi.js';

import { SpotifyService } from '../spotify';
import { envDirectory, getTrackIdFromLink, SPOTIFY_LINK_START } from '../utils';

env.load({ directory: envDirectory });

const {
	TWITCH_CHANNEL,
	COMMAND_PREFIX,
	SUBSCRIBERS_ONLY,
	TWITCH_TOKEN,
	BOT_USERNAME,
	CHAT_FEEDBACK,
} = process.env;

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
			channels: [TWITCH_CHANNEL],
		};

		if (CHAT_FEEDBACK) {
			if (TWITCH_TOKEN && BOT_USERNAME) {
				twitchOptions = {
					...twitchOptions,
					identity: {
						username: BOT_USERNAME,
						password: TWITCH_TOKEN,
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
			console.log(`Connected to ${TWITCH_CHANNEL}'s chat`);
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

		if (COMMAND_PREFIX && msg.startsWith(COMMAND_PREFIX)) {
			if (SUBSCRIBERS_ONLY) {
				if (!userState.subscriber) {
					return;
				}
			}

			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
			msg = msg.substring(`${COMMAND_PREFIX} `.length);
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
		if (CHAT_FEEDBACK) {
			this.twitchClient?.say(target, message);
		}
	}
}
