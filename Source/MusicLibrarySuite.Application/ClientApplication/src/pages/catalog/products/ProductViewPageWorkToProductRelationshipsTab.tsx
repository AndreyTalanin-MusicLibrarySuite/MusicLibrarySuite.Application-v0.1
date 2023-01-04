import { useEffect, useState } from "react";
import { WorkToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";

export interface ProductViewPageWorkToProductRelationshipsTabProps {
  id: string;
}

const ProductViewPageWorkToProductRelationshipsTab = ({ id }: ProductViewPageWorkToProductRelationshipsTabProps) => {
  const [workToProductRelationships, setWorkToProductRelationships] = useState<WorkToProductRelationship[]>([]);
  const [workToProductRelationshipsLoading, setWorkToProductRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setWorkToProductRelationshipsLoading(true);
    applicationClient
      .getWorkToProductRelationshipsByProduct(id)
      .then((workToProductRelationships) => {
        setWorkToProductRelationships(workToProductRelationships);
        setWorkToProductRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  return (
    <EntityRelationshipTable
      entityColumnName="Work"
      dependentEntityColumnName="Product"
      loading={workToProductRelationshipsLoading}
      entityRelationships={workToProductRelationships.map((workToProductRelationship) => ({
        name: workToProductRelationship.name,
        description: workToProductRelationship.description,
        entityId: workToProductRelationship.workId,
        entityName: workToProductRelationship.work?.title ?? "",
        entityHref: `/catalog/works/view?id=${workToProductRelationship.workId}`,
        dependentEntityId: workToProductRelationship.productId,
        dependentEntityName: workToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${workToProductRelationship.productId}`,
      }))}
    />
  );
};

export default ProductViewPageWorkToProductRelationshipsTab;
