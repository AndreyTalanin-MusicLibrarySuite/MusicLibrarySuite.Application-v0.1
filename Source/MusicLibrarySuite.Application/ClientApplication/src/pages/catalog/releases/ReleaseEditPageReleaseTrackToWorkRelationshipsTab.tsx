import { Button, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Release, ReleaseTrackToWorkRelationship, Work } from "../../../api/ApplicationClient";
import EditReleaseTrackRelationshipModal, {
  ReleaseTrackRelationship as ModalReleaseTrackRelationship,
} from "../../../components/modals/EditReleaseTrackRelationshipModal";
import ReleaseTrackRelationshipTable, {
  ReleaseTrackRelationship as TableReleaseTrackRelationship,
} from "../../../components/tables/ReleaseTrackRelationshipTable";
import { getReleaseTrackKey } from "../../../helpers/ReleaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import styles from "./ReleaseEditPageReleaseTrackToWorkRelationshipsTab.module.css";
import "antd/dist/antd.min.css";

export interface ReleaseEditPageReleaseTrackToWorkRelationshipsTabProps {
  release: Release;
  releaseTrackToWorkRelationships: ReleaseTrackToWorkRelationship[];
  releaseTrackToWorkRelationshipsLoading: boolean;
  setReleaseTrackToWorkRelationships: (releaseTrackToWorkRelationships: ReleaseTrackToWorkRelationship[]) => void;
}

const ReleaseEditPageReleaseTrackToWorkRelationshipsTab = ({
  release,
  releaseTrackToWorkRelationships,
  releaseTrackToWorkRelationshipsLoading,
  setReleaseTrackToWorkRelationships,
}: ReleaseEditPageReleaseTrackToWorkRelationshipsTabProps) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalWorks, setModalWorks] = useState<Work[]>([]);
  const [modalReleaseTrackRelationship, setModalReleaseTrackRelationship] = useState<ModalReleaseTrackRelationship>();
  const [tableReleaseTrackRelationships, setTableReleaseTrackRelationships] = useState<TableReleaseTrackRelationship[]>([]);

  const applicationClient = useApplicationClient();

  useEffect(() => {
    setTableReleaseTrackRelationships(
      releaseTrackToWorkRelationships.map((releaseTrackToWorkRelationship) => ({
        name: releaseTrackToWorkRelationship.name,
        description: releaseTrackToWorkRelationship.description,
        releaseTrackId: getReleaseTrackKey(releaseTrackToWorkRelationship.releaseTrack!),
        releaseTrackTitle: releaseTrackToWorkRelationship.releaseTrack!.title,
        releaseTrackHref: `/catalog/releases/view?id=${releaseTrackToWorkRelationship.releaseId}`,
        releaseTrackNumber: releaseTrackToWorkRelationship.releaseTrack!.trackNumber,
        releaseMediaNumber: releaseTrackToWorkRelationship.releaseTrack!.mediaNumber,
        dependentEntityId: releaseTrackToWorkRelationship.workId,
        dependentEntityName: releaseTrackToWorkRelationship.work?.title ?? "",
        dependentEntityHref: `/catalog/works/view?id=${releaseTrackToWorkRelationship.workId}`,
      }))
    );
  }, [releaseTrackToWorkRelationships, navigate]);

  useEffect(() => {
    if (modalReleaseTrackRelationship) {
      applicationClient
        .getWorks([modalReleaseTrackRelationship.dependentEntityId])
        .then((works) => setModalWorks(works))
        .catch((error) => alert(error));
    }
  }, [modalReleaseTrackRelationship, applicationClient]);

  const fetchModalWorks = useCallback(() => {
    applicationClient
      .getPagedWorks(20, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalWorks(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  useEffect(() => fetchModalWorks(), [fetchModalWorks]);

  const onCreateReleaseTrackToWorkRelationshipButtonClick = () => {
    setModalReleaseTrackRelationship(undefined);
    setModalOpen(true);
  };

  const onReleaseTrackToWorkRelationshipEdit = (releaseTrackRelationship: TableReleaseTrackRelationship) => {
    setModalReleaseTrackRelationship({
      trackNumber: releaseTrackRelationship.releaseTrackNumber,
      mediaNumber: releaseTrackRelationship.releaseMediaNumber,
      name: releaseTrackRelationship.name,
      description: releaseTrackRelationship.description,
      dependentEntityId: releaseTrackRelationship.dependentEntityId,
    });
    setModalOpen(true);
  };

  const onReleaseTrackToWorkRelationshipDelete = (releaseTrackRelationship: TableReleaseTrackRelationship) => {
    setReleaseTrackToWorkRelationships(
      releaseTrackToWorkRelationships.filter(
        (releaseTrackToWorkRelationship) => releaseTrackToWorkRelationship.workId !== releaseTrackRelationship.dependentEntityId
      )
    );
  };

  const onReleaseTrackRelationshipsChange = (releaseTrackRelationships: TableReleaseTrackRelationship[]) => {
    const getReleaseTrackToWorkRelationshipKey = (entityId: string, dependentEntityId: string) => {
      return `(${entityId}, ${dependentEntityId})`;
    };
    if (releaseTrackToWorkRelationships) {
      const releaseTrackToWorkRelationshipsMap = new Map<string, ReleaseTrackToWorkRelationship>();
      for (const releaseTrackToWorkRelationship of releaseTrackToWorkRelationships) {
        releaseTrackToWorkRelationshipsMap.set(
          getReleaseTrackToWorkRelationshipKey(getReleaseTrackKey(releaseTrackToWorkRelationship.releaseTrack!), releaseTrackToWorkRelationship.workId),
          releaseTrackToWorkRelationship
        );
      }
      setReleaseTrackToWorkRelationships(
        releaseTrackRelationships.map(
          (releaseTrackRelationship) =>
            releaseTrackToWorkRelationshipsMap.get(
              getReleaseTrackToWorkRelationshipKey(releaseTrackRelationship.releaseTrackId, releaseTrackRelationship.dependentEntityId)
            ) as ReleaseTrackToWorkRelationship
        )
      );
    }
  };

  const onModalOk = (releaseTrackRelationship: ModalReleaseTrackRelationship, resetFormFields: () => void) => {
    const existingReleaseTrackRelationship = releaseTrackToWorkRelationships.find(
      (releaseTrackToWorkRelationship) =>
        releaseTrackToWorkRelationship.trackNumber === releaseTrackRelationship.trackNumber &&
        releaseTrackToWorkRelationship.mediaNumber === releaseTrackRelationship.mediaNumber &&
        releaseTrackToWorkRelationship.workId === releaseTrackRelationship.dependentEntityId
    );
    if (existingReleaseTrackRelationship && !modalReleaseTrackRelationship) {
      const releaseTrackIdentifier = `${existingReleaseTrackRelationship.trackNumber}-${existingReleaseTrackRelationship.mediaNumber}`;
      alert(
        `Unable to create a non-unique relationship between the '${releaseTrackIdentifier}' release track and the '${existingReleaseTrackRelationship.work?.title}' work.`
      );
      return;
    }
    applicationClient.getWork(releaseTrackRelationship.dependentEntityId).then((work) => {
      const resultReleaseTrackToWorkRelationship = new ReleaseTrackToWorkRelationship({
        name: releaseTrackRelationship.name,
        description: releaseTrackRelationship.description,
        trackNumber: releaseTrackRelationship.trackNumber,
        mediaNumber: releaseTrackRelationship.mediaNumber,
        releaseId: release.id,
        workId: work.id,
        work: work,
      });
      if (modalReleaseTrackRelationship) {
        setReleaseTrackToWorkRelationships(
          releaseTrackToWorkRelationships.map((releaseTrackToWorkRelationship) => {
            if (
              releaseTrackToWorkRelationship.trackNumber === modalReleaseTrackRelationship.trackNumber &&
              releaseTrackToWorkRelationship.mediaNumber === modalReleaseTrackRelationship.mediaNumber &&
              releaseTrackToWorkRelationship.workId === modalReleaseTrackRelationship.dependentEntityId
            ) {
              return resultReleaseTrackToWorkRelationship;
            } else {
              return releaseTrackToWorkRelationship;
            }
          })
        );
      } else {
        setReleaseTrackToWorkRelationships([...releaseTrackToWorkRelationships, resultReleaseTrackToWorkRelationship]);
      }
      setModalOpen(false);
      resetFormFields();
    });
  };

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (title?: string) => {
    setModalTitleFilter(title);
  };

  return (
    <>
      <Space className={styles.tabParagraph} direction="horizontal" align="baseline">
        <Typography.Paragraph>You can adjust order in which the release-track-to-work relationships are displayed by dragging them.</Typography.Paragraph>
        <Button type="primary" onClick={onCreateReleaseTrackToWorkRelationshipButtonClick}>
          Create a Release-Track-to-Work Relationship
        </Button>
      </Space>
      <ReleaseTrackRelationshipTable
        editMode
        dependentEntityColumnName="Work"
        loading={releaseTrackToWorkRelationshipsLoading}
        releaseTrackRelationships={tableReleaseTrackRelationships}
        onReleaseTrackRelationshipEdit={onReleaseTrackToWorkRelationshipEdit}
        onReleaseTrackRelationshipDelete={onReleaseTrackToWorkRelationshipDelete}
        onReleaseTrackRelationshipsChange={onReleaseTrackRelationshipsChange}
      />
      <EditReleaseTrackRelationshipModal
        title="Create Release-Track-to-Work Relationship"
        dependentEntityName="Work"
        dependentEntityOptions={modalWorks.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        releaseTrackRelationship={modalReleaseTrackRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />
    </>
  );
};

export default ReleaseEditPageReleaseTrackToWorkRelationshipsTab;
