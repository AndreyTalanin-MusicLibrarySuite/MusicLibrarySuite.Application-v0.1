import dayjs, { Dayjs } from "dayjs";
import { IWork, Work, WorkArtist, WorkComposer, WorkFeaturedArtist, WorkGenre, WorkPerformer } from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../constants/applicationConstants";
import { getStartOfDayDate } from "../../helpers/dateTimeHelpers";

export default interface WorkFormValues {
  id?: string;
  title: string;
  description?: string;
  disambiguationText?: string;
  internationalStandardMusicalWorkCode?: string;
  releasedOn: Dayjs;
  releasedOnYearOnly: boolean;
  systemEntity: boolean;
  enabled: boolean;
  createdOn?: string;
  updatedOn?: string;
  workArtistIds?: string[];
  workFeaturedArtistIds?: string[];
  workPerformerIds?: string[];
  workComposerIds?: string[];
  workGenreIds?: string[];
}

export function mapWorkFormInitialValues(initialValues?: IWork): WorkFormValues | undefined {
  const initialFormValues: WorkFormValues | undefined = initialValues
    ? {
        id: initialValues.id,
        title: initialValues.title,
        description: initialValues.description,
        disambiguationText: initialValues.disambiguationText,
        internationalStandardMusicalWorkCode: initialValues.internationalStandardMusicalWorkCode,
        releasedOn: dayjs(initialValues.releasedOn),
        releasedOnYearOnly: initialValues.releasedOnYearOnly,
        systemEntity: initialValues.systemEntity,
        enabled: initialValues.enabled,
        createdOn: initialValues.createdOn?.toLocaleString(),
        updatedOn: initialValues.updatedOn?.toLocaleString(),
        workArtistIds: initialValues.workArtists.map((workArtist) => workArtist.artistId),
        workFeaturedArtistIds: initialValues.workFeaturedArtists.map((workFeaturedArtist) => workFeaturedArtist.artistId),
        workPerformerIds: initialValues.workPerformers.map((workPerformer) => workPerformer.artistId),
        workComposerIds: initialValues.workComposers.map((workComposer) => workComposer.artistId),
        workGenreIds: initialValues.workGenres.map((workGenre) => workGenre.genreId),
      }
    : undefined;

  return initialFormValues;
}

export function mergeWorkFormValues(formValues: WorkFormValues, initialValues?: IWork): Work {
  const id = formValues.id?.trim() ?? EmptyGuidString;

  const releasedOn = getStartOfDayDate(formValues.releasedOn);

  const workArtists =
    formValues.workArtistIds?.map(
      (artistId) =>
        new WorkArtist({
          workId: id,
          artistId: artistId,
        })
    ) ?? [];
  const workFeaturedArtists =
    formValues.workFeaturedArtistIds?.map(
      (artistId) =>
        new WorkFeaturedArtist({
          workId: id,
          artistId: artistId,
        })
    ) ?? [];
  const workPerformers =
    formValues.workPerformerIds?.map(
      (artistId) =>
        new WorkPerformer({
          workId: id,
          artistId: artistId,
        })
    ) ?? [];
  const workComposers =
    formValues.workComposerIds?.map(
      (artistId) =>
        new WorkComposer({
          workId: id,
          artistId: artistId,
        })
    ) ?? [];
  const workGenres =
    formValues.workGenreIds?.map(
      (genreId) =>
        new WorkGenre({
          workId: id,
          genreId: genreId,
        })
    ) ?? [];

  const updatedValues: IWork = {
    id: id,
    title: formValues.title.trim(),
    description: formValues.description?.trim(),
    disambiguationText: formValues.disambiguationText?.trim(),
    internationalStandardMusicalWorkCode: formValues.internationalStandardMusicalWorkCode?.trim(),
    releasedOn: releasedOn,
    releasedOnYearOnly: formValues.releasedOnYearOnly,
    systemEntity: formValues.systemEntity,
    enabled: formValues.enabled,

    workRelationships: [],
    workToProductRelationships: [],

    workArtists: workArtists,
    workFeaturedArtists: workFeaturedArtists,
    workPerformers: workPerformers,
    workComposers: workComposers,
    workGenres: workGenres,
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }
  if (!updatedValues.disambiguationText && updatedValues.disambiguationText !== undefined) {
    updatedValues.disambiguationText = undefined;
  }
  if (!updatedValues.internationalStandardMusicalWorkCode && updatedValues.internationalStandardMusicalWorkCode !== undefined) {
    updatedValues.internationalStandardMusicalWorkCode = undefined;
  }

  if (initialValues) {
    updatedValues.id = initialValues.id;

    updatedValues.workRelationships = initialValues.workRelationships;
    updatedValues.workToProductRelationships = initialValues.workToProductRelationships;
  }

  return new Work(updatedValues);
}
