import { Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import "antd/dist/antd.min.css";

export interface ProductEditPageReleaseToProductRelationshipsTabProps {
  releaseToProductRelationships: ReleaseToProductRelationship[];
  releaseToProductRelationshipsLoading: boolean;
  setReleaseToProductRelationships: (releaseToProductRelationships: ReleaseToProductRelationship[]) => void;
}

const ProductEditPageReleaseToProductRelationshipsTab = ({
  releaseToProductRelationships,
  releaseToProductRelationshipsLoading,
  setReleaseToProductRelationships,
}: ProductEditPageReleaseToProductRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  useEffect(() => {
    setTableEntityRelationships(
      releaseToProductRelationships.map((releaseToProductRelationship) => ({
        name: releaseToProductRelationship.name,
        description: releaseToProductRelationship.description,
        entityId: releaseToProductRelationship.releaseId,
        entityName: releaseToProductRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToProductRelationship.releaseId}`,
        dependentEntityId: releaseToProductRelationship.productId,
        dependentEntityName: releaseToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseToProductRelationship.productId}`,
      }))
    );
  }, [releaseToProductRelationships, navigate]);

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
    const getReleaseToProductRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (releaseToProductRelationships) {
      const releaseToProductRelationshipsMap = new Map<string, ReleaseToProductRelationship>();
      for (const releaseToProductRelationship of releaseToProductRelationships) {
        releaseToProductRelationshipsMap.set(
          getReleaseToProductRelationshipKey(releaseToProductRelationship.releaseId, releaseToProductRelationship.productId),
          releaseToProductRelationship
        );
      }
      setReleaseToProductRelationships(
        entityRelationships.map(
          (entityRelationship) =>
            releaseToProductRelationshipsMap.get(
              getReleaseToProductRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)
            ) as ReleaseToProductRelationship
        )
      );
    }
  };

  return (
    <>
      <Typography.Paragraph>You can adjust order in which the release-to-product relationships are displayed by dragging them.</Typography.Paragraph>
      <EntityRelationshipTable
        reorderMode
        entityColumnName="Release"
        dependentEntityColumnName="Product"
        loading={releaseToProductRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
    </>
  );
};

export default ProductEditPageReleaseToProductRelationshipsTab;
