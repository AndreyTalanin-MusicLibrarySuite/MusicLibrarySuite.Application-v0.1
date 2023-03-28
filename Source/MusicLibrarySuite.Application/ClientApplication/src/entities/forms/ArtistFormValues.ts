import { Artist, ArtistGenre, IArtist } from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../helpers/ApplicationConstants";

export default interface ArtistFormValues {
  id?: string;
  name: string;
  description?: string;
  disambiguationText?: string;
  systemEntity: boolean;
  enabled: boolean;
  createdOn?: string;
  updatedOn?: string;
  artistGenreIds?: string[];
}

export function mapArtistFormInitialValues(initialValues?: IArtist): ArtistFormValues | undefined {
  const initialFormValues: ArtistFormValues | undefined = initialValues
    ? {
        id: initialValues.id,
        name: initialValues.name,
        description: initialValues.description,
        disambiguationText: initialValues.disambiguationText,
        systemEntity: initialValues.systemEntity,
        enabled: initialValues.enabled,
        createdOn: initialValues.createdOn?.toLocaleString(),
        updatedOn: initialValues.updatedOn?.toLocaleString(),
        artistGenreIds: initialValues.artistGenres.map((artistGenre) => artistGenre.genreId),
      }
    : undefined;

  return initialFormValues;
}

export function mergeArtistFormValues(formValues: ArtistFormValues, initialValues?: IArtist): Artist {
  const id = formValues.id?.trim() ?? EmptyGuidString;

  const artistGenres =
    formValues.artistGenreIds?.map(
      (genreId) =>
        new ArtistGenre({
          artistId: id,
          genreId: genreId,
        })
    ) ?? [];

  const updatedValues: IArtist = {
    id: id,
    name: formValues.name.trim(),
    description: formValues.description?.trim(),
    disambiguationText: formValues.disambiguationText?.trim(),
    systemEntity: formValues.systemEntity,
    enabled: formValues.enabled,

    artistRelationships: [],

    artistGenres: artistGenres,
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }
  if (!updatedValues.disambiguationText && updatedValues.disambiguationText !== undefined) {
    updatedValues.disambiguationText = undefined;
  }

  if (initialValues) {
    updatedValues.id = initialValues.id;

    updatedValues.artistRelationships = initialValues.artistRelationships;
  }

  return new Artist(updatedValues);
}
