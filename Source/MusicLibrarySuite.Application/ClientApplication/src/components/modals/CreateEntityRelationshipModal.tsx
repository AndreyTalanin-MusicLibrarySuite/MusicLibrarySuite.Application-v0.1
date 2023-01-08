import { Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { EmptyGuidString } from "../../helpers/ApplicationConstants";
import "antd/dist/antd.min.css";

export interface DependentEntity {
  id: string;
  name: string;
}

export interface EntityRelationship {
  name: string;
  description?: string;
  dependentEntityId: string;
}

export interface CreateEntityRelationshipModalProps {
  title: string;
  dependentEntityName: string;
  dependentEntities: DependentEntity[];
  open?: boolean;
  entityRelationship?: EntityRelationship;
  onOk: (entityRelationship: EntityRelationship, resetFormFields: () => void) => void;
  onCancel: () => void;
  onSearchDependentEntities: (name?: string) => void;
}

const CreateEntityRelationshipModal = ({
  title,
  dependentEntityName,
  dependentEntities,
  open,
  entityRelationship,
  onOk: onModalOk,
  onCancel: onModalCancel,
  onSearchDependentEntities,
}: CreateEntityRelationshipModalProps) => {
  const [dependentEntityId, setDependentEntityId] = useState<string>(EmptyGuidString);

  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    setDependentEntityId(entityRelationship?.dependentEntityId ?? EmptyGuidString);
  }, [entityRelationship, form]);

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    onModalCancel();
    form.resetFields();
  };

  const onFinish = (entityRelationship: EntityRelationship) => {
    entityRelationship.name = entityRelationship.name?.trim();
    entityRelationship.description = entityRelationship.description?.trim();
    if (entityRelationship.description !== undefined && entityRelationship.description.length === 0) {
      entityRelationship.description = undefined;
    }
    onModalOk({ ...entityRelationship, dependentEntityId }, () => form.resetFields());
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
      <Form form={form} initialValues={entityRelationship} onFinish={onFinish} onFinishFailed={onFinishFailed} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
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

export default CreateEntityRelationshipModal;
