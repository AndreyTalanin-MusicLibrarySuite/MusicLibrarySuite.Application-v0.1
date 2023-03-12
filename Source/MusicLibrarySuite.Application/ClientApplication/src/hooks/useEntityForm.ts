import { Form, FormInstance } from "antd";
import { useCallback, useMemo } from "react";

export default function useEntityForm<Entity, EntityFormValues>(
  initialValues: Entity | undefined,
  mapInitialValues: (initialValues?: Entity) => EntityFormValues | undefined,
  mergeFormValues: (formValues: EntityFormValues, initialValues?: Entity) => Entity,
  onFinish: (values: Entity, resetFormFields: () => void) => void
): [FormInstance<EntityFormValues>, EntityFormValues | undefined, (formValues: EntityFormValues) => void] {
  const [form] = Form.useForm<EntityFormValues>();

  const initialFormValues = useMemo(() => mapInitialValues(initialValues), [initialValues, mapInitialValues]);

  const onFormFinish = useCallback(
    (formValues: EntityFormValues) => {
      const updatedValues = mergeFormValues(formValues, initialValues);
      onFinish(updatedValues, () => form.resetFields());
    },
    [initialValues, mergeFormValues, onFinish, form]
  );

  return [form, initialFormValues, onFormFinish];
}
