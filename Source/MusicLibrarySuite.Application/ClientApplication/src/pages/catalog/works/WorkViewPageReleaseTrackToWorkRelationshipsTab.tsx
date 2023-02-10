import { useEffect, useState } from "react";
import { ReleaseTrackToWorkRelationship } from "../../../api/ApplicationClient";
import ReleaseTrackRelationshipTable from "../../../components/tables/ReleaseTrackRelationshipTable";
import { getReleaseTrackKey } from "../../../helpers/ReleaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";

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

  return (
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
  );
};

export default WorkViewPageReleaseTrackToWorkRelationshipsTab;
