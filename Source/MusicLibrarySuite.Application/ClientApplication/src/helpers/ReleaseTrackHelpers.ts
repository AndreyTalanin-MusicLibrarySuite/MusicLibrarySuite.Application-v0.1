import { ReleaseTrack } from "../api/ApplicationClient";
import { MaxReleaseTrackNumber, MinReleaseTrackNumber } from "./ApplicationConstants";
import { ReleaseTrackNumberPattern } from "./RegularExpressionConstants";

export const getReleaseTrackKey = (releaseTrack: ReleaseTrack) => {
  return `${releaseTrack.trackNumber}-${releaseTrack.mediaNumber}-${releaseTrack.releaseId}`;
};

export const getReleaseTrackKeyByComponents = (trackNumber: number, mediaNumber: number, releaseId: string) => {
  return `${trackNumber}-${mediaNumber}-${releaseId}`;
};

export const formatReleaseTrackNumber = (number: number, totalCount: number | undefined) => {
  return number.toLocaleString(undefined, { minimumIntegerDigits: totalCount !== undefined && totalCount > 99 ? 3 : 2 });
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
