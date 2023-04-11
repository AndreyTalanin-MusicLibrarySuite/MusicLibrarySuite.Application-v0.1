import { Typography } from "antd";
import { useEffect, useState } from "react";
import { ReleaseTrackToProductRelationship } from "../../../api/ApplicationClient";
import ReleaseTrackRelationshipTable from "../../../components/tables/ReleaseTrackRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { getReleaseTrackKey } from "../../../helpers/releaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Title } = Typography;

export interface ReleaseViewPageReleaseTrackToProductRelationshipsTabProps {
  id: string;
}

const ReleaseViewPageReleaseTrackToProductRelationshipsTab = ({ id }: ReleaseViewPageReleaseTrackToProductRelationshipsTabProps) => {
  const [releaseTrackToProductRelationships, setReleaseTrackToProductRelationships] = useState<ReleaseTrackToProductRelationship[]>([]);
  const [releaseTrackToProductRelationshipsLoading, setReleaseTrackToProductRelationshipsLoading] = useState<boolean>(true);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setReleaseTrackToProductRelationshipsLoading(true);
    applicationClient
      .getReleaseTrackToProductRelationships(id)
      .then((releaseTrackToProductRelationships) => {
        setReleaseTrackToProductRelationships(releaseTrackToProductRelationships);
        setReleaseTrackToProductRelationshipsLoading(false);
      })
      .catch((error) => {
        alert(error);
      });
  }, [id, applicationClient]);

  const title = <Title level={5}>View Release-Track-to-Product Relationships</Title>;

  return (
    <ActionTab title={title}>
      <ReleaseTrackRelationshipTable
        dependentEntityColumnName="Product"
        loading={releaseTrackToProductRelationshipsLoading}
        releaseTrackRelationships={releaseTrackToProductRelationships.map((releaseTrackToProductRelationship) => ({
          name: releaseTrackToProductRelationship.name,
          description: releaseTrackToProductRelationship.description,
          releaseTrackId: getReleaseTrackKey(releaseTrackToProductRelationship.releaseTrack!),
          releaseTrackTitle: releaseTrackToProductRelationship.releaseTrack!.title,
          releaseTrackHref: `/catalog/releases/view?id=${releaseTrackToProductRelationship.releaseId}`,
          releaseTrackNumber: releaseTrackToProductRelationship.releaseTrack!.trackNumber,
          releaseMediaNumber: releaseTrackToProductRelationship.releaseTrack!.mediaNumber,
          dependentEntityId: releaseTrackToProductRelationship.productId,
          dependentEntityName: releaseTrackToProductRelationship.product?.title ?? "",
          dependentEntityHref: `/catalog/products/view?id=${releaseTrackToProductRelationship.productId}`,
        }))}
      />
    </ActionTab>
  );
};

export default ReleaseViewPageReleaseTrackToProductRelationshipsTab;
