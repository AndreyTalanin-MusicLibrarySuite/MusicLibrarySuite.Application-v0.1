import { Modal, Typography } from "antd";
import { useState } from "react";
import "antd/dist/antd.min.css";

export interface ConfirmDeleteModalProps {
  title: string;
  message: string;
  open?: boolean;
  onOk: (setLoading: (value: boolean) => void) => void;
  onCancel: () => void;
}

const ConfirmDeleteModal = ({ title, message, open, onOk, onCancel }: ConfirmDeleteModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Modal
      open={open}
      title={title}
      okText="Delete"
      okButtonProps={{ danger: true }}
      confirmLoading={loading}
      onOk={() => onOk(setLoading)}
      onCancel={onCancel}
    >
      <Typography.Paragraph>{message}</Typography.Paragraph>
    </Modal>
  );
};

export default ConfirmDeleteModal;
