import { Typography } from "antd";
import { useEffect, useState } from "react";
import { ReleaseToProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Title } = Typography;

export interface ProductViewPageReleaseToProductRelationshipsTabProps {
  id: string;
}

const ProductViewPageReleaseToProductRelationshipsTab = ({ id }: ProductViewPageReleaseToProductRelationshipsTabProps) => {
  const [releaseToProductRelationships, setReleaseToProductRelationships] = useState<ReleaseToProductRelationship[]>([]);
  const [releaseToProductRelationshipsLoading, setReleaseToProductRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseToProductRelationshipsLoading(true);
    applicationClient
      .getReleaseToProductRelationshipsByProduct(id)
      .then((releaseToProductRelationships) => {
        setReleaseToProductRelationships(releaseToProductRelationships);
        setReleaseToProductRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  const title = <Title level={5}>View Release-to-Product Relationships</Title>;

  return (
    <ActionTab title={title}>
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
    </ActionTab>
  );
};

export default ProductViewPageReleaseToProductRelationshipsTab;
