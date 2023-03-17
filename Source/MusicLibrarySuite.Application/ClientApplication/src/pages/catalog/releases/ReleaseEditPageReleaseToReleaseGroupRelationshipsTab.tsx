import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Release, ReleaseGroup, ReleaseToReleaseGroupRelationship } from "../../../api/ApplicationClient";
import CreateEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/CreateEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ReleaseEditPageReleaseToReleaseGroupRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ReleaseEditPageReleaseToReleaseGroupRelationshipsTabProps {
  release: Release;
  releaseToReleaseGroupRelationships: ReleaseToReleaseGroupRelationship[];
  releaseToReleaseGroupRelationshipsLoading: boolean;
  setReleaseToReleaseGroupRelationships: (releaseToReleaseGroupRelationships: ReleaseToReleaseGroupRelationship[]) => void;
}

const ReleaseEditPageReleaseToReleaseGroupRelationshipsTab = ({
  release,
  releaseToReleaseGroupRelationships,
  releaseToReleaseGroupRelationshipsLoading,
  setReleaseToReleaseGroupRelationships,
}: ReleaseEditPageReleaseToReleaseGroupRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalReleaseGroups, setModalReleaseGroups] = useState<ReleaseGroup[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      releaseToReleaseGroupRelationships.map((releaseToReleaseGroupRelationship) => ({
        name: releaseToReleaseGroupRelationship.name,
        description: releaseToReleaseGroupRelationship.description,
        entityId: releaseToReleaseGroupRelationship.releaseId,
        entityName: releaseToReleaseGroupRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToReleaseGroupRelationship.releaseId}`,
        dependentEntityId: releaseToReleaseGroupRelationship.releaseGroupId,
        dependentEntityName: releaseToReleaseGroupRelationship.releaseGroup?.title ?? "",
        dependentEntityHref: `/catalog/releaseGroups/view?id=${releaseToReleaseGroupRelationship.releaseGroupId}`,
      }))
    );
  }, [releaseToReleaseGroupRelationships, navigate]);

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getReleaseGroups([modalEntityRelationship.dependentEntityId])
        .then((releaseGroups) => setModalReleaseGroups(releaseGroups))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  const fetchModalReleaseGroups = useCallback(() => {
    applicationClient
      .getPagedReleaseGroups(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalReleaseGroups(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalReleaseGroups(), [fetchModalReleaseGroups]);

  const onCreateReleaseToReleaseGroupRelationshipButtonClick = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onReleaseToReleaseGroupRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onReleaseToReleaseGroupRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setReleaseToReleaseGroupRelationships(
      releaseToReleaseGroupRelationships.filter(
        (releaseToReleaseGroupRelationship) => releaseToReleaseGroupRelationship.releaseGroupId !== entityRelationship.dependentEntityId
      )
    );
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
    const getReleaseToReleaseGroupRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (releaseToReleaseGroupRelationships) {
      const releaseToReleaseGroupRelationshipsMap = new Map<string, ReleaseToReleaseGroupRelationship>();
      for (const releaseToReleaseGroupRelationship of releaseToReleaseGroupRelationships) {
        releaseToReleaseGroupRelationshipsMap.set(
          getReleaseToReleaseGroupRelationshipKey(releaseToReleaseGroupRelationship.releaseId, releaseToReleaseGroupRelationship.releaseGroupId),
          releaseToReleaseGroupRelationship
        );
      }
      setReleaseToReleaseGroupRelationships(
        entityRelationships.map(
          (entityRelationship) =>
            releaseToReleaseGroupRelationshipsMap.get(
              getReleaseToReleaseGroupRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)
            ) as ReleaseToReleaseGroupRelationship
        )
      );
    }
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
    const existingEntityRelationship = releaseToReleaseGroupRelationships.find(
      (releaseToReleaseGroupRelationship) => releaseToReleaseGroupRelationship.releaseGroupId === entityRelationship.dependentEntityId
    );
    if (existingEntityRelationship && !modalEntityRelationship) {
      alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.releaseGroup?.title}' release group.`);
      return;
    }
    applicationClient.getReleaseGroup(entityRelationship.dependentEntityId).then((releaseGroup) => {
      const resultReleaseToReleaseGroupRelationship = new ReleaseToReleaseGroupRelationship({
        name: entityRelationship.name,
        description: entityRelationship.description,
        releaseId: release.id,
        releaseGroupId: releaseGroup.id,
        release: release,
        releaseGroup: releaseGroup,
      });
      if (modalEntityRelationship) {
        setReleaseToReleaseGroupRelationships(
          releaseToReleaseGroupRelationships.map((releaseToReleaseGroupRelationship) => {
            if (releaseToReleaseGroupRelationship.releaseGroupId === modalEntityRelationship.dependentEntityId) {
              return resultReleaseToReleaseGroupRelationship;
            } else {
              return releaseToReleaseGroupRelationship;
            }
          })
        );
      } else {
        setReleaseToReleaseGroupRelationships([...releaseToReleaseGroupRelationships, resultReleaseToReleaseGroupRelationship]);
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
        <Typography.Paragraph>You can adjust order in which the release-to-release-group relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateReleaseToReleaseGroupRelationshipButtonClick}>
          Create a Release-to-Release-Group Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Release"
        dependentEntityColumnName="Release Group"
        loading={releaseToReleaseGroupRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onReleaseToReleaseGroupRelationshipEdit}
        onEntityRelationshipDelete={onReleaseToReleaseGroupRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <CreateEntityRelationshipModal
        title="Create Release-to-Release-Group Relationship"
        dependentEntityName="Release Group"
        dependentEntityOptions={modalReleaseGroups.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />
    </>
  );
};

export default ReleaseEditPageReleaseToReleaseGroupRelationshipsTab;
