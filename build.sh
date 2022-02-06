#!/bin/bash
#title					:build.sh
#description			:This script compiles twitch-spotify-request-bot
#description2			:by @MarcDonald and builds OS-native binaries.
#author					:@Colorful
#version				:1.0
#usage					:bash build.sh
#==============================================================================

ENV=./.env

echo "Checking if .env file exists...";
sleep 2
	
echo "Initializing yarn...";
yarn install --frozen-lockfile

if [ -f "$ENV" ]; then

	clear >$(tty)
	echo "Compiling source to JS...";
	yarn run build
	
else
	clear >$(tty)
	echo "Please create a .env file based on .env.template to continue...";
	sleep 2
	exit

fi

clear >$(tty)
echo "Building OS-native binaries from JS...";
pkg ./dist/index.js --targets node14-win-x64,node14-macos-x64,node14-linux-x64 --out-path ./dist/

clear >$(tty)
echo "Cleaning up...";
mv ./dist/index-linux ./dist/twitch-spotify-bot-linux
mv ./dist/index-win.exe ./dist/twitch-spotify-bot-win.exe
mv ./dist/index-macos ./dist/twitch-spotify-bot-macos
sleep 2
		
clear >$(tty)
echo "Thank you for using my little script //Colorful";
sleep 2
exit