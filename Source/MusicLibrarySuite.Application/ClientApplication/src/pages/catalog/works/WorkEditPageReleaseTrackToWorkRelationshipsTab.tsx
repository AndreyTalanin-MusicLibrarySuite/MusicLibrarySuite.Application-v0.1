import { Typography } from "antd";
import { useCallback, useMemo } from "react";
import { ReleaseTrackToWorkRelationship } from "../../../api/ApplicationClient";
import ReleaseTrackRelationshipTable, { ReleaseTrackRelationship } from "../../../components/tables/ReleaseTrackRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { getReleaseTrackKey } from "../../../helpers/releaseTrackHelpers";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const releaseTrackRelationships = useMemo(
    () =>
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
      })),
    [releaseTrackToWorkRelationships]
  );

  const onReleaseTrackRelationshipsOrderChange = useCallback(
    (releaseTrackRelationships: ReleaseTrackRelationship[]) => {
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
    },
    [releaseTrackToWorkRelationships, setReleaseTrackToWorkRelationships]
  );

  const title = <Title level={5}>Reorder Release-Track-to-Work Relationships</Title>;

  return (
    <ActionTab title={title}>
      <Paragraph>You can adjust order in which the release-track-to-work relationships are displayed by dragging them.</Paragraph>
      <ReleaseTrackRelationshipTable
        reorderMode
        dependentEntityColumnName="Work"
        loading={releaseTrackToWorkRelationshipsLoading}
        releaseTrackRelationships={releaseTrackRelationships}
        onReleaseTrackRelationshipsChange={onReleaseTrackRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default WorkEditPageReleaseTrackToWorkRelationshipsTab;
