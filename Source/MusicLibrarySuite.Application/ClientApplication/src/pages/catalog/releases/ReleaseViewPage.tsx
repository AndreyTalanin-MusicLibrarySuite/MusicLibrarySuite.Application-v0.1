import { Button, Card, Collapse, Divider, Space, Table, Tabs, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, MonitorOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Release, ReleaseMedia, ReleaseTrack } from "../../../api/ApplicationClient";
import EditReleaseMediaModal from "../../../components/modals/EditReleaseMediaModal";
import EditReleaseTrackModal from "../../../components/modals/EditReleaseTrackModal";
import ActionPage from "../../../components/pages/ActionPage";
import { formatReleaseMediaNumber, getReleaseMediaKey } from "../../../helpers/ReleaseMediaHelpers";
import { formatReleaseTrackNumber, getReleaseTrackKey } from "../../../helpers/ReleaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ReleaseViewPageReleaseMediaToProductRelationshipsTab from "./ReleaseViewPageReleaseMediaToProductRelationshipsTab";
import ReleaseViewPageReleaseRelationshipsTab from "./ReleaseViewPageReleaseRelationshipsTab";
import ReleaseViewPageReleaseToProductRelationshipsTab from "./ReleaseViewPageReleaseToProductRelationshipsTab";
import ReleaseViewPageReleaseToReleaseGroupRelationshipsTab from "./ReleaseViewPageReleaseToReleaseGroupRelationshipsTab";
import ReleaseViewPageReleaseTrackToProductRelationshipsTab from "./ReleaseViewPageReleaseTrackToProductRelationshipsTab";
import ReleaseViewPageReleaseTrackToWorkRelationshipsTab from "./ReleaseViewPageReleaseTrackToWorkRelationshipsTab";
import styles from "./ReleaseViewPage.module.css";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ReleaseViewPage = () => {
  const navigate = useNavigate();

  const [release, setRelease] = useState<Release>();
  const [viewReleaseMediaModalOpen, setViewReleaseMediaModalOpen] = useState<boolean>(false);
  const [releaseMediaToView, setReleaseMediaToView] = useState<ReleaseMedia>();
  const [viewReleaseTrackModalOpen, setViewReleaseTrackModalOpen] = useState<boolean>(false);
  const [releaseTrackToView, setReleaseTrackToView] = useState<ReleaseTrack>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  useEffect(() => {
    if (id) {
      applicationClient
        .getRelease(id)
        .then((release) => {
          setRelease(release);
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  const onEditButtonClick = useCallback(() => {
    navigate(`/catalog/releases/edit?id=${id}`);
  }, [navigate, id]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/releases/list");
  }, [navigate]);

  const onViewReleaseMediaButtonClick = (releaseMedia: ReleaseMedia) => {
    setReleaseMediaToView(releaseMedia);
    setViewReleaseMediaModalOpen(true);
  };

  const onViewReleaseTrackButtonClick = (releaseTrack: ReleaseTrack) => {
    setReleaseTrackToView(releaseTrack);
    setViewReleaseTrackModalOpen(true);
  };

  const releaseTrackTableColumns = [
    {
      key: "trackNumber",
      title: "Track #",
      dataIndex: "trackNumber",
      render: (_: number, { trackNumber, totalTrackCount }: ReleaseTrack) => formatReleaseTrackNumber(trackNumber, totalTrackCount),
    },
    {
      key: "mediaNumber",
      title: "Media #",
      dataIndex: "mediaNumber",
      render: (_: number, { mediaNumber, totalMediaCount }: ReleaseTrack) => formatReleaseMediaNumber(mediaNumber, totalMediaCount),
    },
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
      render: (_: string, { title, disambiguationText }: ReleaseTrack) => (
        <Space wrap>
          {title}
          {disambiguationText && (
            <Tooltip title={disambiguationText}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (_: string, releaseTrack: ReleaseTrack) => (
        <Space wrap>
          <Button onClick={() => onViewReleaseTrackButtonClick(releaseTrack)}>
            <MonitorOutlined /> View
          </Button>
        </Space>
      ),
    },
  ];

  const title = <Title level={4}>View Release</Title>;

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined /> Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined /> Back to Release List
        </Button>
      </>
    ),
    [onEditButtonClick, onCancelButtonClick]
  );

  const tabs = useMemo(
    () => [
      {
        key: "releaseRelationshipsTab",
        label: "Release Relationships",
        children: id && <ReleaseViewPageReleaseRelationshipsTab id={id} />,
      },
      {
        key: "releaseToProductRelationshipsTab",
        label: "Release-to-Product Relationships",
        children: id && <ReleaseViewPageReleaseToProductRelationshipsTab id={id} />,
      },
      {
        key: "releaseToReleaseGroupRelationshipsTab",
        label: "Release-to-Release-Group Relationships",
        children: id && <ReleaseViewPageReleaseToReleaseGroupRelationshipsTab id={id} />,
      },
      {
        key: "releaseMediaToProductRelationshipsTab",
        label: "Release-Media-to-Product Relationships",
        children: id && <ReleaseViewPageReleaseMediaToProductRelationshipsTab id={id} />,
      },
      {
        key: "releaseTrackToProductRelationshipsTab",
        label: "Release-Track-to-Product Relationships",
        children: id && <ReleaseViewPageReleaseTrackToProductRelationshipsTab id={id} />,
      },
      {
        key: "releaseTrackToWorkRelationshipsTab",
        label: "Release-Track-to-Work Relationships",
        children: id && <ReleaseViewPageReleaseTrackToWorkRelationshipsTab id={id} />,
      },
    ],
    [id]
  );

  const modals = useMemo(
    () => [
      release && (
        <EditReleaseMediaModal
          open={viewReleaseMediaModalOpen}
          releaseMedia={releaseMediaToView}
          onOk={() => setViewReleaseMediaModalOpen(false)}
          onCancel={() => setViewReleaseMediaModalOpen(false)}
        />
      ),
      release && (
        <EditReleaseTrackModal
          open={viewReleaseTrackModalOpen}
          releaseTrack={releaseTrackToView}
          onOk={() => setViewReleaseTrackModalOpen(false)}
          onCancel={() => setViewReleaseTrackModalOpen(false)}
        />
      ),
    ],
    [release, viewReleaseMediaModalOpen, releaseMediaToView, viewReleaseTrackModalOpen, releaseTrackToView]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      {release && (
        <Card
          title={
            <Space>
              {release.title}
              {release.disambiguationText && (
                <Tooltip title={release.disambiguationText}>
                  <QuestionCircleOutlined />
                </Tooltip>
              )}
              <Tag color={release.enabled ? "green" : "red"}>{release.enabled ? "Enabled" : "Disabled"}</Tag>
            </Space>
          }
        >
          {release.description?.length && <Paragraph>{release.description}</Paragraph>}
          {release.barcode?.length && (
            <Paragraph>
              Barcode: <Text keyboard>{release.barcode}</Text>
            </Paragraph>
          )}
          {release.catalogNumber?.length && (
            <Paragraph>
              Catalog Number: <Text keyboard>{release.catalogNumber}</Text>
            </Paragraph>
          )}
          {release.mediaFormat?.length && (
            <Paragraph>
              Media Format: <Text>{release.mediaFormat}</Text>
            </Paragraph>
          )}
          {release.publishFormat?.length && (
            <Paragraph>
              Publish Format: <Text>{release.publishFormat}</Text>
            </Paragraph>
          )}
          <Paragraph>
            Released On: <Text keyboard>{release.releasedOnYearOnly ? release.releasedOn.getUTCFullYear() : release.releasedOn.toLocaleDateString()}</Text>
          </Paragraph>
          {release.releaseArtists && release.releaseArtists.length > 0 && (
            <Paragraph>
              Artists:{" "}
              {release.releaseArtists.map((releaseArtist, index, array) => (
                <>
                  <Typography.Link key={releaseArtist.artistId} href={`/catalog/artists/view?id=${releaseArtist.artistId}`}>
                    {releaseArtist?.artist?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {release.releaseFeaturedArtists && release.releaseFeaturedArtists.length > 0 && (
            <Paragraph>
              Featured Artists:{" "}
              {release.releaseFeaturedArtists.map((releaseFeaturedArtist, index, array) => (
                <>
                  <Typography.Link key={releaseFeaturedArtist.artistId} href={`/catalog/artists/view?id=${releaseFeaturedArtist.artistId}`}>
                    {releaseFeaturedArtist?.artist?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {release.releasePerformers && release.releasePerformers.length > 0 && (
            <Paragraph>
              Performers:{" "}
              {release.releasePerformers.map((releasePerformer, index, array) => (
                <>
                  <Typography.Link key={releasePerformer.artistId} href={`/catalog/artists/view?id=${releasePerformer.artistId}`}>
                    {releasePerformer?.artist?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {release.releaseComposers && release.releaseComposers.length > 0 && (
            <Paragraph>
              Composers:{" "}
              {release.releaseComposers.map((releaseComposer, index, array) => (
                <>
                  <Typography.Link key={releaseComposer.artistId} href={`/catalog/artists/view?id=${releaseComposer.artistId}`}>
                    {releaseComposer?.artist?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {release.releaseGenres && release.releaseGenres.length > 0 && (
            <Paragraph>
              Genres:{" "}
              {release.releaseGenres.map((releaseGenre, index, array) => (
                <>
                  <Typography.Link key={releaseGenre.genreId} href={`/catalog/genres/view?id=${releaseGenre.genreId}`}>
                    {releaseGenre?.genre?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          <Divider />
          {release.createdOn && (
            <Paragraph>
              Created On: <Text keyboard>{release.createdOn.toLocaleString()}</Text>
            </Paragraph>
          )}
          {release.updatedOn && (
            <Paragraph>
              Updated On: <Text keyboard>{release.updatedOn.toLocaleString()}</Text>
            </Paragraph>
          )}
        </Card>
      )}
      {release &&
        release.releaseMediaCollection.map((releaseMedia) => (
          <Card
            key={getReleaseMediaKey(releaseMedia)}
            size="small"
            title={
              <Space wrap className={styles.cardHeader} direction="horizontal" align="baseline">
                <Space wrap direction="horizontal" align="baseline">
                  {`${formatReleaseMediaNumber(releaseMedia.mediaNumber, release.releaseMediaCollection.length)} - ${releaseMedia.title}`}
                  {releaseMedia.disambiguationText && (
                    <Tooltip title={releaseMedia.disambiguationText}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  )}
                </Space>
                <Space wrap direction="horizontal" align="baseline">
                  <Button onClick={() => onViewReleaseMediaButtonClick(releaseMedia)}>
                    <MonitorOutlined /> View
                  </Button>
                </Space>
              </Space>
            }
          >
            <Space direction="vertical" style={{ display: "flex" }}>
              {(releaseMedia.description ||
                releaseMedia.catalogNumber ||
                releaseMedia.mediaFormat ||
                releaseMedia.tableOfContentsChecksum ||
                releaseMedia.tableOfContentsChecksumLong) && (
                <Collapse>
                  <Collapse.Panel key="release-media-details" header="Release Media Details">
                    {releaseMedia.description && <Paragraph>{releaseMedia.description}</Paragraph>}
                    {releaseMedia.description &&
                      (releaseMedia.catalogNumber ||
                        releaseMedia.mediaFormat ||
                        releaseMedia.tableOfContentsChecksum ||
                        releaseMedia.tableOfContentsChecksumLong) && <Divider />}
                    {releaseMedia.catalogNumber && (
                      <Paragraph>
                        Catalog Number: <Text keyboard>{releaseMedia.catalogNumber}</Text>
                      </Paragraph>
                    )}
                    {releaseMedia.mediaFormat && (
                      <Paragraph>
                        Media Format: <Text>{releaseMedia.mediaFormat}</Text>
                      </Paragraph>
                    )}
                    {releaseMedia.tableOfContentsChecksum && (
                      <Paragraph>
                        CDDB Checksum: <Text keyboard>{releaseMedia.tableOfContentsChecksum}</Text>
                      </Paragraph>
                    )}
                    {releaseMedia.tableOfContentsChecksumLong && (
                      <Paragraph>
                        MusicBrainz Checksum: <Text keyboard>{releaseMedia.tableOfContentsChecksumLong}</Text>
                      </Paragraph>
                    )}
                  </Collapse.Panel>
                </Collapse>
              )}
              {releaseMedia.releaseTrackCollection.length > 0 && (
                <Table
                  size="small"
                  columns={releaseTrackTableColumns}
                  rowKey={getReleaseTrackKey}
                  dataSource={releaseMedia.releaseTrackCollection}
                  pagination={false}
                />
              )}
            </Space>
          </Card>
        ))}
      <Tabs items={tabs} />
    </ActionPage>
  );
};

export default ReleaseViewPage;
