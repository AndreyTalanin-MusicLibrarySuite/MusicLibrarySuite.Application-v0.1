import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Genre, GenreRelationship } from "../../../api/ApplicationClient";
import CreateEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/CreateEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./GenreEditPageGenreRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

interface GenreEditPageGenreRelationshipsTabProps {
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
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalNameFilter, setModalNameFilter] = useState<string>();
  const [modalDependentGenres, setModalDependentGenres] = useState<Genre[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      genreRelationships.map((genreRelationship) => ({
        name: genreRelationship.name,
        description: genreRelationship.description,
        entityId: genreRelationship.genreId,
        entityName: genreRelationship.genre?.name ?? "",
        entityHref: `/catalog/genres/view?id=${genreRelationship.genreId}`,
        dependentEntityId: genreRelationship.dependentGenreId,
        dependentEntityName: genreRelationship.dependentGenre?.name ?? "",
        dependentEntityHref: `/catalog/genres/view?id=${genreRelationship.dependentGenreId}`,
      }))
    );
  }, [genreRelationships, navigate]);

  const fetchModalDependentGenres = useCallback(() => {
    applicationClient
      .getPagedGenres(20, 0, modalNameFilter, undefined)
      .then((pageResult) => setModalDependentGenres(pageResult.items))
      .catch((error) => alert(error));
  }, [modalNameFilter, applicationClient]);

  useEffect(() => fetchModalDependentGenres(), [fetchModalDependentGenres]);

  const onCreateGenreRelationshipButtonClick = () => {
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

  const onGenreRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setGenreRelationships(genreRelationships.filter((genreRelationship) => genreRelationship.dependentGenreId !== entityRelationship.dependentEntityId));
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
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
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
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
        <Typography.Paragraph>You can adjust the order in which the genre relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateGenreRelationshipButtonClick}>
          Create a Genre Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Genre"
        dependentEntityColumnName="Dependent Genre"
        loading={genreRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onGenreRelationshipEdit}
        onEntityRelationshipDelete={onGenreRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <CreateEntityRelationshipModal
        title="Create Genre Relationship"
        dependentEntityName="Dependent Genre"
        dependentEntities={modalDependentGenres.map(({ id, name }) => ({ id, name }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntities={onSearchDependentEntities}
      />
    </>
  );
};

export default GenreEditPageGenreRelationshipsTab;
