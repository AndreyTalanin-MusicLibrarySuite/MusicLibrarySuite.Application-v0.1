import { Button, Checkbox, Col, Form, Input, Row, Space, Tabs, Typography } from "antd";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Artist, ArtistRelationship } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ArtistEditPageArtistRelationshipsTab from "./ArtistEditPageArtistRelationshipsTab";
import styles from "./ArtistEditPage.module.css";
import "antd/dist/antd.min.css";

export enum ArtistEditPageMode {
  Create,
  Edit,
}

export interface ArtistEditPageProps {
  mode: ArtistEditPageMode;
}

const ArtistEditPage = ({ mode }: ArtistEditPageProps) => {
  const navigate = useNavigate();

  const [artist, setArtist] = useState<Artist>();
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === ArtistEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchArtist = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getArtist(id)
        .then((artist) => {
          setArtist(
            new Artist({
              ...artist,
              artistRelationships: artist.artistRelationships.map((artistRelationship) => new ArtistRelationship({ ...artistRelationship, artist: artist })),
            })
          );
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  const onArtistRelationshipsChange = useCallback(
    (artistRelationships: ArtistRelationship[]) => {
      if (artist) {
        setArtist(new Artist({ ...artist, artistRelationships: artistRelationships }));
      }
    },
    [artist]
  );

  useEffect(() => {
    fetchArtist();
  }, [fetchArtist]);

  useEffect(() => {
    form.resetFields();
  }, [artist, form]);

  const onSaveButtonClick = () => {
    form.submit();
  };

  const onDeleteButtonClick = useCallback(() => {
    if (artist) {
      setConfirmDeleteModalOpen(true);
    }
  }, [artist]);

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (artist) {
        setModalLoading(true);
        applicationClient
          .deleteArtist(artist.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            navigate("/catalog/artists/list");
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [navigate, artist, applicationClient]
  );

  const onConfirmDeleteModalCancel = () => {
    setConfirmDeleteModalOpen(false);
  };

  const onCancelButtonClick = () => {
    navigate("/catalog/artists/list");
  };

  const onFinish = useCallback(
    (artistValues: Artist) => {
      const artistModel = new Artist({ ...artist, ...artistValues });
      artistModel.id = artistModel.id?.trim();
      artistModel.name = artistModel.name?.trim();
      artistModel.description = artistModel.description?.trim();
      artistModel.disambiguationText = artistModel.disambiguationText?.trim();
      if (artistModel.id !== undefined && artistModel.id.length === 0) {
        artistModel.id = EmptyGuidString;
      }
      if (artistModel.description !== undefined && artistModel.description.length === 0) {
        artistModel.description = undefined;
      }
      if (artistModel.disambiguationText !== undefined && artistModel.disambiguationText.length === 0) {
        artistModel.disambiguationText = undefined;
      }
      if (mode === ArtistEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createArtist(artistModel)
          .then((artist) => {
            setLoading(false);
            navigate(`/catalog/artists/edit?id=${artist.id}`);
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      } else {
        setLoading(true);
        applicationClient
          .updateArtist(artistModel)
          .then(() => {
            setLoading(false);
            fetchArtist();
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      }
    },
    [mode, navigate, artist, applicationClient, fetchArtist]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const tabs = useMemo(
    () => [
      {
        key: "artistRelationshipsTab",
        label: "Artist Relationships",
        children: artist && (
          <ArtistEditPageArtistRelationshipsTab
            artist={artist}
            artistRelationships={artist.artistRelationships}
            artistRelationshipsLoading={loading}
            setArtistRelationships={onArtistRelationshipsChange}
          />
        ),
      },
    ],
    [artist, loading, onArtistRelationshipsChange]
  );

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>{mode === ArtistEditPageMode.Create ? "Create" : "Edit"} Artist</Typography.Title>
        <Button type="primary" loading={loading} onClick={onSaveButtonClick}>
          <SaveOutlined />
          Save
        </Button>
        {mode === ArtistEditPageMode.Edit && (
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
          <Form form={form} initialValues={artist} onFinish={onFinish} onFinishFailed={onFinishFailed} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item label="Id" name="id">
              <Input readOnly={mode === ArtistEditPageMode.Edit} />
            </Form.Item>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "The 'Name' property must not be empty." }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Disambiguation Text" name="disambiguationText">
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="System Entity"
              name="systemEntity"
              rules={[{ required: true, message: "The 'System Entity' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === ArtistEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Enabled"
              name="enabled"
              rules={[{ required: true, message: "The 'Enabled' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === ArtistEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            {mode === ArtistEditPageMode.Edit && (
              <Form.Item label="Created On" name="createdOn">
                <Input readOnly />
              </Form.Item>
            )}
            {mode === ArtistEditPageMode.Edit && (
              <Form.Item label="Updated On" name="updatedOn">
                <Input readOnly />
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
      {artist && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Artist"
          message={`Confirm that you want to delete the "${artist.name}" artist. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      )}
      {artist && <Tabs items={tabs} />}
    </>
  );
};

export default ArtistEditPage;
