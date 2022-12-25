import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, MonitorOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Work } from "../../../api/ApplicationClient";
import StringValueFilterDropdown from "../../../components/helpers/StringValueFilterDropdown";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import { DefaultPageIndex, DefaultPageSize } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./WorkListPage.module.css";
import "antd/dist/antd.min.css";

const WorkListPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(DefaultPageSize);
  const [pageIndex, setPageIndex] = useState<number>(DefaultPageIndex);
  const [titleFilter, setTitleFilter] = useState<string>();
  const [enabledFilter, setEnabledFilter] = useState<boolean>();
  const [totalCount, setTotalCount] = useState<number>();
  const [completedOn, setCompletedOn] = useState<Date>();
  const [works, setWorks] = useState<Work[]>([]);
  const [workToDelete, setWorkToDelete] = useState<Work>();
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  const fetchWorks = useCallback(() => {
    setLoading(true);
    applicationClient
      .getPagedWorks(pageSize, pageIndex, titleFilter, enabledFilter)
      .then((pageResult) => {
        setLoading(false);
        setPageSize(pageResult.pageSize);
        setPageIndex(pageResult.pageIndex);
        setTotalCount(pageResult.totalCount);
        setCompletedOn(pageResult.completedOn);
        setWorks(pageResult.items);
      })
      .catch((error) => {
        setLoading(false);
        alert(error);
      });
  }, [pageSize, pageIndex, titleFilter, enabledFilter, applicationClient]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const onCreateButtonClick = () => {
    navigate("/catalog/works/create");
  };

  const onViewButtonClick = (id: string) => {
    navigate(`/catalog/works/view?id=${id}`);
  };

  const onEditButtonClick = (id: string) => {
    navigate(`/catalog/works/edit?id=${id}`);
  };

  const onDeleteButtonClick = (work: Work) => {
    setWorkToDelete(work);
    setConfirmDeleteModalOpen(true);
  };

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (workToDelete) {
        setModalLoading(true);
        applicationClient
          .deleteWork(workToDelete.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            fetchWorks();
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [workToDelete, applicationClient, fetchWorks]
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
      render: (_: string, { id, title, disambiguationText, systemEntity }: Work) => (
        <Space wrap>
          <Typography.Link href={`/catalog/works/view?id=${id}`}>{title}</Typography.Link>
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
      render: (_: string, work: Work) => (
        <Space wrap>
          <Button onClick={() => onViewButtonClick(work.id)}>
            <MonitorOutlined /> View
          </Button>
          <Button onClick={() => onEditButtonClick(work.id)}>
            <EditOutlined /> Edit
          </Button>
          <Button danger disabled={work.systemEntity} onClick={() => onDeleteButtonClick(work)}>
            <DeleteOutlined /> Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>Browse Works</Typography.Title>
        <Button type="primary" onClick={onCreateButtonClick}>
          <AppstoreAddOutlined />
          Create
        </Button>
      </Space>
      <Table
        columns={columns}
        rowKey="id"
        dataSource={works ?? []}
        loading={loading}
        pagination={{
          current: pageIndex + 1,
          defaultCurrent: DefaultPageIndex + 1,
          pageSize: pageSize,
          defaultPageSize: DefaultPageSize,
          total: totalCount ?? 0,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        onChange={(pagination, filters) => onTableChange(pagination, filters)}
      />
      {totalCount !== undefined && completedOn && (
        <Space className={styles.statusLine}>
          <Typography.Paragraph>{`Found ${totalCount} works total, request completed on ${completedOn.toLocaleString()}.`}</Typography.Paragraph>
        </Space>
      )}
      {workToDelete && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Work"
          message={`Confirm that you want to delete the "${workToDelete.title}" work. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      )}
    </>
  );
};

export default WorkListPage;
