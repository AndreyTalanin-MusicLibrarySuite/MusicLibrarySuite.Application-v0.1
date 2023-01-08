import { Button, Checkbox, Col, Form, Input, Row, Space, Tabs, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Genre, GenreRelationship, IGenre } from "../../../api/ApplicationClient";
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
  const [genreFormValues, setGenreFormValues] = useState<Store>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === GenreEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchGenre = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getGenre(id)
        .then((genre) => {
          genre.genreRelationships = genre.genreRelationships.map((genreRelationship) => new GenreRelationship({ ...genreRelationship, genre: genre }));

          setGenre(genre);
          setGenreFormValues(genre);
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
  }, [genreFormValues, form]);

  const onSaveButtonClick = () => {
    form.submit();
  };

  const onDeleteButtonClick = useCallback(() => {
    if (genre) {
      setConfirmDeleteModalOpen(true);
    }
  }, [genre]);

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (genre) {
        setModalLoading(true);
        applicationClient
          .deleteGenre(genre.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            navigate("/catalog/genres/list");
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [navigate, genre, applicationClient]
  );

  const onConfirmDeleteModalCancel = () => {
    setConfirmDeleteModalOpen(false);
  };

  const onCancelButtonClick = () => {
    navigate("/catalog/genres/list");
  };

  const onFinish = useCallback(
    (genreFormValues: Store) => {
      const genreModel = new Genre({ ...genre, ...(genreFormValues as IGenre) });
      genreModel.id = genreModel.id?.trim();
      genreModel.name = genreModel.name?.trim();
      genreModel.description = genreModel.description?.trim();
      if (genreModel.id !== undefined && genreModel.id.length === 0) {
        genreModel.id = EmptyGuidString;
      }
      if (genreModel.description !== undefined && genreModel.description.length === 0) {
        genreModel.description = undefined;
      }

      genreModel.genreRelationships =
        genreModel.genreRelationships?.map(
          (genreRelationship) => new GenreRelationship({ ...genreRelationship, genre: undefined, dependentGenre: undefined })
        ) ?? [];

      if (mode === GenreEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createGenre(genreModel)
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
          .updateGenre(genreModel)
          .then(() => {
            setLoading(false);
            fetchGenre();
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      }
    },
    [mode, navigate, genre, applicationClient, fetchGenre]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const tabs = useMemo(
    () => [
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
    ],
    [genre, loading, onGenreRelationshipsChange]
  );

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
            initialValues={genreFormValues}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
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
          open={confirmDeleteModalOpen}
          title="Delete Genre"
          message={`Confirm that you want to delete the "${genre.name}" genre. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      )}
      {genre && <Tabs items={tabs} />}
    </>
  );
};

export default GenreEditPage;
