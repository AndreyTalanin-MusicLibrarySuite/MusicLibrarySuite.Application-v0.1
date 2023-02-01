import { Form, Input, Modal } from "antd";
import { Store } from "antd/lib/form/interface";
import { useCallback, useEffect, useMemo } from "react";
import { IReleaseMedia, ReleaseMedia } from "../../api/ApplicationClient";
import "antd/dist/antd.min.css";

export interface CreateReleaseMediaModalProps {
  edit?: boolean;
  open?: boolean;
  releaseMedia?: ReleaseMedia;
  onOk: (releaseMedia: ReleaseMedia, resetFormFields: () => void) => void;
  onCancel: () => void;
}

const CreateReleaseMediaModal = ({ edit, open, releaseMedia, onOk: onModalOk, onCancel: onModalCancel }: CreateReleaseMediaModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [releaseMedia, form]);

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    onModalCancel();
    form.resetFields();
  };

  const onFinish = useCallback(
    (releaseMediaFormValues: Store) => {
      const mediaNumber = releaseMediaFormValues.mediaNumber as string;
      releaseMediaFormValues.mediaNumber = parseInt(mediaNumber);

      const releaseMediaModel = new ReleaseMedia({ ...releaseMedia, ...(releaseMediaFormValues as IReleaseMedia) });
      releaseMediaModel.title = releaseMediaModel.title?.trim();
      releaseMediaModel.description = releaseMediaModel.description?.trim();
      releaseMediaModel.disambiguationText = releaseMediaModel.disambiguationText?.trim();
      releaseMediaModel.catalogNumber = releaseMediaModel.catalogNumber?.trim();
      releaseMediaModel.mediaFormat = releaseMediaModel.mediaFormat?.trim();
      releaseMediaModel.tableOfContentsChecksum = releaseMediaModel.tableOfContentsChecksum?.trim();
      releaseMediaModel.tableOfContentsChecksumLong = releaseMediaModel.tableOfContentsChecksumLong?.trim();
      if (releaseMediaModel.description !== undefined && releaseMediaModel.description.length === 0) {
        releaseMediaModel.description = undefined;
      }
      if (releaseMediaModel.disambiguationText !== undefined && releaseMediaModel.disambiguationText.length === 0) {
        releaseMediaModel.disambiguationText = undefined;
      }
      if (releaseMediaModel.catalogNumber !== undefined && releaseMediaModel.catalogNumber.length === 0) {
        releaseMediaModel.catalogNumber = undefined;
      }
      if (releaseMediaModel.mediaFormat !== undefined && releaseMediaModel.mediaFormat.length === 0) {
        releaseMediaModel.mediaFormat = undefined;
      }
      if (releaseMediaModel.tableOfContentsChecksum !== undefined && releaseMediaModel.tableOfContentsChecksum.length === 0) {
        releaseMediaModel.tableOfContentsChecksum = undefined;
      }
      if (releaseMediaModel.tableOfContentsChecksumLong !== undefined && releaseMediaModel.tableOfContentsChecksumLong.length === 0) {
        releaseMediaModel.tableOfContentsChecksumLong = undefined;
      }

      releaseMediaModel.releaseTrackCollection = [];

      onModalOk(releaseMediaModel, () => form.resetFields());
    },
    [releaseMedia, onModalOk, form]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const title = useMemo(() => {
    return `${edit ? (releaseMedia ? "Edit" : "Create") : "View"} Release Media`;
  }, [edit, releaseMedia]);

  return (
    <Modal forceRender open={open} title={title} onOk={onOk} onCancel={onCancel}>
      <Form form={form} initialValues={releaseMedia} onFinish={onFinish} onFinishFailed={onFinishFailed} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Form.Item
          label="Media Number"
          name="mediaNumber"
          rules={[
            { required: true, message: "The 'Media Number' property must not be empty." },
            { pattern: new RegExp(/^[0-9]+$/), message: "The 'Media Number' property must be a number." },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Title" name="title" rules={[{ required: true, message: "The 'Title' property must not be empty." }]}>
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Disambiguation Text" name="disambiguationText">
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
          rules={[{ max: 256, message: "The 'MusicBrainz Checksum' property must be shorter than 64 characters." }]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateReleaseMediaModal;
