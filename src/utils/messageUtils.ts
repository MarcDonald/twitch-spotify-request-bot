export const SPOTIFY_LINK_START = 'https://open.spotify.com/track/';

export const getTrackIdFromLink = (link: string): string | null => {
  try {
    const startOfId = SPOTIFY_LINK_START.length;
    const endOfId = link.indexOf('?');
    if (startOfId > 0 && endOfId > 0) {
      return link.substring(startOfId, endOfId);
    } else if (startOfId > 0 && endOfId === -1) {
      return link.substring(startOfId);
    } else {
      throw Error('No track ID found in URL');
    }
  } catch (e) {
    console.error(`Unable to parse trackId ${e}`);
  }
  return null;
};
