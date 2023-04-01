import express from 'express';

import SpotifyService from '../spotify/spotify.service';
import Config from '../types/config';

export const waitForCode = (
	config: Config,
	onCodeReceived: (code: string) => void
) => {
	const app = express();
	const port = config.AUTH_SERVER_PORT;

	const server = app.listen(port, () => {
		return console.log(`Auth server is listening on ${port}`);
	});
	app.get('/', (req, res) => {
		const spotifyService = new SpotifyService(config);
		const authURL = spotifyService.getAuthorizationUrl();
		res.redirect(authURL);
	});
	app.get('/spotifyAuth', (req, res) => {
		res.send('Authorization received, you can close this window now.');
		server.close();
		onCodeReceived(req.query.code as string);
	});
};
