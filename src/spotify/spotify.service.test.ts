// noinspection DuplicatedCode

import { beforeEach, test } from 'vitest';

import {
	FAKE_PLAYLIST_EMPTY,
	FAKE_PLAYLIST_HAS_SONG,
	FAKE_TRACK,
} from '../../test/utils/fake-spotify-responses';
import {
	getConfigMockImplementation,
	TEST_CONFIG_WITH_PLAYLIST,
	TEST_CONFIG_NO_PLAYLIST,
} from '../../test/utils/test-configs';
import { getConfig } from '../index';

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
	beforeEach(() => {
		vi.mocked(getConfig).mockImplementation(getConfigMockImplementation);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('initSpotify', async () => {
		// act
		await initSpotify();

		// assert
		expect(createSpotifyApi).toHaveBeenCalledWith({
			clientId: 'spottyClient',
			clientSecret: 'spottySecret',
			redirectUri: `unittest:8080/spotifyAuth`,
		});
	});

	describe('requestTrack', () => {
		test('when no track found', async () => {
			// arrange
			vi.mocked(getTrack).mockImplementation(() => {
				throw new Error('No track found');
			});

			// act/assert
			await expect(() => requestTrack('123')).rejects.toThrow('No track found');
			expect(addTrackToQueue).toHaveBeenCalledTimes(0);
			expect(addTrackToPlaylist).toHaveBeenCalledTimes(0);
		});

		test('when ADD_TO_QUEUE=true and ADD_TO_PLAYLIST=false', async () => {
			// arrange
			vi.mocked(getConfig).mockImplementation((name) =>
				getConfigMockImplementation(name, {
					...TEST_CONFIG_NO_PLAYLIST,
					ADD_TO_QUEUE: true,
				})
			);
			const trackId = FAKE_TRACK.id;
			vi.mocked(getTrack).mockResolvedValue({
				success: true,
				track: FAKE_TRACK,
			});

			// act
			await requestTrack(trackId);

			// assert
			expect(addTrackToQueue).toHaveBeenCalledWith(trackId);
			expect(addTrackToPlaylist).toHaveBeenCalledTimes(0);
		});

		test('when ADD_TO_QUEUE=false and ADD_TO_PLAYLIST=true', async () => {
			// arrange
			vi.mocked(getConfig).mockImplementation((name) =>
				getConfigMockImplementation(name, {
					...TEST_CONFIG_WITH_PLAYLIST,
					ADD_TO_QUEUE: false,
				})
			);
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
			await requestTrack(trackId);

			// assert
			expect(addTrackToQueue).toHaveBeenCalledTimes(0);
			expect(addTrackToPlaylist).toHaveBeenCalledWith(
				trackId,
				TEST_CONFIG_WITH_PLAYLIST.SPOTIFY_PLAYLIST_ID
			);
		});

		test('when ADD_TO_QUEUE=true and ADD_TO_PLAYLIST=true', async () => {
			// arrange
			vi.mocked(getConfig).mockImplementation((name) =>
				getConfigMockImplementation(name, {
					...TEST_CONFIG_WITH_PLAYLIST,
					ADD_TO_QUEUE: true,
				})
			);
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
			await requestTrack(trackId);

			// assert
			expect(addTrackToQueue).toHaveBeenCalledWith(trackId);
			expect(addTrackToPlaylist).toHaveBeenCalledWith(
				trackId,
				TEST_CONFIG_WITH_PLAYLIST.SPOTIFY_PLAYLIST_ID
			);
		});

		test('when song is requested that is already in the playlist', async () => {
			// arrange
			vi.mocked(getConfig).mockImplementation((name) =>
				getConfigMockImplementation(name, {
					...TEST_CONFIG_WITH_PLAYLIST,
					ADD_TO_QUEUE: true,
				})
			);

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
			await requestTrack(trackId);

			// assert
			expect(addTrackToQueue).toHaveBeenCalledWith(trackId);
			expect(addTrackToPlaylist).toHaveBeenCalledTimes(0);
		});
	});
});
