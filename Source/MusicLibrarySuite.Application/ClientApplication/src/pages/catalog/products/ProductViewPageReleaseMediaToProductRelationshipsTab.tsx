import { useEffect, useState } from "react";
import { ReleaseMediaToProductRelationship } from "../../../api/ApplicationClient";
import ReleaseMediaRelationshipTable from "../../../components/tables/ReleaseMediaRelationshipTable";
import { getReleaseMediaKey } from "../../../helpers/ReleaseMediaHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";

export interface ProductViewPageReleaseMediaToProductRelationshipsTabProps {
  id: string;
}

const ProductViewPageReleaseMediaToProductRelationshipsTab = ({ id }: ProductViewPageReleaseMediaToProductRelationshipsTabProps) => {
  const [releaseMediaToProductRelationships, setReleaseMediaToProductRelationships] = useState<ReleaseMediaToProductRelationship[]>([]);
  const [releaseMediaToProductRelationshipsLoading, setReleaseMediaToProductRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseMediaToProductRelationshipsLoading(true);
    applicationClient
      .getReleaseMediaToProductRelationshipsByProduct(id)
      .then((releaseMediaToProductRelationships) => {
        setReleaseMediaToProductRelationships(releaseMediaToProductRelationships);
        setReleaseMediaToProductRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  return (
    <ReleaseMediaRelationshipTable
      dependentEntityColumnName="Product"
      loading={releaseMediaToProductRelationshipsLoading}
      releaseMediaRelationships={releaseMediaToProductRelationships.map((releaseMediaToProductRelationship) => ({
        name: releaseMediaToProductRelationship.name,
        description: releaseMediaToProductRelationship.description,
        releaseMediaId: getReleaseMediaKey(releaseMediaToProductRelationship.releaseMedia!),
        releaseMediaTitle: releaseMediaToProductRelationship.releaseMedia!.title,
        releaseMediaHref: `/catalog/releases/view?id=${releaseMediaToProductRelationship.releaseId}`,
        releaseMediaNumber: releaseMediaToProductRelationship.releaseMedia!.mediaNumber,
        dependentEntityId: releaseMediaToProductRelationship.productId,
        dependentEntityName: releaseMediaToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseMediaToProductRelationship.productId}`,
      }))}
    />
  );
};

export default ProductViewPageReleaseMediaToProductRelationshipsTab;
