# Twitch Spotify Request Bot

## Setup
* Create a `config.json` based on `config.json.example`
* Run `yarn` or `npm install`
* Run `yarn start` or `npm start` to get an authorization link
* Go to the authorization link and get the auth code from the URL
* Send a `POST` request to `https://accounts.spotify.com/api/token` with the Headers:
  ```
  "Content-Type": "application/x-www-form-urlencoded" 
  
  "Authorization": "Basic MDJhMDExMjAzZTU1NGZmN2EyYjY1YTBhNWZkOTE4YTY6MjQ4YzRkMzYyYmExNDE4MmE0MDdmNWIxYTg1MDc2YWI="
  ```
  and the body parameters (body set to `x-www-form-urlencoded`):
  ```
    "grant_type": "authorization_code"
  
    "code": "${AUTH CODE FROM STEP 2"
  
    "redirect_url": "http://localhost"
  ```
* Use the `access_token` in the response body as the `SPOTIFY_ACCESS_TOKEN` in `config.json`
* Fill in all the rest of the data in the `config.json`
