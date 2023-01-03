import { Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { WorkToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import "antd/dist/antd.min.css";

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
  const navigate = useNavigate();

  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

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

  return (
    <>
      <Typography.Paragraph>You can adjust order in which the work-to-product relationships are displayed by dragging them.</Typography.Paragraph>
      <EntityRelationshipTable
        reorderMode
        entityColumnName="Work"
        dependentEntityColumnName="Product"
        loading={workToProductRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
    </>
  );
};

export default ProductEditPageWorkToProductRelationshipsTab;
