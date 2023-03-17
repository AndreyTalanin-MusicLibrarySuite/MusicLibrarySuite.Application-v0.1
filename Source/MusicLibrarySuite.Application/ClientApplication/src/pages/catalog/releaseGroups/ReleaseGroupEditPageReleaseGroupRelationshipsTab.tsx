import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseGroup, ReleaseGroupRelationship } from "../../../api/ApplicationClient";
import CreateEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/CreateEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ReleaseGroupEditPageReleaseGroupRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ReleaseGroupEditPageReleaseGroupRelationshipsTabProps {
  releaseGroup: ReleaseGroup;
  releaseGroupRelationships: ReleaseGroupRelationship[];
  releaseGroupRelationshipsLoading: boolean;
  setReleaseGroupRelationships: (releaseGroupRelationships: ReleaseGroupRelationship[]) => void;
}

const ReleaseGroupEditPageReleaseGroupRelationshipsTab = ({
  releaseGroup,
  releaseGroupRelationships,
  releaseGroupRelationshipsLoading,
  setReleaseGroupRelationships,
}: ReleaseGroupEditPageReleaseGroupRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalDependentReleaseGroups, setModalDependentReleaseGroups] = useState<ReleaseGroup[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      releaseGroupRelationships.map((releaseGroupRelationship) => ({
        name: releaseGroupRelationship.name,
        description: releaseGroupRelationship.description,
        entityId: releaseGroupRelationship.releaseGroupId,
        entityName: releaseGroupRelationship.releaseGroup?.title ?? "",
        entityHref: `/catalog/releaseGroups/view?id=${releaseGroupRelationship.releaseGroupId}`,
        dependentEntityId: releaseGroupRelationship.dependentReleaseGroupId,
        dependentEntityName: releaseGroupRelationship.dependentReleaseGroup?.title ?? "",
        dependentEntityHref: `/catalog/releaseGroups/view?id=${releaseGroupRelationship.dependentReleaseGroupId}`,
      }))
    );
  }, [releaseGroupRelationships, navigate]);

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getReleaseGroups([modalEntityRelationship.dependentEntityId])
        .then((releaseGroups) => setModalDependentReleaseGroups(releaseGroups))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  const fetchModalDependentReleaseGroups = useCallback(() => {
    applicationClient
      .getPagedReleaseGroups(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalDependentReleaseGroups(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalDependentReleaseGroups(), [fetchModalDependentReleaseGroups]);

  const onCreateReleaseGroupRelationshipButtonClick = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onReleaseGroupRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onReleaseGroupRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setReleaseGroupRelationships(
      releaseGroupRelationships.filter((releaseGroupRelationship) => releaseGroupRelationship.dependentReleaseGroupId !== entityRelationship.dependentEntityId)
    );
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
    const getReleaseGroupRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (releaseGroupRelationships) {
      const releaseGroupRelationshipsMap = new Map<string, ReleaseGroupRelationship>();
      for (const releaseGroupRelationship of releaseGroupRelationships) {
        releaseGroupRelationshipsMap.set(
          getReleaseGroupRelationshipKey(releaseGroupRelationship.releaseGroupId, releaseGroupRelationship.dependentReleaseGroupId),
          releaseGroupRelationship
        );
      }
      setReleaseGroupRelationships(
        entityRelationships.map(
          (entityRelationship) =>
            releaseGroupRelationshipsMap.get(
              getReleaseGroupRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)
            ) as ReleaseGroupRelationship
        )
      );
    }
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
    const existingEntityRelationship = releaseGroupRelationships.find(
      (releaseGroupRelationship) => releaseGroupRelationship.dependentReleaseGroupId === entityRelationship.dependentEntityId
    );
    if (existingEntityRelationship && !modalEntityRelationship) {
      alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.dependentReleaseGroup?.title}' release group.`);
      return;
    }
    applicationClient.getReleaseGroup(entityRelationship.dependentEntityId).then((dependentReleaseGroup) => {
      const resultReleaseGroupRelationship = new ReleaseGroupRelationship({
        name: entityRelationship.name,
        description: entityRelationship.description,
        releaseGroupId: releaseGroup.id,
        dependentReleaseGroupId: dependentReleaseGroup.id,
        releaseGroup: releaseGroup,
        dependentReleaseGroup: dependentReleaseGroup,
      });
      if (modalEntityRelationship) {
        setReleaseGroupRelationships(
          releaseGroupRelationships.map((releaseGroupRelationship) => {
            if (releaseGroupRelationship.dependentReleaseGroupId === modalEntityRelationship.dependentEntityId) {
              return resultReleaseGroupRelationship;
            } else {
              return releaseGroupRelationship;
            }
          })
        );
      } else {
        setReleaseGroupRelationships([...releaseGroupRelationships, resultReleaseGroupRelationship]);
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
        <Typography.Paragraph>You can adjust order in which the release group relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateReleaseGroupRelationshipButtonClick}>
          Create a Release Group Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Release Group"
        dependentEntityColumnName="Dependent Release Group"
        loading={releaseGroupRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onReleaseGroupRelationshipEdit}
        onEntityRelationshipDelete={onReleaseGroupRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <CreateEntityRelationshipModal
        title="Create Release Group Relationship"
        dependentEntityName="Dependent Release Group"
        dependentEntityOptions={modalDependentReleaseGroups.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />
    </>
  );
};

export default ReleaseGroupEditPageReleaseGroupRelationshipsTab;
