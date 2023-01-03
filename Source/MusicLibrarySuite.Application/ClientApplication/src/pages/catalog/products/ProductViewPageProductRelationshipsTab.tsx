import { Checkbox, Typography } from "antd";
import { useEffect, useState } from "react";
import { ProductRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

export interface ProductViewPageProductRelationshipsTabProps {
  id: string;
}

const ProductViewPageProductRelationshipsTab = ({ id }: ProductViewPageProductRelationshipsTabProps) => {
  const [productRelationships, setProductRelationships] = useState<ProductRelationship[]>([]);
  const [productRelationshipsLoading, setProductRelationshipsLoading] = useState<boolean>(true);
  const [includeReverseRelationships, setIncludeReverseRelationships] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setProductRelationshipsLoading(true);
    applicationClient
      .getProductRelationships(id, includeReverseRelationships)
      .then((productRelationships) => {
        setProductRelationships(productRelationships);
        setProductRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, includeReverseRelationships, applicationClient]);

  return (
    <>
      <Typography.Paragraph>
        <Checkbox onChange={(e) => setIncludeReverseRelationships(e.target.checked)}>Include reverse product relationships</Checkbox>
      </Typography.Paragraph>
      <EntityRelationshipTable
        entityColumnName="Product"
        dependentEntityColumnName="Dependent Product"
        loading={productRelationshipsLoading}
        entityRelationships={productRelationships.map((productRelationship) => ({
          name: productRelationship.name,
          description: productRelationship.description,
          entityId: productRelationship.productId,
          entityName: productRelationship.product?.title ?? "",
          entityHref: `/catalog/products/view?id=${productRelationship.productId}`,
          dependentEntityId: productRelationship.dependentProductId,
          dependentEntityName: productRelationship.dependentProduct?.title ?? "",
          dependentEntityHref: `/catalog/products/view?id=${productRelationship.dependentProductId}`,
        }))}
      />
    </>
  );
};

export default ProductViewPageProductRelationshipsTab;
