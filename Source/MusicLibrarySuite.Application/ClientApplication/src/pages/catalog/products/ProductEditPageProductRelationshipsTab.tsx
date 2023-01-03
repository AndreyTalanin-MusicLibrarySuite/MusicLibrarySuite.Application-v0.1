import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Product, ProductRelationship } from "../../../api/ApplicationClient";
import CreateEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/CreateEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ProductEditPageProductRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ProductEditPageProductRelationshipsTabProps {
  product: Product;
  productRelationships: ProductRelationship[];
  productRelationshipsLoading: boolean;
  setProductRelationships: (productRelationships: ProductRelationship[]) => void;
}

const ProductEditPageProductRelationshipsTab = ({
  product,
  productRelationships,
  productRelationshipsLoading,
  setProductRelationships,
}: ProductEditPageProductRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalDependentProducts, setModalDependentProducts] = useState<Product[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      productRelationships.map((productRelationship) => ({
        name: productRelationship.name,
        description: productRelationship.description,
        entityId: productRelationship.productId,
        entityName: productRelationship.product?.title ?? "",
        entityHref: `/catalog/products/view?id=${productRelationship.productId}`,
        dependentEntityId: productRelationship.dependentProductId,
        dependentEntityName: productRelationship.dependentProduct?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${productRelationship.dependentProductId}`,
      }))
    );
  }, [productRelationships, navigate]);

  const fetchModalDependentProducts = useCallback(() => {
    applicationClient
      .getPagedProducts(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalDependentProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalDependentProducts(), [fetchModalDependentProducts]);

  const onCreateProductRelationshipButtonClick = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onProductRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onProductRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setProductRelationships(
      productRelationships.filter((productRelationship) => productRelationship.dependentProductId !== entityRelationship.dependentEntityId)
    );
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
    const getProductRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (productRelationships) {
      const productRelationshipsMap = new Map<string, ProductRelationship>();
      for (const productRelationship of productRelationships) {
        productRelationshipsMap.set(getProductRelationshipKey(productRelationship.productId, productRelationship.dependentProductId), productRelationship);
      }
      setProductRelationships(
        entityRelationships.map(
          (entityRelationship) =>
            productRelationshipsMap.get(getProductRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)) as ProductRelationship
        )
      );
    }
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
    const existingEntityRelationship = productRelationships.find(
      (productRelationship) => productRelationship.dependentProductId === entityRelationship.dependentEntityId
    );
    if (existingEntityRelationship && !modalEntityRelationship) {
      alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.dependentProduct?.title}' product.`);
      return;
    }
    applicationClient.getProduct(entityRelationship.dependentEntityId).then((dependentProduct) => {
      const resultProductRelationship = new ProductRelationship({
        name: entityRelationship.name,
        description: entityRelationship.description,
        productId: product.id,
        dependentProductId: dependentProduct.id,
        product: product,
        dependentProduct: dependentProduct,
      });
      if (modalEntityRelationship) {
        setProductRelationships(
          productRelationships.map((productRelationship) => {
            if (productRelationship.dependentProductId === modalEntityRelationship.dependentEntityId) {
              return resultProductRelationship;
            } else {
              return productRelationship;
            }
          })
        );
      } else {
        setProductRelationships([...productRelationships, resultProductRelationship]);
      }
      setModalOpen(false);
      resetFormFields();
    });
  };

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (title?: string) => {
    setModalTitleFilter(title);
  };

  return (
    <>
      <Space className={styles.tabParagraph} direction="horizontal" align="baseline">
        <Typography.Paragraph>You can adjust order in which the product relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateProductRelationshipButtonClick}>
          Create a Product Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Product"
        dependentEntityColumnName="Dependent Product"
        loading={productRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onProductRelationshipEdit}
        onEntityRelationshipDelete={onProductRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <CreateEntityRelationshipModal
        title="Create Product Relationship"
        dependentEntityName="Dependent Product"
        dependentEntities={modalDependentProducts.map(({ id, title }) => ({ id, name: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntities={onSearchDependentEntities}
      />
    </>
  );
};

export default ProductEditPageProductRelationshipsTab;
