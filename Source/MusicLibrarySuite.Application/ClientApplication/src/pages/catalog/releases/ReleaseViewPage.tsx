import { Button, Card, Divider, Space, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Release } from "../../../api/ApplicationClient";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import styles from "./ReleaseViewPage.module.css";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ReleaseViewPage = () => {
  const navigate = useNavigate();

  const [release, setRelease] = useState<Release>();

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

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Title level={4}>View Release</Title>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Release List
        </Button>
      </Space>
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
    </>
  );
};

export default ReleaseViewPage;
