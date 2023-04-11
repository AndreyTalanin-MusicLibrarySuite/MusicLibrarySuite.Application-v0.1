import { Typography } from "antd";
import { useEffect, useState } from "react";
import { ReleaseTrackToWorkRelationship } from "../../../api/ApplicationClient";
import ReleaseTrackRelationshipTable from "../../../components/tables/ReleaseTrackRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { getReleaseTrackKey } from "../../../helpers/releaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Title } = Typography;

export interface WorkViewPageReleaseTrackToWorkRelationshipsTabProps {
  id: string;
}

const WorkViewPageReleaseTrackToWorkRelationshipsTab = ({ id }: WorkViewPageReleaseTrackToWorkRelationshipsTabProps) => {
  const [releaseTrackToWorkRelationships, setReleaseTrackToWorkRelationships] = useState<ReleaseTrackToWorkRelationship[]>([]);
  const [releaseTrackToWorkRelationshipsLoading, setReleaseTrackToWorkRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseTrackToWorkRelationshipsLoading(true);
    applicationClient
      .getReleaseTrackToWorkRelationshipsByWork(id)
      .then((releaseTrackToWorkRelationships) => {
        setReleaseTrackToWorkRelationships(releaseTrackToWorkRelationships);
        setReleaseTrackToWorkRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  const title = <Title level={5}>View Release-Track-to-Work Relationships</Title>;

  return (
    <ActionTab title={title}>
      <ReleaseTrackRelationshipTable
        dependentEntityColumnName="Work"
        loading={releaseTrackToWorkRelationshipsLoading}
        releaseTrackRelationships={releaseTrackToWorkRelationships.map((releaseTrackToWorkRelationship) => ({
          name: releaseTrackToWorkRelationship.name,
          description: releaseTrackToWorkRelationship.description,
          releaseTrackId: getReleaseTrackKey(releaseTrackToWorkRelationship.releaseTrack!),
          releaseTrackTitle: releaseTrackToWorkRelationship.releaseTrack!.title,
          releaseTrackHref: `/catalog/releases/view?id=${releaseTrackToWorkRelationship.releaseId}`,
          releaseTrackNumber: releaseTrackToWorkRelationship.releaseTrack!.trackNumber,
          releaseMediaNumber: releaseTrackToWorkRelationship.releaseTrack!.mediaNumber,
          dependentEntityId: releaseTrackToWorkRelationship.workId,
          dependentEntityName: releaseTrackToWorkRelationship.work?.title ?? "",
          dependentEntityHref: `/catalog/works/view?id=${releaseTrackToWorkRelationship.workId}`,
        }))}
      />
    </ActionTab>
  );
};

export default WorkViewPageReleaseTrackToWorkRelationshipsTab;
