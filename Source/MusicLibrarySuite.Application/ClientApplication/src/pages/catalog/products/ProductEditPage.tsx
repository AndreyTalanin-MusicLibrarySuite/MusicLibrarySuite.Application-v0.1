import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Tabs, Typography } from "antd";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Product,
  ProductRelationship,
  ReleaseMediaToProductRelationship,
  ReleaseToProductRelationship,
  ReleaseTrackToProductRelationship,
  WorkToProductRelationship,
} from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { GuidPattern } from "../../../constants/regularExpressionConstants";
import { mapProductFormInitialValues, mergeProductFormValues } from "../../../entities/forms/ProductFormValues";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useEntityForm from "../../../hooks/useEntityForm";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ProductEditPageProductRelationshipsTab from "./ProductEditPageProductRelationshipsTab";
import ProductEditPageReleaseMediaToProductRelationshipsTab from "./ProductEditPageReleaseMediaToProductRelationshipsTab";
import ProductEditPageReleaseToProductRelationshipsTab from "./ProductEditPageReleaseToProductRelationshipsTab";
import ProductEditPageReleaseTrackToProductRelationshipsTab from "./ProductEditPageReleaseTrackToProductRelationshipsTab";
import ProductEditPageWorkToProductRelationshipsTab from "./ProductEditPageWorkToProductRelationshipsTab";
import "antd/dist/antd.min.css";

export enum ProductEditPageMode {
  Create,
  Edit,
}

export interface ProductEditPageProps {
  mode: ProductEditPageMode;
}

const ProductEditPage = ({ mode }: ProductEditPageProps) => {
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product>();
  const [productInitialValues, setProductInitialValues] = useState<Product>();
  const [releaseToProductRelationships, setReleaseToProductRelationships] = useState<ReleaseToProductRelationship[]>([]);
  const [releaseMediaToProductRelationships, setReleaseMediaToProductRelationships] = useState<ReleaseMediaToProductRelationship[]>([]);
  const [releaseTrackToProductRelationships, setReleaseTrackToProductRelationships] = useState<ReleaseTrackToProductRelationship[]>([]);
  const [workToProductRelationships, setWorkToProductRelationships] = useState<WorkToProductRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === ProductEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const fetchProduct = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getProduct(id)
        .then((product) => {
          product.productRelationships.forEach((productRelationship) => (productRelationship.product = product));

          setProduct(product);
          setProductInitialValues(product);

          applicationClient
            .getReleaseToProductRelationshipsByProduct(id)
            .then((releaseToProductRelationships) => {
              setReleaseToProductRelationships(releaseToProductRelationships);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getReleaseMediaToProductRelationshipsByProduct(id)
            .then((releaseMediaToProductRelationships) => {
              setReleaseMediaToProductRelationships(releaseMediaToProductRelationships);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getReleaseTrackToProductRelationshipsByProduct(id)
            .then((releaseTrackToProductRelationships) => {
              setReleaseTrackToProductRelationships(releaseTrackToProductRelationships);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getWorkToProductRelationshipsByProduct(id)
            .then((workToProductRelationships) => {
              setWorkToProductRelationships(workToProductRelationships);
            })
            .catch((error) => {
              alert(error);
            });
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const saveProduct = useCallback(
    (productValues: Product) => {
      productValues.productRelationships =
        product?.productRelationships?.map(
          (productRelationship) =>
            new ProductRelationship({
              ...productRelationship,
              product: undefined,
              dependentProduct: undefined,
            })
        ) ?? [];

      if (mode === ProductEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createProduct(productValues)
          .then((product) => {
            setLoading(false);
            navigate(`/catalog/products/edit?id=${product.id}`);
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      } else {
        setLoading(true);
        applicationClient
          .updateProduct(productValues)
          .then(() => {
            const releaseToProductRelationshipModels = releaseToProductRelationships.map(
              (releaseToProductRelationship) =>
                new ReleaseToProductRelationship({
                  ...releaseToProductRelationship,
                  release: undefined,
                  product: undefined,
                })
            );
            const releaseMediaToProductRelationshipModels = releaseMediaToProductRelationships.map(
              (releaseMediaToProductRelationship) =>
                new ReleaseMediaToProductRelationship({
                  ...releaseMediaToProductRelationship,
                  releaseMedia: undefined,
                  product: undefined,
                })
            );
            const releaseTrackToProductRelationshipModels = releaseTrackToProductRelationships.map(
              (releaseTrackToProductRelationship) =>
                new ReleaseTrackToProductRelationship({
                  ...releaseTrackToProductRelationship,
                  releaseTrack: undefined,
                  product: undefined,
                })
            );
            const workToProductRelationshipModels = workToProductRelationships.map(
              (workToProductRelationship) =>
                new WorkToProductRelationship({
                  ...workToProductRelationship,
                  work: undefined,
                  product: undefined,
                })
            );

            Promise.all([
              applicationClient.updateReleaseToProductRelationshipsOrder(true, releaseToProductRelationshipModels),
              applicationClient.updateReleaseMediaToProductRelationshipsOrder(true, releaseMediaToProductRelationshipModels),
              applicationClient.updateReleaseTrackToProductRelationshipsOrder(true, releaseTrackToProductRelationshipModels),
              applicationClient.updateWorkToProductRelationshipsOrder(true, workToProductRelationshipModels),
            ])
              .then(() => {
                setLoading(false);
                fetchProduct();
              })
              .catch((error) => {
                setLoading(false);
                alert(error);
              });
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      }
    },
    [
      mode,
      navigate,
      product,
      releaseToProductRelationships,
      releaseMediaToProductRelationships,
      releaseTrackToProductRelationships,
      workToProductRelationships,
      applicationClient,
      fetchProduct,
    ]
  );

  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(productInitialValues, mapProductFormInitialValues, mergeProductFormValues, saveProduct),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [productInitialValues, form]);

  const onProductRelationshipsChange = useCallback(
    (productRelationships: ProductRelationship[]) => {
      if (product) {
        setProduct(new Product({ ...product, productRelationships: productRelationships }));
      }
    },
    [product]
  );

  const onSaveButtonClick = useCallback(() => {
    form.submit();
  }, [form]);

  const onDeleteButtonClick = useCallback(() => {
    if (product) {
      setConfirmDeleteModalOpen(true);
    }
  }, [product]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/products/list");
  }, [navigate]);

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (product) {
        setModalLoading(true);
        applicationClient
          .deleteProduct(product.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            navigate("/catalog/products/list");
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [navigate, product, applicationClient]
  );

  const onConfirmDeleteModalCancel = () => {
    setConfirmDeleteModalOpen(false);
  };

  const title = useMemo(() => <Typography.Title level={4}>{mode === ProductEditPageMode.Create ? "Create" : "Edit"} Product</Typography.Title>, [mode]);

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" loading={loading} onClick={onSaveButtonClick}>
          <SaveOutlined />
          Save
        </Button>
        {mode === ProductEditPageMode.Edit && (
          <Button danger type="primary" onClick={onDeleteButtonClick}>
            <DeleteOutlined />
            Delete
          </Button>
        )}
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Cancel
        </Button>
      </>
    ),
    [mode, loading, onSaveButtonClick, onDeleteButtonClick, onCancelButtonClick]
  );

  const tabs = useMemo(
    () => [
      {
        key: "productRelationshipsTab",
        label: "Product Relationships",
        children: product && (
          <ProductEditPageProductRelationshipsTab
            product={product}
            productRelationships={product.productRelationships}
            productRelationshipsLoading={loading}
            setProductRelationships={onProductRelationshipsChange}
          />
        ),
      },
      {
        key: "releaseToProductRelationshipsTab",
        label: "Release-to-Product Relationships",
        children: product && (
          <ProductEditPageReleaseToProductRelationshipsTab
            releaseToProductRelationships={releaseToProductRelationships}
            releaseToProductRelationshipsLoading={loading}
            setReleaseToProductRelationships={setReleaseToProductRelationships}
          />
        ),
      },
      {
        key: "releaseMediaToProductRelationshipsTab",
        label: "Release-Media-to-Product Relationships",
        children: product && (
          <ProductEditPageReleaseMediaToProductRelationshipsTab
            releaseMediaToProductRelationships={releaseMediaToProductRelationships}
            releaseMediaToProductRelationshipsLoading={loading}
            setReleaseMediaToProductRelationships={setReleaseMediaToProductRelationships}
          />
        ),
      },
      {
        key: "releaseTrackToProductRelationshipsTab",
        label: "Release-Track-to-Product Relationships",
        children: product && (
          <ProductEditPageReleaseTrackToProductRelationshipsTab
            releaseTrackToProductRelationships={releaseTrackToProductRelationships}
            releaseTrackToProductRelationshipsLoading={loading}
            setReleaseTrackToProductRelationships={setReleaseTrackToProductRelationships}
          />
        ),
      },
      {
        key: "workToProductRelationshipsTab",
        label: "Work-to-Product Relationships",
        children: product && (
          <ProductEditPageWorkToProductRelationshipsTab
            workToProductRelationships={workToProductRelationships}
            workToProductRelationshipsLoading={loading}
            setWorkToProductRelationships={setWorkToProductRelationships}
          />
        ),
      },
    ],
    [
      product,
      releaseToProductRelationships,
      releaseMediaToProductRelationships,
      releaseTrackToProductRelationships,
      workToProductRelationships,
      loading,
      onProductRelationshipsChange,
    ]
  );

  const modals = useMemo(
    () => [
      product && (
        <ConfirmDeleteModal
          key="ConfirmDeleteModal"
          open={confirmDeleteModalOpen}
          title="Delete Product"
          message={`Confirm that you want to delete the "${product.title}" product. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
    ],
    [product, confirmDeleteModalOpen, onConfirmDeleteModalOk]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form
            form={form}
            initialValues={initialFormValues}
            onFinish={onFormFinish}
            onFinishFailed={onFormFinishFailed}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item label="Id" name="id" rules={[{ pattern: GuidPattern, message: "The 'Id' property must be a valid GUID (UUID)." }]}>
              <Input readOnly={mode === ProductEditPageMode.Edit} />
            </Form.Item>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: "The 'Title' property must not be empty." },
                { max: 256, message: "The 'Title' property must be shorter than 256 characters." },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ max: 2048, message: "The 'Description' property must be shorter than 2048 characters." }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Disambiguation Text"
              name="disambiguationText"
              rules={[{ max: 2048, message: "The 'Disambiguation Text' property must be shorter than 2048 characters." }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Released On"
              name="releasedOn"
              rules={[
                {
                  required: true,
                  message: "The 'Released On' property must not be empty.",
                },
              ]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              label="Released On"
              name="releasedOnYearOnly"
              rules={[
                {
                  required: true,
                  message: "The 'Released On (Year Only)' property must not be empty.",
                },
              ]}
              valuePropName="checked"
              initialValue={mode === ProductEditPageMode.Create ? false : undefined}
            >
              <Checkbox>Display Year Only</Checkbox>
            </Form.Item>
            <Form.Item
              label="System Entity"
              name="systemEntity"
              rules={[{ required: true, message: "The 'System Entity' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === ProductEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Enabled"
              name="enabled"
              rules={[{ required: true, message: "The 'Enabled' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === ProductEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            {mode === ProductEditPageMode.Edit && (
              <Form.Item label="Created On" name="createdOn">
                <Input readOnly />
              </Form.Item>
            )}
            {mode === ProductEditPageMode.Edit && (
              <Form.Item label="Updated On" name="updatedOn">
                <Input readOnly />
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
      {mode === ProductEditPageMode.Edit && <Tabs items={tabs} />}
    </ActionPage>
  );
};

export default ProductEditPage;
