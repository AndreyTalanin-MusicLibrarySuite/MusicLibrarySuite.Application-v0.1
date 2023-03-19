import { Button, Card, Divider, Space, Tabs, Tag, Typography } from "antd";
import { EditOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Genre } from "../../../api/ApplicationClient";
import ActionPage from "../../../components/pages/ActionPage";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import GenreViewPageGenreRelationshipsTab from "./GenreViewPageGenreRelationshipsTab";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const GenreViewPage = () => {
  const navigate = useNavigate();

  const [genre, setGenre] = useState<Genre>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  useEffect(() => {
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

  const onEditButtonClick = useCallback(() => {
    navigate(`/catalog/genres/edit?id=${id}`);
  }, [navigate, id]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/genres/list");
  }, [navigate]);

  const title = <Title level={4}>View Genre</Title>;

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Genre List
        </Button>
      </>
    ),
    [onEditButtonClick, onCancelButtonClick]
  );

  const tabs = useMemo(
    () => [
      {
        key: "genreRelationshipsTab",
        label: "Genre Relationships",
        children: id && <GenreViewPageGenreRelationshipsTab id={id} />,
      },
    ],
    [id]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons}>
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
      <Tabs items={tabs} />
    </ActionPage>
  );
};

export default GenreViewPage;
