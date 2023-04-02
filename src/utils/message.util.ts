import { NoTrackIDError } from '../types/errors';

import { SPOTIFY_LINK_START } from './constants';

export const getTrackIdFromLink = (link: string): string => {
	const startOfId = SPOTIFY_LINK_START.length;
	const endOfId = link.indexOf('?');
	let trackId;
	if (startOfId > 0 && endOfId > 0) {
		trackId = link.substring(startOfId, endOfId);
	} else if (startOfId > 0 && endOfId === -1) {
		trackId = link.substring(startOfId);
	}

	if (trackId) {
		return trackId;
	} else {
		throw new NoTrackIDError();
	}
};
