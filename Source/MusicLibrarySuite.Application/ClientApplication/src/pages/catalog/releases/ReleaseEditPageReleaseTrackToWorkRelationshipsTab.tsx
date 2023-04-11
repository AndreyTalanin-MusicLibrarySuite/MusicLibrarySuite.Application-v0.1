import { Button, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Release, ReleaseTrackToWorkRelationship, Work } from "../../../api/ApplicationClient";
import EditReleaseTrackRelationshipModal, {
  ReleaseTrackRelationship as ModalReleaseTrackRelationship,
} from "../../../components/modals/EditReleaseTrackRelationshipModal";
import ReleaseTrackRelationshipTable, {
  ReleaseTrackRelationship as TableReleaseTrackRelationship,
} from "../../../components/tables/ReleaseTrackRelationshipTable";
import ActionTab from "../../../components/tabs/ActionTab";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import { getReleaseTrackKey } from "../../../helpers/releaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitleFilter, setModalTitleFilter] = useState<string>();
  const [modalWorks, setModalWorks] = useState<Work[]>([]);
  const [modalReleaseTrackRelationship, setModalReleaseTrackRelationship] = useState<ModalReleaseTrackRelationship>();

  const applicationClient = useApplicationClient();

  const tableReleaseTrackRelationships = useMemo(
    () =>
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
      })),
    [releaseTrackToWorkRelationships]
  );

  useEffect(() => {
    if (modalReleaseTrackRelationship) {
      applicationClient
        .getWorks([modalReleaseTrackRelationship.dependentEntityId])
        .then((works) => setModalWorks(works))
        .catch((error) => alert(error));
    }
  }, [modalReleaseTrackRelationship, applicationClient]);

  useEffect(() => {
    applicationClient
      .getPagedWorks(DefaultPageSize, 0, modalTitleFilter, undefined)
      .then((pageResult) => setModalWorks(pageResult.items))
      .catch((error) => alert(error));
  }, [modalTitleFilter, applicationClient]);

  const onReleaseTrackToWorkRelationshipCreate = () => {
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

  const onReleaseTrackToWorkRelationshipDelete = useCallback(
    (releaseTrackRelationship: TableReleaseTrackRelationship) => {
      setReleaseTrackToWorkRelationships(
        releaseTrackToWorkRelationships.filter(
          (releaseTrackToWorkRelationship) =>
            releaseTrackToWorkRelationship.trackNumber !== releaseTrackRelationship.releaseTrackNumber ||
            releaseTrackToWorkRelationship.mediaNumber !== releaseTrackRelationship.releaseMediaNumber ||
            releaseTrackToWorkRelationship.workId !== releaseTrackRelationship.dependentEntityId
        )
      );
    },
    [releaseTrackToWorkRelationships, setReleaseTrackToWorkRelationships]
  );

  const onReleaseTrackRelationshipsOrderChange = useCallback(
    (releaseTrackRelationships: TableReleaseTrackRelationship[]) => {
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
    },
    [releaseTrackToWorkRelationships, setReleaseTrackToWorkRelationships]
  );

  const onModalOk = useCallback(
    (releaseTrackRelationship: ModalReleaseTrackRelationship, resetFormFields: () => void) => {
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
    },
    [release, releaseTrackToWorkRelationships, setReleaseTrackToWorkRelationships, modalReleaseTrackRelationship, applicationClient]
  );

  const onModalCancel = () => {
    setModalOpen(false);
  };

  const onSearchDependentEntities = (titleFilter?: string) => {
    setModalTitleFilter(titleFilter);
  };

  const title = <Title level={5}>Edit Release-Track-to-Work Relationships</Title>;

  const actionButtons = (
    <>
      <Button type="primary" onClick={onReleaseTrackToWorkRelationshipCreate}>
        Create Release-Track-to-Work Relationship
      </Button>
    </>
  );

  const modals = useMemo(
    () => [
      <EditReleaseTrackRelationshipModal
        title="Create Release-Track-to-Work Relationship"
        dependentEntityName="Work"
        dependentEntityOptions={modalWorks.map(({ id, title }) => ({ id, displayName: title }))}
        open={modalOpen}
        releaseTrackRelationship={modalReleaseTrackRelationship}
        onOk={onModalOk}
        onCancel={onModalCancel}
        onSearchDependentEntityOptions={onSearchDependentEntities}
      />,
    ],
    [modalOpen, modalWorks, modalReleaseTrackRelationship, onModalOk]
  );

  return (
    <ActionTab title={title} actionButtons={actionButtons} modals={modals}>
      <Paragraph>You can adjust order in which the release-track-to-work relationships are displayed by dragging them.</Paragraph>
      <ReleaseTrackRelationshipTable
        editMode
        dependentEntityColumnName="Work"
        loading={releaseTrackToWorkRelationshipsLoading}
        releaseTrackRelationships={tableReleaseTrackRelationships}
        onReleaseTrackRelationshipEdit={onReleaseTrackToWorkRelationshipEdit}
        onReleaseTrackRelationshipDelete={onReleaseTrackToWorkRelationshipDelete}
        onReleaseTrackRelationshipsChange={onReleaseTrackRelationshipsOrderChange}
      />
    </ActionTab>
  );
};

export default ReleaseEditPageReleaseTrackToWorkRelationshipsTab;
