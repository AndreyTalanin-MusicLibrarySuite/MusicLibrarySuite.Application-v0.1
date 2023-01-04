import { Checkbox, Typography } from "antd";
import { useEffect, useState } from "react";
import { ArtistRelationship } from "../../../api/ApplicationClient";
import EntityRelationshipTable from "../../../components/tables/EntityRelationshipTable";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

export interface ArtistViewPageArtistRelationshipsTabProps {
  id: string;
}

const ArtistViewPageArtistRelationshipsTab = ({ id }: ArtistViewPageArtistRelationshipsTabProps) => {
  const [artistRelationships, setArtistRelationships] = useState<ArtistRelationship[]>([]);
  const [artistRelationshipsLoading, setArtistRelationshipsLoading] = useState<boolean>(true);
  const [includeReverseRelationships, setIncludeReverseRelationships] = useState<boolean>(false);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setArtistRelationshipsLoading(true);
    applicationClient
      .getArtistRelationships(id, includeReverseRelationships)
      .then((artistRelationships) => {
        setArtistRelationships(artistRelationships);
        setArtistRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, includeReverseRelationships, applicationClient]);

  return (
    <>
      <Typography.Paragraph>
        <Checkbox onChange={(e) => setIncludeReverseRelationships(e.target.checked)}>Include reverse artist relationships</Checkbox>
      </Typography.Paragraph>
      <EntityRelationshipTable
        entityColumnName="Artist"
        dependentEntityColumnName="Dependent Artist"
        loading={artistRelationshipsLoading}
        entityRelationships={artistRelationships.map((artistRelationship) => ({
          name: artistRelationship.name,
          description: artistRelationship.description,
          entityId: artistRelationship.artistId,
          entityName: artistRelationship.artist?.name ?? "",
          entityHref: `/catalog/artists/view?id=${artistRelationship.artistId}`,
          dependentEntityId: artistRelationship.dependentArtistId,
          dependentEntityName: artistRelationship.dependentArtist?.name ?? "",
          dependentEntityHref: `/catalog/artists/view?id=${artistRelationship.dependentArtistId}`,
        }))}
      />
    </>
  );
};

export default ArtistViewPageArtistRelationshipsTab;
