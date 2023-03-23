import { Button, Card, Divider, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Work } from "../../../api/ApplicationClient";
import ActionPage from "../../../components/pages/ActionPage";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import WorkViewPageReleaseTrackToWorkRelationshipsTab from "./WorkViewPageReleaseTrackToWorkRelationshipsTab";
import WorkViewPageWorkRelationshipsTab from "./WorkViewPageWorkRelationshipsTab";
import WorkViewPageWorkToProductRelationshipsTab from "./WorkViewPageWorkToProductRelationshipsTab";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

const WorkViewPage = () => {
  const navigate = useNavigate();

  const [work, setWork] = useState<Work>();

  const [id] = useQueryStringId(true);
  const applicationClient = useApplicationClient();

  useEffect(() => {
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

  const onEditButtonClick = useCallback(() => {
    navigate(`/catalog/works/edit?id=${id}`);
  }, [navigate, id]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/works/list");
  }, [navigate]);

  const title = <Title level={4}>View Work</Title>;

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" onClick={onEditButtonClick}>
          <EditOutlined />
          Edit
        </Button>
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Back to Work List
        </Button>
      </>
    ),
    [onEditButtonClick, onCancelButtonClick]
  );

  const tabs = useMemo(
    () => [
      {
        key: "workRelationshipsTab",
        label: "Work Relationships",
        children: id && <WorkViewPageWorkRelationshipsTab id={id} />,
      },
      {
        key: "workToProductRelationshipsTab",
        label: "Work-to-Product Relationships",
        children: id && <WorkViewPageWorkToProductRelationshipsTab id={id} />,
      },
      {
        key: "releaseTrackToWorkRelationshipsTab",
        label: "Release-Track-to-Work Relationships",
        children: id && <WorkViewPageReleaseTrackToWorkRelationshipsTab id={id} />,
      },
    ],
    [id]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons}>
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
          {work.internationalStandardMusicalWorkCode?.length && (
            <Paragraph>
              ISWC: <Text keyboard>{work.internationalStandardMusicalWorkCode}</Text>
            </Paragraph>
          )}
          <Paragraph>
            Released On: <Text keyboard>{work.releasedOnYearOnly ? work.releasedOn.getUTCFullYear() : work.releasedOn.toLocaleDateString()}</Text>
          </Paragraph>
          {work.workArtists && work.workArtists.length > 0 && (
            <Paragraph>
              Artists:{" "}
              {work.workArtists.map((workArtist, index, array) => (
                <>
                  <Typography.Link key={workArtist.artistId} href={`/catalog/artists/view?id=${workArtist.artistId}`}>
                    {workArtist?.artist?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {work.workFeaturedArtists && work.workFeaturedArtists.length > 0 && (
            <Paragraph>
              Featured Artists:{" "}
              {work.workFeaturedArtists.map((workFeaturedArtist, index, array) => (
                <>
                  <Typography.Link key={workFeaturedArtist.artistId} href={`/catalog/artists/view?id=${workFeaturedArtist.artistId}`}>
                    {workFeaturedArtist?.artist?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {work.workPerformers && work.workPerformers.length > 0 && (
            <Paragraph>
              Performers:{" "}
              {work.workPerformers.map((workPerformer, index, array) => (
                <>
                  <Typography.Link key={workPerformer.artistId} href={`/catalog/artists/view?id=${workPerformer.artistId}`}>
                    {workPerformer?.artist?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {work.workComposers && work.workComposers.length > 0 && (
            <Paragraph>
              Composers:{" "}
              {work.workComposers.map((workComposer, index, array) => (
                <>
                  <Typography.Link key={workComposer.artistId} href={`/catalog/artists/view?id=${workComposer.artistId}`}>
                    {workComposer?.artist?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
          {work.workGenres && work.workGenres.length > 0 && (
            <Paragraph>
              Genres:{" "}
              {work.workGenres.map((workGenre, index, array) => (
                <>
                  <Typography.Link key={workGenre.genreId} href={`/catalog/genres/view?id=${workGenre.genreId}`}>
                    {workGenre?.genre?.name}
                  </Typography.Link>
                  {index < array.length - 1 && ", "}
                </>
              ))}
            </Paragraph>
          )}
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
      <Tabs items={tabs} />
    </ActionPage>
  );
};

export default WorkViewPage;
