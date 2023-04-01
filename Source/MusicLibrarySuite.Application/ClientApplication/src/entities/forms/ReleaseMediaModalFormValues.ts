import { IReleaseMedia, ReleaseMedia } from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../constants/applicationConstants";

export default interface ReleaseMediaModalFormValues {
  mediaNumber: string;
  title: string;
  description?: string;
  disambiguationText?: string;
  mediaFormat?: string;
  catalogNumber?: string;
  freeDbChecksum?: string;
  musicBrainzChecksum?: string;
}

export function mapReleaseMediaModalFormInitialValues(initialValues?: ReleaseMedia): ReleaseMediaModalFormValues | undefined {
  const initialFormValues: ReleaseMediaModalFormValues | undefined = initialValues
    ? {
        mediaNumber: initialValues.mediaNumber.toString(),
        title: initialValues.title,
        description: initialValues.description,
        disambiguationText: initialValues.disambiguationText,
        mediaFormat: initialValues.mediaFormat,
        catalogNumber: initialValues.catalogNumber,
        freeDbChecksum: initialValues.freeDbChecksum,
        musicBrainzChecksum: initialValues.musicBrainzChecksum,
      }
    : undefined;

  return initialFormValues;
}

export function mergeReleaseMediaModalFormValues(formValues: ReleaseMediaModalFormValues, initialValues?: ReleaseMedia): ReleaseMedia {
  const mediaNumber = parseInt(formValues.mediaNumber);

  const updatedValues: IReleaseMedia = {
    mediaNumber: mediaNumber,
    releaseId: EmptyGuidString,
    title: formValues.title.trim(),
    description: formValues.description?.trim(),
    disambiguationText: formValues.disambiguationText?.trim(),
    mediaFormat: formValues.mediaFormat?.trim(),
    catalogNumber: formValues.catalogNumber?.trim(),
    freeDbChecksum: formValues.freeDbChecksum?.trim(),
    musicBrainzChecksum: formValues.musicBrainzChecksum?.trim(),

    releaseMediaToProductRelationships: [],

    releaseTrackCollection: [],
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }
  if (!updatedValues.disambiguationText && updatedValues.disambiguationText !== undefined) {
    updatedValues.disambiguationText = undefined;
  }
  if (!updatedValues.mediaFormat && updatedValues.mediaFormat !== undefined) {
    updatedValues.mediaFormat = undefined;
  }
  if (!updatedValues.catalogNumber && updatedValues.catalogNumber !== undefined) {
    updatedValues.catalogNumber = undefined;
  }
  if (!updatedValues.freeDbChecksum && updatedValues.freeDbChecksum !== undefined) {
    updatedValues.freeDbChecksum = undefined;
  }
  if (!updatedValues.musicBrainzChecksum && updatedValues.musicBrainzChecksum !== undefined) {
    updatedValues.musicBrainzChecksum = undefined;
  }

  if (initialValues) {
    updatedValues.releaseId = initialValues.releaseId;

    updatedValues.releaseMediaToProductRelationships = initialValues.releaseMediaToProductRelationships;

    updatedValues.releaseTrackCollection = initialValues.releaseTrackCollection;
  }

  return new ReleaseMedia(updatedValues);
}
