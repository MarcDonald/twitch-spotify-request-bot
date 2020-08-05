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
- Yarn (NPM does not work as the Spotify Web API Node package has not merged in
  [this](https://github.com/thelinmichael/spotify-web-api-node/pull/302/) PR yet
  and we are using the Yarn syntax in our `package.json` for pulling in dependencies
  built from PRs)
- A Spotify account

## Setup

- Go to the [Spotify developer dashboard](https://developer.spotify.com/dashboard/) 
  and create a new application. The app can have whatever name and description you want
- Once the app is created, click on Edit Settings and add a redirect URL of
  `http://localhost:8000/spotifyAuth` (NB: the port will be whatever you have
  set as the `AUTH_SERVER_PORT` in the `config.json` file, by default it is 8000)
- Run `yarn`
- Create a `src/config.json` file based on `src/config.json.template` file and fill
  in the fields
  - The playlist ID can be found by right clicking on the playlist ->
    clicking Share -> Copy Spotify URI and then copying the ID after `spotify:playlist:`
    eg. `spotify:playlist:{THIS_STRING_IS_THE_ID}`)
  - The Spotify client ID and secret are obtained from the application you
    created in the Spotify developer dashboard
- Run `yarn start` in the root directory of the project
- Open the authorization link and give the app the require permissions
- Type a Spotify link in the chat (ensuring the link is the first piece of text in the message)
  and make sure it shows up in your desired playlist (Spotify links should start
  with `https://open.spotify.com/track/`)
- If there's a problem with Spotify authorization at any point, try deleting the
  `spotify-auth-store.json` file and starting the app again
