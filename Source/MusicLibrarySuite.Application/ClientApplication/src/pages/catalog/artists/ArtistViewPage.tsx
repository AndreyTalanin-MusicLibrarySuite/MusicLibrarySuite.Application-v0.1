import { Button, Card, Divider, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Artist } from "../../../api/ApplicationClient";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ArtistViewPageArtistRelationshipsTab from "./ArtistViewPageArtistRelationshipsTab";
import styles from "./ArtistViewPage.module.css";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const ArtistViewPage = () => {
  const navigate = useNavigate();

  const [artist, setArtist] = useState<Artist>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  const fetchArtist = useCallback(() => {
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

  useEffect(() => {
    fetchArtist();
  }, [fetchArtist]);

  const onEditButtonClick = () => {
    navigate(`/catalog/artists/edit?id=${id}`);
  };

  const onCancelButtonClick = () => {
    navigate("/catalog/artists/list");
  };

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
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Title level={4}>View Artist</Title>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Artist List
        </Button>
      </Space>
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
              Artist Genres:{" "}
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
      {artist && <Tabs items={tabs} />}
    </>
  );
};

export default ArtistViewPage;
