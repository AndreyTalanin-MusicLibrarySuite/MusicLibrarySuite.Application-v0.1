import { Button, Card, Divider, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Artist } from "../../../api/ApplicationClient";
import ActionPage from "../../../components/pages/ActionPage";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ArtistViewPageArtistRelationshipsTab from "./ArtistViewPageArtistRelationshipsTab";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ArtistViewPage = () => {
  const navigate = useNavigate();

  const [artist, setArtist] = useState<Artist>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  useEffect(() => {
    if (id) {
      applicationClient
        .getArtist(id)
        .then((artist) => {
          setArtist(artist);
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  const onEditButtonClick = useCallback(() => {
    navigate(`/catalog/artists/edit?id=${id}`);
  }, [navigate, id]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/artists/list");
  }, [navigate]);

  const title = <Title level={4}>View Artist</Title>;

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Artist List
        </Button>
      </>
    ),
    [onEditButtonClick, onCancelButtonClick]
  );

  const tabs = useMemo(
    () => [
      {
        key: "artistRelationshipsTab",
        label: "Artist Relationships",
        children: id && <ArtistViewPageArtistRelationshipsTab id={id} />,
      },
    ],
    [id]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons}>
      {artist && (
        <Card
          title={
            <Space>
              {artist.name}
              {artist.disambiguationText && (
                <Tooltip title={artist.disambiguationText}>
                  <QuestionCircleOutlined />
                </Tooltip>
              )}
              {artist.systemEntity && <Tag>System Entity</Tag>}
              <Tag color={artist.enabled ? "green" : "red"}>{artist.enabled ? "Enabled" : "Disabled"}</Tag>
            </Space>
          }
        >
          {artist.description && <Paragraph>{artist.description}</Paragraph>}
          {artist.artistGenres && artist.artistGenres.length > 0 && (
            <Paragraph>
              Genres:{" "}
              {artist.artistGenres.map((artistGenre, index, array) => (
                <>
                  <Typography.Link key={artistGenre.genreId} href={`/catalog/genres/view?id=${artistGenre.genreId}`}>
                    {artistGenre?.genre?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {(artist.description || (artist.artistGenres && artist.artistGenres.length > 0)) && <Divider />}
          {artist.createdOn && (
            <Paragraph>
              Created On: <Text keyboard>{artist.createdOn.toLocaleString()}</Text>
            </Paragraph>
          )}
          {artist.updatedOn && (
            <Paragraph>
              Updated On: <Text keyboard>{artist.updatedOn.toLocaleString()}</Text>
            </Paragraph>
          )}
        </Card>
      )}
      <Tabs items={tabs} />
    </ActionPage>
  );
};

export default ArtistViewPage;
