import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReleaseGroup, ReleaseGroupRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalDependentReleaseGroups, setModalDependentReleaseGroups] = useState<ReleaseGroup[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      releaseGroupRelationships.map((releaseGroupRelationship) => ({
        name: releaseGroupRelationship.name,
        description: releaseGroupRelationship.description,
        entityId: releaseGroupRelationship.releaseGroupId,
        entityName: releaseGroupRelationship.releaseGroup?.title ?? "",
        entityHref: `/catalog/releaseGroups/view?id=${releaseGroupRelationship.releaseGroupId}`,
        dependentEntityId: releaseGroupRelationship.dependentReleaseGroupId,
        dependentEntityName: releaseGroupRelationship.dependentReleaseGroup?.title ?? "",
        dependentEntityHref: `/catalog/releaseGroups/view?id=${releaseGroupRelationship.dependentReleaseGroupId}`,
      })),
    [releaseGroupRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getReleaseGroups([modalEntityRelationship.dependentEntityId])
        .then((releaseGroups) => setModalDependentReleaseGroups(releaseGroups))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedReleaseGroups(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalDependentReleaseGroups(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onReleaseGroupRelationshipCreate = () => {
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

  const onReleaseGroupRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setReleaseGroupRelationships(
        releaseGroupRelationships.filter(
          (releaseGroupRelationship) => releaseGroupRelationship.dependentReleaseGroupId !== entityRelationship.dependentEntityId
        )
      );
    },
    [releaseGroupRelationships, setReleaseGroupRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
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
    },
    [releaseGroupRelationships, setReleaseGroupRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
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
    },
    [releaseGroup, releaseGroupRelationships, setReleaseGroupRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Release Group Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onReleaseGroupRelationshipCreate}>
        Create Release Group Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Release Group Relationship"
        dependentEntityName="Dependent Release Group"
        dependentEntityOptions={modalDependentReleaseGroups.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalDependentReleaseGroups, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the release group relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Release Group"
        dependentEntityColumnName="Dependent Release Group"
        loading={releaseGroupRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onReleaseGroupRelationshipEdit}
        onEntityRelationshipDelete={onReleaseGroupRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ReleaseGroupEditPageReleaseGroupRelationshipsTab;
