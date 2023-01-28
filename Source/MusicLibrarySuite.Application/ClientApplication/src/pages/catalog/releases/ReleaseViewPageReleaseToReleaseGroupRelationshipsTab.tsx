import { useEffect, useState } from "react";
import { ReleaseToReleaseGroupRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";

export interface ReleaseViewPageReleaseToReleaseGroupRelationshipsTabProps {
  id: string;
}

const ReleaseViewPageReleaseToReleaseGroupRelationshipsTab = ({ id }: ReleaseViewPageReleaseToReleaseGroupRelationshipsTabProps) => {
  const [releaseToReleaseGroupRelationships, setReleaseToReleaseGroupRelationships] = useState<ReleaseToReleaseGroupRelationship[]>([]);
  const [releaseToReleaseGroupRelationshipsLoading, setReleaseToReleaseGroupRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseToReleaseGroupRelationshipsLoading(true);
    applicationClient
      .getReleaseToReleaseGroupRelationships(id)
      .then((releaseToReleaseGroupRelationships) => {
        setReleaseToReleaseGroupRelationships(releaseToReleaseGroupRelationships);
        setReleaseToReleaseGroupRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  return (
    <EntityRelationshipTable
      entityColumnName="Release"
      dependentEntityColumnName="Release Group"
      loading={releaseToReleaseGroupRelationshipsLoading}
      entityRelationships={releaseToReleaseGroupRelationships.map((releaseToReleaseGroupRelationship) => ({
        name: releaseToReleaseGroupRelationship.name,
        description: releaseToReleaseGroupRelationship.description,
        entityId: releaseToReleaseGroupRelationship.releaseId,
        entityName: releaseToReleaseGroupRelationship.release?.title ?? "",
        entityHref: `/catalog/releases/view?id=${releaseToReleaseGroupRelationship.releaseId}`,
        dependentEntityId: releaseToReleaseGroupRelationship.releaseGroupId,
        dependentEntityName: releaseToReleaseGroupRelationship.releaseGroup?.title ?? "",
        dependentEntityHref: `/catalog/releaseGroups/view?id=${releaseToReleaseGroupRelationship.releaseGroupId}`,
      }))}
    />
  );
};

export default ReleaseViewPageReleaseToReleaseGroupRelationshipsTab;
