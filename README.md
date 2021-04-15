# Twitch Spotify Request Bot

## What is this?

This is a bot that listens to the chat of a given Twitch stream for messages
with a Spotify song link in them and then adds that song to a playlist and/or
your queue. The Spotify link must be at the start of the message in order to be picked up.

✔️ Message that WOULD be picked up:

```
https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=x-_FFgqBRB20mzW_lM7kDQ pls play this, it's a bop
```

❌ Message that WOULD NOT be picked up:

```
this is a bop can you please play this https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=x-_FFgqBRB20mzW_lM7kDQ
```

## Prerequisites

- Some basic programming knowledge (running terminal commands and editing JSON
  files)
- Node (developed and tested on 14.6.0 - your mileage may vary on other versions)
- Yarn or NPM
- A Spotify account

## Setup

- Go to the [Spotify developer dashboard](https://developer.spotify.com/dashboard/)
  and create a new application. The app can have whatever name and description you want
- Once the app is created, click on Edit Settings and add a redirect URL of
  `http://localhost:8000/spotifyAuth` (NB: the port will be whatever you have
  set as the `AUTH_SERVER_PORT` in the `./.env` file, by default it is 8000)
- Create a `./.env` file based on `./.env.template` file and fill
  in the fields
  - The playlist ID can be found by right clicking on the playlist ->
    clicking Share -> Copy Spotify URI and then copying the ID after `spotify:playlist:`
    eg. `spotify:playlist:{THIS_STRING_IS_THE_ID}`)
  - The Spotify client ID and secret are obtained from the application you
    created in the Spotify developer dashboard
  - If you wish to have chat feedback, set `CHAT_FEEDBACK` to true then generate a 
    [Twitch Chat OAuth Token](https://twitchapps.com/tmi/) and set it as the `TWITCH_TOKEN` field in 
    the `config.json` file. Also set the `BOT_USERNAME` field to the name of the account you wish to 
    use (must be the same account you generate the OAuth token for)
- Run `./build.sh` This will compile from source using `npm` and then build OS-native binaries using `pkg`
- Run the freshly compiled binary for your OS in `./dist`.
- Open the authorization link and give the app the required permissions
- If you have `ADD_TO_QUEUE` toggled on, ensure you have the Spotify client open and that it is active (i.e. is playing a song)
- Type a Spotify link in the chat (ensuring the link is the first piece of text in the message)
  and make sure it shows up in your desired playlist (Spotify links should start
  with `https://open.spotify.com/track/`)
- If there's a problem with Spotify authorization at any point, try deleting the
  `spotify-auth-store.json` file and starting the app again
  
## Open Source Libraries Used
### [Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node)
Used for connecting to and performing actions using Spotify

MIT License

### [tmi.js](https://github.com/tmijs/tmi.js)
Used for connecting to Twitch chat

MIT License

### [Express](https://github.com/expressjs/express)
Used for creating a temporary local web server to retrieve the callback from the Spotify authorization

MIT License

### [Nodemon](https://github.com/remy/nodemon)
Used to speed up development with hot reload

MIT License

### [Prettier](https://github.com/prettier/prettier)
Used to make code pretty

MIT License

### [ts-node](https://github.com/TypeStrong/ts-node)
Used to run TypeScript

MIT License

### [TypeScript](https://www.typescriptlang.org/)
Used for strong typings

Apache 2.0 License
