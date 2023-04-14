import { Plugin, MessageArgs } from '@modularbot/core';

import { initSpotify, requestTrack } from './spotify/spotify.service';
import { NoTrackIDError } from './types/errors';
import { getTrackIdFromLink, SPOTIFY_LINK_START } from './utils';
import { log } from './utils';

type PluginConfig = {
	logLevel?: number;
	chatFeedback?: boolean;
	addToQueue?: boolean;
	addToPlaylist?: boolean;
	playlistId?: string;
	subscribersOnly?: boolean;
	commandPrefix: string;
	spotify: {
		clientId: string;
		clientSecret: string;
	};
	authServer: {
		port: number;
		host: string;
	};
};

const SpotifyRequestsPlugin = (props: PluginConfig): Plugin => {
	const name = 'Spotify Requests';

	log.settings.minLevel =
		typeof props.logLevel === 'number' ? props.logLevel : 3;

	const init = async () => {
		log.trace('Initializing');
		await initSpotify({
			clientId: props.spotify.clientId,
			clientSecret: props.spotify.clientSecret,
			host: props.authServer.host,
			port: props.authServer.port,
		});
	};

	const onMessage = async ({ message, userState }: MessageArgs) => {
		if (props.commandPrefix && message.startsWith(props.commandPrefix)) {
			if (props.subscribersOnly) {
				log.info(props.subscribersOnly);
				if (!userState.subscriber) {
					return;
				}
			}

			log.info('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
			const messageContent = message.substring(
				`${props.commandPrefix} `.length
			);
			if (messageContent.startsWith(SPOTIFY_LINK_START)) {
				await handleSpotifyLink(messageContent);
			} else {
				log.warn('Command used but no Spotify link provided');
			}
			log.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
		}
	};

	const handleSpotifyLink = async (message: string) => {
		try {
			const trackId = getTrackIdFromLink(message);
			await requestTrack(trackId, {
				addToPlaylist: props.addToPlaylist ?? false,
				addToQueue: props.addToQueue ?? false,
				playlistId: props.playlistId,
			});
		} catch (e) {
			if (e instanceof NoTrackIDError) {
				log.error('Unable to parse track ID from message');
			} else {
				log.error('Unable to add track', e);
			}
		}
	};

	return {
		name,
		init,
		onMessage,
	};
};

export default SpotifyRequestsPlugin;
