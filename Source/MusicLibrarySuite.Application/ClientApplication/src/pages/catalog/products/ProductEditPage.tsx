import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Space, Tabs, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { IProduct, Product, ProductRelationship, WorkToProductRelationship } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ProductEditPageProductRelationshipsTab from "./ProductEditPageProductRelationshipsTab";
import ProductEditPageWorkToProductRelationshipsTab from "./ProductEditPageWorkToProductRelationshipsTab";
import styles from "./ProductEditPage.module.css";
import "antd/dist/antd.min.css";

dayjs.extend(weekday);
dayjs.extend(localeData);

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
  const [productFormValues, setProductFormValues] = useState<Store>({});
  const [workToProductRelationships, setWorkToProductRelationships] = useState<WorkToProductRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === ProductEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchProduct = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getProduct(id)
        .then((product) => {
          product.productRelationships = product.productRelationships.map(
            (productRelationship) => new ProductRelationship({ ...productRelationship, product: product })
          );

          setProduct(product);
          setProductFormValues({ ...product, releasedOn: dayjs(product.releasedOn) });

          applicationClient.getWorkToProductRelationshipsByProduct(id).then((workToProductRelationships) => {
            setWorkToProductRelationships(workToProductRelationships);
          });
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  const onProductRelationshipsChange = useCallback(
    (productRelationships: ProductRelationship[]) => {
      if (product) {
        setProduct(new Product({ ...product, productRelationships: productRelationships }));
      }
    },
    [product]
  );

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    form.resetFields();
  }, [productFormValues, form]);

  const onSaveButtonClick = () => {
    form.submit();
  };

  const onDeleteButtonClick = useCallback(() => {
    if (product) {
      setConfirmDeleteModalOpen(true);
    }
  }, [product]);

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

  const onCancelButtonClick = () => {
    navigate("/catalog/products/list");
  };

  const onFinish = useCallback(
    (productFormValues: Store) => {
      const releasedOn = productFormValues.releasedOn as Dayjs;
      productFormValues.releasedOn = releasedOn.startOf("day").add(releasedOn.utcOffset(), "minute").toDate();

      const productModel = new Product({ ...product, ...(productFormValues as IProduct) });
      productModel.id = productModel.id?.trim();
      productModel.title = productModel.title?.trim();
      productModel.description = productModel.description?.trim();
      productModel.disambiguationText = productModel.disambiguationText?.trim();
      if (productModel.id !== undefined && productModel.id.length === 0) {
        productModel.id = EmptyGuidString;
      }
      if (productModel.description !== undefined && productModel.description.length === 0) {
        productModel.description = undefined;
      }
      if (productModel.disambiguationText !== undefined && productModel.disambiguationText.length === 0) {
        productModel.disambiguationText = undefined;
      }

      productModel.productRelationships = productModel.productRelationships.map(
        (productRelationship) => new ProductRelationship({ ...productRelationship, product: undefined, dependentProduct: undefined })
      );

      if (mode === ProductEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createProduct(productModel)
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
          .updateProduct(productModel)
          .then(() => {
            Promise.all([applicationClient.updateWorkToProductRelationshipsOrder(true, workToProductRelationships)])
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
    [mode, navigate, product, workToProductRelationships, applicationClient, fetchProduct]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

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
    [product, loading, workToProductRelationships, onProductRelationshipsChange]
  );

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>{mode === ProductEditPageMode.Create ? "Create" : "Edit"} Product</Typography.Title>
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
      </Space>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form
            form={form}
            initialValues={productFormValues}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item label="Id" name="id">
              <Input readOnly={mode === ProductEditPageMode.Edit} />
            </Form.Item>
            <Form.Item label="Title" name="title" rules={[{ required: true, message: "The 'Title' property must not be empty." }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Disambiguation Text" name="disambiguationText">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Released On" name="releasedOn" rules={[{ required: true, message: "The 'Released On' property must not be empty." }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item
              label="Released On"
              name="releasedOnYearOnly"
              rules={[{ required: true, message: "The 'Released On (Year Only)' property must not be empty." }]}
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
      {product && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Product"
          message={`Confirm that you want to delete the "${product.title}" product. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      )}
      {product && <Tabs items={tabs} />}
    </>
  );
};

export default ProductEditPage;
