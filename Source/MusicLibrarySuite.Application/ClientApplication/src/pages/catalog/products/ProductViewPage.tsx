import { Button, Card, Divider, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Product } from "../../../api/ApplicationClient";
import ActionPage from "../../../components/pages/ActionPage";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ProductViewPageProductRelationshipsTab from "./ProductViewPageProductRelationshipsTab";
import ProductViewPageReleaseMediaToProductRelationshipsTab from "./ProductViewPageReleaseMediaToProductRelationshipsTab";
import ProductViewPageReleaseToProductRelationshipsTab from "./ProductViewPageReleaseToProductRelationshipsTab";
import ProductViewPageReleaseTrackToProductRelationshipsTab from "./ProductViewPageReleaseTrackToProductRelationshipsTab";
import ProductViewPageWorkToProductRelationshipsTab from "./ProductViewPageWorkToProductRelationshipsTab";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ProductViewPage = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  useEffect(() => {
    if (id) {
      applicationClient
        .getProduct(id)
        .then((product) => {
          setProduct(product);
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  const onEditButtonClick = useCallback(() => {
    navigate(`/catalog/products/edit?id=${id}`);
  }, [navigate, id]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/products/list");
  }, [navigate]);

  const title = <Title level={4}>View Product</Title>;

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Product List
        </Button>
      </>
    ),
    [onEditButtonClick, onCancelButtonClick]
  );

  const tabs = useMemo(
    () => [
      {
        key: "productRelationshipsTab",
        label: "Product Relationships",
        children: id && <ProductViewPageProductRelationshipsTab id={id} />,
      },
      {
        key: "releaseToProductRelationshipsTab",
        label: "Release-to-Product Relationships",
        children: id && <ProductViewPageReleaseToProductRelationshipsTab id={id} />,
      },
      {
        key: "releaseMediaToProductRelationshipsTab",
        label: "Release-Media-to-Product Relationships",
        children: id && <ProductViewPageReleaseMediaToProductRelationshipsTab id={id} />,
      },
      {
        key: "releaseTrackToProductRelationshipsTab",
        label: "Release-Track-to-Product Relationships",
        children: id && <ProductViewPageReleaseTrackToProductRelationshipsTab id={id} />,
      },
      {
        key: "workToProductRelationshipsTab",
        label: "Work-to-Product Relationships",
        children: id && <ProductViewPageWorkToProductRelationshipsTab id={id} />,
      },
    ],
    [id]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons}>
      {product && (
        <Card
          title={
            <Space>
              {product.title}
              {product.disambiguationText && (
                <Tooltip title={product.disambiguationText}>
                  <QuestionCircleOutlined />
                </Tooltip>
              )}
              {product.systemEntity && <Tag>System Entity</Tag>}
              <Tag color={product.enabled ? "green" : "red"}>{product.enabled ? "Enabled" : "Disabled"}</Tag>
            </Space>
          }
        >
          {product.description?.length && <Paragraph>{product.description}</Paragraph>}
          <Paragraph>
            Released On: <Text keyboard>{product.releasedOnYearOnly ? product.releasedOn.getUTCFullYear() : product.releasedOn.toLocaleDateString()}</Text>
          </Paragraph>
          <Divider />
          {product.createdOn && (
            <Paragraph>
              Created On: <Text keyboard>{product.createdOn.toLocaleString()}</Text>
            </Paragraph>
          )}
          {product.updatedOn && (
            <Paragraph>
              Updated On: <Text keyboard>{product.updatedOn.toLocaleString()}</Text>
            </Paragraph>
          )}
        </Card>
      )}
      <Tabs items={tabs} />
    </ActionPage>
  );
};

export default ProductViewPage;
