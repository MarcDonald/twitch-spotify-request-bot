import express from 'express';

import { createAuthorizeURL } from '../spotify/spotify.api';
import { log } from '../utils';

export const waitForCode = (
	authServerPort: number,
	onCodeReceived: (code: string) => void
) => {
	const app = express();
	const port = authServerPort;

	const server = app.listen(port, () => {
		return log.info(`Auth server is listening on ${port}`);
	});

	app.get('/', (req, res) => {
		const authURL = createAuthorizeURL();
		res.redirect(authURL);
	});

	app.get('/spotifyAuth', (req, res) => {
		res.send('Authorization received, you can close this window now.');
		log.info('Authorization received, closing server');
		server.close();
		onCodeReceived(req.query.code as string);
	});
};
