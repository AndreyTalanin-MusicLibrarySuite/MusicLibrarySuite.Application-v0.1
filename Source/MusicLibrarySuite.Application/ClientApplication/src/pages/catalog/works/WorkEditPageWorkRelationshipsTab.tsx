import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Work, WorkRelationship } from "../../../api/ApplicationClient";
import CreateEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/CreateEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./WorkEditPageWorkRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

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
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalDependentWorks, setModalDependentWorks] = useState<Work[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      workRelationships.map((workRelationship) => ({
        name: workRelationship.name,
        description: workRelationship.description,
        entityId: workRelationship.workId,
        entityName: workRelationship.work?.title ?? "",
        entityHref: `/catalog/works/view?id=${workRelationship.workId}`,
        dependentEntityId: workRelationship.dependentWorkId,
        dependentEntityName: workRelationship.dependentWork?.title ?? "",
        dependentEntityHref: `/catalog/works/view?id=${workRelationship.dependentWorkId}`,
      }))
    );
  }, [workRelationships, navigate]);

  const fetchModalDependentWorks = useCallback(() => {
    applicationClient
      .getPagedWorks(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalDependentWorks(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalDependentWorks(), [fetchModalDependentWorks]);

  const onCreateWorkRelationshipButtonClick = () => {
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

  const onWorkRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setWorkRelationships(workRelationships.filter((workRelationship) => workRelationship.dependentWorkId !== entityRelationship.dependentEntityId));
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
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
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
    const existingEntityRelationship = workRelationships.find((workRelationship) => workRelationship.dependentWorkId === entityRelationship.dependentEntityId);
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
        <Typography.Paragraph>You can adjust the order in which the work relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateWorkRelationshipButtonClick}>
          Create a Work Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Work"
        dependentEntityColumnName="Dependent Work"
        loading={workRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onWorkRelationshipEdit}
        onEntityRelationshipDelete={onWorkRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <CreateEntityRelationshipModal
        title="Create Work Relationship"
        dependentEntityName="Dependent Work"
        dependentEntities={modalDependentWorks.map(({ id, title }) => ({ id, name: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntities={onSearchDependentEntities}
      />
    </>
  );
};

export default WorkEditPageWorkRelationshipsTab;
