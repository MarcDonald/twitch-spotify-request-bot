export const SPOTIFY_LINK_REGEX = /https:\/\/open\.spotify\.com(?:\/[-\w]+)*?\/track\/([\w]+)(?:\?.*)/;

export const getTrackIdFromLink = (link: string): string | null => {
	try {
		let match = link.match(SPOTIFY_LINK_REGEX);
		if (match !== null) {
			return match[1];
		} else {
			throw Error('No track ID found in URL');
		}
	} catch (e) {
		console.error(`Unable to parse trackId ${e}`);
	}
	return null;
};
