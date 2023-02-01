import { Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseTrackToProductRelationship } from "../../../api/ApplicationClient";
import ReleaseTrackRelationshipTable, { ReleaseTrackRelationship } from "../../../components/tables/ReleaseTrackRelationshipTable";
import { getReleaseTrackKey } from "../../../helpers/ReleaseTrackHelpers";
import "antd/dist/antd.min.css";

export interface ProductEditPageReleaseTrackToProductRelationshipsTabProps {
  releaseTrackToProductRelationships: ReleaseTrackToProductRelationship[];
  releaseTrackToProductRelationshipsLoading: boolean;
  setReleaseTrackToProductRelationships: (releaseTrackToProductRelationships: ReleaseTrackToProductRelationship[]) => void;
}

const ProductEditPageReleaseTrackToProductRelationshipsTab = ({
  releaseTrackToProductRelationships,
  releaseTrackToProductRelationshipsLoading,
  setReleaseTrackToProductRelationships,
}: ProductEditPageReleaseTrackToProductRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [releaseTrackRelationships, setReleaseTrackRelationships] = useState<ReleaseTrackRelationship[]>([]);

  useEffect(() => {
    setReleaseTrackRelationships(
      releaseTrackToProductRelationships.map((releaseTrackToProductRelationship) => ({
        name: releaseTrackToProductRelationship.name,
        description: releaseTrackToProductRelationship.description,
        releaseTrackId: getReleaseTrackKey(releaseTrackToProductRelationship.releaseTrack!),
        releaseTrackTitle: releaseTrackToProductRelationship.releaseTrack!.title,
        releaseTrackHref: `/catalog/releases/view?id=${releaseTrackToProductRelationship.releaseId}`,
        releaseTrackNumber: releaseTrackToProductRelationship.releaseTrack!.trackNumber,
        releaseMediaNumber: releaseTrackToProductRelationship.releaseTrack!.mediaNumber,
        dependentEntityId: releaseTrackToProductRelationship.productId,
        dependentEntityName: releaseTrackToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseTrackToProductRelationship.productId}`,
      }))
    );
  }, [releaseTrackToProductRelationships, navigate]);

  const onReleaseTrackRelationshipsChange = (releaseTrackRelationships: ReleaseTrackRelationship[]) => {
    const getReleaseTrackToProductRelationshipKey = (releaseTrackId: string, dependentEntityId: string) => {
      return `(${releaseTrackId}, ${dependentEntityId})`;
    };
    if (releaseTrackToProductRelationships) {
      const releaseTrackToProductRelationshipsMap = new Map<string, ReleaseTrackToProductRelationship>();
      for (const releaseTrackToProductRelationship of releaseTrackToProductRelationships) {
        releaseTrackToProductRelationshipsMap.set(
          getReleaseTrackToProductRelationshipKey(
            getReleaseTrackKey(releaseTrackToProductRelationship.releaseTrack!),
            releaseTrackToProductRelationship.productId
          ),
          releaseTrackToProductRelationship
        );
      }
      setReleaseTrackToProductRelationships(
        releaseTrackRelationships.map(
          (releaseTrackRelationship) =>
            releaseTrackToProductRelationshipsMap.get(
              getReleaseTrackToProductRelationshipKey(releaseTrackRelationship.releaseTrackId, releaseTrackRelationship.dependentEntityId)
            ) as ReleaseTrackToProductRelationship
        )
      );
    }
  };

  return (
    <>
      <Typography.Paragraph>You can adjust order in which the release-track-to-product relationships are displayed by dragging them.</Typography.Paragraph>
      <ReleaseTrackRelationshipTable
        reorderMode
        dependentEntityColumnName="Product"
        loading={releaseTrackToProductRelationshipsLoading}
        releaseTrackRelationships={releaseTrackRelationships}
        onReleaseTrackRelationshipsChange={onReleaseTrackRelationshipsChange}
      />
    </>
  );
};

export default ProductEditPageReleaseTrackToProductRelationshipsTab;
