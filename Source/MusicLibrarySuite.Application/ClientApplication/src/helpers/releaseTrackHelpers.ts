import { ReleaseTrack } from "../api/ApplicationClient";
import { MaxReleaseTrackNumber, MinReleaseTrackNumber } from "../constants/applicationConstants";
import { ReleaseTrackNumberPattern } from "../constants/regularExpressionConstants";

export const getReleaseTrackKey = (releaseTrack: ReleaseTrack) => {
  return `${releaseTrack.trackNumber}-${releaseTrack.mediaNumber}-${releaseTrack.releaseId}`;
};

export const getReleaseTrackKeyByComponents = (trackNumber: number, mediaNumber: number, releaseId: string) => {
  return `${trackNumber}-${mediaNumber}-${releaseId}`;
};

export const formatReleaseTrackNumber = (number: number, totalCount?: number) => {
  const minimumIntegerDigits = totalCount !== undefined ? (totalCount < 100 ? (totalCount < 10 ? 1 : 2) : 3) : undefined;
  return number.toLocaleString(undefined, { minimumIntegerDigits });
};

export const validateReleaseTrackNumber = (value: string) => {
  if (!value.match(ReleaseTrackNumberPattern)) {
    return Promise.reject();
  } else {
    const trackNumber = parseInt(value);
    if (trackNumber < MinReleaseTrackNumber || trackNumber >= MaxReleaseTrackNumber) {
      return Promise.reject();
    } else {
      return Promise.resolve();
    }
  }
};
