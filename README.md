# Twitch Spotify Request Bot

## What is this?

This is a bot that listens to the chat of a given Twitch stream for messages with a Spotify song link in them and then
adds that song to a playlist and/or your queue. The Spotify link must be at the start of the message in order to be
picked up.

✔️ Message that WOULD be picked up:

```
!prefix https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=x-_FFgqBRB20mzW_lM7kDQ pls play this, it's a bop
```

❌ Message that WOULD NOT be picked up:

```
!prefix this is a bop can you please play this https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=x-_FFgqBRB20mzW_lM7kDQ
```

## Deploy

**NB:** [Open issue related to Heroku deployments](https://github.com/MarcDonald/twitch-spotify-request-bot/issues/18)

Click here to deploy your bot to heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/MarcDonald/twitch-spotify-request-bot)

1. Go to the [Spotify developer dashboard](https://developer.spotify.com/dashboard/)
   and create a new application. The app can have whatever name and description you want
2. You just need to fill the required information in the Heroku page
3. Once the app is created in Heroku, go back to Spotify developer dashboard, select your app and then click on Edit
   Settings and add a redirect URL of
   `https://app-name.herokuapp.com/spotifyAuth` (NB: Same URL that you declared in HOST from the step 2. Just add
   the `/spotifyAuth` at the end)
4. Wait the build process and then click on 'View' or 'Open app' in Heroku page

- The playlist ID can be found by right-clicking on the playlist ->
  clicking Share -> Copy Spotify URI and then copying the ID after `spotify:playlist:`
  eg. `spotify:playlist:{THIS_STRING_IS_THE_ID}`)
- The Spotify client ID and secret are obtained from the application you created in the Spotify developer dashboard
- If you wish to have chat feedback, set `CHAT_FEEDBACK` to true then generate a
  [Twitch Chat OAuth Token](https://twitchapps.com/tmi/) and set it as the `TWITCH_TOKEN` field in the `.env` file. Also
  set the `BOT_USERNAME` field to the name of the account you wish to use (must be the same account you generate the
  OAuth token for). 
  
  **Do NOT commit these to Git, they are SECRETS!**

## Prerequisites for running locally

- Some basic programming knowledge (running terminal commands and editing `.env`
  files)
- [Node](https://nodejs.org/en/) (developed and tested on 14.6.0 - your mileage may vary on other versions)
- A Spotify account

## Setup

### Development

1. Run `yarn`
2. Run `yarn run husky:prepare`

### Running

1. Go to the [Spotify developer dashboard](https://developer.spotify.com/dashboard/)
   and create a new application. The app can have whatever name and description you want
2. Once the app is created, click on Edit Settings and add a redirect URL of
   `http://localhost:8000/spotifyAuth` (NB: the port will be whatever you have set as the `AUTH_SERVER_PORT` in
   the `./.env` file, by default it is 8000)
3. Create a `./.env` file based on `./.env.template` file and fill in the fields

- The playlist ID can be found by right-clicking on the playlist ->
  clicking Share -> Copy Spotify URI and then copying the ID after `spotify:playlist:`
  e.g. `spotify:playlist:{THIS_STRING_IS_THE_ID}`)
- The Spotify client ID and secret are obtained from the application you created in the Spotify developer dashboard
- If you wish to have chat feedback, set `CHAT_FEEDBACK` to true then generate a
  [Twitch Chat OAuth Token](https://twitchapps.com/tmi/) and set it as the `TWITCH_TOKEN` field in the `.env` file. Also
  set the `BOT_USERNAME` field to the name of the account you wish to use (must be the same account you generate the
  OAuth token for)
  
  **Do NOT commit this file to Git as it will contain SECRETS to log in as you!**

4. Run `bash ./build.sh`. This will automatically compile from source using `yarn` and then build OS-native binaries
   using `pkg`
5. Run the freshly compiled binary for your OS in `./dist`.
6. Open the authorization link and give the app the required permissions
7. If you have `ADD_TO_QUEUE` toggled on, ensure you have the Spotify client open and that it is active (i.e. is playing
   a song)
8. Type a Spotify link in the chat (ensuring the link is the first piece of text in the message)
   and make sure it shows up in your desired playlist (Spotify links should start
   with `https://open.spotify.com/track/`)
9. If there's a problem with Spotify authorization at any point, try deleting the
   `spotify-auth-store.json` file and starting the app again

#### Note

##### Running without generating a binary file

If you would prefer to launch the bot without generating a binary file you can replace steps 4 and 5 the following

- Run `yarn`
- Run `yarn build && yarn start`

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

### [dotenv](https://github.com/motdotla/dotenv)

Used to load environment variables

BSD 2-Clause "Simplified" License

### [env-smart](https://github.com/jessety/env-smart)

Used to set types for environment variables

MIT License

### [pkg](https://github.com/vercel/pkg)

Used to create platform binaries

MIT License

## Contributors

Checkout the [Contributors file](./CONTRIBUTORS.md) to see everyone who has helped out with the bot

### [Material Design Icons](https://github.com/google/material-design-icons)

Used for the icon

Apache 2 License
