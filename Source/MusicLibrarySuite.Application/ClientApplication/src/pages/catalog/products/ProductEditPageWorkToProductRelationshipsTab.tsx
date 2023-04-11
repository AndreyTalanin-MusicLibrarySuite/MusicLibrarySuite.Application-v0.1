import { Typography } from "antd";
import { useCallback, useMemo } from "react";
import { WorkToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

export interface ProductEditPageWorkToProductRelationshipsTabProps {
  workToProductRelationships: WorkToProductRelationship[];
  workToProductRelationshipsLoading: boolean;
  setWorkToProductRelationships: (workToProductRelationships: WorkToProductRelationship[]) => void;
}

const ProductEditPageWorkToProductRelationshipsTab = ({
  workToProductRelationships,
  workToProductRelationshipsLoading,
  setWorkToProductRelationships,
}: ProductEditPageWorkToProductRelationshipsTabProps) => {
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

  const title = <Title level={5}>Reorder Work-to-Product Relationships</Title>;

  return (
    <ActionTab title={title}>
      <Paragraph>You can adjust order in which the work-to-product relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        reorderMode
        entityColumnName="Work"
        dependentEntityColumnName="Product"
        loading={workToProductRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ProductEditPageWorkToProductRelationshipsTab;
