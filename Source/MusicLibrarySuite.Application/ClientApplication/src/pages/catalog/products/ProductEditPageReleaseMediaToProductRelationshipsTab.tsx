import { Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseMediaToProductRelationship } from "../../../api/ApplicationClient";
import ReleaseMediaRelationshipTable, { ReleaseMediaRelationship } from "../../../components/tables/ReleaseMediaRelationshipTable";
import { getReleaseMediaKey } from "../../../helpers/ReleaseMediaHelpers";
import "antd/dist/antd.min.css";

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
  const navigate = useNavigate();

  const [releaseMediaRelationships, setReleaseMediaRelationships] = useState<ReleaseMediaRelationship[]>([]);

  useEffect(() => {
    setReleaseMediaRelationships(
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
      }))
    );
  }, [releaseMediaToProductRelationships, navigate]);

  const onReleaseMediaRelationshipsChange = (releaseMediaRelationships: ReleaseMediaRelationship[]) => {
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
  };

  return (
    <>
      <Typography.Paragraph>You can adjust order in which the release-media-to-product relationships are displayed by dragging them.</Typography.Paragraph>
      <ReleaseMediaRelationshipTable
        reorderMode
        dependentEntityColumnName="Product"
        loading={releaseMediaToProductRelationshipsLoading}
        releaseMediaRelationships={releaseMediaRelationships}
        onReleaseMediaRelationshipsChange={onReleaseMediaRelationshipsChange}
      />
    </>
  );
};

export default ProductEditPageReleaseMediaToProductRelationshipsTab;
