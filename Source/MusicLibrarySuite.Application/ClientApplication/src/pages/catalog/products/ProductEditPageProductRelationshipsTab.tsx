import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, ProductRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalDependentProducts, setModalDependentProducts] = useState<Product[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      productRelationships.map((productRelationship) => ({
        name: productRelationship.name,
        description: productRelationship.description,
        entityId: productRelationship.productId,
        entityName: productRelationship.product?.title ?? "",
        entityHref: `/catalog/products/view?id=${productRelationship.productId}`,
        dependentEntityId: productRelationship.dependentProductId,
        dependentEntityName: productRelationship.dependentProduct?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${productRelationship.dependentProductId}`,
      })),
    [productRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getProducts([modalEntityRelationship.dependentEntityId])
        .then((products) => setModalDependentProducts(products))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedProducts(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalDependentProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onProductRelationshipCreate = () => {
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

  const onProductRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setProductRelationships(
        productRelationships.filter((productRelationship) => productRelationship.dependentProductId !== entityRelationship.dependentEntityId)
      );
    },
    [productRelationships, setProductRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
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
    },
    [productRelationships, setProductRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
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
    },
    [product, productRelationships, setProductRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Product Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onProductRelationshipCreate}>
        Create Product Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Product Relationship"
        dependentEntityName="Dependent Product"
        dependentEntityOptions={modalDependentProducts.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalDependentProducts, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the product relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Product"
        dependentEntityColumnName="Dependent Product"
        loading={productRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onProductRelationshipEdit}
        onEntityRelationshipDelete={onProductRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ProductEditPageProductRelationshipsTab;
