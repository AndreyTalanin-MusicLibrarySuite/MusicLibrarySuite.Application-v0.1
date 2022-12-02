import { Button, Checkbox, Col, Form, Input, Row, Space, Tabs, Typography } from "antd";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Genre, GenreRelationship } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import GenreEditPageGenreRelationshipsTab from "./GenreEditPageGenreRelationshipsTab";
import styles from "./GenreEditPage.module.css";
import "antd/dist/antd.min.css";

export enum GenreEditPageMode {
  Create,
  Edit,
}

export interface GenreEditPageProps {
  mode: GenreEditPageMode;
}

const GenreEditPage = ({ mode }: GenreEditPageProps) => {
  const navigate = useNavigate();

  const [genre, setGenre] = useState<Genre>();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === GenreEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchGenre = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getGenre(id)
        .then((genre) => {
          setGenre(
            new Genre({
              ...genre,
              genreRelationships: genre.genreRelationships.map((genreRelationship) => new GenreRelationship({ ...genreRelationship, genre: genre })),
            })
          );
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  const onGenreRelationshipsChange = useCallback(
    (genreRelationships: GenreRelationship[]) => {
      if (genre) {
        setGenre(new Genre({ ...genre, genreRelationships: genreRelationships }));
      }
    },
    [genre]
  );

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
    if (genre) {
      setModalOpen(true);
    }
  };

  const onDeleteModalOk = (setModalLoading: (value: boolean) => void) => {
    if (genre) {
      setModalLoading(true);
      applicationClient
        .deleteGenre(genre.id)
        .then(() => {
          setModalLoading(false);
          setModalOpen(false);
          navigate("/catalog/genres/list");
        })
        .catch((error) => {
          setModalLoading(false);
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
    if (mode === GenreEditPageMode.Create) {
      setLoading(true);
      applicationClient
        .createGenre(genre)
        .then((genre) => {
          setLoading(false);
          navigate(`/catalog/genres/edit?id=${genre.id}`);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    } else {
      setLoading(true);
      applicationClient
        .updateGenre(genre)
        .then(() => {
          setLoading(false);
          fetchGenre();
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    }
  };

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const tabs = [
    {
      key: "genreRelationshipsTab",
      label: "Genre Relationships",
      children: genre && (
        <GenreEditPageGenreRelationshipsTab
          genre={genre}
          genreRelationships={genre.genreRelationships}
          genreRelationshipsLoading={loading}
          setGenreRelationships={onGenreRelationshipsChange}
        />
      ),
    },
  ];

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>{mode === GenreEditPageMode.Create ? "Create" : "Edit"} Genre</Typography.Title>
        <Button type="primary" loading={loading} onClick={onSaveButtonClick}>
          <SaveOutlined />
          Save
        </Button>
        {mode === GenreEditPageMode.Edit && (
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
          <Form
            form={form}
            initialValues={genre}
            onFinish={(values) => onFinish(new Genre({ ...genre, ...values }))}
            onFinishFailed={onFinishFailed}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item label="Id" name="id">
              <Input readOnly={mode === GenreEditPageMode.Edit} />
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
              initialValue={mode === GenreEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Enabled"
              name="enabled"
              rules={[{ required: true, message: "The 'Enabled' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === GenreEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            {mode === GenreEditPageMode.Edit && (
              <Form.Item label="Created On" name="createdOn">
                <Input readOnly />
              </Form.Item>
            )}
            {mode === GenreEditPageMode.Edit && (
              <Form.Item label="Updated On" name="updatedOn">
                <Input readOnly />
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
      {genre && (
        <ConfirmDeleteModal
          open={modalOpen}
          title="Delete Genre"
          message={`Confirm that you want to delete the "${genre.name}" genre. This operation can not be undone.`}
          onOk={onDeleteModalOk}
          onCancel={onDeleteModalCancel}
        />
      )}
      {genre && <Tabs items={tabs} />}
    </>
  );
};

export default GenreEditPage;
