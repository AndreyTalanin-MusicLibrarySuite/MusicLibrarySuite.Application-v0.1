import { ReleaseMedia } from "../api/ApplicationClient";
import { MaxReleaseMediaNumber, MinReleaseMediaNumber } from "./ApplicationConstants";
import { ReleaseMediaNumberPattern } from "./RegularExpressionConstants";

export const getReleaseMediaKey = (releaseMedia: ReleaseMedia) => {
  return `${releaseMedia.mediaNumber}-${releaseMedia.releaseId}`;
};

export const getReleaseMediaKeyByComponents = (mediaNumber: number, releaseId: string) => {
  return `${mediaNumber}-${releaseId}`;
};

export const formatReleaseMediaNumber = (number: number, totalCount: number | undefined) => {
  return number.toLocaleString(undefined, { minimumIntegerDigits: totalCount !== undefined && totalCount > 99 ? 3 : 2 });
};

export const validateReleaseMediaNumber = (value: string) => {
  if (!value.match(ReleaseMediaNumberPattern)) {
    return Promise.reject();
  } else {
    const mediaNumber = parseInt(value);
    if (mediaNumber < MinReleaseMediaNumber || mediaNumber >= MaxReleaseMediaNumber) {
      return Promise.reject();
    } else {
      return Promise.resolve();
    }
  }
};
