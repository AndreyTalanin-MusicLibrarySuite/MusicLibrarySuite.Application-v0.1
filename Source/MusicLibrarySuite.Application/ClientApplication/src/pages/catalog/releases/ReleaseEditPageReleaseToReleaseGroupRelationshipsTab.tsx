import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Release, ReleaseGroup, ReleaseToReleaseGroupRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalReleaseGroups, setModalReleaseGroups] = useState<ReleaseGroup[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      releaseToReleaseGroupRelationships.map((releaseToReleaseGroupRelationship) => ({
        name: releaseToReleaseGroupRelationship.name,
        description: releaseToReleaseGroupRelationship.description,
        entityId: releaseToReleaseGroupRelationship.releaseId,
        entityName: releaseToReleaseGroupRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToReleaseGroupRelationship.releaseId}`,
        dependentEntityId: releaseToReleaseGroupRelationship.releaseGroupId,
        dependentEntityName: releaseToReleaseGroupRelationship.releaseGroup?.title ?? "",
        dependentEntityHref: `/catalog/releaseGroups/view?id=${releaseToReleaseGroupRelationship.releaseGroupId}`,
      })),
    [releaseToReleaseGroupRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getReleaseGroups([modalEntityRelationship.dependentEntityId])
        .then((releaseGroups) => setModalReleaseGroups(releaseGroups))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedReleaseGroups(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalReleaseGroups(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onReleaseToReleaseGroupRelationshipCreate = () => {
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

  const onReleaseToReleaseGroupRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setReleaseToReleaseGroupRelationships(
        releaseToReleaseGroupRelationships.filter(
          (releaseToReleaseGroupRelationship) => releaseToReleaseGroupRelationship.releaseGroupId !== entityRelationship.dependentEntityId
        )
      );
    },
    [releaseToReleaseGroupRelationships, setReleaseToReleaseGroupRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
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
    },
    [releaseToReleaseGroupRelationships, setReleaseToReleaseGroupRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
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
    },
    [release, releaseToReleaseGroupRelationships, setReleaseToReleaseGroupRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Release-to-Release-Group Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onReleaseToReleaseGroupRelationshipCreate}>
        Create Release-to-Release-Group Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Release-to-Release-Group Relationship"
        dependentEntityName="Release Group"
        dependentEntityOptions={modalReleaseGroups.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalReleaseGroups, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the release-to-release-group relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Release"
        dependentEntityColumnName="Release Group"
        loading={releaseToReleaseGroupRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onReleaseToReleaseGroupRelationshipEdit}
        onEntityRelationshipDelete={onReleaseToReleaseGroupRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ReleaseEditPageReleaseToReleaseGroupRelationshipsTab;
