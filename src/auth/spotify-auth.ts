export default class SpotifyAuth {
	constructor(
		public accessToken: string,
		public refreshToken: string,
		public expireTime: number
	) {}
}
