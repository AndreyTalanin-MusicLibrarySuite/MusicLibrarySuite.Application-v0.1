import { Button, Card, Divider, Space, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Work } from "../../../api/ApplicationClient";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import styles from "./WorkViewPage.module.css";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const WorkViewPage = () => {
  const navigate = useNavigate();

  const [work, setWork] = useState<Work>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  const fetchWork = useCallback(() => {
    if (id) {
      applicationClient
        .getWork(id)
        .then((work) => {
          setWork(work);
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  const onEditButtonClick = () => {
    navigate(`/catalog/works/edit?id=${id}`);
  };

  const onCancelButtonClick = () => {
    navigate("/catalog/works/list");
  };

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Title level={4}>View Work</Title>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Work List
        </Button>
      </Space>
      {work && (
        <Card
          title={
            <Space>
              {work.title}
              {work.disambiguationText && (
                <Tooltip title={work.disambiguationText}>
                  <QuestionCircleOutlined />
                </Tooltip>
              )}
              {work.systemEntity && <Tag>System Entity</Tag>}
              <Tag color={work.enabled ? "green" : "red"}>{work.enabled ? "Enabled" : "Disabled"}</Tag>
            </Space>
          }
        >
          {work.description?.length && <Paragraph>{work.description}</Paragraph>}
          {work.internationalStandardMusicalWorkCode?.length && <Paragraph>ISWC: {work.internationalStandardMusicalWorkCode}</Paragraph>}
          <Paragraph>
            Released On: <Text keyboard>{work.releasedOnYearOnly ? work.releasedOn.getUTCFullYear() : work.releasedOn.toLocaleDateString()}</Text>
          </Paragraph>
          <Divider />
          {work.createdOn && (
            <Paragraph>
              Created On: <Text keyboard>{work.createdOn.toLocaleString()}</Text>
            </Paragraph>
          )}
          {work.updatedOn && (
            <Paragraph>
              Updated On: <Text keyboard>{work.updatedOn.toLocaleString()}</Text>
            </Paragraph>
          )}
        </Card>
      )}
    </>
  );
};

export default WorkViewPage;
