import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, Release, ReleaseToProductRelationship } from "../../../api/ApplicationClient";
import EditEntityRelationshipModal, { EntityRelationship as ModalEntityRelationship } from "../../../components/modals/EditEntityRelationshipModal";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalEntityRelationship, setModalEntityRelationship] = useState<ModalEntityRelationship>();

  const applicationClient = useApplicationClient();

  const tableEntityRelationships = useMemo(
    () =>
      releaseToProductRelationships.map((releaseToProductRelationship) => ({
        name: releaseToProductRelationship.name,
        description: releaseToProductRelationship.description,
        entityId: releaseToProductRelationship.releaseId,
        entityName: releaseToProductRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToProductRelationship.releaseId}`,
        dependentEntityId: releaseToProductRelationship.productId,
        dependentEntityName: releaseToProductRelationship.product?.title ?? "",
        dependentEntityHref: `/catalog/products/view?id=${releaseToProductRelationship.productId}`,
      })),
    [releaseToProductRelationships]
  );

  useEffect(() => {
    if (modalEntityRelationship) {
      applicationClient
        .getProducts([modalEntityRelationship.dependentEntityId])
        .then((products) => setModalProducts(products))
        .catch((error) => alert(error));
    }
  }, [modalEntityRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedProducts(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalProducts(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onReleaseToProductRelationshipCreate = () => {
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

  const onReleaseToProductRelationshipDelete = useCallback(
    (entityRelationship: TableEntityRelationship) => {
      setReleaseToProductRelationships(
        releaseToProductRelationships.filter((releaseToProductRelationship) => releaseToProductRelationship.productId !== entityRelationship.dependentEntityId)
      );
    },
    [releaseToProductRelationships, setReleaseToProductRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
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
    },
    [releaseToProductRelationships, setReleaseToProductRelationships]
  );

  const onModalOk = useCallback(
    (entityRelationship: ModalEntityRelationship, resetFormFields: () => void) => {
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
    },
    [release, releaseToProductRelationships, setReleaseToProductRelationships, modalEntityRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Release-to-Product Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onReleaseToProductRelationshipCreate}>
        Create Release-to-Product Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditEntityRelationshipModal
        title="Create Release-to-Product Relationship"
        dependentEntityName="Product"
        dependentEntityOptions={modalProducts.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        entityRelationship={modalEntityRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalProducts, modalEntityRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the release-to-product relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        editMode
        entityColumnName="Release"
        dependentEntityColumnName="Product"
        loading={releaseToProductRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipEdit={onReleaseToProductRelationshipEdit}
        onEntityRelationshipDelete={onReleaseToProductRelationshipDelete}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ReleaseEditPageReleaseToProductRelationshipsTab;
