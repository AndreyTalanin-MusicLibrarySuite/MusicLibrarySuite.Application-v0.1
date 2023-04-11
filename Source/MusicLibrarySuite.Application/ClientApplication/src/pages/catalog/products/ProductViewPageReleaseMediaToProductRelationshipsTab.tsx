import { Typography } from "antd";
import { useEffect, useState } from "react";
import { ReleaseMediaToProductRelationship } from "../../../api/ApplicationClient";
import ReleaseMediaRelationshipTable from "../../../components/tables/ReleaseMediaRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { getReleaseMediaKey } from "../../../helpers/releaseMediaHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Title } = Typography;

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

  const title = <Title level={5}>View Release-Media-to-Product Relationships</Title>;

  return (
    <ActionTab title={title}>
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
    </ActionTab>
  );
};

export default ProductViewPageReleaseMediaToProductRelationshipsTab;
