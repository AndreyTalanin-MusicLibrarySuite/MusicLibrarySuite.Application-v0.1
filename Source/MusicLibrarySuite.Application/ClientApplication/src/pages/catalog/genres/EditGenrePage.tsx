import { Button, Checkbox, Col, Form, Input, Row, Space, Typography } from "antd";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Genre } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import styles from "./EditGenrePage.module.css";
import "antd/dist/antd.min.css";

export enum EditGenrePageMode {
  Create,
  Edit,
}

export interface EditGenrePageProps {
  mode: EditGenrePageMode;
}

const EditGenrePage = ({ mode }: EditGenrePageProps) => {
  const navigate = useNavigate();

  const [genre, setGenre] = useState<Genre | undefined>(new Genre());
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === EditGenrePageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchGenre = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getGenre(id)
        .then((genre) => {
          setGenre(genre);
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  useEffect(() => {
    fetchGenre();
  }, [fetchGenre]);

  useEffect(() => {
    form.resetFields();
  }, [genre, form]);

  const onSaveButtonClick = () => {
    form.submit();
  };

  const onDeleteButtonClick = () => {
    if (genre !== undefined) {
      setModalOpen(true);
    }
  };

  const onDeleteModalOk = (setRequestInProgressCallback: (value: boolean) => void) => {
    if (genre !== undefined) {
      setRequestInProgressCallback(true);
      applicationClient
        .deleteGenre(genre.id)
        .then(() => {
          setRequestInProgressCallback(false);
          setModalOpen(false);
          navigate("/catalog/genres/list");
        })
        .catch((error) => {
          setRequestInProgressCallback(false);
          setModalOpen(false);
          alert(error);
        });
    }
  };

  const onDeleteModalCancel = () => {
    setModalOpen(false);
  };

  const onCancelButtonClick = () => {
    navigate("/catalog/genres/list");
  };

  const onFinish = (genre: Genre) => {
    genre.id = genre.id?.trim();
    genre.name = genre.name?.trim();
    genre.description = genre.description?.trim();
    if (genre.id !== undefined && genre.id.length === 0) {
      genre.id = EmptyGuidString;
    }
    if (genre.description !== undefined && genre.description.length === 0) {
      genre.description = undefined;
    }
    if (mode === EditGenrePageMode.Create) {
      setRequestInProgress(true);
      applicationClient
        .createGenre(genre)
        .then((genre) => {
          setRequestInProgress(false);
          navigate(`/catalog/genres/edit?id=${genre.id}`);
        })
        .catch((error) => {
          setRequestInProgress(false);
          alert(error);
        });
    } else {
      setRequestInProgress(true);
      applicationClient
        .updateGenre(genre)
        .then(() => {
          setRequestInProgress(false);
          fetchGenre();
        })
        .catch((error) => {
          setRequestInProgress(false);
          alert(error);
        });
    }
  };

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>{mode === EditGenrePageMode.Create ? "Create" : "Edit"} Genre</Typography.Title>
        <Button type="primary" loading={requestInProgress} onClick={onSaveButtonClick}>
          <SaveOutlined />
          Save
        </Button>
        {mode === EditGenrePageMode.Edit && (
          <Button danger type="primary" onClick={onDeleteButtonClick}>
            <DeleteOutlined />
            Delete
          </Button>
        )}
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Cancel
        </Button>
      </Space>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form form={form} initialValues={genre} onFinish={onFinish} onFinishFailed={onFinishFailed} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item label="Id" name="id">
              <Input readOnly={mode === EditGenrePageMode.Edit} />
            </Form.Item>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "The 'Name' property must not be empty." }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="System Entity"
              name="systemEntity"
              rules={[{ required: true, message: "The 'System Entity' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === EditGenrePageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Enabled"
              name="enabled"
              rules={[{ required: true, message: "The 'Enabled' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === EditGenrePageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            {mode === EditGenrePageMode.Edit && (
              <Form.Item label="Created On" name="createdOn">
                <Input readOnly />
              </Form.Item>
            )}
            {mode === EditGenrePageMode.Edit && (
              <Form.Item label="Updated On" name="updatedOn">
                <Input readOnly />
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
      {genre !== undefined && (
        <ConfirmDeleteModal
          open={modalOpen}
          title="Delete Genre"
          message={`Confirm that you want to delete the "${genre.name}" genre. This operation can not be undone.`}
          onOk={onDeleteModalOk}
          onCancel={onDeleteModalCancel}
        />
      )}
    </>
  );
};

export default EditGenrePage;
