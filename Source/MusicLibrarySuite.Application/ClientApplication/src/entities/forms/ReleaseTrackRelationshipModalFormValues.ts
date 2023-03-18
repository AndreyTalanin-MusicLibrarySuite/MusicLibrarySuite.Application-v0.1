import { ReleaseTrackRelationship } from "../../components/modals/CreateReleaseTrackRelationshipModal";

export default interface ReleaseTrackRelationshipModalFormValues {
  trackNumber: string;
  mediaNumber: string;
  name: string;
  description?: string;
  dependentEntityId: string;
}

export function mapReleaseTrackRelationshipModalFormInitialValues(
  initialValues?: ReleaseTrackRelationship
): ReleaseTrackRelationshipModalFormValues | undefined {
  const initialFormValues: ReleaseTrackRelationshipModalFormValues | undefined = initialValues
    ? {
        trackNumber: initialValues.trackNumber.toString(),
        mediaNumber: initialValues.mediaNumber.toString(),
        name: initialValues.name,
        description: initialValues.description,
        dependentEntityId: initialValues.dependentEntityId,
      }
    : undefined;

  return initialFormValues;
}

export function mergeReleaseTrackRelationshipModalFormValues(
  formValues: ReleaseTrackRelationshipModalFormValues,
  _initialValues?: ReleaseTrackRelationship
): ReleaseTrackRelationship {
  const trackNumber = parseInt(formValues.trackNumber);
  const mediaNumber = parseInt(formValues.mediaNumber);

  const updatedValues: ReleaseTrackRelationship = {
    trackNumber: trackNumber,
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
