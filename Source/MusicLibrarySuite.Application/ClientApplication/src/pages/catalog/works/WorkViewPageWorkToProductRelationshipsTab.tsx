import { Typography } from "antd";
import { useEffect, useState } from "react";
import { WorkToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Title } = Typography;

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

  const title = <Title level={5}>View Work-to-Product Relationships</Title>;

  return (
    <ActionTab title={title}>
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
    </ActionTab>
  );
};

export default WorkViewPageWorkToProductRelationshipsTab;
