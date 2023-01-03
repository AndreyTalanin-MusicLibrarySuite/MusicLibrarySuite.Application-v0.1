import { Checkbox, Typography } from "antd";
import { useEffect, useState } from "react";
import { WorkRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

export interface WorkViewPageWorkRelationshipsTabProps {
  id: string;
}

const WorkViewPageWorkRelationshipsTab = ({ id }: WorkViewPageWorkRelationshipsTabProps) => {
  const [workRelationships, setWorkRelationships] = useState<WorkRelationship[]>([]);
  const [workRelationshipsLoading, setWorkRelationshipsLoading] = useState<boolean>(true);
  const [includeReverseRelationships, setIncludeReverseRelationships] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setWorkRelationshipsLoading(true);
    applicationClient
      .getWorkRelationships(id, includeReverseRelationships)
      .then((workRelationships) => {
        setWorkRelationships(workRelationships);
        setWorkRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, includeReverseRelationships, applicationClient]);

  return (
    <>
      <Typography.Paragraph>
        <Checkbox onChange={(e) => setIncludeReverseRelationships(e.target.checked)}>Include reverse work relationships</Checkbox>
      </Typography.Paragraph>
      <EntityRelationshipTable
        entityColumnName="Work"
        dependentEntityColumnName="Dependent Work"
        loading={workRelationshipsLoading}
        entityRelationships={workRelationships.map((workRelationship) => ({
          name: workRelationship.name,
          description: workRelationship.description,
          entityId: workRelationship.workId,
          entityName: workRelationship.work?.title ?? "",
          entityHref: `/catalog/works/view?id=${workRelationship.workId}`,
          dependentEntityId: workRelationship.dependentWorkId,
          dependentEntityName: workRelationship.dependentWork?.title ?? "",
          dependentEntityHref: `/catalog/works/view?id=${workRelationship.dependentWorkId}`,
        }))}
      />
    </>
  );
};

export default WorkViewPageWorkRelationshipsTab;
