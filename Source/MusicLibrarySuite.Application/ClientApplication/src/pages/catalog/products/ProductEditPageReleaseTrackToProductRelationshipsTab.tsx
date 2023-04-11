import { Typography } from "antd";
import { useCallback, useMemo } from "react";
import { ReleaseTrackToProductRelationship } from "../../../api/ApplicationClient";
import ReleaseTrackRelationshipTable, { ReleaseTrackRelationship } from "../../../components/tables/ReleaseTrackRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { getReleaseTrackKey } from "../../../helpers/releaseTrackHelpers";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const tableReleaseTrackRelationships = useMemo(
    () =>
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
      })),

    [releaseTrackToProductRelationships]
  );

  const onReleaseTrackRelationshipsOrderChange = useCallback(
    (releaseTrackRelationships: ReleaseTrackRelationship[]) => {
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
    },
    [releaseTrackToProductRelationships, setReleaseTrackToProductRelationships]
  );

  const title = <Title level={5}>Reorder Release-Track-to-Product Relationships</Title>;

  return (
    <ActionTab title={title}>
      <Paragraph>You can adjust order in which the release-track-to-product relationships are displayed by dragging them.</Paragraph>
      <ReleaseTrackRelationshipTable
        reorderMode
        dependentEntityColumnName="Product"
        loading={releaseTrackToProductRelationshipsLoading}
        releaseTrackRelationships={tableReleaseTrackRelationships}
        onReleaseTrackRelationshipsChange={onReleaseTrackRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ProductEditPageReleaseTrackToProductRelationshipsTab;
