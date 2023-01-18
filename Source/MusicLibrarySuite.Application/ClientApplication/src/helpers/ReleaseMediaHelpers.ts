import { ReleaseMedia } from "../api/ApplicationClient";

export const getReleaseMediaKey = (releaseMedia: ReleaseMedia) => {
  return `${releaseMedia.mediaNumber}-${releaseMedia.releaseId}`;
};

export const formatReleaseMediaNumber = (number: number, totalCount: number | undefined) => {
  return number.toLocaleString(undefined, { minimumIntegerDigits: totalCount !== undefined && totalCount > 99 ? 3 : 2 });
};
