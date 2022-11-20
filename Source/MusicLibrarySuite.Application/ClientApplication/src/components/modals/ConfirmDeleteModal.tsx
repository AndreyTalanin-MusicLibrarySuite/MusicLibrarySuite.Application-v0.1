import { Modal, Typography } from "antd";
import { useState } from "react";
import "antd/dist/antd.min.css";

export interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  onOk: (setRequestInProgressCallback: (value: boolean) => void) => void;
  onCancel: () => void;
}

const ConfirmDeleteModal = ({ open, title, message, onOk, onCancel }: ConfirmDeleteModalProps) => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);

  return (
    <Modal
      title={title}
      okText="Delete"
      okButtonProps={{ danger: true }}
      open={open}
      confirmLoading={requestInProgress}
      onOk={() => onOk(setRequestInProgress)}
      onCancel={onCancel}
    >
      <Typography.Paragraph>{message}</Typography.Paragraph>
    </Modal>
  );
};

export default ConfirmDeleteModal;
