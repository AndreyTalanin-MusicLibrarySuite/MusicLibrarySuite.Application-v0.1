import { IReleaseGroup, ReleaseGroup } from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../constants/applicationConstants";

export default interface ReleaseGroupFormValues {
  id?: string;
  title: string;
  description?: string;
  disambiguationText?: string;
  enabled: boolean;
  createdOn?: string;
  updatedOn?: string;
}

export function mapReleaseGroupFormInitialValues(initialValues?: IReleaseGroup): ReleaseGroupFormValues | undefined {
  const initialFormValues: ReleaseGroupFormValues | undefined = initialValues
    ? {
        id: initialValues.id,
        title: initialValues.title,
        description: initialValues.description,
        disambiguationText: initialValues.disambiguationText,
        enabled: initialValues.enabled,
        createdOn: initialValues.createdOn?.toLocaleString(),
        updatedOn: initialValues.updatedOn?.toLocaleString(),
      }
    : undefined;

  return initialFormValues;
}

export function mergeReleaseGroupFormValues(formValues: ReleaseGroupFormValues, initialValues?: IReleaseGroup): ReleaseGroup {
  const id = formValues.id?.trim() ?? EmptyGuidString;

  const updatedValues: IReleaseGroup = {
    id: id,
    title: formValues.title.trim(),
    description: formValues.description?.trim(),
    disambiguationText: formValues.disambiguationText?.trim(),
    enabled: formValues.enabled,

    releaseGroupRelationships: [],
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }
  if (!updatedValues.disambiguationText && updatedValues.disambiguationText !== undefined) {
    updatedValues.disambiguationText = undefined;
  }

  if (initialValues) {
    updatedValues.id = initialValues.id;

    updatedValues.releaseGroupRelationships = initialValues.releaseGroupRelationships;
  }

  return new ReleaseGroup(updatedValues);
}
