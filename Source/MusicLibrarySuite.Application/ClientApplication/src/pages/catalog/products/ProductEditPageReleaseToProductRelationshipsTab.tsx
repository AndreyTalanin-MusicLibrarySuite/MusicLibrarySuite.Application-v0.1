import { Typography } from "antd";
import { useCallback, useMemo } from "react";
import { ReleaseToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const tableEntityRelationships = useMemo(
    () =>
      releaseToProductRelationships.map((releaseToProductRelationship) => ({
        name: releaseToProductRelationship.name,
        description: releaseToProductRelationship.description,
        entityId: releaseToProductRelationship.releaseId,
        entityName: releaseToProductRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToProductRelationship.releaseId}`,
        dependentEntityId: releaseToProductRelationship.productId,
        dependentEntityName: releaseToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseToProductRelationship.productId}`,
      })),
    [releaseToProductRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
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
    },
    [releaseToProductRelationships, setReleaseToProductRelationships]
  );

  const title = <Title level={5}>Reorder Release-to-Product Relationships</Title>;

  return (
    <ActionTab title={title}>
      <Paragraph>You can adjust order in which the release-to-product relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        reorderMode
        entityColumnName="Release"
        dependentEntityColumnName="Product"
        loading={releaseToProductRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ProductEditPageReleaseToProductRelationshipsTab;
