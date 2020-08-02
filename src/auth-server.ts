import express from 'express';

export default class AuthServer {
  public waitForCode(onCodeReceived: Function) {
    const app = express();
    const port = process.env.PORT || '8000';

    const server = app.listen(port, (err) => {
      if (err) return console.error(err);
      return console.log(`Auth server is listening on ${port}`);
    });

    app.get('/spotifyAuth', (req, res) => {
      res.send('Authorization received, you can close this window now.');
      server.close();
      onCodeReceived(req.query.code);
    });
  }
}
