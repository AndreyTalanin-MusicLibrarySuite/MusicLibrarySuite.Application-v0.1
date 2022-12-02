import { Button, Space, Table, Tag, Typography } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, MonitorOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Genre } from "../../../api/ApplicationClient";
import StringValueFilterDropdown from "../../../components/helpers/StringValueFilterDropdown";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./GenreListPage.module.css";
import "antd/dist/antd.min.css";

const defaultPageSize = 10;
const defaultPageIndex = 0;

const GenreListPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [pageIndex, setPageIndex] = useState<number>(defaultPageIndex);
  const [nameFilter, setNameFilter] = useState<string>();
  const [enabledFilter, setEnabledFilter] = useState<boolean>();
  const [totalCount, setTotalCount] = useState<number>();
  const [completedOn, setCompletedOn] = useState<Date>();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreToDelete, setGenreToDelete] = useState<Genre>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  const fetchGenres = useCallback(() => {
    setLoading(true);
    applicationClient
      .getPagedGenres(pageSize, pageIndex, nameFilter, enabledFilter)
      .then((pageResult) => {
        setLoading(false);
        setPageSize(pageResult.pageSize);
        setPageIndex(pageResult.pageIndex);
        setTotalCount(pageResult.totalCount);
        setCompletedOn(pageResult.completedOn);
        setGenres(pageResult.items);
      })
      .catch((error) => {
        setLoading(false);
        alert(error);
      });
  }, [pageSize, pageIndex, nameFilter, enabledFilter, applicationClient]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  const onCreateButtonClick = () => {
    navigate("/catalog/genres/create");
  };

  const onViewButtonClick = (id: string) => {
    navigate(`/catalog/genres/view?id=${id}`);
  };

  const onEditButtonClick = (id: string) => {
    navigate(`/catalog/genres/edit?id=${id}`);
  };

  const onDeleteButtonClick = (genre: Genre) => {
    setGenreToDelete(genre);
    setModalOpen(true);
  };

  const onDeleteModalOk = (setModalLoading: (value: boolean) => void) => {
    if (genreToDelete) {
      setModalLoading(true);
      applicationClient
        .deleteGenre(genreToDelete.id)
        .then(() => {
          setModalLoading(false);
          setModalOpen(false);
          fetchGenres();
        })
        .catch((error) => {
          setModalLoading(false);
          setModalOpen(false);
          alert(error);
        });
    }
  };

  const onDeleteModalCancel = () => {
    setModalOpen(false);
  };

  const onTableChange = ({ pageSize, current: pageNumber }: TablePaginationConfig, filter: Record<string, FilterValue | null>) => {
    setPageSize(pageSize ?? defaultPageSize);
    setPageIndex((pageNumber ?? defaultPageIndex + 1) - 1);
    if (filter["enabled"] !== null && filter["enabled"].length > 0) {
      setEnabledFilter(filter["enabled"][0] as boolean);
    } else {
      setEnabledFilter(undefined);
    }
  };

  const onApplyNameFilter = (value?: string) => {
    value = value?.trim();
    value = value && value.length > 0 ? value : undefined;
    setNameFilter(value);
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      filterDropdown: <StringValueFilterDropdown value={nameFilter} placeholder="Enter Name" onValueChange={onApplyNameFilter} />,
      filterMultiple: false,
      filteredValue: nameFilter ? [nameFilter] : [],
      render: (_: string, { id, name, systemEntity }: Genre) => (
        <Space wrap>
          <Typography.Link href={`/catalog/genres/view?id=${id}`}>{name}</Typography.Link>
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
      render: (_: string, genre: Genre) => (
        <Space wrap>
          <Button onClick={() => onViewButtonClick(genre.id)}>
            <MonitorOutlined /> View
          </Button>
          <Button onClick={() => onEditButtonClick(genre.id)}>
            <EditOutlined /> Edit
          </Button>
          <Button danger disabled={genre.systemEntity} onClick={() => onDeleteButtonClick(genre)}>
            <DeleteOutlined /> Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>Browse Genres</Typography.Title>
        <Button type="primary" onClick={onCreateButtonClick}>
          <AppstoreAddOutlined />
          Create
        </Button>
      </Space>
      <Table
        columns={columns}
        rowKey="id"
        dataSource={genres ?? []}
        loading={loading}
        pagination={{
          current: pageIndex + 1,
          defaultCurrent: defaultPageIndex + 1,
          pageSize: pageSize,
          defaultPageSize: defaultPageSize,
          total: totalCount ?? 0,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        onChange={(pagination, filters) => onTableChange(pagination, filters)}
      />
      {totalCount !== undefined && completedOn && (
        <Space className={styles.statusLine}>
          <Typography.Paragraph>{`Found ${totalCount} genres total, request completed on ${completedOn.toLocaleString()}.`}</Typography.Paragraph>
        </Space>
      )}
      {genreToDelete && (
        <ConfirmDeleteModal
          open={modalOpen}
          title="Delete Genre"
          message={`Confirm that you want to delete the "${genreToDelete.name}" genre. This operation can not be undone.`}
          onOk={onDeleteModalOk}
          onCancel={onDeleteModalCancel}
        />
      )}
    </>
  );
};

export default GenreListPage;
