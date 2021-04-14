import express from 'express';
import 'dotenv/config'
import env from 'env-smart';
env.load();

export const waitForCode = (onCodeReceived: Function) => {
  const app = express();
  const port = process.env.AUTH_SERVER_PORT;

  const server = app.listen(port, (err: Error) => {
    if(err) return console.error(err);
    return console.log(`Auth server is listening on ${port}`);
  });

  app.get('/spotifyAuth', (req, res) => {
    res.send('Authorization received, you can close this window now.');
    server.close();
    onCodeReceived(req.query.code);
  });
};