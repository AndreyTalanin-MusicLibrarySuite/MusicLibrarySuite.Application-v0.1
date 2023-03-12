import { IReleaseMedia, ReleaseMedia } from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../helpers/ApplicationConstants";

export default interface ReleaseMediaModalFormValues {
  mediaNumber: string;
  title: string;
  description?: string;
  disambiguationText?: string;
  catalogNumber?: string;
  mediaFormat?: string;
  tableOfContentsChecksum?: string;
  tableOfContentsChecksumLong?: string;
}

export function mapReleaseMediaModalFormInitialValues(initialValues?: ReleaseMedia): ReleaseMediaModalFormValues | undefined {
  const initialFormValues: ReleaseMediaModalFormValues | undefined = initialValues
    ? {
        mediaNumber: initialValues.mediaNumber.toString(),
        title: initialValues.title,
        description: initialValues.description,
        disambiguationText: initialValues.disambiguationText,
        catalogNumber: initialValues.catalogNumber,
        mediaFormat: initialValues.mediaFormat,
        tableOfContentsChecksum: initialValues.tableOfContentsChecksum,
        tableOfContentsChecksumLong: initialValues.tableOfContentsChecksumLong,
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
    catalogNumber: formValues.catalogNumber?.trim(),
    mediaFormat: formValues.mediaFormat?.trim(),
    tableOfContentsChecksum: formValues.tableOfContentsChecksum?.trim(),
    tableOfContentsChecksumLong: formValues.tableOfContentsChecksumLong?.trim(),

    releaseMediaToProductRelationships: [],

    releaseTrackCollection: [],
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }
  if (!updatedValues.disambiguationText && updatedValues.disambiguationText !== undefined) {
    updatedValues.disambiguationText = undefined;
  }
  if (!updatedValues.catalogNumber && updatedValues.catalogNumber !== undefined) {
    updatedValues.catalogNumber = undefined;
  }
  if (!updatedValues.mediaFormat && updatedValues.mediaFormat !== undefined) {
    updatedValues.mediaFormat = undefined;
  }
  if (!updatedValues.tableOfContentsChecksum && updatedValues.tableOfContentsChecksum !== undefined) {
    updatedValues.tableOfContentsChecksum = undefined;
  }
  if (!updatedValues.tableOfContentsChecksumLong && updatedValues.tableOfContentsChecksumLong !== undefined) {
    updatedValues.tableOfContentsChecksumLong = undefined;
  }

  if (initialValues) {
    updatedValues.releaseId = initialValues.releaseId;

    updatedValues.releaseMediaToProductRelationships = initialValues.releaseMediaToProductRelationships;

    updatedValues.releaseTrackCollection = initialValues.releaseTrackCollection;
  }

  return new ReleaseMedia(updatedValues);
}
