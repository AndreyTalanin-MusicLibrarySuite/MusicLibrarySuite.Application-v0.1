import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, MonitorOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseGroup } from "../../../api/ApplicationClient";
import StringValueFilterDropdown from "../../../components/helpers/StringValueFilterDropdown";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { DefaultPageIndex, DefaultPageSize } from "../../../constants/applicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const ReleaseGroupListPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(DefaultPageSize);
  const [pageIndex, setPageIndex] = useState<number>(DefaultPageIndex);
  const [titleFilter, setTitleFilter] = useState<string>();
  const [enabledFilter, setEnabledFilter] = useState<boolean>();
  const [totalCount, setTotalCount] = useState<number>();
  const [releaseGroups, setReleaseGroups] = useState<ReleaseGroup[]>([]);
  const [releaseGroupToDelete, setReleaseGroupToDelete] = useState<ReleaseGroup>();
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  const fetchReleaseGroups = useCallback(() => {
    setLoading(true);
    applicationClient
      .getPagedReleaseGroups(pageSize, pageIndex, titleFilter, enabledFilter)
      .then((pageResult) => {
        setLoading(false);
        setPageSize(pageResult.pageSize);
        setPageIndex(pageResult.pageIndex);
        setTotalCount(pageResult.totalCount);
        setReleaseGroups(pageResult.items);
      })
      .catch((error) => {
        setLoading(false);
        alert(error);
      });
  }, [pageSize, pageIndex, titleFilter, enabledFilter, applicationClient]);

  useEffect(() => {
    fetchReleaseGroups();
  }, [fetchReleaseGroups]);

  const onCreateButtonClick = useCallback(() => {
    navigate("/catalog/releaseGroups/create");
  }, [navigate]);

  const onViewButtonClick = useCallback(
    (id: string) => {
      navigate(`/catalog/releaseGroups/view?id=${id}`);
    },
    [navigate]
  );

  const onEditButtonClick = useCallback(
    (id: string) => {
      navigate(`/catalog/releaseGroups/edit?id=${id}`);
    },
    [navigate]
  );

  const onDeleteButtonClick = (releaseGroup: ReleaseGroup) => {
    setReleaseGroupToDelete(releaseGroup);
    setConfirmDeleteModalOpen(true);
  };

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (releaseGroupToDelete) {
        setModalLoading(true);
        applicationClient
          .deleteReleaseGroup(releaseGroupToDelete.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            fetchReleaseGroups();
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [releaseGroupToDelete, applicationClient, fetchReleaseGroups]
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
      render: (_: string, { id, title, disambiguationText }: ReleaseGroup) => (
        <Space wrap>
          <Typography.Link href={`/catalog/releaseGroups/view?id=${id}`}>{title}</Typography.Link>
          {disambiguationText && (
            <Tooltip title={disambiguationText}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
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
      render: (_: string, releaseGroup: ReleaseGroup) => (
        <Space wrap>
          <Button onClick={() => onViewButtonClick(releaseGroup.id)}>
            <MonitorOutlined /> View
          </Button>
          <Button onClick={() => onEditButtonClick(releaseGroup.id)}>
            <EditOutlined /> Edit
          </Button>
          <Button danger onClick={() => onDeleteButtonClick(releaseGroup)}>
            <DeleteOutlined /> Delete
          </Button>
        </Space>
      ),
    },
  ];

  const title = <Typography.Title level={4}>Browse Release Groups</Typography.Title>;

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

  const statusLine = useMemo(() => totalCount !== undefined && `Found ${totalCount} release groups total.`, [totalCount]);

  const modals = useMemo(
    () => [
      releaseGroupToDelete && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Release Group"
          message={`Confirm that you want to delete the "${releaseGroupToDelete.title}" release group. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
    ],
    [releaseGroupToDelete, confirmDeleteModalOpen, onConfirmDeleteModalOk]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      <Table
        columns={columns}
        rowKey="id"
        dataSource={releaseGroups ?? []}
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

export default ReleaseGroupListPage;
