export class NoTrackIDError extends Error {
	constructor() {
		super('No track ID found in URL');
	}
}
