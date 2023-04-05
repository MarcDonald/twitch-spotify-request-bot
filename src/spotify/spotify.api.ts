import fs from 'fs';

import SpotifyWebApi from 'spotify-web-api-node';

import { waitForCode } from '../auth/auth-server';
import { CONFIG } from '../index';
import SpotifyAuth from '../types/spotify-auth';

let spotifyApi: SpotifyWebApi;
let cachedAuth: SpotifyAuth;

const createSpotifyApi = async (config: {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}) => {
	spotifyApi = new SpotifyWebApi(config);
	if (!fs.existsSync('./spotify-auth-store.json')) {
		const authToStore: SpotifyAuth = {
			accessToken: '',
			refreshToken: '',
			expireTime: new Date().getTime() / 1000,
		};

		fs.writeFileSync('./spotify-auth-store.json', JSON.stringify(authToStore));
	}

	const auth: SpotifyAuth = JSON.parse(
		fs.readFileSync('./spotify-auth-store.json', 'utf8')
	);
	setSpotifyAuth(auth);

	await authorize();
};

const setSpotifyAuth = ({
	accessToken,
	refreshToken,
}: {
	accessToken: string;
	refreshToken: string;
}) => {
	if (!spotifyApi) throw new Error('Spotify API not initialized');
	spotifyApi.setAccessToken(accessToken);
	spotifyApi.setRefreshToken(refreshToken);
};

const refreshTokenIfRequired = async () => {
	if (hasTokenExpired()) {
		console.log('Spotify token expired, refreshing...');
		const newAuth = await refreshToken(cachedAuth.refreshToken);
		writeNewSpotifyAuth(newAuth);
	}
};

type GetTrackResponse =
	| {
			success: true;
			track: Awaited<ReturnType<typeof spotifyApi.getTrack>>['body'];
			// eslint-disable-next-line no-mixed-spaces-and-tabs
	  }
	| {
			success: false;
			error: string;
			// eslint-disable-next-line no-mixed-spaces-and-tabs
	  };

const getTrack = async (trackId: string): Promise<GetTrackResponse> => {
	if (!spotifyApi) throw new Error('Spotify API not initialized');
	await refreshTokenIfRequired();
	const res = await spotifyApi.getTrack(trackId);
	if (!res.body) {
		return {
			success: false,
			error: 'No track found',
		};
	} else {
		return {
			success: true,
			track: res.body,
		};
	}
};

const addTrackToQueue = async (trackId: string) => {
	if (!spotifyApi) throw new Error('Spotify API not initialized');
	await refreshTokenIfRequired();
	return (await spotifyApi.addToQueue(createTrackURI(trackId))).body;
};

const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
	if (!spotifyApi) throw new Error('Spotify API not initialized');
	await refreshTokenIfRequired();
	return (
		await spotifyApi.addTracksToPlaylist(playlistId, [createTrackURI(trackId)])
	).body;
};

type GetPlaylistResponse =
	| {
			success: true;
			playlist: Awaited<ReturnType<typeof spotifyApi.getPlaylist>>['body'];
			// eslint-disable-next-line no-mixed-spaces-and-tabs
	  }
	| {
			success: false;
			error: string;
			// eslint-disable-next-line no-mixed-spaces-and-tabs
	  };

const getPlaylist = async (
	playlistId: string
): Promise<GetPlaylistResponse> => {
	if (!spotifyApi) throw new Error('Spotify API not initialized');
	await refreshTokenIfRequired();
	const res = await spotifyApi.getPlaylist(playlistId);
	if (!res.body) {
		return {
			success: false,
			error: 'No playlist found',
		};
	} else {
		return {
			success: true,
			playlist: res.body,
		};
	}
};

const createAuthorizeURL = () => {
	if (!spotifyApi) throw new Error('Spotify API not initialized');
	const scopes = [
		'user-modify-playback-state',
		'playlist-read-private',
		'playlist-modify-public',
		'playlist-modify-private',
	];

	return spotifyApi.createAuthorizeURL(scopes, '');
};

const authorizationCodeGrant = async (code: string): Promise<SpotifyAuth> => {
	if (!spotifyApi) throw new Error('Spotify API not initialized');
	try {
		const response = await spotifyApi.authorizationCodeGrant(code);
		const accessToken = response.body['access_token'];
		const refreshToken = response.body['refresh_token'];
		const expireTime = calculateExpireTime(response.body['expires_in']);
		spotifyApi.setAccessToken(accessToken);
		spotifyApi.setRefreshToken(refreshToken);
		return { accessToken, refreshToken, expireTime };
	} catch (e) {
		console.error(e);
		process.exit(-1);
	}
};

const refreshToken = async (refreshToken: string): Promise<SpotifyAuth> => {
	try {
		spotifyApi.setRefreshToken(refreshToken);
		const response = await spotifyApi.refreshAccessToken();
		const accessToken = response.body['access_token'];
		spotifyApi.setAccessToken(accessToken);
		const expireTime = calculateExpireTime(response.body['expires_in']);
		return {
			accessToken,
			refreshToken,
			expireTime,
		};
	} catch (e) {
		console.error(`Error refreshing access token ${e}`);
		process.exit(-1);
	}
};

const calculateExpireTime = (expiresIn: number): number =>
	new Date().getTime() / 1000 + expiresIn;

const createTrackURI = (trackId: string): string => `spotify:track:${trackId}`;

const performNewAuthorization = async () => {
	const authUrl = createAuthorizeURL();
	console.log(
		'Click or go to the following link and give this app permissions'
	);
	console.log(`\n${authUrl}\n`);
	waitForCode(CONFIG, async (code: string) => {
		const newAuth = await authorizationCodeGrant(code);
		writeNewSpotifyAuth(newAuth);
	});
};

const writeNewSpotifyAuth = (newAuth: SpotifyAuth) => {
	cachedAuth = { ...newAuth };
	try {
		fs.writeFileSync('./spotify-auth-store.json', JSON.stringify(newAuth));
	} catch (e) {
		console.error(`Error writing new auth to file ${e}`);
	}
};

const hasTokenExpired = () => {
	return new Date().getTime() / 1000 >= cachedAuth.expireTime;
};

const authorize = async () => {
	console.log('Authorizing with Spotify');
	try {
		if (!cachedAuth.refreshToken) {
			console.log('No credentials found, performing new authorization');
			await performNewAuthorization();
		} else {
			console.log('Spotify credentials found');
			setSpotifyAuth({
				accessToken: cachedAuth.accessToken,
				refreshToken: cachedAuth.refreshToken,
			});
		}
	} catch (e) {
		console.error(`Error authorizing with Spotify ${e}`);
		process.exit(-1);
	}
};

export {
	createSpotifyApi,
	getTrack,
	addTrackToQueue,
	addTrackToPlaylist,
	getPlaylist,
	authorize,
	createAuthorizeURL,
};
