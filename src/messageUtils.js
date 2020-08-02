const getTrackIdFromLink = (link) => {
  try {
    const startOfId = 'https://open.spotify.com/track/'.length;
    const endOfId = link.indexOf('?');
    return link.substring(startOfId, endOfId);
  } catch (e) {
    console.error(`Unable to parse trackId ${e}`);
    return;
  }
};

const SPOTIFY_LINK_START = 'https://open.spotify.com/track/';

module.exports = {
  getTrackIdFromLink,
  SPOTIFY_LINK_START,
};
