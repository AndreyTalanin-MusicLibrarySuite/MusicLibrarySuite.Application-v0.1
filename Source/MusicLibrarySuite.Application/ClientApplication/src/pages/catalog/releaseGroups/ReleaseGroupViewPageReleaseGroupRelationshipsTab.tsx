import { Checkbox, Typography } from "antd";
import { useEffect, useState } from "react";
import { ReleaseGroupRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

export interface ReleaseGroupViewPageReleaseGroupRelationshipsTabProps {
  id: string;
}

const ReleaseGroupViewPageReleaseGroupRelationshipsTab = ({ id }: ReleaseGroupViewPageReleaseGroupRelationshipsTabProps) => {
  const [releaseGroupRelationships, setReleaseGroupRelationships] = useState<ReleaseGroupRelationship[]>([]);
  const [releaseGroupRelationshipsLoading, setReleaseGroupRelationshipsLoading] = useState<boolean>(true);
  const [includeReverseRelationships, setIncludeReverseRelationships] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseGroupRelationshipsLoading(true);
    applicationClient
      .getReleaseGroupRelationships(id, includeReverseRelationships)
      .then((releaseGroupRelationships) => {
        setReleaseGroupRelationships(releaseGroupRelationships);
        setReleaseGroupRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, includeReverseRelationships, applicationClient]);

  return (
    <>
      <Typography.Paragraph>
        <Checkbox onChange={(e) => setIncludeReverseRelationships(e.target.checked)}>Include reverse release group relationships</Checkbox>
      </Typography.Paragraph>
      <EntityRelationshipTable
        entityColumnName="Release Group"
        dependentEntityColumnName="Dependent Release Group"
        loading={releaseGroupRelationshipsLoading}
        entityRelationships={releaseGroupRelationships.map((releaseGroupRelationship) => ({
          name: releaseGroupRelationship.name,
          description: releaseGroupRelationship.description,
          entityId: releaseGroupRelationship.releaseGroupId,
          entityName: releaseGroupRelationship.releaseGroup?.title ?? "",
          entityHref: `/catalog/releaseGroups/view?id=${releaseGroupRelationship.releaseGroupId}`,
          dependentEntityId: releaseGroupRelationship.dependentReleaseGroupId,
          dependentEntityName: releaseGroupRelationship.dependentReleaseGroup?.title ?? "",
          dependentEntityHref: `/catalog/releaseGroups/view?id=${releaseGroupRelationship.dependentReleaseGroupId}`,
        }))}
      />
    </>
  );
};

export default ReleaseGroupViewPageReleaseGroupRelationshipsTab;
