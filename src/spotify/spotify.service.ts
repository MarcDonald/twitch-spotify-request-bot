import 'dotenv/config';

import { getConfig } from '../index';
import { output } from '../output/output';

import {
	addTrackToQueue,
	addTrackToPlaylist,
	createSpotifyApi,
	getTrack,
	getPlaylist,
} from './spotify.api';

const initSpotify = async () => {
	const redirectUri = `${getConfig('HOST')}:${getConfig(
		'AUTH_SERVER_PORT'
	)}/spotifyAuth`;

	await createSpotifyApi({
		clientId: getConfig('SPOTIFY_CLIENT_ID'),
		clientSecret: getConfig('SPOTIFY_CLIENT_SECRET'),
		redirectUri: `${redirectUri}`,
	});
};

const requestTrack = async (trackId: string) => {
	output(`Request received for ${trackId}`, 'log');

	const songInfo = await getTrack(trackId);
	if (!songInfo.success) {
		output(`Fail (invalid ID): Could not find a track with that ID`, 'chat');
		return;
	}

	output(`Found song with name: ${songInfo.track.name}`, 'log');

	if (getConfig('ADD_TO_QUEUE')) {
		output(`Attempting to add ${songInfo.track.name} to queue`, 'verbose');
		await addTrackToQueue(trackId);
		output(`Success: ${songInfo.track.name} added to queue`, 'chat');
	}

	if (getConfig('ADD_TO_PLAYLIST')) {
		output(`Checking if song is already in playlist`, 'verbose');
		try {
			if (!(await trackInPlaylist(trackId))) {
				output(
					`Attempting to add ${songInfo.track.name} to playlist`,
					'verbose'
				);
				await addTrackToPlaylist(trackId, getConfig('SPOTIFY_PLAYLIST_ID'));
				output(`Success: ${songInfo.track.name} added to playlist`, 'chat');
			} else {
				output(
					`Fail (duplicate): ${songInfo.track.name} already in the playlist`,
					'chat'
				);
			}
		} catch (e) {
			output(`Error adding song to playlist: ${e}`, 'log');
			output(`Fail: ${songInfo.track.name} not added to playlist`, 'chat');
		}
	}
};

const trackInPlaylist = async (trackId: string) => {
	const res = await getPlaylist(getConfig('SPOTIFY_PLAYLIST_ID'));
	if (!res.success) {
		throw new Error(
			`Could not get playlist: ${getConfig('SPOTIFY_PLAYLIST_ID')}`
		);
	}
	const trackIds = res.playlist.tracks.items.map((item) => item.track?.id);
	return trackIds.includes(trackId);
};

export { initSpotify, requestTrack };
