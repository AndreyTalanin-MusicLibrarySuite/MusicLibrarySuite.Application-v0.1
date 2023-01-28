import { useEffect, useState } from "react";
import { ReleaseToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";

export interface ReleaseViewPageReleaseToProductRelationshipsTabProps {
  id: string;
}

const ReleaseViewPageReleaseToProductRelationshipsTab = ({ id }: ReleaseViewPageReleaseToProductRelationshipsTabProps) => {
  const [releaseToProductRelationships, setReleaseToProductRelationships] = useState<ReleaseToProductRelationship[]>([]);
  const [releaseToProductRelationshipsLoading, setReleaseToProductRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseToProductRelationshipsLoading(true);
    applicationClient
      .getReleaseToProductRelationships(id)
      .then((releaseToProductRelationships) => {
        setReleaseToProductRelationships(releaseToProductRelationships);
        setReleaseToProductRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  return (
    <EntityRelationshipTable
      entityColumnName="Release"
      dependentEntityColumnName="Product"
      loading={releaseToProductRelationshipsLoading}
      entityRelationships={releaseToProductRelationships.map((releaseToProductRelationship) => ({
        name: releaseToProductRelationship.name,
        description: releaseToProductRelationship.description,
        entityId: releaseToProductRelationship.releaseId,
        entityName: releaseToProductRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToProductRelationship.releaseId}`,
        dependentEntityId: releaseToProductRelationship.productId,
        dependentEntityName: releaseToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseToProductRelationship.productId}`,
      }))}
    />
  );
};

export default ReleaseViewPageReleaseToProductRelationshipsTab;
