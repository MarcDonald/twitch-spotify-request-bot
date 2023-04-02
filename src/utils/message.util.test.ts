import { describe } from 'vitest';

import { NoTrackIDError } from '../types/errors';

import { getTrackIdFromLink } from './message.util';

describe('getTrackIdFromLink', () => {
	it('should return track ID when valid URL with query params passed in', () => {
		// arrange
		const link =
			'https://open.spotify.com/track/1Q7g5Z7Z3YQY4Y9X1XK2ZB?si=1a2b3c4d5e6f7g8h9i0j';
		const expectedTrackId = '1Q7g5Z7Z3YQY4Y9X1XK2ZB';

		// act
		const result = getTrackIdFromLink(link);

		// assert
		expect(result).toBe(expectedTrackId);
	});

	it('should return track ID when valid URL without query params is passed in', () => {
		// arrange
		const link = 'https://open.spotify.com/track/1Q7g5Z7Z3YQY4Y9X1XK2ZB';
		const expectedTrackId = '1Q7g5Z7Z3YQY4Y9X1XK2ZB';

		// act
		const result = getTrackIdFromLink(link);

		// assert
		expect(result).toBe(expectedTrackId);
	});

	it('should throw NoTrackIDError when no track ID is found', () => {
		// arrange
		const link = 'https://open.spotify.com/track/';

		// act and assert
		expect(() => getTrackIdFromLink(link)).toThrow(NoTrackIDError);
	});
});
