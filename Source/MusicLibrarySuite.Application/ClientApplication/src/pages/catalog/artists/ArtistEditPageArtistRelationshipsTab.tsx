import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Artist, ArtistRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalNameFilter, setModalNameFilter] = useState<string>();
  const [modalDependentArtists, setModalDependentArtists] = useState<Artist[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      artistRelationships.map((artistRelationship) => ({
        name: artistRelationship.name,
        description: artistRelationship.description,
        entityId: artistRelationship.artistId,
        entityName: artistRelationship.artist?.name ?? "",
        entityHref: `/catalog/artists/view?id=${artistRelationship.artistId}`,
        dependentEntityId: artistRelationship.dependentArtistId,
        dependentEntityName: artistRelationship.dependentArtist?.name ?? "",
        dependentEntityHref: `/catalog/artists/view?id=${artistRelationship.dependentArtistId}`,
      })),
    [artistRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getArtists([modalEntityRelationship.dependentEntityId])
        .then((artists) => setModalDependentArtists(artists))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedArtists(DefaultPageSize, 0, modalNameFilter, undefined)
      .then((pageResult) => setModalDependentArtists(pageResult.items))
      .catch((error) => alert(error));
  }, [modalNameFilter, applicationClient]);

  const onArtistRelationshipCreate = () => {
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

  const onArtistRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setArtistRelationships(artistRelationships.filter((artistRelationship) => artistRelationship.dependentArtistId !== entityRelationship.dependentEntityId));
    },
    [artistRelationships, setArtistRelationships]
  );

  const onArtistRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
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
    },
    [artistRelationships, setArtistRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
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
    },
    [artist, artistRelationships, setArtistRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (nameFilter?: string) => {
    setModalNameFilter(nameFilter);
  };

  const title = <Title level={5}>Edit Artist Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onArtistRelationshipCreate}>
        Create Artist Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Artist Relationship"
        dependentEntityName="Dependent Artist"
        dependentEntityOptions={modalDependentArtists.map(({ id, name }) => ({ id, displayName: name }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalDependentArtists, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the artist relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Artist"
        dependentEntityColumnName="Dependent Artist"
        loading={artistRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onArtistRelationshipEdit}
        onEntityRelationshipDelete={onArtistRelationshipDelete}
        onEntityRelationshipsChange={onArtistRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ArtistEditPageArtistRelationshipsTab;
