import { Form, Input, Modal } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { ReleaseMedia } from "../../api/ApplicationClient";
import { mapReleaseMediaModalFormInitialValues, mergeReleaseMediaModalFormValues } from "../../entities/forms/ReleaseMediaModalFormValues";
import useEntityForm from "../../hooks/useEntityForm";
import "antd/dist/antd.min.css";

export interface CreateReleaseMediaModalProps {
  edit?: boolean;
  open?: boolean;
  releaseMedia?: ReleaseMedia;
  onOk: (releaseMedia: ReleaseMedia, resetFormFields: () => void) => void;
  onCancel: () => void;
}

const CreateReleaseMediaModal = ({ edit, open, releaseMedia, onOk: onModalOk, onCancel: onModalCancel }: CreateReleaseMediaModalProps) => {
  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(releaseMedia, mapReleaseMediaModalFormInitialValues, mergeReleaseMediaModalFormValues, onModalOk),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [releaseMedia, form]);

  const onOk = useCallback(() => {
    form.submit();
  }, [form]);

  const onCancel = useCallback(() => {
    onModalCancel();
    form.resetFields();
  }, [onModalCancel, form]);

  const title = useMemo(() => {
    return `${edit ? (releaseMedia ? "Edit" : "Create") : "View"} Release Media`;
  }, [edit, releaseMedia]);

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
            { required: true, message: "The 'Media Number' property must not be empty." },
            { pattern: new RegExp(/^[0-9]{1,3}$/), message: "The 'Media Number' property must be a number in range [0 - 255]." },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: "The 'Title' property must not be empty." },
            { max: 256, message: "The 'Title' property must be shorter than 256 characters." },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Description" name="description" rules={[{ max: 2048, message: "The 'Description' property must be shorter than 2048 characters." }]}>
          <Input.TextArea readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="Disambiguation Text"
          name="disambiguationText"
          rules={[{ max: 2048, message: "The 'Disambiguation Text' property must be shorter than 2048 characters." }]}
        >
          <Input.TextArea readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="Catalog Number"
          name="catalogNumber"
          rules={[{ max: 32, message: "The 'Catalog Number' property must be shorter than 32 characters." }]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Media Format" name="mediaFormat" rules={[{ max: 256, message: "The 'Media Format' property must be shorter than 256 characters." }]}>
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="CDDB Checksum"
          name="tableOfContentsChecksum"
          rules={[{ max: 64, message: "The 'CDDB Checksum' property must be shorter than 64 characters." }]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="MusicBrainz Checksum"
          name="tableOfContentsChecksumLong"
          rules={[{ max: 64, message: "The 'MusicBrainz Checksum' property must be shorter than 64 characters." }]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateReleaseMediaModal;
