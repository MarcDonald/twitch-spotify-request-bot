# Twitch Spotify Request Bot

## Setup
* Go to the Spotify developer dashboard
    (https://developer.spotify.com/dashboard/) and create a new application. The
    app can have whatever name and description you want. Once the app is
    created, click on Edit Settings and add a redirect URL of
    `http://localhost:8000/spotifyAuth` (note: the port will be whatever you
    have set as the `AUTH_SERVER_PORT` in the `config.json` file, by default it
    is 8000)
* Run `yarn` or `npm install`
* Create a `src/config.json` based on `src/config.json.example` and fill in the
    fields (the playlist ID can be found by right clicking on the playlist ->
    clicking Share -> Copy Playlist Link and then copying the ID between `/playlist/` and the `?` symbol
    eg. https://open.spotify.com/playlist/{THIS_STRING_IS_THE_ID}?{ANYTHING_HERE_IS_UNNECESSARY}
* Run `yarn start` or `npm start`
* Open the authorization link and give the app the require permissions
* Type a Spotify link in the chat (ensuring the link is the first piece of text
    in the message) and make sure it shows up in your desired playlist (Spotify
    links should start with https://open.spotify.com/track/)
* If there's a problem with Spotify authorization at any point, try deleting the
    `spotify-auth-store.json` file and starting the app again
