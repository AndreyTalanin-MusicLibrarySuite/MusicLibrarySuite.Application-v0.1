import { Genre, IGenre } from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../constants/applicationConstants";

export default interface GenreFormValues {
  id?: string;
  name: string;
  description?: string;
  systemEntity: boolean;
  enabled: boolean;
  createdOn?: string;
  updatedOn?: string;
}

export function mapGenreFormInitialValues(initialValues?: IGenre): GenreFormValues | undefined {
  const initialFormValues: GenreFormValues | undefined = initialValues
    ? {
        id: initialValues.id,
        name: initialValues.name,
        description: initialValues.description,
        systemEntity: initialValues.systemEntity,
        enabled: initialValues.enabled,
        createdOn: initialValues.createdOn?.toLocaleString(),
        updatedOn: initialValues.updatedOn?.toLocaleString(),
      }
    : undefined;

  return initialFormValues;
}

export function mergeGenreFormValues(formValues: GenreFormValues, initialValues?: IGenre): Genre {
  const id = formValues.id?.trim() ?? EmptyGuidString;

  const updatedValues: IGenre = {
    id: id,
    name: formValues.name.trim(),
    description: formValues.description?.trim(),
    systemEntity: formValues.systemEntity,
    enabled: formValues.enabled,

    genreRelationships: [],
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }

  if (initialValues) {
    updatedValues.id = initialValues.id;

    updatedValues.genreRelationships = initialValues.genreRelationships;
  }

  return new Genre(updatedValues);
}
