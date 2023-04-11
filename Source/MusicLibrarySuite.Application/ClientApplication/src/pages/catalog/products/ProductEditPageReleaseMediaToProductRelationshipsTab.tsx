import { Typography } from "antd";
import { useCallback, useMemo } from "react";
import { ReleaseMediaToProductRelationship } from "../../../api/ApplicationClient";
import ReleaseMediaRelationshipTable, { ReleaseMediaRelationship } from "../../../components/tables/ReleaseMediaRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { getReleaseMediaKey } from "../../../helpers/releaseMediaHelpers";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

export interface ProductEditPageReleaseMediaToProductRelationshipsTabProps {
  releaseMediaToProductRelationships: ReleaseMediaToProductRelationship[];
  releaseMediaToProductRelationshipsLoading: boolean;
  setReleaseMediaToProductRelationships: (releaseMediaToProductRelationships: ReleaseMediaToProductRelationship[]) => void;
}

const ProductEditPageReleaseMediaToProductRelationshipsTab = ({
  releaseMediaToProductRelationships,
  releaseMediaToProductRelationshipsLoading,
  setReleaseMediaToProductRelationships,
}: ProductEditPageReleaseMediaToProductRelationshipsTabProps) => {
  const tableReleaseMediaRelationships = useMemo(
    () =>
      releaseMediaToProductRelationships.map((releaseMediaToProductRelationship) => ({
        name: releaseMediaToProductRelationship.name,
        description: releaseMediaToProductRelationship.description,
        releaseMediaId: getReleaseMediaKey(releaseMediaToProductRelationship.releaseMedia!),
        releaseMediaTitle: releaseMediaToProductRelationship.releaseMedia!.title,
        releaseMediaHref: `/catalog/releases/view?id=${releaseMediaToProductRelationship.releaseId}`,
        releaseMediaNumber: releaseMediaToProductRelationship.releaseMedia!.mediaNumber,
        dependentEntityId: releaseMediaToProductRelationship.productId,
        dependentEntityName: releaseMediaToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseMediaToProductRelationship.productId}`,
      })),
    [releaseMediaToProductRelationships]
  );

  const onReleaseMediaRelationshipsOrderChange = useCallback(
    (releaseMediaRelationships: ReleaseMediaRelationship[]) => {
      const getReleaseMediaToProductRelationshipKey = (releaseMediaId: string, dependentEntityId: string) => {
        return `(${releaseMediaId}, ${dependentEntityId})`;
      };
      if (releaseMediaToProductRelationships) {
        const releaseMediaToProductRelationshipsMap = new Map<string, ReleaseMediaToProductRelationship>();
        for (const releaseMediaToProductRelationship of releaseMediaToProductRelationships) {
          releaseMediaToProductRelationshipsMap.set(
            getReleaseMediaToProductRelationshipKey(
              getReleaseMediaKey(releaseMediaToProductRelationship.releaseMedia!),
              releaseMediaToProductRelationship.productId
            ),
            releaseMediaToProductRelationship
          );
        }
        setReleaseMediaToProductRelationships(
          releaseMediaRelationships.map(
            (releaseMediaRelationship) =>
              releaseMediaToProductRelationshipsMap.get(
                getReleaseMediaToProductRelationshipKey(releaseMediaRelationship.releaseMediaId, releaseMediaRelationship.dependentEntityId)
              ) as ReleaseMediaToProductRelationship
          )
        );
      }
    },
    [releaseMediaToProductRelationships, setReleaseMediaToProductRelationships]
  );

  const title = <Title level={5}>Reorder Release-Media-to-Product Relationships</Title>;

  return (
    <ActionTab title={title}>
      <Paragraph>You can adjust order in which the release-media-to-product relationships are displayed by dragging them.</Paragraph>
      <ReleaseMediaRelationshipTable
        reorderMode
        dependentEntityColumnName="Product"
        loading={releaseMediaToProductRelationshipsLoading}
        releaseMediaRelationships={tableReleaseMediaRelationships}
        onReleaseMediaRelationshipsChange={onReleaseMediaRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ProductEditPageReleaseMediaToProductRelationshipsTab;
