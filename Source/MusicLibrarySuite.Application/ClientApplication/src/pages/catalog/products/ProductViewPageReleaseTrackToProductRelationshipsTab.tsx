import { useEffect, useState } from "react";
import { ReleaseTrackToProductRelationship } from "../../../api/ApplicationClient";
import ReleaseTrackRelationshipTable from "../../../components/tables/ReleaseTrackRelationshipTable";
import { getReleaseTrackKey } from "../../../helpers/ReleaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";

export interface ProductViewPageReleaseTrackToProductRelationshipsTabProps {
  id: string;
}

const ProductViewPageReleaseTrackToProductRelationshipsTab = ({ id }: ProductViewPageReleaseTrackToProductRelationshipsTabProps) => {
  const [releaseTrackToProductRelationships, setReleaseTrackToProductRelationships] = useState<ReleaseTrackToProductRelationship[]>([]);
  const [releaseTrackToProductRelationshipsLoading, setReleaseTrackToProductRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseTrackToProductRelationshipsLoading(true);
    applicationClient
      .getReleaseTrackToProductRelationshipsByProduct(id)
      .then((releaseTrackToProductRelationships) => {
        setReleaseTrackToProductRelationships(releaseTrackToProductRelationships);
        setReleaseTrackToProductRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  return (
    <ReleaseTrackRelationshipTable
      dependentEntityColumnName="Product"
      loading={releaseTrackToProductRelationshipsLoading}
      releaseTrackRelationships={releaseTrackToProductRelationships.map((releaseTrackToProductRelationship) => ({
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
      }))}
    />
  );
};

export default ProductViewPageReleaseTrackToProductRelationshipsTab;