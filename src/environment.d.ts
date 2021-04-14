declare global {
    namespace NodeJS {
        declare interface ProcessEnv {
            TWITCH_CHANNEL: string;
            SPOTIFY_CLIENT_ID: string;
            SPOTIFY_CLIENT_SECRET: string;
            SPOTIFY_PLAYLIST_ID?: string;
            TWITCH_TOKEN: string;
            BOT_USERNAME: string;
            CHAT_FEEDBACK: boolean;
            ADD_TO_QUEUE: boolean;
            ADD_TO_PLAYLIST: boolean;
            SUBSCRIBERS_ONLY: boolean;
            COMMAND_PREFIX: string;
            AUTH_SERVER_PORT: number;
        }
    }
}
export {}