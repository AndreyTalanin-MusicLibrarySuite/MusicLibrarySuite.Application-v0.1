import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, Release, ReleaseTrackToProductRelationship } from "../../../api/ApplicationClient";
import EditReleaseTrackRelationshipModal, {
  ReleaseTrackRelationship as ModalReleaseTrackRelationship,
} from "../../../components/modals/EditReleaseTrackRelationshipModal";
import ReleaseTrackRelationshipTable, {
  ReleaseTrackRelationship as TableReleaseTrackRelationship,
} from "../../../components/tables/ReleaseTrackRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import { getReleaseTrackKey } from "../../../helpers/releaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalReleaseTrackRelationship, setModalReleaseTrackRelationship] = useState<ModalReleaseTrackRelationship>();

  const applicationClient = useApplicationClient();

  const tableReleaseTrackRelationships = useMemo(
    () =>
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
      })),
    [releaseTrackToProductRelationships]
  );

  useEffect(() => {
    if (modalReleaseTrackRelationship) {
      applicationClient
        .getProducts([modalReleaseTrackRelationship.dependentEntityId])
        .then((products) => setModalProducts(products))
        .catch((error) => alert(error));
    }
  }, [modalReleaseTrackRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedProducts(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onReleaseTrackToProductRelationshipCreate = () => {
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

  const onReleaseTrackToProductRelationshipDelete = useCallback(
    (releaseTrackRelationship: TableReleaseTrackRelationship) => {
      setReleaseTrackToProductRelationships(
        releaseTrackToProductRelationships.filter(
          (releaseTrackToProductRelationship) =>
            releaseTrackToProductRelationship.trackNumber !== releaseTrackRelationship.releaseTrackNumber ||
            releaseTrackToProductRelationship.mediaNumber !== releaseTrackRelationship.releaseMediaNumber ||
            releaseTrackToProductRelationship.productId !== releaseTrackRelationship.dependentEntityId
        )
      );
    },
    [releaseTrackToProductRelationships, setReleaseTrackToProductRelationships]
  );

  const onReleaseTrackRelationshipsOrderChange = useCallback(
    (releaseTrackRelationships: TableReleaseTrackRelationship[]) => {
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
    },
    [releaseTrackToProductRelationships, setReleaseTrackToProductRelationships]
  );

  const onModalOk = useCallback(
    (releaseTrackRelationship: ModalReleaseTrackRelationship, resetFormFields: () => void) => {
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
    },
    [release, releaseTrackToProductRelationships, setReleaseTrackToProductRelationships, modalReleaseTrackRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Release-Track-to-Product Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onReleaseTrackToProductRelationshipCreate}>
        Create Release-Track-to-Product Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditReleaseTrackRelationshipModal
        title="Create Release-Track-to-Product Relationship"
        dependentEntityName="Product"
        dependentEntityOptions={modalProducts.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        releaseTrackRelationship={modalReleaseTrackRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalProducts, modalReleaseTrackRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the release-track-to-product relationships are displayed by dragging them.</Paragraph>
      <ReleaseTrackRelationshipTable
        editMode
        dependentEntityColumnName="Product"
        loading={releaseTrackToProductRelationshipsLoading}
        releaseTrackRelationships={tableReleaseTrackRelationships}
        onReleaseTrackRelationshipEdit={onReleaseTrackToProductRelationshipEdit}
        onReleaseTrackRelationshipDelete={onReleaseTrackToProductRelationshipDelete}
        onReleaseTrackRelationshipsChange={onReleaseTrackRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ReleaseEditPageReleaseTrackToProductRelationshipsTab;
