import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Release, ReleaseRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalDependentReleases, setModalDependentReleases] = useState<Release[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      releaseRelationships.map((releaseRelationship) => ({
        name: releaseRelationship.name,
        description: releaseRelationship.description,
        entityId: releaseRelationship.releaseId,
        entityName: releaseRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseRelationship.releaseId}`,
        dependentEntityId: releaseRelationship.dependentReleaseId,
        dependentEntityName: releaseRelationship.dependentRelease?.title ?? "",
        dependentEntityHref: `/catalog/releases/view?id=${releaseRelationship.dependentReleaseId}`,
      })),
    [releaseRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getReleases([modalEntityRelationship.dependentEntityId])
        .then((releases) => setModalDependentReleases(releases))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedReleases(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalDependentReleases(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onReleaseRelationshipCreate = () => {
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

  const onReleaseRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setReleaseRelationships(
        releaseRelationships.filter((releaseRelationship) => releaseRelationship.dependentReleaseId !== entityRelationship.dependentEntityId)
      );
    },
    [releaseRelationships, setReleaseRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
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
    },
    [releaseRelationships, setReleaseRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
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
    },
    [release, releaseRelationships, setReleaseRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Release Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onReleaseRelationshipCreate}>
        Create Release Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Release Relationship"
        dependentEntityName="Dependent Release"
        dependentEntityOptions={modalDependentReleases.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalDependentReleases, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the release relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Release"
        dependentEntityColumnName="Dependent Release"
        loading={releaseRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onReleaseRelationshipEdit}
        onEntityRelationshipDelete={onReleaseRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ReleaseEditPageReleaseRelationshipsTab;
