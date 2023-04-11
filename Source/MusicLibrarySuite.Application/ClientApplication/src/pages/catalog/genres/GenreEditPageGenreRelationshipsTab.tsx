import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Genre, GenreRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

export interface GenreEditPageGenreRelationshipsTabProps {
  genre: Genre;
  genreRelationships: GenreRelationship[];
  genreRelationshipsLoading: boolean;
  setGenreRelationships: (genreRelationships: GenreRelationship[]) => void;
}

const GenreEditPageGenreRelationshipsTab = ({
  genre,
  genreRelationships,
  genreRelationshipsLoading,
  setGenreRelationships,
}: GenreEditPageGenreRelationshipsTabProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalNameFilter, setModalNameFilter] = useState<string>();
  const [modalDependentGenres, setModalDependentGenres] = useState<Genre[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      genreRelationships.map((genreRelationship) => ({
        name: genreRelationship.name,
        description: genreRelationship.description,
        entityId: genreRelationship.genreId,
        entityName: genreRelationship.genre?.name ?? "",
        entityHref: `/catalog/genres/view?id=${genreRelationship.genreId}`,
        dependentEntityId: genreRelationship.dependentGenreId,
        dependentEntityName: genreRelationship.dependentGenre?.name ?? "",
        dependentEntityHref: `/catalog/genres/view?id=${genreRelationship.dependentGenreId}`,
      })),
    [genreRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getGenres([modalEntityRelationship.dependentEntityId])
        .then((genres) => setModalDependentGenres(genres))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedGenres(DefaultPageSize, 0, modalNameFilter, undefined)
      .then((pageResult) => setModalDependentGenres(pageResult.items))
      .catch((error) => alert(error));
  }, [modalNameFilter, applicationClient]);

  const onGenreRelationshipCreate = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onGenreRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onGenreRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setGenreRelationships(genreRelationships.filter((genreRelationship) => genreRelationship.dependentGenreId !== entityRelationship.dependentEntityId));
    },
    [genreRelationships, setGenreRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
      const getGenreRelationshipKey = (entityId: string, dependentEntityId: string) => {
        return `(${entityId}, ${dependentEntityId})`;
      };
      if (genreRelationships) {
        const genreRelationshipsMap = new Map<string, GenreRelationship>();
        for (const genreRelationship of genreRelationships) {
          genreRelationshipsMap.set(getGenreRelationshipKey(genreRelationship.genreId, genreRelationship.dependentGenreId), genreRelationship);
        }
        setGenreRelationships(
          entityRelationships.map(
            (entityRelationship) =>
              genreRelationshipsMap.get(getGenreRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)) as GenreRelationship
          )
        );
      }
    },
    [genreRelationships, setGenreRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
      const existingEntityRelationship = genreRelationships.find(
        (genreRelationship) => genreRelationship.dependentGenreId === entityRelationship.dependentEntityId
      );
      if (existingEntityRelationship && !modalEntityRelationship) {
        alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.dependentGenre?.name}' genre.`);
        return;
      }
      applicationClient.getGenre(entityRelationship.dependentEntityId).then((dependentGenre) => {
        const resultGenreRelationship = new GenreRelationship({
          name: entityRelationship.name,
          description: entityRelationship.description,
          genreId: genre.id,
          dependentGenreId: dependentGenre.id,
          genre: genre,
          dependentGenre: dependentGenre,
        });
        if (modalEntityRelationship) {
          setGenreRelationships(
            genreRelationships.map((genreRelationship) => {
              if (genreRelationship.dependentGenreId === modalEntityRelationship.dependentEntityId) {
                return resultGenreRelationship;
              } else {
                return genreRelationship;
              }
            })
          );
        } else {
          setGenreRelationships([...genreRelationships, resultGenreRelationship]);
        }
        setModalOpen(false);
        resetFormFields();
      });
    },
    [genre, genreRelationships, setGenreRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (nameFilter?: string) => {
    setModalNameFilter(nameFilter);
  };

  const title = <Title level={5}>Edit Genre Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onGenreRelationshipCreate}>
        Create Genre Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Genre Relationship"
        dependentEntityName="Dependent Genre"
        dependentEntityOptions={modalDependentGenres.map(({ id, name }) => ({ id, displayName: name }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalDependentGenres, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the genre relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Genre"
        dependentEntityColumnName="Dependent Genre"
        loading={genreRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onGenreRelationshipEdit}
        onEntityRelationshipDelete={onGenreRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default GenreEditPageGenreRelationshipsTab;
