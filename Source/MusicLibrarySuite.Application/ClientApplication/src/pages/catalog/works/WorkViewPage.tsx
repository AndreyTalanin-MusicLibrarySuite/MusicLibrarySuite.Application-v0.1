import { Button, Card, Divider, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Work } from "../../../api/ApplicationClient";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import WorkViewPageWorkRelationshipsTab from "./WorkViewPageWorkRelationshipsTab";
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

  const tabs = useMemo(
    () => [
      {
        key: "workRelationshipsTab",
        label: "Work Relationships",
        children: id && <WorkViewPageWorkRelationshipsTab id={id} />,
      },
    ],
    [id]
  );

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
              Work Artists:{" "}
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
              Work Featured Artists:{" "}
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
              Work Performers:{" "}
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
              Work Composers:{" "}
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
              Work Genres:{" "}
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
      {work && <Tabs items={tabs} />}
    </>
  );
};

export default WorkViewPage;
