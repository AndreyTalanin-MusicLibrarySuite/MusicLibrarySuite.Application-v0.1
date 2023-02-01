import { ReleaseTrack } from "../api/ApplicationClient";

export const getReleaseTrackKey = (releaseTrack: ReleaseTrack) => {
  return `${releaseTrack.trackNumber}-${releaseTrack.mediaNumber}-${releaseTrack.releaseId}`;
};

export const getReleaseTrackKeyByComponents = (trackNumber: number, mediaNumber: number, releaseId: string) => {
  return `${trackNumber}-${mediaNumber}-${releaseId}`;
};

export const formatReleaseTrackNumber = (number: number, totalCount: number | undefined) => {
  return number.toLocaleString(undefined, { minimumIntegerDigits: totalCount !== undefined && totalCount > 99 ? 3 : 2 });
};
