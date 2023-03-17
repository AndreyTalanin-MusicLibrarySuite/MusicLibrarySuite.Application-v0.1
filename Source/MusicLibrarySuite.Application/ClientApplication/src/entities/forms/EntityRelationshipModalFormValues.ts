import { EntityRelationship } from "../../components/modals/CreateEntityRelationshipModal";

export default interface EntityRelationshipModalFormValues {
  name: string;
  description?: string;
  dependentEntityId: string;
}

export function mapEntityRelationshipModalFormInitialValues(initialValues?: EntityRelationship): EntityRelationshipModalFormValues | undefined {
  const initialFormValues: EntityRelationshipModalFormValues | undefined = initialValues
    ? {
        name: initialValues.name,
        description: initialValues.description,
        dependentEntityId: initialValues.dependentEntityId,
      }
    : undefined;

  return initialFormValues;
}

export function mergeEntityRelationshipModalFormValues(formValues: EntityRelationshipModalFormValues, _initialValues?: EntityRelationship): EntityRelationship {
  const updatedValues: EntityRelationship = {
    name: formValues.name.trim(),
    description: formValues.description?.trim(),
    dependentEntityId: formValues.dependentEntityId.trim(),
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }

  return updatedValues;
}
