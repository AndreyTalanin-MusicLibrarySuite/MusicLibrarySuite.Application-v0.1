import { Form, Input, Modal } from "antd";
import { Store } from "antd/lib/form/interface";
import { useCallback, useEffect, useMemo } from "react";
import { IReleaseTrack, ReleaseTrack } from "../../api/ApplicationClient";
import "antd/dist/antd.min.css";

export interface CreateReleaseTrackModalProps {
  edit?: boolean;
  open?: boolean;
  releaseTrack?: ReleaseTrack;
  onOk: (releaseTrack: ReleaseTrack, resetFormFields: () => void) => void;
  onCancel: () => void;
}

const CreateReleaseTrackModal = ({ edit, open, releaseTrack, onOk: onModalOk, onCancel: onModalCancel }: CreateReleaseTrackModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [releaseTrack, form]);

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    onModalCancel();
    form.resetFields();
  };

  const onFinish = useCallback(
    (releaseTrackValues: Store) => {
      const trackNumber = releaseTrackValues.trackNumber as string;
      releaseTrackValues.trackNumber = parseInt(trackNumber);
      const mediaNumber = releaseTrackValues.mediaNumber as string;
      releaseTrackValues.mediaNumber = parseInt(mediaNumber);

      const releaseTrackModel = new ReleaseTrack({ ...releaseTrack, ...(releaseTrackValues as IReleaseTrack) });
      releaseTrackModel.title = releaseTrackModel.title?.trim();
      releaseTrackModel.description = releaseTrackModel.description?.trim();
      releaseTrackModel.disambiguationText = releaseTrackModel.disambiguationText?.trim();
      releaseTrackModel.internationalStandardRecordingCode = releaseTrackModel.internationalStandardRecordingCode?.trim();
      if (releaseTrackModel.description !== undefined && releaseTrackModel.description.length === 0) {
        releaseTrackModel.description = undefined;
      }
      if (releaseTrackModel.disambiguationText !== undefined && releaseTrackModel.disambiguationText.length === 0) {
        releaseTrackModel.disambiguationText = undefined;
      }
      if (releaseTrackModel.internationalStandardRecordingCode !== undefined && releaseTrackModel.internationalStandardRecordingCode.length === 0) {
        releaseTrackModel.internationalStandardRecordingCode = undefined;
      }

      onModalOk(releaseTrackModel, () => form.resetFields());
    },
    [releaseTrack, onModalOk, form]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const title = useMemo(() => {
    return `${edit ? (releaseTrack ? "Edit" : "Create") : "View"} Release Track`;
  }, [edit, releaseTrack]);

  return (
    <Modal forceRender open={open} title={title} onOk={onOk} onCancel={onCancel}>
      <Form form={form} initialValues={releaseTrack} onFinish={onFinish} onFinishFailed={onFinishFailed} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Form.Item
          label="Track Number"
          name="trackNumber"
          rules={[
            { required: true, message: "The 'Track Number' property must not be empty." },
            { pattern: new RegExp(/^[0-9]+$/), message: "The 'Track Number' property must be a number." },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
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
        <Form.Item label="ISRC" name="internationalStandardRecordingCode">
          <Input readOnly={!edit} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateReleaseTrackModal;
