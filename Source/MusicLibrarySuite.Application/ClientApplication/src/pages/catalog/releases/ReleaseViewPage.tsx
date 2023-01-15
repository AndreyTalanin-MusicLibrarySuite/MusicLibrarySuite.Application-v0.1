import { Button, Card, Collapse, Divider, Space, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, MonitorOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Release, ReleaseMedia } from "../../../api/ApplicationClient";
import CreateReleaseMediaModal from "../../../components/modals/CreateReleaseMediaModal";
import { formatReleaseMediaNumber, getReleaseMediaKey } from "../../../helpers/ReleaseMediaHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import styles from "./ReleaseViewPage.module.css";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ReleaseViewPage = () => {
  const navigate = useNavigate();

  const [release, setRelease] = useState<Release>();
  const [viewReleaseMediaModalOpen, setViewReleaseMediaModalOpen] = useState<boolean>(false);
  const [releaseMediaToView, setReleaseMediaToView] = useState<ReleaseMedia>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  const fetchRelease = useCallback(() => {
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

  useEffect(() => {
    fetchRelease();
  }, [fetchRelease]);

  const onEditButtonClick = () => {
    navigate(`/catalog/releases/edit?id=${id}`);
  };

  const onCancelButtonClick = () => {
    navigate("/catalog/releases/list");
  };

  const onViewReleaseMediaButtonClick = (releaseMedia: ReleaseMedia) => {
    setReleaseMediaToView(releaseMedia);
    setViewReleaseMediaModalOpen(true);
  };

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Title level={4}>View Release</Title>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined /> Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined /> Back to Release List
        </Button>
      </Space>
      <Space direction="vertical" style={{ display: "flex" }}>
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
                Media Format: <Text>{release.publishFormat}</Text>
              </Paragraph>
            )}
            <Paragraph>
              Released On: <Text keyboard>{release.releasedOnYearOnly ? release.releasedOn.getUTCFullYear() : release.releasedOn.toLocaleDateString()}</Text>
            </Paragraph>
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
                  <Button onClick={() => onViewReleaseMediaButtonClick(releaseMedia)}>
                    <MonitorOutlined /> View
                  </Button>
                </Space>
              }
            >
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
            </Card>
          ))}
      </Space>
      {release && (
        <CreateReleaseMediaModal
          open={viewReleaseMediaModalOpen}
          releaseMedia={releaseMediaToView}
          onOk={() => setViewReleaseMediaModalOpen(false)}
          onCancel={() => setViewReleaseMediaModalOpen(false)}
        />
      )}
    </>
  );
};

export default ReleaseViewPage;
