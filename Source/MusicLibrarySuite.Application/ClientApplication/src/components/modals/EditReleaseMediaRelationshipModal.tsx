import { Form, Input, Modal } from "antd";
import { useCallback, useEffect } from "react";
import {
  mapReleaseMediaRelationshipModalFormInitialValues,
  mergeReleaseMediaRelationshipModalFormValues,
} from "../../entities/forms/ReleaseMediaRelationshipModalFormValues";
import { MaxReleaseMediaNumber, MinReleaseMediaNumber } from "../../helpers/ApplicationConstants";
import { validateReleaseMediaNumber } from "../../helpers/ReleaseMediaHelpers";
import useEntityForm from "../../hooks/useEntityForm";
import EntitySelect from "../inputs/EntitySelect";
import "antd/dist/antd.min.css";

export interface DependentEntity {
  id: string;
  displayName: string;
}

export interface ReleaseMediaRelationship {
  mediaNumber: number;
  name: string;
  description?: string;
  dependentEntityId: string;
}

export interface EditReleaseMediaRelationshipModalProps {
  title: string;
  dependentEntityName: string;
  dependentEntityOptions: DependentEntity[];
  open?: boolean;
  releaseMediaRelationship?: ReleaseMediaRelationship;
  onOk: (releaseMediaRelationship: ReleaseMediaRelationship, resetFormFields: () => void) => void;
  onCancel: () => void;
  onSearchDependentEntityOptions: (displayNameFilter?: string) => void;
}

const EditReleaseMediaRelationshipModal = ({
  title,
  dependentEntityName,
  dependentEntityOptions,
  open,
  releaseMediaRelationship,
  onOk: onModalOk,
  onCancel: onModalCancel,
  onSearchDependentEntityOptions,
}: EditReleaseMediaRelationshipModalProps) => {
  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(releaseMediaRelationship, mapReleaseMediaRelationshipModalFormInitialValues, mergeReleaseMediaRelationshipModalFormValues, onModalOk),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [releaseMediaRelationship, form]);

  const onOk = useCallback(() => {
    form.submit();
  }, [form]);

  const onCancel = useCallback(() => {
    onModalCancel();
    form.resetFields();
  }, [onModalCancel, form]);

  return (
    <Modal forceRender open={open} title={title} onOk={onOk} onCancel={onCancel}>
      <Form
        form={form}
        initialValues={initialFormValues}
        onFinish={onFormFinish}
        onFinishFailed={onFormFinishFailed}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="Media Number"
          name="mediaNumber"
          rules={[
            {
              required: true,
              message: "The 'Media Number' property must not be empty.",
            },
            {
              validator: (_, value: string) => validateReleaseMediaNumber(value),
              message: `The 'Media Number' property must be a number in range [${MinReleaseMediaNumber} - ${MaxReleaseMediaNumber - 1}].`,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: "The 'Name' property must not be empty." },
            { max: 256, message: "The 'Name' property must be shorter than 256 characters." },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              max: 2048,
              message: "The 'Description' property must be shorter than 2048 characters.",
            },
          ]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label={dependentEntityName}
          name="dependentEntityId"
          rules={[
            {
              required: true,
              message: `The '${dependentEntityName}' property must not be empty.`,
            },
          ]}
        >
          <EntitySelect
            options={dependentEntityOptions.map((dependentEntity) => ({ value: dependentEntity.id, label: dependentEntity.displayName }))}
            onSearch={onSearchDependentEntityOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditReleaseMediaRelationshipModal;
