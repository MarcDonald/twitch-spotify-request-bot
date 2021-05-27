import SpotifyService from './spotify.service';
import express from 'express';
import 'dotenv/config';
import env from 'env-smart';
import { envDirectory } from './constants';
env.load({ directory: envDirectory });

const AUTH_SERVER_PORT  = process.env.PORT || process.env.AUTH_SERVER_PORT;

export const waitForCode = (onCodeReceived: Function) => {
  const app = express();
  const port = AUTH_SERVER_PORT;

  const server = app.listen(port, () => {
    return console.log(`Auth server is listening on ${port}`);
  });
  app.get('/', (req, res) => {
    const spotifyService = new SpotifyService();
    let authURL = spotifyService.getAuthorizationUrl();
    res.redirect(authURL);
  });
  app.get('/spotifyAuth', (req, res) => {
    res.send('Authorization received, you can close this window now.');
    server.close();
    onCodeReceived(req.query.code);
  });
};
