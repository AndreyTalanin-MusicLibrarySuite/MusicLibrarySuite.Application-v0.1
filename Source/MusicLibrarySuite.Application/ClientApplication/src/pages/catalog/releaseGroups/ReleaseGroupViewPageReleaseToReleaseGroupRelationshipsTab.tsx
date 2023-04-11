import { Typography } from "antd";
import { useEffect, useState } from "react";
import { ReleaseToReleaseGroupRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Title } = Typography;

export interface ReleaseGroupViewPageReleaseToReleaseGroupRelationshipsTabProps {
  id: string;
}

const ReleaseGroupViewPageReleaseToReleaseGroupRelationshipsTab = ({ id }: ReleaseGroupViewPageReleaseToReleaseGroupRelationshipsTabProps) => {
  const [releaseToReleaseGroupRelationships, setReleaseToReleaseGroupRelationships] = useState<ReleaseToReleaseGroupRelationship[]>([]);
  const [releaseToReleaseGroupRelationshipsLoading, setReleaseToReleaseGroupRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseToReleaseGroupRelationshipsLoading(true);
    applicationClient
      .getReleaseToReleaseGroupRelationshipsByReleaseGroup(id)
      .then((releaseToReleaseGroupRelationships) => {
        setReleaseToReleaseGroupRelationships(releaseToReleaseGroupRelationships);
        setReleaseToReleaseGroupRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  const title = <Title level={5}>View Release-to-Release-Group Relationships</Title>;

  return (
    <ActionTab title={title}>
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
    </ActionTab>
  );
};

export default ReleaseGroupViewPageReleaseToReleaseGroupRelationshipsTab;
