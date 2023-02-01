import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Product, Release, ReleaseTrackToProductRelationship } from "../../../api/ApplicationClient";
import CreateReleaseTrackRelationshipModal, {
  ReleaseTrackRelationship as ModalReleaseTrackRelationship,
} from "../../../components/modals/CreateReleaseTrackRelationshipModal";
import ReleaseTrackRelationshipTable, {
  ReleaseTrackRelationship as TableReleaseTrackRelationship,
} from "../../../components/tables/ReleaseTrackRelationshipTable";
import { getReleaseTrackKey } from "../../../helpers/ReleaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ReleaseEditPageReleaseTrackToProductRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ReleaseEditPageReleaseTrackToProductRelationshipsTabProps {
  release: Release;
  releaseTrackToProductRelationships: ReleaseTrackToProductRelationship[];
  releaseTrackToProductRelationshipsLoading: boolean;
  setReleaseTrackToProductRelationships: (releaseTrackToProductRelationships: ReleaseTrackToProductRelationship[]) => void;
}

const ReleaseEditPageReleaseTrackToProductRelationshipsTab = ({
  release,
  releaseTrackToProductRelationships,
  releaseTrackToProductRelationshipsLoading,
  setReleaseTrackToProductRelationships,
}: ReleaseEditPageReleaseTrackToProductRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalReleaseTrackRelationship, setModalReleaseTrackRelationship] = useState<ModalReleaseTrackRelationship>();
  const [tableReleaseTrackRelationships, setTableReleaseTrackRelationships] = useState<TableReleaseTrackRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableReleaseTrackRelationships(
      releaseTrackToProductRelationships.map((releaseTrackToProductRelationship) => ({
        name: releaseTrackToProductRelationship.name,
        description: releaseTrackToProductRelationship.description,
        releaseTrackId: getReleaseTrackKey(releaseTrackToProductRelationship.releaseTrack!),
        releaseTrackTitle: releaseTrackToProductRelationship.releaseTrack!.title,
        releaseTrackHref: `/catalog/releases/view?id=${releaseTrackToProductRelationship.releaseId}`,
        releaseTrackNumber: releaseTrackToProductRelationship.releaseTrack!.trackNumber,
        releaseMediaNumber: releaseTrackToProductRelationship.releaseTrack!.mediaNumber,
        dependentEntityId: releaseTrackToProductRelationship.productId,
        dependentEntityName: releaseTrackToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseTrackToProductRelationship.productId}`,
      }))
    );
  }, [releaseTrackToProductRelationships, navigate]);

  const fetchModalProducts = useCallback(() => {
    applicationClient
      .getPagedProducts(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalProducts(), [fetchModalProducts]);

  const onCreateReleaseTrackToProductRelationshipButtonClick = () => {
    setModalReleaseTrackRelationship(undefined);
    setModalOpen(true);
  };

  const onReleaseTrackToProductRelationshipEdit = (releaseTrackRelationship: TableReleaseTrackRelationship) => {
    setModalReleaseTrackRelationship({
      trackNumber: releaseTrackRelationship.releaseTrackNumber,
      mediaNumber: releaseTrackRelationship.releaseMediaNumber,
      name: releaseTrackRelationship.name,
      description: releaseTrackRelationship.description,
      dependentEntityId: releaseTrackRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onReleaseTrackToProductRelationshipDelete = (releaseTrackRelationship: TableReleaseTrackRelationship) => {
    setReleaseTrackToProductRelationships(
      releaseTrackToProductRelationships.filter(
        (releaseTrackToProductRelationship) => releaseTrackToProductRelationship.productId !== releaseTrackRelationship.dependentEntityId
      )
    );
  };

  const onReleaseTrackRelationshipsChange = (releaseTrackRelationships: TableReleaseTrackRelationship[]) => {
    const getReleaseTrackToProductRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (releaseTrackToProductRelationships) {
      const releaseTrackToProductRelationshipsMap = new Map<string, ReleaseTrackToProductRelationship>();
      for (const releaseTrackToProductRelationship of releaseTrackToProductRelationships) {
        releaseTrackToProductRelationshipsMap.set(
          getReleaseTrackToProductRelationshipKey(
            getReleaseTrackKey(releaseTrackToProductRelationship.releaseTrack!),
            releaseTrackToProductRelationship.productId
          ),
          releaseTrackToProductRelationship
        );
      }
      setReleaseTrackToProductRelationships(
        releaseTrackRelationships.map(
          (releaseTrackRelationship) =>
            releaseTrackToProductRelationshipsMap.get(
              getReleaseTrackToProductRelationshipKey(releaseTrackRelationship.releaseTrackId, releaseTrackRelationship.dependentEntityId)
            ) as ReleaseTrackToProductRelationship
        )
      );
    }
  };

  const onModalOk = (releaseTrackRelationship: ModalReleaseTrackRelationship, resetFormFields: () => void) => {
    const existingReleaseTrackRelationship = releaseTrackToProductRelationships.find(
      (releaseTrackToProductRelationship) =>
        releaseTrackToProductRelationship.trackNumber === releaseTrackRelationship.trackNumber &&
        releaseTrackToProductRelationship.mediaNumber === releaseTrackRelationship.mediaNumber &&
        releaseTrackToProductRelationship.productId === releaseTrackRelationship.dependentEntityId
    );
    if (existingReleaseTrackRelationship && !modalReleaseTrackRelationship) {
      const releaseTrackIdentifier = `${existingReleaseTrackRelationship.trackNumber}-${existingReleaseTrackRelationship.mediaNumber}`;
      alert(
        `Unable to create a non-unique relationship between the '${releaseTrackIdentifier}' release track and the '${existingReleaseTrackRelationship.product?.title}' product.`
      );
      return;
    }
    applicationClient.getProduct(releaseTrackRelationship.dependentEntityId).then((product) => {
      const resultReleaseTrackToProductRelationship = new ReleaseTrackToProductRelationship({
        name: releaseTrackRelationship.name,
        description: releaseTrackRelationship.description,
        trackNumber: releaseTrackRelationship.trackNumber,
        mediaNumber: releaseTrackRelationship.mediaNumber,
        releaseId: release.id,
        productId: product.id,
        product: product,
      });
      if (modalReleaseTrackRelationship) {
        setReleaseTrackToProductRelationships(
          releaseTrackToProductRelationships.map((releaseTrackToProductRelationship) => {
            if (
              releaseTrackToProductRelationship.trackNumber === modalReleaseTrackRelationship.trackNumber &&
              releaseTrackToProductRelationship.mediaNumber === modalReleaseTrackRelationship.mediaNumber &&
              releaseTrackToProductRelationship.productId === modalReleaseTrackRelationship.dependentEntityId
            ) {
              return resultReleaseTrackToProductRelationship;
            } else {
              return releaseTrackToProductRelationship;
            }
          })
        );
      } else {
        setReleaseTrackToProductRelationships([...releaseTrackToProductRelationships, resultReleaseTrackToProductRelationship]);
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
        <Typography.Paragraph>You can adjust order in which the release-track-to-product relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateReleaseTrackToProductRelationshipButtonClick}>
          Create a Release-Track-to-Product Relationship
        </Button>
      </Space>
      <ReleaseTrackRelationshipTable
        editMode
        dependentEntityColumnName="Product"
        loading={releaseTrackToProductRelationshipsLoading}
        releaseTrackRelationships={tableReleaseTrackRelationships}
        onReleaseTrackRelationshipEdit={onReleaseTrackToProductRelationshipEdit}
        onReleaseTrackRelationshipDelete={onReleaseTrackToProductRelationshipDelete}
        onReleaseTrackRelationshipsChange={onReleaseTrackRelationshipsChange}
      />
      <CreateReleaseTrackRelationshipModal
        title="Create Release-Track-to-Product Relationship"
        dependentEntityName="Product"
        dependentEntities={modalProducts.map(({ id, title }) => ({ id, name: title }))}
        open={modalOpen}
        releaseTrackRelationship={modalReleaseTrackRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntities={onSearchDependentEntities}
      />
    </>
  );
};

export default ReleaseEditPageReleaseTrackToProductRelationshipsTab;
