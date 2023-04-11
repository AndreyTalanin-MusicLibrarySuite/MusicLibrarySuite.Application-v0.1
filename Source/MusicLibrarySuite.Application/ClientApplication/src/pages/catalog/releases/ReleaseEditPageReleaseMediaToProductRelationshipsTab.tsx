import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, Release, ReleaseMediaToProductRelationship } from "../../../api/ApplicationClient";
import EditReleaseMediaRelationshipModal, {
  ReleaseMediaRelationship as ModalReleaseMediaRelationship,
} from "../../../components/modals/EditReleaseMediaRelationshipModal";
import ReleaseMediaRelationshipTable, {
  ReleaseMediaRelationship as TableReleaseMediaRelationship,
} from "../../../components/tables/ReleaseMediaRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import { getReleaseMediaKey } from "../../../helpers/releaseMediaHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalReleaseMediaRelationship, setModalReleaseMediaRelationship] = useState<ModalReleaseMediaRelationship>();

  const applicationClient = useApplicationClient();

  const tableReleaseMediaRelationships = useMemo(
    () =>
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
      })),

    [releaseMediaToProductRelationships]
  );

  useEffect(() => {
    if (modalReleaseMediaRelationship) {
      applicationClient
        .getProducts([modalReleaseMediaRelationship.dependentEntityId])
        .then((products) => setModalProducts(products))
        .catch((error) => alert(error));
    }
  }, [modalReleaseMediaRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedProducts(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onReleaseMediaToProductRelationshipCreate = () => {
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

  const onReleaseMediaToProductRelationshipDelete = useCallback(
    (releaseMediaRelationship: TableReleaseMediaRelationship) => {
      setReleaseMediaToProductRelationships(
        releaseMediaToProductRelationships.filter(
          (releaseMediaToProductRelationship) =>
            releaseMediaToProductRelationship.mediaNumber !== releaseMediaRelationship.releaseMediaNumber ||
            releaseMediaToProductRelationship.productId !== releaseMediaRelationship.dependentEntityId
        )
      );
    },
    [releaseMediaToProductRelationships, setReleaseMediaToProductRelationships]
  );

  const onReleaseMediaRelationshipsOrderChange = useCallback(
    (releaseMediaRelationships: TableReleaseMediaRelationship[]) => {
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
    },
    [releaseMediaToProductRelationships, setReleaseMediaToProductRelationships]
  );

  const onModalOk = useCallback(
    (releaseMediaRelationship: ModalReleaseMediaRelationship, resetFormFields: () => void) => {
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
    },
    [release, releaseMediaToProductRelationships, setReleaseMediaToProductRelationships, modalReleaseMediaRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Release-Media-to-Product Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onReleaseMediaToProductRelationshipCreate}>
        Create Release-Media-to-Product Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditReleaseMediaRelationshipModal
        title="Create Release-Media-to-Product Relationship"
        dependentEntityName="Product"
        dependentEntityOptions={modalProducts.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        releaseMediaRelationship={modalReleaseMediaRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalProducts, modalReleaseMediaRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the release-media-to-product relationships are displayed by dragging them.</Paragraph>
      <ReleaseMediaRelationshipTable
        editMode
        dependentEntityColumnName="Product"
        loading={releaseMediaToProductRelationshipsLoading}
        releaseMediaRelationships={tableReleaseMediaRelationships}
        onReleaseMediaRelationshipEdit={onReleaseMediaToProductRelationshipEdit}
        onReleaseMediaRelationshipDelete={onReleaseMediaToProductRelationshipDelete}
        onReleaseMediaRelationshipsChange={onReleaseMediaRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ReleaseEditPageReleaseMediaToProductRelationshipsTab;
