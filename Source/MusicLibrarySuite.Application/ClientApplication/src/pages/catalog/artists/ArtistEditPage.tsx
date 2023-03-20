import { Button, Checkbox, Col, Form, Input, Row, Tabs, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Artist, ArtistGenre, ArtistRelationship, Genre, IArtist } from "../../../api/ApplicationClient";
import EntitySelect from "../../../components/inputs/EntitySelect";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import { GuidPattern } from "../../../helpers/RegularExpressionConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ArtistEditPageArtistRelationshipsTab from "./ArtistEditPageArtistRelationshipsTab";
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
  const [artistFormValues, setArtistFormValues] = useState<Store>({});
  const [artistGenreOptions, setArtistGenreOptions] = useState<Genre[]>([]);
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
          artist.artistRelationships = artist.artistRelationships.map(
            (artistRelationship) => new ArtistRelationship({ ...artistRelationship, artist: artist })
          );

          artist.artistGenres = artist.artistGenres.map((artistGenre) => new ArtistGenre({ ...artistGenre, artist: artist }));

          setArtist(artist);
          setArtistFormValues({ ...artist, artistGenres: artist?.artistGenres.map((artistGenre) => artistGenre.genreId) ?? [] });

          applicationClient
            .getGenres(artist.artistGenres?.map((artistGenre) => artistGenre.genreId) ?? [])
            .then((genres) => {
              setArtistGenreOptions(genres);
            })
            .catch((error) => {
              alert(error);
            });
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
  }, [artistFormValues, form]);

  const onSaveButtonClick = useCallback(() => {
    form.submit();
  }, [form]);

  const onDeleteButtonClick = useCallback(() => {
    if (artist) {
      setConfirmDeleteModalOpen(true);
    }
  }, [artist]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/artists/list");
  }, [navigate]);

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

  const onFinish = useCallback(
    (artistFormValues: Store) => {
      const artistGenreIds = artistFormValues.artistGenres as string[];
      if (artist?.id) {
        artistFormValues.artistGenres = artistGenreIds.map((genreId) => new ArtistGenre({ artistId: artist.id, genreId }));
      } else {
        artistFormValues.artistGenres = [];
      }

      const artistModel = new Artist({ ...artist, ...(artistFormValues as IArtist) });
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

      artistModel.artistRelationships =
        artistModel.artistRelationships?.map(
          (artistRelationship) => new ArtistRelationship({ ...artistRelationship, artist: undefined, dependentArtist: undefined })
        ) ?? [];

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

  const fetchArtistGenreOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedGenres(20, 0, nameFilter, undefined)
        .then((genreResponse) => {
          setArtistGenreOptions(genreResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchArtistGenreOptions(undefined), [fetchArtistGenreOptions]);

  const title = useMemo(() => <Typography.Title level={4}>{mode === ArtistEditPageMode.Create ? "Create" : "Edit"} Artist</Typography.Title>, [mode]);

  const actionButtons = useMemo(
    () => (
      <>
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
      </>
    ),
    [mode, loading, onSaveButtonClick, onDeleteButtonClick, onCancelButtonClick]
  );

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

  const modals = useMemo(
    () => [
      artist && (
        <ConfirmDeleteModal
          key="ConfirmDeleteModal"
          open={confirmDeleteModalOpen}
          title="Delete Artist"
          message={`Confirm that you want to delete the "${artist.name}" artist. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
    ],
    [artist, confirmDeleteModalOpen, onConfirmDeleteModalOk]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form
            form={form}
            initialValues={artistFormValues}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item label="Id" name="id" rules={[{ pattern: GuidPattern, message: "The 'Id' property must be a valid GUID (UUID)." }]}>
              <Input readOnly={mode === ArtistEditPageMode.Edit} />
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
              label="Disambiguation Text"
              name="disambiguationText"
              rules={[{ max: 2048, message: "The 'Disambiguation Text' property must be shorter than 2048 characters." }]}
            >
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
              <Form.Item label="Genres" name="artistGenres">
                <EntitySelect
                  mode="multiple"
                  options={artistGenreOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchArtistGenreOptions}
                />
              </Form.Item>
            )}
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
      <Tabs items={tabs} />
    </ActionPage>
  );
};

export default ArtistEditPage;
