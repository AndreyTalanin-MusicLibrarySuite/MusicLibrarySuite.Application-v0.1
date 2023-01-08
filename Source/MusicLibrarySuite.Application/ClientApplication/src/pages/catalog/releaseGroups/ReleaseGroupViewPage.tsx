import { Button, Card, Divider, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseGroup } from "../../../api/ApplicationClient";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ReleaseGroupViewPageReleaseGroupRelationshipsTab from "./ReleaseGroupViewPageReleaseGroupRelationshipsTab";
import styles from "./ReleaseGroupViewPage.module.css";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ReleaseGroupViewPage = () => {
  const navigate = useNavigate();

  const [releaseGroup, setReleaseGroup] = useState<ReleaseGroup>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  const fetchReleaseGroup = useCallback(() => {
    if (id) {
      applicationClient
        .getReleaseGroup(id)
        .then((releaseGroup) => {
          setReleaseGroup(releaseGroup);
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  useEffect(() => {
    fetchReleaseGroup();
  }, [fetchReleaseGroup]);

  const onEditButtonClick = () => {
    navigate(`/catalog/releaseGroups/edit?id=${id}`);
  };

  const onCancelButtonClick = () => {
    navigate("/catalog/releaseGroups/list");
  };

  const tabs = useMemo(
    () => [
      {
        key: "releaseGroupRelationshipsTab",
        label: "Release Group Relationships",
        children: id && <ReleaseGroupViewPageReleaseGroupRelationshipsTab id={id} />,
      },
    ],
    [id]
  );

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Title level={4}>View Release Group</Title>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Release Group List
        </Button>
      </Space>
      {releaseGroup && (
        <Card
          title={
            <Space>
              {releaseGroup.title}
              {releaseGroup.disambiguationText && (
                <Tooltip title={releaseGroup.disambiguationText}>
                  <QuestionCircleOutlined />
                </Tooltip>
              )}
              <Tag color={releaseGroup.enabled ? "green" : "red"}>{releaseGroup.enabled ? "Enabled" : "Disabled"}</Tag>
            </Space>
          }
        >
          {releaseGroup.description?.length && (
            <>
              <Paragraph>{releaseGroup.description}</Paragraph>
              <Divider />
            </>
          )}
          {releaseGroup.createdOn && (
            <Paragraph>
              Created On: <Text keyboard>{releaseGroup.createdOn.toLocaleString()}</Text>
            </Paragraph>
          )}
          {releaseGroup.updatedOn && (
            <Paragraph>
              Updated On: <Text keyboard>{releaseGroup.updatedOn.toLocaleString()}</Text>
            </Paragraph>
          )}
        </Card>
      )}
      {tabs && <Tabs items={tabs} />}
    </>
  );
};

export default ReleaseGroupViewPage;
