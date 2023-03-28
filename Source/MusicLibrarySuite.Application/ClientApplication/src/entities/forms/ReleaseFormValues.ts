import dayjs, { Dayjs } from "dayjs";
import { IRelease, Release, ReleaseArtist, ReleaseComposer, ReleaseFeaturedArtist, ReleaseGenre, ReleasePerformer } from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../helpers/ApplicationConstants";
import { getStartOfDayDate } from "../../helpers/DateTimeHelpers";

export default interface ReleaseFormValues {
  id?: string;
  title: string;
  description?: string;
  disambiguationText?: string;
  barcode?: string;
  catalogNumber?: string;
  mediaFormat?: string;
  publishFormat?: string;
  releasedOn: Dayjs;
  releasedOnYearOnly: boolean;
  enabled: boolean;
  createdOn?: string;
  updatedOn?: string;
  releaseArtistIds?: string[];
  releaseFeaturedArtistIds?: string[];
  releasePerformerIds?: string[];
  releaseComposerIds?: string[];
  releaseGenreIds?: string[];
}

export function mapReleaseFormInitialValues(initialValues?: IRelease): ReleaseFormValues | undefined {
  const initialFormValues: ReleaseFormValues | undefined = initialValues
    ? {
        id: initialValues.id,
        title: initialValues.title,
        description: initialValues.description,
        disambiguationText: initialValues.disambiguationText,
        barcode: initialValues.barcode,
        catalogNumber: initialValues.catalogNumber,
        mediaFormat: initialValues.mediaFormat,
        publishFormat: initialValues.publishFormat,
        releasedOn: dayjs(initialValues.releasedOn),
        releasedOnYearOnly: initialValues.releasedOnYearOnly,
        enabled: initialValues.enabled,
        createdOn: initialValues.createdOn?.toLocaleString(),
        updatedOn: initialValues.updatedOn?.toLocaleString(),
        releaseArtistIds: initialValues.releaseArtists.map((releaseArtist) => releaseArtist.artistId),
        releaseFeaturedArtistIds: initialValues.releaseFeaturedArtists.map((releaseFeaturedArtist) => releaseFeaturedArtist.artistId),
        releasePerformerIds: initialValues.releasePerformers.map((releasePerformer) => releasePerformer.artistId),
        releaseComposerIds: initialValues.releaseComposers.map((releaseComposer) => releaseComposer.artistId),
        releaseGenreIds: initialValues.releaseGenres.map((releaseGenre) => releaseGenre.genreId),
      }
    : undefined;

  return initialFormValues;
}

export function mergeReleaseFormValues(formValues: ReleaseFormValues, initialValues?: IRelease): Release {
  const id = formValues.id?.trim() ?? EmptyGuidString;

  const releasedOn = getStartOfDayDate(formValues.releasedOn);

  const releaseArtists =
    formValues.releaseArtistIds?.map(
      (releaseId) =>
        new ReleaseArtist({
          releaseId: id,
          artistId: releaseId,
        })
    ) ?? [];
  const releaseFeaturedArtists =
    formValues.releaseFeaturedArtistIds?.map(
      (releaseId) =>
        new ReleaseFeaturedArtist({
          releaseId: id,
          artistId: releaseId,
        })
    ) ?? [];
  const releasePerformers =
    formValues.releasePerformerIds?.map(
      (releaseId) =>
        new ReleasePerformer({
          releaseId: id,
          artistId: releaseId,
        })
    ) ?? [];
  const releaseComposers =
    formValues.releaseComposerIds?.map(
      (artistId) =>
        new ReleaseComposer({
          releaseId: id,
          artistId: artistId,
        })
    ) ?? [];
  const releaseGenres =
    formValues.releaseGenreIds?.map(
      (genreId) =>
        new ReleaseGenre({
          releaseId: id,
          genreId: genreId,
        })
    ) ?? [];

  const updatedValues: IRelease = {
    id: id,
    title: formValues.title.trim(),
    description: formValues.description?.trim(),
    disambiguationText: formValues.disambiguationText?.trim(),
    barcode: formValues.barcode?.trim(),
    catalogNumber: formValues.catalogNumber?.trim(),
    mediaFormat: formValues.mediaFormat?.trim(),
    publishFormat: formValues.publishFormat?.trim(),
    releasedOn: releasedOn,
    releasedOnYearOnly: formValues.releasedOnYearOnly,
    enabled: formValues.enabled,

    releaseRelationships: [],
    releaseToProductRelationships: [],
    releaseToReleaseGroupRelationships: [],

    releaseMediaCollection: [],

    releaseArtists: releaseArtists,
    releaseFeaturedArtists: releaseFeaturedArtists,
    releasePerformers: releasePerformers,
    releaseComposers: releaseComposers,
    releaseGenres: releaseGenres,
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }
  if (!updatedValues.disambiguationText && updatedValues.disambiguationText !== undefined) {
    updatedValues.disambiguationText = undefined;
  }
  if (!updatedValues.barcode && updatedValues.barcode !== undefined) {
    updatedValues.barcode = undefined;
  }
  if (!updatedValues.catalogNumber && updatedValues.catalogNumber !== undefined) {
    updatedValues.catalogNumber = undefined;
  }
  if (!updatedValues.mediaFormat && updatedValues.mediaFormat !== undefined) {
    updatedValues.mediaFormat = undefined;
  }
  if (!updatedValues.publishFormat && updatedValues.publishFormat !== undefined) {
    updatedValues.publishFormat = undefined;
  }

  if (initialValues) {
    updatedValues.id = initialValues.id;

    updatedValues.releaseRelationships = initialValues.releaseRelationships;
    updatedValues.releaseToProductRelationships = initialValues.releaseToProductRelationships;
    updatedValues.releaseToReleaseGroupRelationships = initialValues.releaseToReleaseGroupRelationships;

    updatedValues.releaseMediaCollection = initialValues.releaseMediaCollection;
  }

  return new Release(updatedValues);
}
