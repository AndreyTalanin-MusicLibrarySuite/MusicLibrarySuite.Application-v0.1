import { Typography } from "antd";
import { useCallback, useMemo } from "react";
import { ReleaseToReleaseGroupRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

export interface ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTabProps {
  releaseToReleaseGroupRelationships: ReleaseToReleaseGroupRelationship[];
  releaseToReleaseGroupRelationshipsLoading: boolean;
  setReleaseToReleaseGroupRelationships: (releaseToReleaseGroupRelationships: ReleaseToReleaseGroupRelationship[]) => void;
}

const ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTab = ({
  releaseToReleaseGroupRelationships,
  releaseToReleaseGroupRelationshipsLoading,
  setReleaseToReleaseGroupRelationships,
}: ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTabProps) => {
  const tableEntityRelationships = useMemo(
    () =>
      releaseToReleaseGroupRelationships.map((releaseToReleaseGroupRelationship) => ({
        name: releaseToReleaseGroupRelationship.name,
        description: releaseToReleaseGroupRelationship.description,
        entityId: releaseToReleaseGroupRelationship.releaseId,
        entityName: releaseToReleaseGroupRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToReleaseGroupRelationship.releaseId}`,
        dependentEntityId: releaseToReleaseGroupRelationship.releaseGroupId,
        dependentEntityName: releaseToReleaseGroupRelationship.releaseGroup?.title ?? "",
        dependentEntityHref: `/catalog/releaseGroups/view?id=${releaseToReleaseGroupRelationship.releaseGroupId}`,
      })),
    [releaseToReleaseGroupRelationships]
  );

  const onEntityRelationshipsOrderChange = useCallback(
    (entityRelationships: TableEntityRelationship[]) => {
      const getReleaseToReleaseGroupRelationshipKey = (entityId: string, dependentEntityId: string) => {
        return `(${entityId}, ${dependentEntityId})`;
      };
      if (releaseToReleaseGroupRelationships) {
        const releaseToReleaseGroupRelationshipsMap = new Map<string, ReleaseToReleaseGroupRelationship>();
        for (const releaseToReleaseGroupRelationship of releaseToReleaseGroupRelationships) {
          releaseToReleaseGroupRelationshipsMap.set(
            getReleaseToReleaseGroupRelationshipKey(releaseToReleaseGroupRelationship.releaseId, releaseToReleaseGroupRelationship.releaseGroupId),
            releaseToReleaseGroupRelationship
          );
        }
        setReleaseToReleaseGroupRelationships(
          entityRelationships.map(
            (entityRelationship) =>
              releaseToReleaseGroupRelationshipsMap.get(
                getReleaseToReleaseGroupRelationshipKey(entityRelationship.entityId, entityRelationship.dependentEntityId)
              ) as ReleaseToReleaseGroupRelationship
          )
        );
      }
    },
    [releaseToReleaseGroupRelationships, setReleaseToReleaseGroupRelationships]
  );

  const title = <Title level={5}>Reorder Release-to-Release-Group Relationships</Title>;

  return (
    <ActionTab title={title}>
      <Paragraph>You can adjust order in which the release-to-release-group relationships are displayed by dragging them.</Paragraph>
      <EntityRelationshipTable
        reorderMode
        entityColumnName="Release"
        dependentEntityColumnName="Release Group"
        loading={releaseToReleaseGroupRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipsChange={onEntityRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTab;
