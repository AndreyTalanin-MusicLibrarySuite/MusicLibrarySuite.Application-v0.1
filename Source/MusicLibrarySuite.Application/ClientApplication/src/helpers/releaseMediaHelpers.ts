import { ReleaseMedia } from "../api/ApplicationClient";
import { MaxReleaseMediaNumber, MinReleaseMediaNumber } from "../constants/applicationConstants";
import { ReleaseMediaNumberPattern } from "../constants/regularExpressionConstants";

export const getReleaseMediaKey = (releaseMedia: ReleaseMedia) => {
  return `${releaseMedia.mediaNumber}-${releaseMedia.releaseId}`;
};

export const getReleaseMediaKeyByComponents = (mediaNumber: number, releaseId: string) => {
  return `${mediaNumber}-${releaseId}`;
};

export const formatReleaseMediaNumber = (number: number, totalCount?: number) => {
  const minimumIntegerDigits = totalCount !== undefined ? (totalCount < 100 ? (totalCount < 10 ? 1 : 2) : 3) : undefined;
  return number.toLocaleString(undefined, { minimumIntegerDigits });
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
