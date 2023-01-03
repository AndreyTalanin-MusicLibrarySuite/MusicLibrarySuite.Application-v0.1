import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Product, Work, WorkToProductRelationship } from "../../../api/ApplicationClient";
import CreateEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/CreateEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./WorkEditPageWorkToProductRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface WorkEditPageWorkToProductRelationshipsTabProps {
  work: Work;
  workToProductRelationships: WorkToProductRelationship[];
  workToProductRelationshipsLoading: boolean;
  setWorkToProductRelationships: (workToProductRelationships: WorkToProductRelationship[]) => void;
}

const WorkEditPageWorkToProductRelationshipsTab = ({
  work,
  workToProductRelationships,
  workToProductRelationshipsLoading,
  setWorkToProductRelationships,
}: WorkEditPageWorkToProductRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      workToProductRelationships.map((workToProductRelationship) => ({
        name: workToProductRelationship.name,
        description: workToProductRelationship.description,
        entityId: workToProductRelationship.workId,
        entityName: workToProductRelationship.work?.title ?? "",
        entityHref: `/catalog/works/view?id=${workToProductRelationship.workId}`,
        dependentEntityId: workToProductRelationship.productId,
        dependentEntityName: workToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${workToProductRelationship.productId}`,
      }))
    );
  }, [workToProductRelationships, navigate]);

  const fetchModalProducts = useCallback(() => {
    applicationClient
      .getPagedProducts(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalProducts(), [fetchModalProducts]);

  const onCreateWorkToProductRelationshipButtonClick = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onWorkToProductRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onWorkToProductRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setWorkToProductRelationships(
      workToProductRelationships.filter((workToProductRelationship) => workToProductRelationship.productId !== entityRelationship.dependentEntityId)
    );
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
    const getWorkToProductRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (workToProductRelationships) {
      const workToProductRelationshipsMap = new Map<string, WorkToProductRelationship>();
      for (const workToProductRelationship of workToProductRelationships) {
        workToProductRelationshipsMap.set(
          getWorkToProductRelationshipKey(workToProductRelationship.workId, workToProductRelationship.productId),
          workToProductRelationship
        );
      }
      setWorkToProductRelationships(
        entityRelationships.map(
          (entityRelationship) =>
            workToProductRelationshipsMap.get(
              getWorkToProductRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)
            ) as WorkToProductRelationship
        )
      );
    }
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
    const existingEntityRelationship = workToProductRelationships.find(
      (workToProductRelationship) => workToProductRelationship.productId === entityRelationship.dependentEntityId
    );
    if (existingEntityRelationship && !modalEntityRelationship) {
      alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.product?.title}' product.`);
      return;
    }
    applicationClient.getProduct(entityRelationship.dependentEntityId).then((product) => {
      const resultWorkToProductRelationship = new WorkToProductRelationship({
        name: entityRelationship.name,
        description: entityRelationship.description,
        workId: work.id,
        productId: product.id,
        work: work,
        product: product,
      });
      if (modalEntityRelationship) {
        setWorkToProductRelationships(
          workToProductRelationships.map((workToProductRelationship) => {
            if (workToProductRelationship.productId === modalEntityRelationship.dependentEntityId) {
              return resultWorkToProductRelationship;
            } else {
              return workToProductRelationship;
            }
          })
        );
      } else {
        setWorkToProductRelationships([...workToProductRelationships, resultWorkToProductRelationship]);
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
        <Typography.Paragraph>You can adjust order in which the work-to-product relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateWorkToProductRelationshipButtonClick}>
          Create a Work-to-Product Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Work"
        dependentEntityColumnName="Product"
        loading={workToProductRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onWorkToProductRelationshipEdit}
        onEntityRelationshipDelete={onWorkToProductRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <CreateEntityRelationshipModal
        title="Create Work-to-Product Relationship"
        dependentEntityName="Product"
        dependentEntities={modalProducts.map(({ id, title }) => ({ id, name: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntities={onSearchDependentEntities}
      />
    </>
  );
};

export default WorkEditPageWorkToProductRelationshipsTab;
