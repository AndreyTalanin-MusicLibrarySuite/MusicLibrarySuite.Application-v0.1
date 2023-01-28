import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Release, ReleaseRelationship } from "../../../api/ApplicationClient";
import CreateEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/CreateEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ReleaseEditPageReleaseRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ReleaseEditPageReleaseRelationshipsTabProps {
  release: Release;
  releaseRelationships: ReleaseRelationship[];
  releaseRelationshipsLoading: boolean;
  setReleaseRelationships: (releaseRelationships: ReleaseRelationship[]) => void;
}

const ReleaseEditPageReleaseRelationshipsTab = ({
  release,
  releaseRelationships,
  releaseRelationshipsLoading,
  setReleaseRelationships,
}: ReleaseEditPageReleaseRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalDependentReleases, setModalDependentReleases] = useState<Release[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      releaseRelationships.map((releaseRelationship) => ({
        name: releaseRelationship.name,
        description: releaseRelationship.description,
        entityId: releaseRelationship.releaseId,
        entityName: releaseRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseRelationship.releaseId}`,
        dependentEntityId: releaseRelationship.dependentReleaseId,
        dependentEntityName: releaseRelationship.dependentRelease?.title ?? "",
        dependentEntityHref: `/catalog/releases/view?id=${releaseRelationship.dependentReleaseId}`,
      }))
    );
  }, [releaseRelationships, navigate]);

  const fetchModalDependentReleases = useCallback(() => {
    applicationClient
      .getPagedReleases(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalDependentReleases(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalDependentReleases(), [fetchModalDependentReleases]);

  const onCreateReleaseRelationshipButtonClick = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onReleaseRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onReleaseRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setReleaseRelationships(
      releaseRelationships.filter((releaseRelationship) => releaseRelationship.dependentReleaseId !== entityRelationship.dependentEntityId)
    );
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
    const getReleaseRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (releaseRelationships) {
      const releaseRelationshipsMap = new Map<string, ReleaseRelationship>();
      for (const releaseRelationship of releaseRelationships) {
        releaseRelationshipsMap.set(getReleaseRelationshipKey(releaseRelationship.releaseId, releaseRelationship.dependentReleaseId), releaseRelationship);
      }
      setReleaseRelationships(
        entityRelationships.map(
          (entityRelationship) =>
            releaseRelationshipsMap.get(getReleaseRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)) as ReleaseRelationship
        )
      );
    }
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
    const existingEntityRelationship = releaseRelationships.find(
      (releaseRelationship) => releaseRelationship.dependentReleaseId === entityRelationship.dependentEntityId
    );
    if (existingEntityRelationship && !modalEntityRelationship) {
      alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.dependentRelease?.title}' release.`);
      return;
    }
    applicationClient.getRelease(entityRelationship.dependentEntityId).then((dependentRelease) => {
      const resultReleaseRelationship = new ReleaseRelationship({
        name: entityRelationship.name,
        description: entityRelationship.description,
        releaseId: release.id,
        dependentReleaseId: dependentRelease.id,
        release: release,
        dependentRelease: dependentRelease,
      });
      if (modalEntityRelationship) {
        setReleaseRelationships(
          releaseRelationships.map((releaseRelationship) => {
            if (releaseRelationship.dependentReleaseId === modalEntityRelationship.dependentEntityId) {
              return resultReleaseRelationship;
            } else {
              return releaseRelationship;
            }
          })
        );
      } else {
        setReleaseRelationships([...releaseRelationships, resultReleaseRelationship]);
      }
      setModalOpen(false);
      resetFormFields();
    });
  };

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (title?: string) => {
    setModalTitleFilter(title);
  };

  return (
    <>
      <Space className={styles.tabParagraph} direction="horizontal" align="baseline">
        <Typography.Paragraph>You can adjust order in which the release relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateReleaseRelationshipButtonClick}>
          Create a Release Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Release"
        dependentEntityColumnName="Dependent Release"
        loading={releaseRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onReleaseRelationshipEdit}
        onEntityRelationshipDelete={onReleaseRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <CreateEntityRelationshipModal
        title="Create Release Relationship"
        dependentEntityName="Dependent Release"
        dependentEntities={modalDependentReleases.map(({ id, title }) => ({ id, name: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntities={onSearchDependentEntities}
      />
    </>
  );
};

export default ReleaseEditPageReleaseRelationshipsTab;
