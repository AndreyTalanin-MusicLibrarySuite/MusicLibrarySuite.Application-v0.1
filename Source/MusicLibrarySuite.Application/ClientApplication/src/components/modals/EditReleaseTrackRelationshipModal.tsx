import { Form, Input, Modal } from "antd";
import { useCallback, useEffect } from "react";
import { MaxReleaseMediaNumber, MaxReleaseTrackNumber, MinReleaseMediaNumber, MinReleaseTrackNumber } from "../../constants/applicationConstants";
import {
  mapReleaseTrackRelationshipModalFormInitialValues,
  mergeReleaseTrackRelationshipModalFormValues,
} from "../../entities/forms/ReleaseTrackRelationshipModalFormValues";
import { validateReleaseMediaNumber } from "../../helpers/releaseMediaHelpers";
import { validateReleaseTrackNumber } from "../../helpers/releaseTrackHelpers";
import useEntityForm from "../../hooks/useEntityForm";
import EntitySelect from "../inputs/EntitySelect";
import "antd/dist/antd.min.css";

export interface DependentEntity {
  id: string;
  displayName: string;
}

export interface ReleaseTrackRelationship {
  trackNumber: number;
  mediaNumber: number;
  name: string;
  description?: string;
  dependentEntityId: string;
}

export interface EditReleaseTrackRelationshipModalProps {
  title: string;
  dependentEntityName: string;
  dependentEntityOptions: DependentEntity[];
  open?: boolean;
  releaseTrackRelationship?: ReleaseTrackRelationship;
  onOk: (releaseTrackRelationship: ReleaseTrackRelationship, resetFormFields: () => void) => void;
  onCancel: () => void;
  onSearchDependentEntityOptions: (displayNameFilter?: string) => void;
}

const EditReleaseTrackRelationshipModal = ({
  title,
  dependentEntityName,
  dependentEntityOptions,
  open,
  releaseTrackRelationship,
  onOk: onModalOk,
  onCancel: onModalCancel,
  onSearchDependentEntityOptions,
}: EditReleaseTrackRelationshipModalProps) => {
  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(releaseTrackRelationship, mapReleaseTrackRelationshipModalFormInitialValues, mergeReleaseTrackRelationshipModalFormValues, onModalOk),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [releaseTrackRelationship, form]);

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
          label="Track Number"
          name="trackNumber"
          rules={[
            {
              required: true,
              message: "The 'Track Number' property must not be empty.",
            },
            {
              validator: (_, value: string) => validateReleaseTrackNumber(value),
              message: `The 'Track Number' property must be a number in range [${MinReleaseTrackNumber} - ${MaxReleaseTrackNumber - 1}].`,
            },
          ]}
        >
          <Input />
        </Form.Item>
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

export default EditReleaseTrackRelationshipModal;
