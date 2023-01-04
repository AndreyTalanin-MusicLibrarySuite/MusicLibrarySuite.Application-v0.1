import { Checkbox, Typography } from "antd";
import { useEffect, useState } from "react";
import { GenreRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

export interface GenreViewPageGenreRelationshipsTabProps {
  id: string;
}

const GenreViewPageGenreRelationshipsTab = ({ id }: GenreViewPageGenreRelationshipsTabProps) => {
  const [genreRelationships, setGenreRelationships] = useState<GenreRelationship[]>([]);
  const [genreRelationshipsLoading, setGenreRelationshipsLoading] = useState<boolean>(true);
  const [includeReverseRelationships, setIncludeReverseRelationships] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setGenreRelationshipsLoading(true);
    applicationClient
      .getGenreRelationships(id, includeReverseRelationships)
      .then((genreRelationships) => {
        setGenreRelationships(genreRelationships);
        setGenreRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, includeReverseRelationships, applicationClient]);

  return (
    <>
      <Typography.Paragraph>
        <Checkbox onChange={(e) => setIncludeReverseRelationships(e.target.checked)}>Include reverse genre relationships</Checkbox>
      </Typography.Paragraph>
      <EntityRelationshipTable
        entityColumnName="Genre"
        dependentEntityColumnName="Dependent Genre"
        loading={genreRelationshipsLoading}
        entityRelationships={genreRelationships.map((genreRelationship) => ({
          name: genreRelationship.name,
          description: genreRelationship.description,
          entityId: genreRelationship.genreId,
          entityName: genreRelationship.genre?.name ?? "",
          entityHref: `/catalog/genres/view?id=${genreRelationship.genreId}`,
          dependentEntityId: genreRelationship.dependentGenreId,
          dependentEntityName: genreRelationship.dependentGenre?.name ?? "",
          dependentEntityHref: `/catalog/genres/view?id=${genreRelationship.dependentGenreId}`,
        }))}
      />
    </>
  );
};

export default GenreViewPageGenreRelationshipsTab;
