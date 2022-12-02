import { Button, Card, Divider, Space, Tabs, Tag, Typography } from "antd";
import { EditOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Genre } from "../../../api/ApplicationClient";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ViewGenrePageGenreRelationshipsTab from "./ViewGenrePageGenreRelationshipsTab";
import styles from "./ViewGenrePage.module.css";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ViewGenrePage = () => {
  const navigate = useNavigate();

  const [genre, setGenre] = useState<Genre>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  const fetchGenre = useCallback(() => {
    if (id) {
      applicationClient
        .getGenre(id)
        .then((genre) => {
          setGenre(genre);
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  useEffect(() => {
    fetchGenre();
  }, [fetchGenre]);

  const onEditButtonClick = () => {
    navigate(`/catalog/genres/edit?id=${id}`);
  };

  const onCancelButtonClick = () => {
    navigate("/catalog/genres/list");
  };

  const tabs = [
    {
      key: "genreRelationshipsTab",
      label: "Genre Relationships",
      children: id && <ViewGenrePageGenreRelationshipsTab id={id} />,
    },
  ];

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Title level={4}>View Genre</Title>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Genre List
        </Button>
      </Space>
      {genre && (
        <Card
          title={
            <Space>
              {genre.name}
              {genre.systemEntity && <Tag>System Entity</Tag>}
              <Tag color={genre.enabled ? "green" : "red"}>{genre.enabled ? "Enabled" : "Disabled"}</Tag>
            </Space>
          }
        >
          {genre.description?.length && (
            <>
              <Paragraph>{genre.description}</Paragraph>
              <Divider />
            </>
          )}
          {genre.createdOn && (
            <Paragraph>
              Created On: <Text keyboard>{genre.createdOn.toLocaleString()}</Text>
            </Paragraph>
          )}
          {genre.updatedOn && (
            <Paragraph>
              Updated On: <Text keyboard>{genre.updatedOn.toLocaleString()}</Text>
            </Paragraph>
          )}
        </Card>
      )}
      {genre && <Tabs items={tabs} />}
    </>
  );
};

export default ViewGenrePage;
