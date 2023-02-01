import { Form, Input, Modal, Select } from "antd";
import { Store } from "antd/lib/form/interface";
import { useEffect, useState } from "react";
import { EmptyGuidString } from "../../helpers/ApplicationConstants";

export interface DependentEntity {
  id: string;
  name: string;
}

export interface ReleaseTrackRelationship {
  trackNumber: number;
  mediaNumber: number;
  name: string;
  description?: string;
  dependentEntityId: string;
}

export interface CreateReleaseTrackRelationshipModalProps {
  title: string;
  dependentEntityName: string;
  dependentEntities: DependentEntity[];
  open?: boolean;
  releaseTrackRelationship?: ReleaseTrackRelationship;
  onOk: (releaseTrackRelationship: ReleaseTrackRelationship, resetFormFields: () => void) => void;
  onCancel: () => void;
  onSearchDependentEntities: (name?: string) => void;
}

const CreateReleaseTrackRelationshipModal = ({
  title,
  dependentEntityName,
  dependentEntities,
  open,
  releaseTrackRelationship,
  onOk: onModalOk,
  onCancel: onModalCancel,
  onSearchDependentEntities,
}: CreateReleaseTrackRelationshipModalProps) => {
  const [dependentEntityId, setDependentEntityId] = useState<string>(EmptyGuidString);

  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    setDependentEntityId(releaseTrackRelationship?.dependentEntityId ?? EmptyGuidString);
  }, [releaseTrackRelationship, form]);

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    onModalCancel();
    form.resetFields();
  };

  const onFinish = (releaseTrackRelationship: Store) => {
    const trackNumber = releaseTrackRelationship.trackNumber as string;
    releaseTrackRelationship.trackNumber = parseInt(trackNumber);
    const mediaNumber = releaseTrackRelationship.mediaNumber as string;
    releaseTrackRelationship.mediaNumber = parseInt(mediaNumber);

    const releaseTrackRelationshipModel = { ...(releaseTrackRelationship as ReleaseTrackRelationship), dependentEntityId };
    releaseTrackRelationshipModel.name = releaseTrackRelationshipModel.name?.trim();
    releaseTrackRelationshipModel.description = releaseTrackRelationshipModel.description?.trim();
    if (releaseTrackRelationshipModel.description !== undefined && releaseTrackRelationshipModel.description.length === 0) {
      releaseTrackRelationshipModel.description = undefined;
    }
    onModalOk(releaseTrackRelationshipModel, () => form.resetFields());
  };

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const dependentEntityFilterSort = (option: { value: string; label: string }, optionToCompare: { value: string; label: string }) => {
    return (option?.label ?? "").toUpperCase().localeCompare((optionToCompare?.label ?? "").toUpperCase());
  };

  const dependentEntityFilterOption = (name: string, option: { value: string; label: string } | undefined) => {
    return (option?.label ?? "").toUpperCase().includes(name.toUpperCase());
  };

  const onDependentEntitySearch = (name: string) => {
    onSearchDependentEntities(name);
  };

  const onDependentEntityChange = (id: string) => {
    onSearchDependentEntities();
    setDependentEntityId(id);
  };

  return (
    <Modal forceRender open={open} title={title} onOk={onOk} onCancel={onCancel}>
      <Form
        form={form}
        initialValues={releaseTrackRelationship}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="Track Number"
          name="trackNumber"
          rules={[
            { required: true, message: "The 'Track Number' property must not be empty." },
            { pattern: new RegExp(/^[0-9]+$/), message: "The 'Track Number' property must be a number." },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Media Number"
          name="mediaNumber"
          rules={[
            { required: true, message: "The 'Media Number' property must not be empty." },
            { pattern: new RegExp(/^[0-9]+$/), message: "The 'Media Number' property must be a number." },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: "The 'Name' property must not be empty." }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label={dependentEntityName}
          name="dependentEntityId"
          rules={[{ required: true, message: `The '${dependentEntityName}' property must not be empty.` }]}
        >
          <Select
            showSearch
            placeholder="Search"
            filterSort={dependentEntityFilterSort}
            filterOption={dependentEntityFilterOption}
            value={dependentEntityId}
            options={dependentEntities.map(({ id, name }) => ({ value: id, label: name }))}
            optionFilterProp="label"
            onSearch={onDependentEntitySearch}
            onChange={onDependentEntityChange}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateReleaseTrackRelationshipModal;
