import { Button, Card, Divider, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseGroup } from "../../../api/ApplicationClient";
import ActionPage from "../../../components/pages/ActionPage";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ReleaseGroupViewPageReleaseGroupRelationshipsTab from "./ReleaseGroupViewPageReleaseGroupRelationshipsTab";
import ReleaseGroupViewPageReleaseToReleaseGroupRelationshipsTab from "./ReleaseGroupViewPageReleaseToReleaseGroupRelationshipsTab";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ReleaseGroupViewPage = () => {
  const navigate = useNavigate();

  const [releaseGroup, setReleaseGroup] = useState<ReleaseGroup>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  useEffect(() => {
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

  const onEditButtonClick = useCallback(() => {
    navigate(`/catalog/releaseGroups/edit?id=${id}`);
  }, [navigate, id]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/releaseGroups/list");
  }, [navigate]);

  const title = <Title level={4}>View Release Group</Title>;

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Release Group List
        </Button>
      </>
    ),
    [onEditButtonClick, onCancelButtonClick]
  );

  const tabs = useMemo(
    () => [
      {
        key: "releaseGroupRelationshipsTab",
        label: "Release Group Relationships",
        children: id && <ReleaseGroupViewPageReleaseGroupRelationshipsTab id={id} />,
      },
      {
        key: "releaseToReleaseGroupRelationshipsTab",
        label: "Release-to-Release-Group Relationships",
        children: id && <ReleaseGroupViewPageReleaseToReleaseGroupRelationshipsTab id={id} />,
      },
    ],
    [id]
  );

  return (
    <>
      <ActionPage title={title} actionButtons={actionButtons}>
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
        <Tabs items={tabs} />
      </ActionPage>
    </>
  );
};

export default ReleaseGroupViewPage;
