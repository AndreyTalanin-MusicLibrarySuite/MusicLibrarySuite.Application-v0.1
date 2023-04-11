import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Work, WorkRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

export interface WorkEditPageWorkRelationshipsTabProps {
  work: Work;
  workRelationships: WorkRelationship[];
  workRelationshipsLoading: boolean;
  setWorkRelationships: (workRelationships: WorkRelationship[]) => void;
}

const WorkEditPageWorkRelationshipsTab = ({
  work,
  workRelationships,
  workRelationshipsLoading,
  setWorkRelationships,
}: WorkEditPageWorkRelationshipsTabProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalDependentWorks, setModalDependentWorks] = useState<Work[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      workRelationships.map((workRelationship) => ({
        name: workRelationship.name,
        description: workRelationship.description,
        entityId: workRelationship.workId,
        entityName: workRelationship.work?.title ?? "",
        entityHref: `/catalog/works/view?id=${workRelationship.workId}`,
        dependentEntityId: workRelationship.dependentWorkId,
        dependentEntityName: workRelationship.dependentWork?.title ?? "",
        dependentEntityHref: `/catalog/works/view?id=${workRelationship.dependentWorkId}`,
      })),
    [workRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getWorks([modalEntityRelationship.dependentEntityId])
        .then((works) => setModalDependentWorks(works))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedWorks(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalDependentWorks(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onWorkRelationshipCreate = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onWorkRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onWorkRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setWorkRelationships(workRelationships.filter((workRelationship) => workRelationship.dependentWorkId !== entityRelationship.dependentEntityId));
    },
    [workRelationships, setWorkRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
      const getWorkRelationshipKey = (entityId: string, dependentEntityId: string) => {
        return `(${entityId}, ${dependentEntityId})`;
      };
      if (workRelationships) {
        const workRelationshipsMap = new Map<string, WorkRelationship>();
        for (const workRelationship of workRelationships) {
          workRelationshipsMap.set(getWorkRelationshipKey(workRelationship.workId, workRelationship.dependentWorkId), workRelationship);
        }
        setWorkRelationships(
          entityRelationships.map(
            (entityRelationship) =>
              workRelationshipsMap.get(getWorkRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)) as WorkRelationship
          )
        );
      }
    },
    [workRelationships, setWorkRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
      const existingEntityRelationship = workRelationships.find(
        (workRelationship) => workRelationship.dependentWorkId === entityRelationship.dependentEntityId
      );
      if (existingEntityRelationship && !modalEntityRelationship) {
        alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.dependentWork?.title}' work.`);
        return;
      }
      applicationClient.getWork(entityRelationship.dependentEntityId).then((dependentWork) => {
        const resultWorkRelationship = new WorkRelationship({
          name: entityRelationship.name,
          description: entityRelationship.description,
          workId: work.id,
          dependentWorkId: dependentWork.id,
          work: work,
          dependentWork: dependentWork,
        });
        if (modalEntityRelationship) {
          setWorkRelationships(
            workRelationships.map((workRelationship) => {
              if (workRelationship.dependentWorkId === modalEntityRelationship.dependentEntityId) {
                return resultWorkRelationship;
              } else {
                return workRelationship;
              }
            })
          );
        } else {
          setWorkRelationships([...workRelationships, resultWorkRelationship]);
        }
        setModalOpen(false);
        resetFormFields();
      });
    },
    [work, workRelationships, setWorkRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Work Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onWorkRelationshipCreate}>
        Create Work Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Work Relationship"
        dependentEntityName="Dependent Work"
        dependentEntityOptions={modalDependentWorks.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalDependentWorks, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the work relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Work"
        dependentEntityColumnName="Dependent Work"
        loading={workRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onWorkRelationshipEdit}
        onEntityRelationshipDelete={onWorkRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default WorkEditPageWorkRelationshipsTab;
