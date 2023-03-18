import { ReleaseMediaRelationship } from "../../components/modals/EditReleaseMediaRelationshipModal";

export default interface ReleaseMediaRelationshipModalFormValues {
  mediaNumber: string;
  name: string;
  description?: string;
  dependentEntityId: string;
}

export function mapReleaseMediaRelationshipModalFormInitialValues(
  initialValues?: ReleaseMediaRelationship
): ReleaseMediaRelationshipModalFormValues | undefined {
  const initialFormValues: ReleaseMediaRelationshipModalFormValues | undefined = initialValues
    ? {
        mediaNumber: initialValues.mediaNumber.toString(),
        name: initialValues.name,
        description: initialValues.description,
        dependentEntityId: initialValues.dependentEntityId,
      }
    : undefined;

  return initialFormValues;
}

export function mergeReleaseMediaRelationshipModalFormValues(
  formValues: ReleaseMediaRelationshipModalFormValues,
  _initialValues?: ReleaseMediaRelationship
): ReleaseMediaRelationship {
  const mediaNumber = parseInt(formValues.mediaNumber);

  const updatedValues: ReleaseMediaRelationship = {
    mediaNumber: mediaNumber,
    name: formValues.name.trim(),
    description: formValues.description?.trim(),
    dependentEntityId: formValues.dependentEntityId.trim(),
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }

  return updatedValues;
}
