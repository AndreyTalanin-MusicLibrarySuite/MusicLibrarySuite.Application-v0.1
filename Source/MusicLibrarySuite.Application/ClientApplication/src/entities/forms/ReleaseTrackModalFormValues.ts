import {
  IReleaseTrack,
  ReleaseTrack,
  ReleaseTrackArtist,
  ReleaseTrackComposer,
  ReleaseTrackFeaturedArtist,
  ReleaseTrackGenre,
  ReleaseTrackPerformer,
} from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../helpers/ApplicationConstants";

export default interface ReleaseTrackModalFormValues {
  trackNumber: string;
  mediaNumber: string;
  title: string;
  description?: string;
  disambiguationText?: string;
  internationalStandardRecordingCode?: string;
  releaseTrackArtistIds?: string[];
  releaseTrackFeaturedArtistIds?: string[];
  releaseTrackPerformerIds?: string[];
  releaseTrackComposerIds?: string[];
  releaseTrackGenreIds?: string[];
}

export function mapReleaseTrackModalFormInitialValues(initialValues?: ReleaseTrack): ReleaseTrackModalFormValues | undefined {
  const initialFormValues: ReleaseTrackModalFormValues | undefined = initialValues
    ? {
        trackNumber: initialValues.trackNumber.toString(),
        mediaNumber: initialValues.mediaNumber.toString(),
        title: initialValues.title,
        description: initialValues.description,
        disambiguationText: initialValues.disambiguationText,
        internationalStandardRecordingCode: initialValues.internationalStandardRecordingCode,
        releaseTrackArtistIds: initialValues.releaseTrackArtists.map((releaseTrackArtist) => releaseTrackArtist.artistId),
        releaseTrackFeaturedArtistIds: initialValues.releaseTrackFeaturedArtists.map((releaseTrackFeaturedArtist) => releaseTrackFeaturedArtist.artistId),
        releaseTrackPerformerIds: initialValues.releaseTrackPerformers.map((releaseTrackPerformer) => releaseTrackPerformer.artistId),
        releaseTrackComposerIds: initialValues.releaseTrackComposers.map((releaseTrackComposer) => releaseTrackComposer.artistId),
        releaseTrackGenreIds: initialValues.releaseTrackGenres.map((releaseTrackGenre) => releaseTrackGenre.genreId),
      }
    : undefined;

  return initialFormValues;
}

export function mergeReleaseTrackModalFormValues(formValues: ReleaseTrackModalFormValues, initialValues?: ReleaseTrack): ReleaseTrack {
  const trackNumber = parseInt(formValues.trackNumber);
  const mediaNumber = parseInt(formValues.mediaNumber);

  const releaseTrackArtists =
    formValues.releaseTrackArtistIds?.map(
      (artistId) =>
        new ReleaseTrackArtist({
          trackNumber: trackNumber,
          mediaNumber: mediaNumber,
          releaseId: EmptyGuidString,
          artistId: artistId,
        })
    ) ?? [];
  const releaseTrackFeaturedArtists =
    formValues.releaseTrackFeaturedArtistIds?.map(
      (artistId) =>
        new ReleaseTrackFeaturedArtist({
          trackNumber: trackNumber,
          mediaNumber: mediaNumber,
          releaseId: EmptyGuidString,
          artistId: artistId,
        })
    ) ?? [];
  const releaseTrackPerformers =
    formValues.releaseTrackPerformerIds?.map(
      (artistId) =>
        new ReleaseTrackPerformer({
          trackNumber: trackNumber,
          mediaNumber: mediaNumber,
          releaseId: EmptyGuidString,
          artistId: artistId,
        })
    ) ?? [];
  const releaseTrackComposers =
    formValues.releaseTrackComposerIds?.map(
      (artistId) =>
        new ReleaseTrackComposer({
          trackNumber: trackNumber,
          mediaNumber: mediaNumber,
          releaseId: EmptyGuidString,
          artistId: artistId,
        })
    ) ?? [];
  const releaseTrackGenres =
    formValues.releaseTrackGenreIds?.map(
      (genreId) =>
        new ReleaseTrackGenre({
          trackNumber: trackNumber,
          mediaNumber: mediaNumber,
          releaseId: EmptyGuidString,
          genreId: genreId,
        })
    ) ?? [];

  const updatedValues: IReleaseTrack = {
    trackNumber: trackNumber,
    mediaNumber: mediaNumber,
    releaseId: EmptyGuidString,
    title: formValues.title.trim(),
    description: formValues.description?.trim(),
    disambiguationText: formValues.disambiguationText?.trim(),
    internationalStandardRecordingCode: formValues.internationalStandardRecordingCode?.trim(),

    releaseTrackToProductRelationships: [],
    releaseTrackToWorkRelationships: [],

    releaseTrackArtists: releaseTrackArtists,
    releaseTrackFeaturedArtists: releaseTrackFeaturedArtists,
    releaseTrackPerformers: releaseTrackPerformers,
    releaseTrackComposers: releaseTrackComposers,
    releaseTrackGenres: releaseTrackGenres,
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }
  if (!updatedValues.disambiguationText && updatedValues.disambiguationText !== undefined) {
    updatedValues.disambiguationText = undefined;
  }
  if (!updatedValues.internationalStandardRecordingCode && updatedValues.internationalStandardRecordingCode !== undefined) {
    updatedValues.internationalStandardRecordingCode = undefined;
  }

  if (initialValues) {
    updatedValues.releaseId = initialValues.releaseId;

    updatedValues.releaseTrackToProductRelationships = initialValues.releaseTrackToProductRelationships;
    updatedValues.releaseTrackToWorkRelationships = initialValues.releaseTrackToWorkRelationships;
  }

  return new ReleaseTrack(updatedValues);
}
