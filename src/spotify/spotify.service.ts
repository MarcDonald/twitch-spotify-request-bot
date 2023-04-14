import 'dotenv/config';

import { log } from '../utils';

import {
	addTrackToQueue,
	addTrackToPlaylist,
	createSpotifyApi,
	getTrack,
	getPlaylist,
} from './spotify.api';

type SpotifyOpts = {
	host: string;
	port: number;
	clientId: string;
	clientSecret: string;
};

const initSpotify = async (opts: SpotifyOpts) => {
	const redirectUri = `${opts.host}:${opts.port}/spotifyAuth`;

	await createSpotifyApi({
		clientId: opts.clientId,
		clientSecret: opts.clientSecret,
		redirectUri: `${redirectUri}`,
		port: opts.port,
	});
};

type RequestOpts = {
	addToQueue: boolean;
	addToPlaylist: boolean;
	playlistId?: string;
};

const requestTrack = async (trackId: string, opts: RequestOpts) => {
	log.info(`Request received for ${trackId}`, 'log');

	const songInfo = await getTrack(trackId);
	if (!songInfo.success) {
		log.error(`Fail (invalid ID): Could not find a track with that ID`, 'chat');
		return;
	}

	log.info(`Found song with name: ${songInfo.track.name}`, 'log');

	if (opts.addToQueue) {
		log.info(`Attempting to add ${songInfo.track.name} to queue`, 'verbose');
		await addTrackToQueue(trackId);
		log.info(`Success: ${songInfo.track.name} added to queue`, 'chat');
	}

	if (opts.addToPlaylist && opts.playlistId) {
		log.info(`Checking if song is already in playlist`, 'verbose');
		try {
			if (!(await trackInPlaylist(trackId, opts.playlistId))) {
				log.info(
					`Attempting to add ${songInfo.track.name} to playlist`,
					'verbose'
				);
				await addTrackToPlaylist(trackId, opts.playlistId);
				log.info(`Success: ${songInfo.track.name} added to playlist`, 'chat');
			} else {
				log.error(
					`Fail (duplicate): ${songInfo.track.name} already in the playlist`,
					'chat'
				);
			}
		} catch (e) {
			log.error(`Error adding song to playlist: ${e}`, 'log');
		}
	}
};

const trackInPlaylist = async (trackId: string, playlistId: string) => {
	const res = await getPlaylist(playlistId);
	if (!res.success) {
		throw new Error(`Could not get playlist: ${playlistId}`);
	}
	const trackIds = res.playlist.tracks.items.map((item) => item.track?.id);
	return trackIds.includes(trackId);
};

export { initSpotify, requestTrack };
