#!/bin/bash

echo "Checking if .env file exists";

ENV=./.env


if [ -f "$ENV" ]; then
	echo "Found .env file";
else
	echo "Please create a .env file based on .env.template to continue";
	exit
fi

echo "Initializing npm...";
npm ci

echo "Compiling source to JS...";
npm run build

echo "Building OS-native binaries from JS...";
mkdir -p ./out
pkg ./dist/index.js --targets node18-win-x64,node18-macos-x64,node18-linux-x64 --out-path ./out/

echo "Cleaning up...";
mv ./out/index-linux ./out/twitch-spotify-bot-linux
mv ./out/index-win.exe ./out/twitch-spotify-bot-win.exe
mv ./out/index-macos ./out/twitch-spotify-bot-macos

echo "Done! Check the 'out' folder for the compiled binaries.";
exit