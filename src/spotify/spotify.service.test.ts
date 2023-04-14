// noinspection DuplicatedCode

import { test } from 'vitest';

import {
	FAKE_PLAYLIST_EMPTY,
	FAKE_PLAYLIST_HAS_SONG,
	FAKE_TRACK,
} from '../../test/utils/fake-spotify-responses';
import { TEST_CONFIG_WITH_PLAYLIST } from '../../test/utils/test-configs';

import {
	addTrackToPlaylist,
	addTrackToQueue,
	createSpotifyApi,
	getPlaylist,
	getTrack,
} from './spotify.api';
import { initSpotify, requestTrack } from './spotify.service';

vi.mock('./spotify.api', () => ({
	createSpotifyApi: vi.fn(),
	authorize: vi.fn(),
	getTrack: vi.fn(),
	addTrackToQueue: vi.fn(),
	addTrackToPlaylist: vi.fn(),
	getPlaylist: vi.fn(),
}));

vi.mock('../index', () => ({
	getConfig: vi.fn(),
}));

describe('spotify.service', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('initSpotify', async () => {
		// act
		await initSpotify({
			host: 'unittest',
			port: 8080,
			clientId: 'spottyClient',
			clientSecret: 'spottySecret',
		});

		// assert
		expect(createSpotifyApi).toHaveBeenCalledWith({
			clientId: 'spottyClient',
			clientSecret: 'spottySecret',
			redirectUri: `unittest:8080/spotifyAuth`,
			port: 8080,
		});
	});

	describe('requestTrack', () => {
		test('when no track found', async () => {
			// arrange
			vi.mocked(getTrack).mockImplementation(() => {
				throw new Error('No track found');
			});

			// act/assert
			await expect(() =>
				requestTrack('123', {
					addToQueue: false,
					addToPlaylist: false,
					playlistId: FAKE_PLAYLIST_EMPTY.id,
				})
			).rejects.toThrow('No track found');
			expect(addTrackToQueue).toHaveBeenCalledTimes(0);
			expect(addTrackToPlaylist).toHaveBeenCalledTimes(0);
		});

		test('when ADD_TO_QUEUE=true and ADD_TO_PLAYLIST=false', async () => {
			// arrange
			const trackId = FAKE_TRACK.id;
			vi.mocked(getTrack).mockResolvedValue({
				success: true,
				track: FAKE_TRACK,
			});

			// act
			await requestTrack(trackId, {
				addToQueue: true,
				addToPlaylist: false,
				playlistId: FAKE_PLAYLIST_HAS_SONG.id,
			});

			// assert
			expect(addTrackToQueue).toHaveBeenCalledWith(trackId);
			expect(addTrackToPlaylist).toHaveBeenCalledTimes(0);
		});

		test('when ADD_TO_QUEUE=false and ADD_TO_PLAYLIST=true', async () => {
			// arrange
			const trackId = FAKE_TRACK.id;
			vi.mocked(getTrack).mockResolvedValue({
				success: true,
				track: FAKE_TRACK,
			});
			vi.mocked(getPlaylist).mockResolvedValue({
				success: true,
				playlist: FAKE_PLAYLIST_EMPTY,
			});

			// act
			await requestTrack(trackId, {
				addToQueue: false,
				addToPlaylist: true,
				playlistId: TEST_CONFIG_WITH_PLAYLIST.SPOTIFY_PLAYLIST_ID,
			});

			// assert
			expect(addTrackToQueue).toHaveBeenCalledTimes(0);
			expect(addTrackToPlaylist).toHaveBeenCalledWith(
				trackId,
				TEST_CONFIG_WITH_PLAYLIST.SPOTIFY_PLAYLIST_ID
			);
		});

		test('when ADD_TO_QUEUE=true and ADD_TO_PLAYLIST=true', async () => {
			// arrange
			const trackId = FAKE_TRACK.id;
			vi.mocked(getTrack).mockResolvedValue({
				success: true,
				track: FAKE_TRACK,
			});
			vi.mocked(getPlaylist).mockResolvedValue({
				success: true,
				playlist: FAKE_PLAYLIST_EMPTY,
			});

			// act
			await requestTrack(trackId, {
				addToQueue: true,
				addToPlaylist: true,
				playlistId: TEST_CONFIG_WITH_PLAYLIST.SPOTIFY_PLAYLIST_ID,
			});

			// assert
			expect(addTrackToQueue).toHaveBeenCalledWith(trackId);
			expect(addTrackToPlaylist).toHaveBeenCalledWith(
				trackId,
				TEST_CONFIG_WITH_PLAYLIST.SPOTIFY_PLAYLIST_ID
			);
		});

		test('when song is requested that is already in the playlist', async () => {
			// arrange
			const trackId = FAKE_TRACK.id;
			vi.mocked(getTrack).mockResolvedValue({
				success: true,
				track: FAKE_TRACK,
			});

			vi.mocked(getPlaylist).mockResolvedValue({
				success: true,
				playlist: FAKE_PLAYLIST_HAS_SONG,
			});

			// act
			await requestTrack(trackId, {
				addToQueue: true,
				addToPlaylist: true,
				playlistId: FAKE_PLAYLIST_HAS_SONG.id,
			});

			// assert
			expect(addTrackToQueue).toHaveBeenCalledWith(trackId);
			expect(addTrackToPlaylist).toHaveBeenCalledTimes(0);
		});
	});
});
