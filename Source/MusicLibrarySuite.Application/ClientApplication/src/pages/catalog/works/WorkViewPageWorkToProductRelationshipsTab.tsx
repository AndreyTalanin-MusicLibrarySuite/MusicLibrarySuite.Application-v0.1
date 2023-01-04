import { useEffect, useState } from "react";
import { WorkToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";

export interface WorkViewPageWorkToProductRelationshipsTabProps {
  id: string;
}

const WorkViewPageWorkToProductRelationshipsTab = ({ id }: WorkViewPageWorkToProductRelationshipsTabProps) => {
  const [workToProductRelationships, setWorkToProductRelationships] = useState<WorkToProductRelationship[]>([]);
  const [workToProductRelationshipsLoading, setWorkToProductRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setWorkToProductRelationshipsLoading(true);
    applicationClient
      .getWorkToProductRelationships(id)
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

export default WorkViewPageWorkToProductRelationshipsTab;
