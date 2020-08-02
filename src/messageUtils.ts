export default class MessageUtils {
  public static SPOTIFY_LINK_START = 'https://open.spotify.com/track/';

  public static getTrackIdFromLink(link: string): string | null {
    try {
      const startOfId = MessageUtils.SPOTIFY_LINK_START.length;
      const endOfId = link.indexOf('?');
      if (startOfId > 0 && endOfId > 0) {
        return link.substring(startOfId, endOfId);
      }
    } catch (e) {
      console.error(`Unable to parse trackId ${e}`);
    }
    return null;
  }
}
