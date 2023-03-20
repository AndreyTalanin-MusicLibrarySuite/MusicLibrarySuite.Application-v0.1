import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Product, Release, ReleaseToProductRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ReleaseEditPageReleaseToProductRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ReleaseEditPageReleaseToProductRelationshipsTabProps {
  release: Release;
  releaseToProductRelationships: ReleaseToProductRelationship[];
  releaseToProductRelationshipsLoading: boolean;
  setReleaseToProductRelationships: (releaseToProductRelationships: ReleaseToProductRelationship[]) => void;
}

const ReleaseEditPageReleaseToProductRelationshipsTab = ({
  release,
  releaseToProductRelationships,
  releaseToProductRelationshipsLoading,
  setReleaseToProductRelationships,
}: ReleaseEditPageReleaseToProductRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();
  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableEntityRelationships(
      releaseToProductRelationships.map((releaseToProductRelationship) => ({
        name: releaseToProductRelationship.name,
        description: releaseToProductRelationship.description,
        entityId: releaseToProductRelationship.releaseId,
        entityName: releaseToProductRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToProductRelationship.releaseId}`,
        dependentEntityId: releaseToProductRelationship.productId,
        dependentEntityName: releaseToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseToProductRelationship.productId}`,
      }))
    );
  }, [releaseToProductRelationships, navigate]);

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getProducts([modalEntityRelationship.dependentEntityId])
        .then((products) => setModalProducts(products))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  const fetchModalProducts = useCallback(() => {
    applicationClient
      .getPagedProducts(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalProducts(), [fetchModalProducts]);

  const onCreateReleaseToProductRelationshipButtonClick = () => {
    setModalEntityRelationship(undefined);
    setModalOpen(true);
  };

  const onReleaseToProductRelationshipEdit = (entityRelationship: TableEntityRelationship) => {
    setModalEntityRelationship({
      name: entityRelationship.name,
      description: entityRelationship.description,
      dependentEntityId: entityRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onReleaseToProductRelationshipDelete = (entityRelationship: TableEntityRelationship) => {
    setReleaseToProductRelationships(
      releaseToProductRelationships.filter((releaseToProductRelationship) => releaseToProductRelationship.productId !== entityRelationship.dependentEntityId)
    );
  };

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
    const getReleaseToProductRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (releaseToProductRelationships) {
      const releaseToProductRelationshipsMap = new Map<string, ReleaseToProductRelationship>();
      for (const releaseToProductRelationship of releaseToProductRelationships) {
        releaseToProductRelationshipsMap.set(
          getReleaseToProductRelationshipKey(releaseToProductRelationship.releaseId, releaseToProductRelationship.productId),
          releaseToProductRelationship
        );
      }
      setReleaseToProductRelationships(
        entityRelationships.map(
          (entityRelationship) =>
            releaseToProductRelationshipsMap.get(
              getReleaseToProductRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)
            ) as ReleaseToProductRelationship
        )
      );
    }
  };

  const onModalOk = (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
    const existingEntityRelationship = releaseToProductRelationships.find(
      (releaseToProductRelationship) => releaseToProductRelationship.productId === entityRelationship.dependentEntityId
    );
    if (existingEntityRelationship && !modalEntityRelationship) {
      alert(`Unable to create a non-unique relationship with the '${existingEntityRelationship.product?.title}' product.`);
      return;
    }
    applicationClient.getProduct(entityRelationship.dependentEntityId).then((product) => {
      const resultReleaseToProductRelationship = new ReleaseToProductRelationship({
        name: entityRelationship.name,
        description: entityRelationship.description,
        releaseId: release.id,
        productId: product.id,
        release: release,
        product: product,
      });
      if (modalEntityRelationship) {
        setReleaseToProductRelationships(
          releaseToProductRelationships.map((releaseToProductRelationship) => {
            if (releaseToProductRelationship.productId === modalEntityRelationship.dependentEntityId) {
              return resultReleaseToProductRelationship;
            } else {
              return releaseToProductRelationship;
            }
          })
        );
      } else {
        setReleaseToProductRelationships([...releaseToProductRelationships, resultReleaseToProductRelationship]);
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
        <Typography.Paragraph>You can adjust order in which the release-to-product relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateReleaseToProductRelationshipButtonClick}>
          Create a Release-to-Product Relationship
        </Button>
      </Space>
      <EntityRelationshipTable
        editMode
        entityColumnName="Release"
        dependentEntityColumnName="Product"
        loading={releaseToProductRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onReleaseToProductRelationshipEdit}
        onEntityRelationshipDelete={onReleaseToProductRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
      <EditEntityRelationshipModal
        title="Create Release-to-Product Relationship"
        dependentEntityName="Product"
        dependentEntityOptions={modalProducts.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />
    </>
  );
};

export default ReleaseEditPageReleaseToProductRelationshipsTab;
