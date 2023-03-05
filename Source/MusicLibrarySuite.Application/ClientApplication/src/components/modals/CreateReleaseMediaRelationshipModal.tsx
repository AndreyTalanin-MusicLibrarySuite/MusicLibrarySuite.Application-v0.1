import { Form, Input, Modal, Select } from "antd";
import { Store } from "antd/lib/form/interface";
import { useEffect, useState } from "react";
import { EmptyGuidString } from "../../helpers/ApplicationConstants";

export interface DependentEntity {
  id: string;
  name: string;
}

export interface ReleaseMediaRelationship {
  mediaNumber: number;
  name: string;
  description?: string;
  dependentEntityId: string;
}

export interface CreateReleaseMediaRelationshipModalProps {
  title: string;
  dependentEntityName: string;
  dependentEntities: DependentEntity[];
  open?: boolean;
  releaseMediaRelationship?: ReleaseMediaRelationship;
  onOk: (releaseMediaRelationship: ReleaseMediaRelationship, resetFormFields: () => void) => void;
  onCancel: () => void;
  onSearchDependentEntities: (name?: string) => void;
}

const CreateReleaseMediaRelationshipModal = ({
  title,
  dependentEntityName,
  dependentEntities,
  open,
  releaseMediaRelationship,
  onOk: onModalOk,
  onCancel: onModalCancel,
  onSearchDependentEntities,
}: CreateReleaseMediaRelationshipModalProps) => {
  const [dependentEntityId, setDependentEntityId] = useState<string>(EmptyGuidString);

  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    setDependentEntityId(releaseMediaRelationship?.dependentEntityId ?? EmptyGuidString);
  }, [releaseMediaRelationship, form]);

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    onModalCancel();
    form.resetFields();
  };

  const onFinish = (releaseMediaRelationship: Store) => {
    const mediaNumber = releaseMediaRelationship.mediaNumber as string;
    releaseMediaRelationship.mediaNumber = parseInt(mediaNumber);

    const releaseMediaRelationshipModel = { ...(releaseMediaRelationship as ReleaseMediaRelationship), dependentEntityId };
    releaseMediaRelationshipModel.name = releaseMediaRelationshipModel.name?.trim();
    releaseMediaRelationshipModel.description = releaseMediaRelationshipModel.description?.trim();
    if (releaseMediaRelationshipModel.description !== undefined && releaseMediaRelationshipModel.description.length === 0) {
      releaseMediaRelationshipModel.description = undefined;
    }
    onModalOk(releaseMediaRelationshipModel, () => form.resetFields());
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
        initialValues={releaseMediaRelationship}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
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

export default CreateReleaseMediaRelationshipModal;
