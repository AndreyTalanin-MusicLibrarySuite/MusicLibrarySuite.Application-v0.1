import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Product, Release, ReleaseMediaToProductRelationship } from "../../../api/ApplicationClient";
import EditReleaseMediaRelationshipModal, {
  ReleaseMediaRelationship as ModalReleaseMediaRelationship,
} from "../../../components/modals/EditReleaseMediaRelationshipModal";
import ReleaseMediaRelationshipTable, {
  ReleaseMediaRelationship as TableReleaseMediaRelationship,
} from "../../../components/tables/ReleaseMediaRelationshipTable";
import { getReleaseMediaKey } from "../../../helpers/releaseMediaHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ReleaseEditPageReleaseMediaToProductRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ReleaseEditPageReleaseMediaToProductRelationshipsTabProps {
  release: Release;
  releaseMediaToProductRelationships: ReleaseMediaToProductRelationship[];
  releaseMediaToProductRelationshipsLoading: boolean;
  setReleaseMediaToProductRelationships: (releaseMediaToProductRelationships: ReleaseMediaToProductRelationship[]) => void;
}

const ReleaseEditPageReleaseMediaToProductRelationshipsTab = ({
  release,
  releaseMediaToProductRelationships,
  releaseMediaToProductRelationshipsLoading,
  setReleaseMediaToProductRelationships,
}: ReleaseEditPageReleaseMediaToProductRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalReleaseMediaRelationship, setModalReleaseMediaRelationship] = useState<ModalReleaseMediaRelationship>();
  const [tableReleaseMediaRelationships, setTableReleaseMediaRelationships] = useState<TableReleaseMediaRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableReleaseMediaRelationships(
      releaseMediaToProductRelationships.map((releaseMediaToProductRelationship) => ({
        name: releaseMediaToProductRelationship.name,
        description: releaseMediaToProductRelationship.description,
        releaseMediaId: getReleaseMediaKey(releaseMediaToProductRelationship.releaseMedia!),
        releaseMediaTitle: releaseMediaToProductRelationship.releaseMedia!.title,
        releaseMediaHref: `/catalog/releases/view?id=${releaseMediaToProductRelationship.releaseId}`,
        releaseMediaNumber: releaseMediaToProductRelationship.releaseMedia!.mediaNumber,
        dependentEntityId: releaseMediaToProductRelationship.productId,
        dependentEntityName: releaseMediaToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseMediaToProductRelationship.productId}`,
      }))
    );
  }, [releaseMediaToProductRelationships, navigate]);

  useEffect(() => {
    if (modalReleaseMediaRelationship) {
      applicationClient
        .getProducts([modalReleaseMediaRelationship.dependentEntityId])
        .then((products) => setModalProducts(products))
        .catch((error) => alert(error));
    }
  }, [modalReleaseMediaRelationship, applicationClient]);

  const fetchModalProducts = useCallback(() => {
    applicationClient
      .getPagedProducts(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalProducts(), [fetchModalProducts]);

  const onCreateReleaseMediaToProductRelationshipButtonClick = () => {
    setModalReleaseMediaRelationship(undefined);
    setModalOpen(true);
  };

  const onReleaseMediaToProductRelationshipEdit = (releaseMediaRelationship: TableReleaseMediaRelationship) => {
    setModalReleaseMediaRelationship({
      mediaNumber: releaseMediaRelationship.releaseMediaNumber,
      name: releaseMediaRelationship.name,
      description: releaseMediaRelationship.description,
      dependentEntityId: releaseMediaRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onReleaseMediaToProductRelationshipDelete = (releaseMediaRelationship: TableReleaseMediaRelationship) => {
    setReleaseMediaToProductRelationships(
      releaseMediaToProductRelationships.filter(
        (releaseMediaToProductRelationship) =>
          releaseMediaToProductRelationship.mediaNumber !== releaseMediaRelationship.releaseMediaNumber ||
          releaseMediaToProductRelationship.productId !== releaseMediaRelationship.dependentEntityId
      )
    );
  };

  const onReleaseMediaRelationshipsChange = (releaseMediaRelationships: TableReleaseMediaRelationship[]) => {
    const getReleaseMediaToProductRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (releaseMediaToProductRelationships) {
      const releaseMediaToProductRelationshipsMap = new Map<string, ReleaseMediaToProductRelationship>();
      for (const releaseMediaToProductRelationship of releaseMediaToProductRelationships) {
        releaseMediaToProductRelationshipsMap.set(
          getReleaseMediaToProductRelationshipKey(
            getReleaseMediaKey(releaseMediaToProductRelationship.releaseMedia!),
            releaseMediaToProductRelationship.productId
          ),
          releaseMediaToProductRelationship
        );
      }
      setReleaseMediaToProductRelationships(
        releaseMediaRelationships.map(
          (releaseMediaRelationship) =>
            releaseMediaToProductRelationshipsMap.get(
              getReleaseMediaToProductRelationshipKey(releaseMediaRelationship.releaseMediaId, releaseMediaRelationship.dependentEntityId)
            ) as ReleaseMediaToProductRelationship
        )
      );
    }
  };

  const onModalOk = (releaseMediaRelationship: ModalReleaseMediaRelationship, resetFormFields: () => void) => {
    const existingReleaseMediaRelationship = releaseMediaToProductRelationships.find(
      (releaseMediaToProductRelationship) =>
        releaseMediaToProductRelationship.mediaNumber === releaseMediaRelationship.mediaNumber &&
        releaseMediaToProductRelationship.productId === releaseMediaRelationship.dependentEntityId
    );
    if (existingReleaseMediaRelationship && !modalReleaseMediaRelationship) {
      const releaseMediaIdentifier = `${existingReleaseMediaRelationship.mediaNumber}`;
      alert(
        `Unable to create a non-unique relationship between the '${releaseMediaIdentifier}' release media and the '${existingReleaseMediaRelationship.product?.title}' product.`
      );
      return;
    }
    applicationClient.getProduct(releaseMediaRelationship.dependentEntityId).then((product) => {
      const resultReleaseMediaToProductRelationship = new ReleaseMediaToProductRelationship({
        name: releaseMediaRelationship.name,
        description: releaseMediaRelationship.description,
        mediaNumber: releaseMediaRelationship.mediaNumber,
        releaseId: release.id,
        productId: product.id,
        product: product,
      });
      if (modalReleaseMediaRelationship) {
        setReleaseMediaToProductRelationships(
          releaseMediaToProductRelationships.map((releaseMediaToProductRelationship) => {
            if (
              releaseMediaToProductRelationship.mediaNumber === modalReleaseMediaRelationship.mediaNumber &&
              releaseMediaToProductRelationship.productId === modalReleaseMediaRelationship.dependentEntityId
            ) {
              return resultReleaseMediaToProductRelationship;
            } else {
              return releaseMediaToProductRelationship;
            }
          })
        );
      } else {
        setReleaseMediaToProductRelationships([...releaseMediaToProductRelationships, resultReleaseMediaToProductRelationship]);
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
        <Typography.Paragraph>You can adjust order in which the release-media-to-product relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateReleaseMediaToProductRelationshipButtonClick}>
          Create a Release-Media-to-Product Relationship
        </Button>
      </Space>
      <ReleaseMediaRelationshipTable
        editMode
        dependentEntityColumnName="Product"
        loading={releaseMediaToProductRelationshipsLoading}
        releaseMediaRelationships={tableReleaseMediaRelationships}
        onReleaseMediaRelationshipEdit={onReleaseMediaToProductRelationshipEdit}
        onReleaseMediaRelationshipDelete={onReleaseMediaToProductRelationshipDelete}
        onReleaseMediaRelationshipsChange={onReleaseMediaRelationshipsChange}
      />
      <EditReleaseMediaRelationshipModal
        title="Create Release-Media-to-Product Relationship"
        dependentEntityName="Product"
        dependentEntityOptions={modalProducts.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        releaseMediaRelationship={modalReleaseMediaRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />
    </>
  );
};

export default ReleaseEditPageReleaseMediaToProductRelationshipsTab;
