import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, MonitorOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Product } from "../../../api/ApplicationClient";
import StringValueFilterDropdown from "../../../components/helpers/StringValueFilterDropdown";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { DefaultPageIndex, DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const ProductListPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(DefaultPageSize);
  const [pageIndex, setPageIndex] = useState<number>(DefaultPageIndex);
  const [titleFilter, setTitleFilter] = useState<string>();
  const [enabledFilter, setEnabledFilter] = useState<boolean>();
  const [totalCount, setTotalCount] = useState<number>();
  const [products, setProducts] = useState<Product[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product>();
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  const fetchProducts = useCallback(() => {
    setLoading(true);
    applicationClient
      .getPagedProducts(pageSize, pageIndex, titleFilter, enabledFilter)
      .then((pageResult) => {
        setLoading(false);
        setPageSize(pageResult.pageSize);
        setPageIndex(pageResult.pageIndex);
        setTotalCount(pageResult.totalCount);
        setProducts(pageResult.items);
      })
      .catch((error) => {
        setLoading(false);
        alert(error);
      });
  }, [pageSize, pageIndex, titleFilter, enabledFilter, applicationClient]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onCreateButtonClick = useCallback(() => {
    navigate("/catalog/products/create");
  }, [navigate]);

  const onViewButtonClick = useCallback(
    (id: string) => {
      navigate(`/catalog/products/view?id=${id}`);
    },
    [navigate]
  );

  const onEditButtonClick = useCallback(
    (id: string) => {
      navigate(`/catalog/products/edit?id=${id}`);
    },
    [navigate]
  );

  const onDeleteButtonClick = (product: Product) => {
    setProductToDelete(product);
    setConfirmDeleteModalOpen(true);
  };

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (productToDelete) {
        setModalLoading(true);
        applicationClient
          .deleteProduct(productToDelete.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            fetchProducts();
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [productToDelete, applicationClient, fetchProducts]
  );

  const onConfirmDeleteModalCancel = () => {
    setConfirmDeleteModalOpen(false);
  };

  const onTableChange = ({ pageSize, current: pageNumber }: TablePaginationConfig, filter: Record<string, FilterValue | null>) => {
    setPageSize(pageSize ?? DefaultPageSize);
    setPageIndex((pageNumber ?? DefaultPageIndex + 1) - 1);
    if (filter["enabled"] !== null && filter["enabled"].length > 0) {
      setEnabledFilter(filter["enabled"][0] as boolean);
    } else {
      setEnabledFilter(undefined);
    }
  };

  const onApplyTitleFilter = (value?: string) => {
    value = value?.trim();
    value = value && value.length > 0 ? value : undefined;
    setTitleFilter(value);
  };

  const columns = [
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
      filterDropdown: <StringValueFilterDropdown value={titleFilter} placeholder="Enter Title" onValueChange={onApplyTitleFilter} />,
      filterMultiple: false,
      filteredValue: titleFilter ? [titleFilter] : [],
      render: (_: string, { id, title, disambiguationText, systemEntity }: Product) => (
        <Space wrap>
          <Typography.Link href={`/catalog/products/view?id=${id}`}>{title}</Typography.Link>
          {disambiguationText && (
            <Tooltip title={disambiguationText}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
          {systemEntity && <Tag>System Entity</Tag>}
        </Space>
      ),
    },
    {
      key: "enabled",
      title: "Enabled",
      dataIndex: "enabled",
      filters: [
        { text: "Enabled", value: true },
        { text: "Disabled", value: false },
      ],
      filterMultiple: false,
      filteredValue: enabledFilter !== undefined ? [enabledFilter] : [],
      render: (enabled: boolean) => <Tag color={enabled ? "green" : "red"}>{enabled ? "Enabled" : "Disabled"}</Tag>,
    },
    {
      key: "action",
      title: "Action",
      filteredValue: [] /* Disables a warning. */,
      render: (_: string, product: Product) => (
        <Space wrap>
          <Button onClick={() => onViewButtonClick(product.id)}>
            <MonitorOutlined /> View
          </Button>
          <Button onClick={() => onEditButtonClick(product.id)}>
            <EditOutlined /> Edit
          </Button>
          <Button danger disabled={product.systemEntity} onClick={() => onDeleteButtonClick(product)}>
            <DeleteOutlined /> Delete
          </Button>
        </Space>
      ),
    },
  ];

  const title = <Typography.Title level={4}>Browse Products</Typography.Title>;

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" onClick={onCreateButtonClick}>
          <AppstoreAddOutlined />
          Create
        </Button>
      </>
    ),
    [onCreateButtonClick]
  );

  const statusLine = useMemo(() => totalCount !== undefined && `Found ${totalCount} products total.`, [totalCount]);

  const modals = useMemo(
    () => [
      productToDelete && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Product"
          message={`Confirm that you want to delete the "${productToDelete.title}" product. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
    ],
    [productToDelete, confirmDeleteModalOpen, onConfirmDeleteModalOk]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      <Table
        columns={columns}
        rowKey="id"
        dataSource={products ?? []}
        loading={loading}
        pagination={{
          current: pageIndex + 1,
          defaultCurrent: DefaultPageIndex + 1,
          pageSize: pageSize,
          defaultPageSize: DefaultPageSize,
          total: totalCount ?? 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: statusLine ? () => statusLine : undefined,
          style: { alignItems: "baseline" },
        }}
        onChange={(pagination, filters) => onTableChange(pagination, filters)}
      />
    </ActionPage>
  );
};

export default ProductListPage;
