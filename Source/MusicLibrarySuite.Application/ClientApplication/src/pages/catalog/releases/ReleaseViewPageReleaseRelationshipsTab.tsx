import { Checkbox, Typography } from "antd";
import { useEffect, useState } from "react";
import { ReleaseRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";

export interface ReleaseViewPageReleaseRelationshipsTabProps {
  id: string;
}

const ReleaseViewPageReleaseRelationshipsTab = ({ id }: ReleaseViewPageReleaseRelationshipsTabProps) => {
  const [releaseRelationships, setReleaseRelationships] = useState<ReleaseRelationship[]>([]);
  const [releaseRelationshipsLoading, setReleaseRelationshipsLoading] = useState<boolean>(true);
  const [includeReverseRelationships, setIncludeReverseRelationships] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseRelationshipsLoading(true);
    applicationClient
      .getReleaseRelationships(id, includeReverseRelationships)
      .then((releaseRelationships) => {
        setReleaseRelationships(releaseRelationships);
        setReleaseRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, includeReverseRelationships, applicationClient]);

  return (
    <>
      <Typography.Paragraph>
        <Checkbox onChange={(e) => setIncludeReverseRelationships(e.target.checked)}>Include reverse release relationships</Checkbox>
      </Typography.Paragraph>
      <EntityRelationshipTable
        entityColumnName="Release"
        dependentEntityColumnName="Dependent Release"
        loading={releaseRelationshipsLoading}
        entityRelationships={releaseRelationships.map((releaseRelationship) => ({
          name: releaseRelationship.name,
          description: releaseRelationship.description,
          entityId: releaseRelationship.releaseId,
          entityName: releaseRelationship.release?.title ?? "",
          entityHref: `/catalog/releases/view?id=${releaseRelationship.releaseId}`,
          dependentEntityId: releaseRelationship.dependentReleaseId,
          dependentEntityName: releaseRelationship.dependentRelease?.title ?? "",
          dependentEntityHref: `/catalog/releases/view?id=${releaseRelationship.dependentReleaseId}`,
        }))}
      />
    </>
  );
};

export default ReleaseViewPageReleaseRelationshipsTab;
