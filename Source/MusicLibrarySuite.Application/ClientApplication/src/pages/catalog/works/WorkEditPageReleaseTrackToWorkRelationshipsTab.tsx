import { Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseTrackToWorkRelationship } from "../../../api/ApplicationClient";
import ReleaseTrackRelationshipTable, { ReleaseTrackRelationship } from "../../../components/tables/ReleaseTrackRelationshipTable";
import { getReleaseTrackKey } from "../../../helpers/ReleaseTrackHelpers";
import "antd/dist/antd.min.css";

export interface WorkEditPageReleaseTrackToWorkRelationshipsTabProps {
  releaseTrackToWorkRelationships: ReleaseTrackToWorkRelationship[];
  releaseTrackToWorkRelationshipsLoading: boolean;
  setReleaseTrackToWorkRelationships: (releaseTrackToWorkRelationships: ReleaseTrackToWorkRelationship[]) => void;
}

const WorkEditPageReleaseTrackToWorkRelationshipsTab = ({
  releaseTrackToWorkRelationships,
  releaseTrackToWorkRelationshipsLoading,
  setReleaseTrackToWorkRelationships,
}: WorkEditPageReleaseTrackToWorkRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [releaseTrackRelationships, setReleaseTrackRelationships] = useState<ReleaseTrackRelationship[]>([]);

  useEffect(() => {
    setReleaseTrackRelationships(
      releaseTrackToWorkRelationships.map((releaseTrackToWorkRelationship) => ({
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
      }))
    );
  }, [releaseTrackToWorkRelationships, navigate]);

  const onReleaseTrackRelationshipsChange = (releaseTrackRelationships: ReleaseTrackRelationship[]) => {
    const getReleaseTrackToWorkRelationshipKey = (releaseTrackId: string, dependentEntityId: string) => {
      return `(${releaseTrackId}, ${dependentEntityId})`;
    };
    if (releaseTrackToWorkRelationships) {
      const releaseTrackToWorkRelationshipsMap = new Map<string, ReleaseTrackToWorkRelationship>();
      for (const releaseTrackToWorkRelationship of releaseTrackToWorkRelationships) {
        releaseTrackToWorkRelationshipsMap.set(
          getReleaseTrackToWorkRelationshipKey(getReleaseTrackKey(releaseTrackToWorkRelationship.releaseTrack!), releaseTrackToWorkRelationship.workId),
          releaseTrackToWorkRelationship
        );
      }
      setReleaseTrackToWorkRelationships(
        releaseTrackRelationships.map(
          (releaseTrackRelationship) =>
            releaseTrackToWorkRelationshipsMap.get(
              getReleaseTrackToWorkRelationshipKey(releaseTrackRelationship.releaseTrackId, releaseTrackRelationship.dependentEntityId)
            ) as ReleaseTrackToWorkRelationship
        )
      );
    }
  };

  return (
    <>
      <Typography.Paragraph>You can adjust order in which the release-track-to-work relationships are displayed by dragging them.</Typography.Paragraph>
      <ReleaseTrackRelationshipTable
        reorderMode
        dependentEntityColumnName="Work"
        loading={releaseTrackToWorkRelationshipsLoading}
        releaseTrackRelationships={releaseTrackRelationships}
        onReleaseTrackRelationshipsChange={onReleaseTrackRelationshipsChange}
      />
    </>
  );
};

export default WorkEditPageReleaseTrackToWorkRelationshipsTab;
