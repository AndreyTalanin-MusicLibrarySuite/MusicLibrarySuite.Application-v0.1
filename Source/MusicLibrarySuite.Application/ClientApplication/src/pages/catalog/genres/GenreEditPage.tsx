import { Button, Checkbox, Col, Form, Input, Row, Tabs, Typography } from "antd";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Genre, GenreRelationship } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { mapGenreFormInitialValues, mergeGenreFormValues } from "../../../entities/forms/GenreFormValues";
import { GuidPattern } from "../../../helpers/RegularExpressionConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useEntityForm from "../../../hooks/useEntityForm";
import useQueryStringId from "../../../hooks/useQueryStringId";
import GenreEditPageGenreRelationshipsTab from "./GenreEditPageGenreRelationshipsTab";
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
  const [genreInitialValues, setGenreInitialValues] = useState<Genre>();
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === GenreEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const fetchGenre = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getGenre(id)
        .then((genre) => {
          genre.genreRelationships.forEach((genreRelationship) => (genreRelationship.genre = genre));

          setGenre(genre);
          setGenreInitialValues(genre);
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  useEffect(() => {
    fetchGenre();
  }, [fetchGenre]);

  const saveGenre = useCallback(
    (genreValues: Genre) => {
      genreValues.genreRelationships =
        genre?.genreRelationships?.map(
          (genreRelationship) =>
            new GenreRelationship({
              ...genreRelationship,
              genre: undefined,
              dependentGenre: undefined,
            })
        ) ?? [];

      if (mode === GenreEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createGenre(genreValues)
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
          .updateGenre(genreValues)
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

  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(genreInitialValues, mapGenreFormInitialValues, mergeGenreFormValues, saveGenre),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [genreInitialValues, form]);

  const onGenreRelationshipsChange = useCallback(
    (genreRelationships: GenreRelationship[]) => {
      if (genre) {
        setGenre(new Genre({ ...genre, genreRelationships: genreRelationships }));
      }
    },
    [genre]
  );

  const onSaveButtonClick = useCallback(() => {
    form.submit();
  }, [form]);

  const onDeleteButtonClick = useCallback(() => {
    if (genre) {
      setConfirmDeleteModalOpen(true);
    }
  }, [genre]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/genres/list");
  }, [navigate]);

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

  const title = useMemo(() => <Typography.Title level={4}>{mode === GenreEditPageMode.Create ? "Create" : "Edit"} Genre</Typography.Title>, [mode]);

  const actionButtons = useMemo(
    () => (
      <>
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
      </>
    ),
    [mode, loading, onSaveButtonClick, onDeleteButtonClick, onCancelButtonClick]
  );

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

  const modals = useMemo(
    () => [
      genre && (
        <ConfirmDeleteModal
          key="ConfirmDeleteModal"
          open={confirmDeleteModalOpen}
          title="Delete Genre"
          message={`Confirm that you want to delete the "${genre.name}" genre. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
    ],
    [genre, confirmDeleteModalOpen, onConfirmDeleteModalOk]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form
            form={form}
            initialValues={initialFormValues}
            onFinish={onFormFinish}
            onFinishFailed={onFormFinishFailed}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item label="Id" name="id" rules={[{ pattern: GuidPattern, message: "The 'Id' property must be a valid GUID (UUID)." }]}>
              <Input readOnly={mode === GenreEditPageMode.Edit} />
            </Form.Item>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "The 'Name' property must not be empty." },
                { max: 256, message: "The 'Name' property must be shorter than 256 characters." },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ max: 2048, message: "The 'Description' property must be shorter than 2048 characters." }]}
            >
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
      {mode === GenreEditPageMode.Edit && <Tabs items={tabs} />}
    </ActionPage>
  );
};

export default GenreEditPage;
