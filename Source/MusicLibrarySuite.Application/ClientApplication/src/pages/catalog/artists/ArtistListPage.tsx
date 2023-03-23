import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, MonitorOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Artist } from "../../../api/ApplicationClient";
import StringValueFilterDropdown from "../../../components/helpers/StringValueFilterDropdown";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { DefaultPageIndex, DefaultPageSize } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const ArtistListPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(DefaultPageSize);
  const [pageIndex, setPageIndex] = useState<number>(DefaultPageIndex);
  const [nameFilter, setNameFilter] = useState<string>();
  const [enabledFilter, setEnabledFilter] = useState<boolean>();
  const [totalCount, setTotalCount] = useState<number>();
  const [completedOn, setCompletedOn] = useState<Date>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistToDelete, setArtistToDelete] = useState<Artist>();
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  const fetchArtists = useCallback(() => {
    setLoading(true);
    applicationClient
      .getPagedArtists(pageSize, pageIndex, nameFilter, enabledFilter)
      .then((pageResult) => {
        setLoading(false);
        setPageSize(pageResult.pageSize);
        setPageIndex(pageResult.pageIndex);
        setTotalCount(pageResult.totalCount);
        setCompletedOn(pageResult.completedOn);
        setArtists(pageResult.items);
      })
      .catch((error) => {
        setLoading(false);
        alert(error);
      });
  }, [pageSize, pageIndex, nameFilter, enabledFilter, applicationClient]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const onCreateButtonClick = useCallback(() => {
    navigate("/catalog/artists/create");
  }, [navigate]);

  const onViewButtonClick = useCallback(
    (id: string) => {
      navigate(`/catalog/artists/view?id=${id}`);
    },
    [navigate]
  );

  const onEditButtonClick = useCallback(
    (id: string) => {
      navigate(`/catalog/artists/edit?id=${id}`);
    },
    [navigate]
  );

  const onDeleteButtonClick = (artist: Artist) => {
    setArtistToDelete(artist);
    setConfirmDeleteModalOpen(true);
  };

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (artistToDelete) {
        setModalLoading(true);
        applicationClient
          .deleteArtist(artistToDelete.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            fetchArtists();
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [artistToDelete, applicationClient, fetchArtists]
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
      render: (_: string, { id, name, disambiguationText, systemEntity }: Artist) => (
        <Space wrap>
          <Typography.Link href={`/catalog/artists/view?id=${id}`}>{name}</Typography.Link>
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
      render: (_: string, artist: Artist) => (
        <Space wrap>
          <Button onClick={() => onViewButtonClick(artist.id)}>
            <MonitorOutlined /> View
          </Button>
          <Button onClick={() => onEditButtonClick(artist.id)}>
            <EditOutlined /> Edit
          </Button>
          <Button danger disabled={artist.systemEntity} onClick={() => onDeleteButtonClick(artist)}>
            <DeleteOutlined /> Delete
          </Button>
        </Space>
      ),
    },
  ];

  const title = <Typography.Title level={4}>Browse Artists</Typography.Title>;

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

  const statusLine = useMemo(
    () => totalCount !== undefined && completedOn && `Found ${totalCount} artists total, request completed on ${completedOn.toLocaleString()}.`,
    [totalCount, completedOn]
  );

  const modals = useMemo(
    () => [
      artistToDelete && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Artist"
          message={`Confirm that you want to delete the "${artistToDelete.name}" artist. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
    ],
    [artistToDelete, confirmDeleteModalOpen, onConfirmDeleteModalOk]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      <Table
        columns={columns}
        rowKey="id"
        dataSource={artists ?? []}
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

export default ArtistListPage;
