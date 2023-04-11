import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, Work, WorkToProductRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      workToProductRelationships.map((workToProductRelationship) => ({
        name: workToProductRelationship.name,
        description: workToProductRelationship.description,
        entityId: workToProductRelationship.workId,
        entityName: workToProductRelationship.work?.title ?? "",
        entityHref: `/catalog/works/view?id=${workToProductRelationship.workId}`,
        dependentEntityId: workToProductRelationship.productId,
        dependentEntityName: workToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${workToProductRelationship.productId}`,
      })),

    [workToProductRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getProducts([modalEntityRelationship.dependentEntityId])
        .then((products) => setModalProducts(products))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedProducts(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onWorkToProductRelationshipCreate = () => {
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

  const onWorkToProductRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setWorkToProductRelationships(
        workToProductRelationships.filter((workToProductRelationship) => workToProductRelationship.productId !== entityRelationship.dependentEntityId)
      );
    },
    [workToProductRelationships, setWorkToProductRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
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
    },
    [workToProductRelationships, setWorkToProductRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
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
    },
    [work, workToProductRelationships, setWorkToProductRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Work-to-Product Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onWorkToProductRelationshipCreate}>
        Create Work-to-Product Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Work-to-Product Relationship"
        dependentEntityName="Product"
        dependentEntityOptions={modalProducts.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalProducts, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the work-to-product relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Work"
        dependentEntityColumnName="Product"
        loading={workToProductRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onWorkToProductRelationshipEdit}
        onEntityRelationshipDelete={onWorkToProductRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default WorkEditPageWorkToProductRelationshipsTab;
