import { Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseToReleaseGroupRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable, { EntityRelationship as TableEntityRelationship } from "../../../components/tables/EntityRelationshipTable";
import "antd/dist/antd.min.css";

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
  const navigate = useNavigate();

  const [tableEntityRelationships, setTableEntityRelationships] = useState<TableEntityRelationship[]>([]);

  useEffect(() => {
    setTableEntityRelationships(
      releaseToReleaseGroupRelationships.map((releaseToReleaseGroupRelationship) => ({
        name: releaseToReleaseGroupRelationship.name,
        description: releaseToReleaseGroupRelationship.description,
        entityId: releaseToReleaseGroupRelationship.releaseId,
        entityName: releaseToReleaseGroupRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToReleaseGroupRelationship.releaseId}`,
        dependentEntityId: releaseToReleaseGroupRelationship.releaseGroupId,
        dependentEntityName: releaseToReleaseGroupRelationship.releaseGroup?.title ?? "",
        dependentEntityHref: `/catalog/releaseGroups/view?id=${releaseToReleaseGroupRelationship.releaseGroupId}`,
      }))
    );
  }, [releaseToReleaseGroupRelationships, navigate]);

  const onEntityRelationshipsChange = (entityRelationships: TableEntityRelationship[]) => {
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
  };

  return (
    <>
      <Typography.Paragraph>You can adjust order in which the release-to-release-group relationships are displayed by dragging them.</Typography.Paragraph>
      <EntityRelationshipTable
        reorderMode
        entityColumnName="Release"
        dependentEntityColumnName="Release Group"
        loading={releaseToReleaseGroupRelationshipsLoading}
        entityRelationships={tableEntityRelationships}
        onEntityRelationshipsChange={onEntityRelationshipsChange}
      />
    </>
  );
};

export default ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTab;
