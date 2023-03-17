import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Artist, ArtistRelationship } from "../../../api/ApplicationClient";
import CreateEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/CreateEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ArtistEditPageArtistRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ArtistEditPageArtistRelationshipsTabProps {
  artist: Artist;
  artistRelationships: ArtistRelationship[];
  artistRelationshipsLoading: boolean;
  setArtistRelationships: (artistRelationships: ArtistRelationship[]) => void;
}

const ArtistEditPageArtistRelationshipsTab = ({
  artist,
  artistRelationships,
  artistRelationshipsLoading,
  setArtistRelationships,
}: ArtistEditPageArtistRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalNameFilter, setModalNameFilter] = useState<string>();
  const [modalDependentArtists, setModalDependentArtists] = useState<Artist[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      artistRelationships.map((artistRelationship) => ({
        name: artistRelationship.name,
        description: artistRelationship.description,
        entityId: artistRelationship.artistId,
        entityName: artistRelationship.artist?.name ?? "",
        entityHref: `/catalog/artists/view?id=${artistRelationship.artistId}`,
        dependentEntityId: artistRelationship.dependentArtistId,
        dependentEntityName: artistRelationship.dependentArtist?.name ?? "",
        dependentEntityHref: `/catalog/artists/view?id=${artistRelationship.dependentArtistId}`,
      }))
    );
  }, [artistRelationships, navigate]);

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getArtists([modalEntityRelationship.dependentEntityId])
        .then((artists) => setModalDependentArtists(artists))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  const fetchModalDependentArtists = useCallback(() => {
    applicationClient
      .getPagedArtists(20, 0, modalNameFilter, undefined)
      .then((pageResult) => setModalDependentArtists(pageResult.items))
      .catch((error) => alert(error));
  }, [modalNameFilter, applicationClient]);

  useEffect(() => fetchModalDependentArtists(), [fetchModalDependentArtists]);

  const onCreateArtistRelationshipButtonClick = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onArtistRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onArtistRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setArtistRelationships(artistRelationships.filter((artistRelationship) => artistRelationship.dependentArtistId !== entityRelationship.dependentEntityId));
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
    const getArtistRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (artistRelationships) {
      const artistRelationshipsMap = new Map<string, ArtistRelationship>();
      for (const artistRelationship of artistRelationships) {
        artistRelationshipsMap.set(getArtistRelationshipKey(artistRelationship.artistId, artistRelationship.dependentArtistId), artistRelationship);
      }
      setArtistRelationships(
        entityRelationships.map(
          (entityRelationship) =>
            artistRelationshipsMap.get(getArtistRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)) as ArtistRelationship
        )
      );
    }
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
    const existingEntityRelationship = artistRelationships.find(
      (artistRelationship) => artistRelationship.dependentArtistId === entityRelationship.dependentEntityId
    );
    if (existingEntityRelationship && !modalEntityRelationship) {
      alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.dependentArtist?.name}' artist.`);
      return;
    }
    applicationClient.getArtist(entityRelationship.dependentEntityId).then((dependentArtist) => {
      const resultArtistRelationship = new ArtistRelationship({
        name: entityRelationship.name,
        description: entityRelationship.description,
        artistId: artist.id,
        dependentArtistId: dependentArtist.id,
        artist: artist,
        dependentArtist: dependentArtist,
      });
      if (modalEntityRelationship) {
        setArtistRelationships(
          artistRelationships.map((artistRelationship) => {
            if (artistRelationship.dependentArtistId === modalEntityRelationship.dependentEntityId) {
              return resultArtistRelationship;
            } else {
              return artistRelationship;
            }
          })
        );
      } else {
        setArtistRelationships([...artistRelationships, resultArtistRelationship]);
      }
      setModalOpen(false);
      resetFormFields();
    });
  };

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (name?: string) => {
    setModalNameFilter(name);
  };

  return (
    <>
      <Space className={styles.tabParagraph} direction="horizontal" align="baseline">
        <Typography.Paragraph>You can adjust order in which the artist relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateArtistRelationshipButtonClick}>
          Create an Artist Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Artist"
        dependentEntityColumnName="Dependent Artist"
        loading={artistRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onArtistRelationshipEdit}
        onEntityRelationshipDelete={onArtistRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <CreateEntityRelationshipModal
        title="Create Artist Relationship"
        dependentEntityName="Dependent Artist"
        dependentEntityOptions={modalDependentArtists.map(({ id, name }) => ({ id, displayName: name }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />
    </>
  );
};

export default ArtistEditPageArtistRelationshipsTab;
