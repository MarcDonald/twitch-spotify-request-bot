// TODO: Should validate this with zod
type SpotifyAuth = {
	accessToken: string;
	refreshToken: string;
	expireTime: number;
};

export default SpotifyAuth;
