import { Button, Card, Checkbox, Col, Collapse, DatePicker, Divider, Form, Input, Row, Space, Table, Tabs, Tooltip, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import {
  DeleteOutlined,
  EditOutlined,
  FieldNumberOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  QuestionCircleOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Artist,
  Genre,
  IRelease,
  Release,
  ReleaseArtist,
  ReleaseComposer,
  ReleaseFeaturedArtist,
  ReleaseGenre,
  ReleaseMedia,
  ReleaseMediaToProductRelationship,
  ReleasePerformer,
  ReleaseRelationship,
  ReleaseToProductRelationship,
  ReleaseToReleaseGroupRelationship,
  ReleaseTrack,
  ReleaseTrackToProductRelationship,
  ReleaseTrackToWorkRelationship,
} from "../../../api/ApplicationClient";
import EntitySelect from "../../../components/inputs/EntitySelect";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import CreateReleaseMediaModal from "../../../components/modals/CreateReleaseMediaModal";
import CreateReleaseTrackModal from "../../../components/modals/CreateReleaseTrackModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import { formatReleaseMediaNumber, getReleaseMediaKey, getReleaseMediaKeyByComponents } from "../../../helpers/ReleaseMediaHelpers";
import { formatReleaseTrackNumber, getReleaseTrackKey, getReleaseTrackKeyByComponents } from "../../../helpers/ReleaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ReleaseEditPageReleaseMediaToProductRelationshipsTab from "./ReleaseEditPageReleaseMediaToProductRelationshipsTab";
import ReleaseEditPageReleaseRelationshipsTab from "./ReleaseEditPageReleaseRelationshipsTab";
import ReleaseEditPageReleaseToProductRelationshipsTab from "./ReleaseEditPageReleaseToProductRelationshipsTab";
import ReleaseEditPageReleaseToReleaseGroupRelationshipsTab from "./ReleaseEditPageReleaseToReleaseGroupRelationshipsTab";
import ReleaseEditPageReleaseTrackToProductRelationshipsTab from "./ReleaseEditPageReleaseTrackToProductRelationshipsTab";
import ReleaseEditPageReleaseTrackToWorkRelationshipsTab from "./ReleaseEditPageReleaseTrackToWorkRelationshipsTab";
import styles from "./ReleaseEditPage.module.css";
import "antd/dist/antd.min.css";

const { Paragraph, Text, Title } = Typography;

dayjs.extend(weekday);
dayjs.extend(localeData);

export enum ReleaseEditPageMode {
  Create,
  Edit,
}

export interface ReleaseEditPageProps {
  mode: ReleaseEditPageMode;
}

const ReleaseEditPage = ({ mode }: ReleaseEditPageProps) => {
  const navigate = useNavigate();

  const [release, setRelease] = useState<Release>();
  const [releaseFormValues, setReleaseFormValues] = useState<Store>({});
  const [releaseArtistOptions, setReleaseArtistOptions] = useState<Artist[]>([]);
  const [releaseFeaturedArtistOptions, setReleaseFeaturedArtistOptions] = useState<Artist[]>([]);
  const [releasePerformerOptions, setReleasePerformerOptions] = useState<Artist[]>([]);
  const [releaseComposerOptions, setReleaseComposerOptions] = useState<Artist[]>([]);
  const [releaseGenreOptions, setReleaseGenreOptions] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);
  const [createReleaseMediaModalOpen, setCreateReleaseMediaModalOpen] = useState<boolean>(false);
  const [releaseMediaToEdit, setReleaseMediaToEdit] = useState<ReleaseMedia>();
  const [createReleaseTrackModalOpen, setCreateReleaseTrackModalOpen] = useState<boolean>(false);
  const [releaseTrackToEdit, setReleaseTrackToEdit] = useState<ReleaseTrack>();

  const [id] = useQueryStringId(mode === ReleaseEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchRelease = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getRelease(id)
        .then((release) => {
          release.releaseRelationships = release.releaseRelationships.map(
            (releaseRelationship) => new ReleaseRelationship({ ...releaseRelationship, release: release })
          );

          release.releaseToProductRelationships = release.releaseToProductRelationships.map(
            (releaseToProductRelationship) => new ReleaseToProductRelationship({ ...releaseToProductRelationship, release: release })
          );
          release.releaseToReleaseGroupRelationships = release.releaseToReleaseGroupRelationships.map(
            (releaseToReleaseGroupRelationship) => new ReleaseToReleaseGroupRelationship({ ...releaseToReleaseGroupRelationship, release: release })
          );

          release.releaseMediaCollection.forEach((releaseMedia) => {
            releaseMedia.releaseMediaToProductRelationships.forEach(
              (releaseMediaToProductRelationship) => (releaseMediaToProductRelationship.releaseMedia = releaseMedia)
            );

            releaseMedia.releaseTrackCollection.forEach((releaseTrack) => {
              releaseTrack.releaseTrackToProductRelationships.forEach(
                (releaseTrackToProductRelationship) => (releaseTrackToProductRelationship.releaseTrack = releaseTrack)
              );
              releaseTrack.releaseTrackToWorkRelationships.forEach(
                (releaseTrackToWorkRelationship) => (releaseTrackToWorkRelationship.releaseTrack = releaseTrack)
              );
            });
          });

          release.releaseArtists = release.releaseArtists.map((releaseArtist) => new ReleaseArtist({ ...releaseArtist, release: release }));
          release.releaseFeaturedArtists = release.releaseFeaturedArtists.map(
            (releaseFeaturedArtist) => new ReleaseFeaturedArtist({ ...releaseFeaturedArtist, release: release })
          );
          release.releasePerformers = release.releasePerformers.map((releasePerformer) => new ReleasePerformer({ ...releasePerformer, release: release }));
          release.releaseComposers = release.releaseComposers.map((releaseComposer) => new ReleaseComposer({ ...releaseComposer, release: release }));
          release.releaseGenres = release.releaseGenres.map((releaseGenre) => new ReleaseGenre({ ...releaseGenre, release: release }));

          setRelease(release);
          setReleaseFormValues({
            ...release,
            releasedOn: dayjs(release.releasedOn),
            releaseArtists: release?.releaseArtists.map((releaseArtist) => releaseArtist.artistId) ?? [],
            releaseFeaturedArtists: release?.releaseFeaturedArtists.map((releaseFeaturedArtist) => releaseFeaturedArtist.artistId) ?? [],
            releasePerformers: release?.releasePerformers.map((releasePerformer) => releasePerformer.artistId) ?? [],
            releaseComposers: release?.releaseComposers.map((releaseComposer) => releaseComposer.artistId) ?? [],
            releaseGenres: release?.releaseGenres.map((releaseGenre) => releaseGenre.genreId) ?? [],
          });

          applicationClient
            .getArtists(release.releaseArtists?.map((releaseArtist) => releaseArtist.artistId) ?? [])
            .then((releaseArtists) => {
              setReleaseArtistOptions(releaseArtists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(release.releaseFeaturedArtists?.map((releaseFeaturedArtist) => releaseFeaturedArtist.artistId) ?? [])
            .then((releaseFeaturedArtists) => {
              setReleaseFeaturedArtistOptions(releaseFeaturedArtists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(release.releasePerformers?.map((releasePerformer) => releasePerformer.artistId) ?? [])
            .then((releasePerformers) => {
              setReleasePerformerOptions(releasePerformers);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(release.releaseComposers?.map((releaseComposer) => releaseComposer.artistId) ?? [])
            .then((releaseComposers) => {
              setReleaseComposerOptions(releaseComposers);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getGenres(release.releaseGenres?.map((releaseGenre) => releaseGenre.genreId) ?? [])
            .then((releaseGenres) => {
              setReleaseGenreOptions(releaseGenres);
            })
            .catch((error) => {
              alert(error);
            });
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  const onReleaseRelationshipsChange = useCallback(
    (releaseRelationships: ReleaseRelationship[]) => {
      if (release) {
        setRelease(new Release({ ...release, releaseRelationships: releaseRelationships }));
      }
    },
    [release]
  );

  const onReleaseToProductRelationshipsChange = useCallback(
    (releaseToProductRelationships: ReleaseToProductRelationship[]) => {
      if (release) {
        setRelease(new Release({ ...release, releaseToProductRelationships: releaseToProductRelationships }));
      }
    },
    [release]
  );

  const onReleaseToReleaseGroupRelationshipsChange = useCallback(
    (releaseToReleaseGroupRelationships: ReleaseToReleaseGroupRelationship[]) => {
      if (release) {
        setRelease(new Release({ ...release, releaseToReleaseGroupRelationships: releaseToReleaseGroupRelationships }));
      }
    },
    [release]
  );

  const onReleaseMediaToProductRelationshipsChange = useCallback(
    (releaseMediaToProductRelationships: ReleaseMediaToProductRelationship[]) => {
      if (release) {
        const releaseMediaRelationshipMap = new Map<string, ReleaseMediaToProductRelationship[]>();
        for (const releaseMediaRelationship of releaseMediaToProductRelationships) {
          const releaseMediaKey = getReleaseMediaKeyByComponents(releaseMediaRelationship.mediaNumber, release.id);
          if (releaseMediaRelationshipMap.has(releaseMediaKey)) {
            releaseMediaRelationshipMap.set(releaseMediaKey, [...(releaseMediaRelationshipMap.get(releaseMediaKey) ?? []), releaseMediaRelationship]);
          } else {
            releaseMediaRelationshipMap.set(releaseMediaKey, [releaseMediaRelationship]);
          }
        }

        setRelease(
          new Release({
            ...release,
            releaseMediaCollection: release.releaseMediaCollection.map((releaseMedia) => {
              const newReleaseMedia = new ReleaseMedia({
                ...releaseMedia,
                releaseMediaToProductRelationships: releaseMediaRelationshipMap.get(getReleaseMediaKeyByComponents(releaseMedia.mediaNumber, release.id)) ?? [],
              });
              newReleaseMedia.releaseMediaToProductRelationships.forEach(
                (releaseMediaRelationship) => (releaseMediaRelationship.releaseMedia = newReleaseMedia)
              );
              return newReleaseMedia;
            }),
          })
        );
      }
    },
    [release]
  );

  const onReleaseTrackToProductRelationshipsChange = useCallback(
    (releaseTrackToProductRelationships: ReleaseTrackToProductRelationship[]) => {
      if (release) {
        const releaseTrackRelationshipMap = new Map<string, ReleaseTrackToProductRelationship[]>();
        for (const releaseTrackRelationship of releaseTrackToProductRelationships) {
          const releaseTrackKey = getReleaseTrackKeyByComponents(releaseTrackRelationship.trackNumber, releaseTrackRelationship.mediaNumber, release.id);
          if (releaseTrackRelationshipMap.has(releaseTrackKey)) {
            releaseTrackRelationshipMap.set(releaseTrackKey, [...(releaseTrackRelationshipMap.get(releaseTrackKey) ?? []), releaseTrackRelationship]);
          } else {
            releaseTrackRelationshipMap.set(releaseTrackKey, [releaseTrackRelationship]);
          }
        }

        setRelease(
          new Release({
            ...release,
            releaseMediaCollection: release.releaseMediaCollection.map((releaseMedia) => {
              const newReleaseMedia = new ReleaseMedia({
                ...releaseMedia,
                releaseTrackCollection: releaseMedia.releaseTrackCollection.map((releaseTrack) => {
                  const newReleaseTrack = new ReleaseTrack({
                    ...releaseTrack,
                    releaseTrackToProductRelationships:
                      releaseTrackRelationshipMap.get(getReleaseTrackKeyByComponents(releaseTrack.trackNumber, releaseMedia.mediaNumber, release.id)) ?? [],
                  });
                  newReleaseTrack.releaseTrackToProductRelationships.forEach(
                    (releaseTrackRelationship) => (releaseTrackRelationship.releaseTrack = newReleaseTrack)
                  );
                  return newReleaseTrack;
                }),
              });
              return newReleaseMedia;
            }),
          })
        );
      }
    },
    [release]
  );

  const onReleaseTrackToWorkRelationshipsChange = useCallback(
    (releaseTrackToWorkRelationships: ReleaseTrackToWorkRelationship[]) => {
      if (release) {
        const releaseTrackRelationshipMap = new Map<string, ReleaseTrackToWorkRelationship[]>();
        for (const releaseTrackRelationship of releaseTrackToWorkRelationships) {
          const releaseTrackKey = getReleaseTrackKeyByComponents(releaseTrackRelationship.trackNumber, releaseTrackRelationship.mediaNumber, release.id);
          if (releaseTrackRelationshipMap.has(releaseTrackKey)) {
            releaseTrackRelationshipMap.set(releaseTrackKey, [...(releaseTrackRelationshipMap.get(releaseTrackKey) ?? []), releaseTrackRelationship]);
          } else {
            releaseTrackRelationshipMap.set(releaseTrackKey, [releaseTrackRelationship]);
          }
        }

        setRelease(
          new Release({
            ...release,
            releaseMediaCollection: release.releaseMediaCollection.map((releaseMedia) => {
              const newReleaseMedia = new ReleaseMedia({
                ...releaseMedia,
                releaseTrackCollection: releaseMedia.releaseTrackCollection.map((releaseTrack) => {
                  const newReleaseTrack = new ReleaseTrack({
                    ...releaseTrack,
                    releaseTrackToWorkRelationships:
                      releaseTrackRelationshipMap.get(getReleaseTrackKeyByComponents(releaseTrack.trackNumber, releaseMedia.mediaNumber, release.id)) ?? [],
                  });
                  newReleaseTrack.releaseTrackToWorkRelationships.forEach(
                    (releaseTrackRelationship) => (releaseTrackRelationship.releaseTrack = newReleaseTrack)
                  );
                  return newReleaseTrack;
                }),
              });
              return newReleaseMedia;
            }),
          })
        );
      }
    },
    [release]
  );

  useEffect(() => {
    fetchRelease();
  }, [fetchRelease]);

  useEffect(() => {
    form.resetFields();
  }, [releaseFormValues, form]);

  const onSaveButtonClick = () => {
    form.submit();
  };

  const onDeleteButtonClick = useCallback(() => {
    if (release) {
      setConfirmDeleteModalOpen(true);
    }
  }, [release]);

  const onCancelButtonClick = () => {
    navigate("/catalog/releases/list");
  };

  const onCreateReleaseTrackButtonClick = useCallback(() => {
    if (release) {
      setReleaseTrackToEdit(undefined);
      setCreateReleaseTrackModalOpen(true);
    }
  }, [release]);

  const onCreateReleaseMediaButtonClick = useCallback(() => {
    if (release) {
      setReleaseMediaToEdit(undefined);
      setCreateReleaseMediaModalOpen(true);
    }
  }, [release]);

  const onRenumberReleaseContentButtonClick = useCallback(() => {
    if (release) {
      const orderedReleaseMediaCollection = [...release.releaseMediaCollection].sort((item, otherItem) => item.mediaNumber - otherItem.mediaNumber);
      setRelease(
        new Release({
          ...release,
          releaseMediaCollection: orderedReleaseMediaCollection.map((releaseMedia, releaseMediaIndex) => {
            const orderedReleaseTrackCollection = [...releaseMedia.releaseTrackCollection].sort((item, otherItem) => item.trackNumber - otherItem.trackNumber);
            return new ReleaseMedia({
              ...releaseMedia,
              mediaNumber: releaseMediaIndex + 1,
              releaseTrackCollection: orderedReleaseTrackCollection.map((releaseTrack, releaseTrackIndex) => {
                return new ReleaseTrack({
                  ...releaseTrack,
                  trackNumber: releaseTrackIndex + 1,
                  mediaNumber: releaseMediaIndex + 1,
                });
              }),
            });
          }),
        })
      );
    }
  }, [release]);

  const onEditReleaseMediaButtonClick = useCallback(
    (releaseMedia: ReleaseMedia) => {
      if (release) {
        setReleaseMediaToEdit(releaseMedia);
        setCreateReleaseMediaModalOpen(true);
      }
    },
    [release]
  );

  const onDeleteReleaseMediaButtonClick = useCallback(
    (releaseMedia: ReleaseMedia) => {
      if (release) {
        setRelease(
          new Release({
            ...release,
            releaseMediaCollection: release.releaseMediaCollection.filter((releaseMediaToCompare) => releaseMediaToCompare !== releaseMedia),
          })
        );
      }
    },
    [release]
  );

  const onEditReleaseTrackButtonClick = useCallback(
    (releaseTrack: ReleaseTrack) => {
      if (release) {
        setReleaseTrackToEdit(releaseTrack);
        setCreateReleaseTrackModalOpen(true);
      }
    },
    [release]
  );

  const onDeleteReleaseTrackButtonClick = useCallback(
    (releaseTrack: ReleaseTrack) => {
      if (release) {
        setRelease(
          new Release({
            ...release,
            releaseMediaCollection: release.releaseMediaCollection.map(
              (releaseMedia) =>
                new ReleaseMedia({
                  ...releaseMedia,
                  releaseTrackCollection: releaseMedia.releaseTrackCollection.filter((releaseTrackToCompare) => releaseTrackToCompare !== releaseTrack),
                })
            ),
          })
        );
      }
    },
    [release]
  );

  const onFinish = useCallback(
    (releaseFormValues: Store) => {
      const releasedOn = releaseFormValues.releasedOn as Dayjs;
      releaseFormValues.releasedOn = releasedOn.startOf("day").add(releasedOn.utcOffset(), "minute").toDate();

      const releaseArtistIds = releaseFormValues.releaseArtists as string[];
      const releaseFeaturedArtistIds = releaseFormValues.releaseFeaturedArtists as string[];
      const releasePerformerIds = releaseFormValues.releasePerformers as string[];
      const releaseComposerIds = releaseFormValues.releaseComposers as string[];
      const releaseGenreIds = releaseFormValues.releaseGenres as string[];
      if (release?.id) {
        releaseFormValues.releaseArtists = releaseArtistIds.map((artistId) => new ReleaseArtist({ releaseId: release.id, artistId: artistId }));
        releaseFormValues.releaseFeaturedArtists = releaseFeaturedArtistIds.map(
          (artistId) => new ReleaseFeaturedArtist({ releaseId: release.id, artistId: artistId })
        );
        releaseFormValues.releasePerformers = releasePerformerIds.map((artistId) => new ReleasePerformer({ releaseId: release.id, artistId: artistId }));
        releaseFormValues.releaseComposers = releaseComposerIds.map((artistId) => new ReleaseComposer({ releaseId: release.id, artistId: artistId }));
        releaseFormValues.releaseGenres = releaseGenreIds.map((genreId) => new ReleaseGenre({ releaseId: release.id, genreId: genreId }));
      } else {
        releaseFormValues.releaseArtists = [];
        releaseFormValues.releaseFeaturedArtists = [];
        releaseFormValues.releasePerformers = [];
        releaseFormValues.releaseComposers = [];
        releaseFormValues.releaseGenres = [];
      }

      const releaseModel = new Release({ ...release, ...(releaseFormValues as IRelease) });
      releaseModel.id = releaseModel.id?.trim();
      releaseModel.title = releaseModel.title?.trim();
      releaseModel.description = releaseModel.description?.trim();
      releaseModel.disambiguationText = releaseModel.disambiguationText?.trim();
      releaseModel.barcode = releaseModel.barcode?.trim();
      releaseModel.catalogNumber = releaseModel.catalogNumber?.trim();
      releaseModel.mediaFormat = releaseModel.mediaFormat?.trim();
      releaseModel.publishFormat = releaseModel.publishFormat?.trim();
      if (releaseModel.id !== undefined && releaseModel.id.length === 0) {
        releaseModel.id = EmptyGuidString;
      }
      if (releaseModel.description !== undefined && releaseModel.description.length === 0) {
        releaseModel.description = undefined;
      }
      if (releaseModel.disambiguationText !== undefined && releaseModel.disambiguationText.length === 0) {
        releaseModel.disambiguationText = undefined;
      }
      if (releaseModel.barcode !== undefined && releaseModel.barcode.length === 0) {
        releaseModel.barcode = undefined;
      }
      if (releaseModel.catalogNumber !== undefined && releaseModel.catalogNumber.length === 0) {
        releaseModel.catalogNumber = undefined;
      }
      if (releaseModel.mediaFormat !== undefined && releaseModel.mediaFormat.length === 0) {
        releaseModel.mediaFormat = undefined;
      }
      if (releaseModel.publishFormat !== undefined && releaseModel.publishFormat.length === 0) {
        releaseModel.publishFormat = undefined;
      }

      releaseModel.releaseRelationships =
        releaseModel.releaseRelationships?.map(
          (releaseRelationship) => new ReleaseRelationship({ ...releaseRelationship, release: undefined, dependentRelease: undefined })
        ) ?? [];

      releaseModel.releaseToProductRelationships =
        releaseModel.releaseToProductRelationships.map(
          (releaseToProductRelationship) => new ReleaseToProductRelationship({ ...releaseToProductRelationship, release: undefined, product: undefined })
        ) ?? [];
      releaseModel.releaseToReleaseGroupRelationships =
        releaseModel.releaseToReleaseGroupRelationships.map(
          (releaseToReleaseGroupRelationship) =>
            new ReleaseToReleaseGroupRelationship({ ...releaseToReleaseGroupRelationship, release: undefined, releaseGroup: undefined })
        ) ?? [];

      releaseModel.releaseMediaCollection.forEach((releaseMedia) => {
        releaseMedia.releaseMediaToProductRelationships = releaseMedia.releaseMediaToProductRelationships.map(
          (releaseMediaToProductRelationship) =>
            new ReleaseMediaToProductRelationship({ ...releaseMediaToProductRelationship, releaseMedia: undefined, product: undefined })
        );

        releaseMedia.releaseTrackCollection.forEach((releaseTrack) => {
          releaseTrack.releaseTrackToProductRelationships = releaseTrack.releaseTrackToProductRelationships.map(
            (releaseTrackToProductRelationship) =>
              new ReleaseTrackToProductRelationship({ ...releaseTrackToProductRelationship, releaseTrack: undefined, product: undefined })
          );
          releaseTrack.releaseTrackToWorkRelationships = releaseTrack.releaseTrackToWorkRelationships.map(
            (releaseTrackToWorkRelationship) =>
              new ReleaseTrackToWorkRelationship({ ...releaseTrackToWorkRelationship, releaseTrack: undefined, work: undefined })
          );
        });
      });

      if (mode === ReleaseEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createRelease(releaseModel)
          .then((release) => {
            setLoading(false);
            navigate(`/catalog/releases/edit?id=${release.id}`);
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      } else {
        setLoading(true);
        applicationClient
          .updateRelease(releaseModel)
          .then(() => {
            setLoading(false);
            fetchRelease();
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      }
    },
    [mode, navigate, release, applicationClient, fetchRelease]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (release) {
        setModalLoading(true);
        applicationClient
          .deleteRelease(release.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            navigate("/catalog/releases/list");
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [navigate, release, applicationClient]
  );

  const onConfirmDeleteModalCancel = () => {
    setConfirmDeleteModalOpen(false);
  };

  const onCreateReleaseMediaModalOk = useCallback(
    (releaseMedia: ReleaseMedia, resetFormFields: () => void) => {
      if (release) {
        const existingReleaseMedia = release.releaseMediaCollection.find(
          (releaseMediaToCompare) => releaseMediaToCompare.mediaNumber === releaseMedia.mediaNumber
        );
        if (existingReleaseMedia && !releaseMediaToEdit) {
          alert(`Unable to create a release media with a non-unique number: ${releaseMedia.mediaNumber}.`);
          return;
        }

        const shouldAddReleaseMedia = !releaseMediaToEdit;

        if (shouldAddReleaseMedia) {
          setRelease(new Release({ ...release, releaseMediaCollection: [...release.releaseMediaCollection, releaseMedia] }));
        } else {
          setRelease(
            new Release({
              ...release,
              releaseMediaCollection: release.releaseMediaCollection.map((releaseMediaToCompare) =>
                releaseMediaToCompare !== releaseMediaToEdit ? releaseMediaToCompare : releaseMedia
              ),
            })
          );
        }
        setCreateReleaseMediaModalOpen(false);
        resetFormFields();
      }
    },
    [release, releaseMediaToEdit]
  );

  const onCreateReleaseMediaModalCancel = () => {
    setCreateReleaseMediaModalOpen(false);
  };

  const onCreateReleaseTrackModalOk = useCallback(
    (releaseTrack: ReleaseTrack, resetFormFields: () => void) => {
      if (release) {
        const existingReleaseTrack = release.releaseMediaCollection
          .map((releaseMedia) =>
            releaseMedia.releaseTrackCollection.find(
              (releaseTrackToCompare) =>
                releaseTrackToCompare.trackNumber === releaseTrack.trackNumber && releaseTrackToCompare.mediaNumber === releaseTrack.mediaNumber
            )
          )
          .reduce((previousValue, currentValue) => (previousValue !== undefined ? previousValue : currentValue), undefined);
        if (existingReleaseTrack && !releaseTrackToEdit) {
          alert(
            `Unable to create a release track with a non-unique pair of track and media numbers: ${releaseTrack.trackNumber}, ${releaseTrack.mediaNumber}.`
          );
          return;
        }

        const shouldMoveReleaseTrack = !releaseTrackToEdit || releaseTrackToEdit?.mediaNumber !== releaseTrack.mediaNumber;
        const destinationReleaseMedia = release.releaseMediaCollection.find(
          (releaseMediaToCompare) => releaseMediaToCompare.mediaNumber === releaseTrack.mediaNumber
        );
        const sourceReleaseMedia = release.releaseMediaCollection.find(
          (releaseMediaToCompare) => releaseMediaToCompare.mediaNumber === releaseTrackToEdit?.mediaNumber
        );
        if (shouldMoveReleaseTrack && !destinationReleaseMedia) {
          alert(`Unable to add or move the release track to a non-existing release media: ${releaseTrack.mediaNumber}.`);
          return;
        }

        setRelease(
          new Release({
            ...release,
            releaseMediaCollection: release.releaseMediaCollection.map((releaseMediaToCompare) => {
              if (releaseMediaToCompare === destinationReleaseMedia) {
                return new ReleaseMedia({
                  ...releaseMediaToCompare,
                  releaseTrackCollection: shouldMoveReleaseTrack
                    ? [...releaseMediaToCompare.releaseTrackCollection, releaseTrack]
                    : releaseMediaToCompare.releaseTrackCollection.map((releaseTrackToCompare) =>
                        releaseTrackToCompare !== releaseTrackToEdit ? releaseTrackToCompare : releaseTrack
                      ),
                });
              } else if (shouldMoveReleaseTrack && releaseMediaToCompare === sourceReleaseMedia) {
                return new ReleaseMedia({
                  ...releaseMediaToCompare,
                  releaseTrackCollection: releaseMediaToCompare.releaseTrackCollection.filter(
                    (releaseTrackToCompare) => releaseTrackToCompare !== releaseTrackToEdit
                  ),
                });
              } else {
                return releaseMediaToCompare;
              }
            }),
          })
        );
        setCreateReleaseTrackModalOpen(false);
        resetFormFields();
      }
    },
    [release, releaseTrackToEdit]
  );

  const onCreateReleaseTrackModalCancel = () => {
    setCreateReleaseTrackModalOpen(false);
  };

  const fetchReleaseArtistOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setReleaseArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseArtistOptions(undefined, () => void 0), [fetchReleaseArtistOptions]);

  const fetchReleaseFeaturedArtistOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setReleaseFeaturedArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseFeaturedArtistOptions(undefined, () => void 0), [fetchReleaseFeaturedArtistOptions]);

  const fetchReleasePerformerOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setReleasePerformerOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleasePerformerOptions(undefined, () => void 0), [fetchReleasePerformerOptions]);

  const fetchReleaseComposerOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setReleaseComposerOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseComposerOptions(undefined, () => void 0), [fetchReleaseComposerOptions]);

  const fetchReleaseGenreOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedGenres(20, 0, nameFilter, undefined)
        .then((genreResponse) => {
          setLoading(false);
          setReleaseGenreOptions(genreResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseGenreOptions(undefined, () => void 0), [fetchReleaseGenreOptions]);

  const releaseTrackTableColumns = [
    {
      key: "trackNumber",
      title: "Track #",
      dataIndex: "trackNumber",
      render: (_: number, { trackNumber, totalTrackCount }: ReleaseTrack) => formatReleaseTrackNumber(trackNumber, totalTrackCount),
    },
    {
      key: "mediaNumber",
      title: "Media #",
      dataIndex: "mediaNumber",
      render: (_: number, { mediaNumber, totalMediaCount }: ReleaseTrack) => formatReleaseMediaNumber(mediaNumber, totalMediaCount),
    },
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
      render: (_: string, { title, disambiguationText }: ReleaseTrack) => (
        <Space wrap>
          {title}
          {disambiguationText && (
            <Tooltip title={disambiguationText}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (_: string, releaseTrack: ReleaseTrack) => (
        <Space wrap>
          <Button onClick={() => onEditReleaseTrackButtonClick(releaseTrack)}>
            <EditOutlined /> Edit
          </Button>
          <Button danger onClick={() => onDeleteReleaseTrackButtonClick(releaseTrack)}>
            <DeleteOutlined /> Delete
          </Button>
        </Space>
      ),
    },
  ];

  const releaseInfoCardText = useMemo(() => {
    if (release) {
      const releaseMediaCollectionLength = release.releaseMediaCollection.length;
      const releaseTrackCollectionLength = release.releaseMediaCollection
        .map((releaseMedia) => releaseMedia.releaseTrackCollection.length)
        .reduce((sum, currentLength) => sum + currentLength, 0);

      return `The current release contains ${releaseTrackCollectionLength} tracks and ${releaseMediaCollectionLength} media.`;
    }

    return undefined;
  }, [release]);

  const releaseMediaToProductRelationships = useMemo(() => {
    if (release) {
      return release.releaseMediaCollection
        .map((releaseMedia) => {
          return releaseMedia.releaseMediaToProductRelationships;
        })
        .flat();
    }
    return [];
  }, [release]);

  const releaseTrackToProductRelationships = useMemo(() => {
    if (release) {
      return release.releaseMediaCollection
        .map((releaseMedia) => {
          return releaseMedia.releaseTrackCollection
            .map((releaseTrack) => {
              return releaseTrack.releaseTrackToProductRelationships;
            })
            .flat();
        })
        .flat();
    }
    return [];
  }, [release]);

  const releaseTrackToWorkRelationships = useMemo(() => {
    if (release) {
      return release.releaseMediaCollection
        .map((releaseMedia) => {
          return releaseMedia.releaseTrackCollection
            .map((releaseTrack) => {
              return releaseTrack.releaseTrackToWorkRelationships;
            })
            .flat();
        })
        .flat();
    }
    return [];
  }, [release]);

  const tabs = useMemo(
    () => [
      {
        key: "releaseRelationshipsTab",
        label: "Release Relationships",
        children: release && (
          <ReleaseEditPageReleaseRelationshipsTab
            release={release}
            releaseRelationships={release.releaseRelationships}
            releaseRelationshipsLoading={loading}
            setReleaseRelationships={onReleaseRelationshipsChange}
          />
        ),
      },
      {
        key: "releaseToProductRelationshipsTab",
        label: "Release-to-Product Relationships",
        children: release && (
          <ReleaseEditPageReleaseToProductRelationshipsTab
            release={release}
            releaseToProductRelationships={release.releaseToProductRelationships}
            releaseToProductRelationshipsLoading={loading}
            setReleaseToProductRelationships={onReleaseToProductRelationshipsChange}
          />
        ),
      },
      {
        key: "releaseToReleaseGroupRelationshipsTab",
        label: "Release-to-Release-Group Relationships",
        children: release && (
          <ReleaseEditPageReleaseToReleaseGroupRelationshipsTab
            release={release}
            releaseToReleaseGroupRelationships={release.releaseToReleaseGroupRelationships}
            releaseToReleaseGroupRelationshipsLoading={loading}
            setReleaseToReleaseGroupRelationships={onReleaseToReleaseGroupRelationshipsChange}
          />
        ),
      },
      {
        key: "releaseMediaToProductRelationshipsTab",
        label: "Release-Media-to-Product Relationships",
        children: release && (
          <ReleaseEditPageReleaseMediaToProductRelationshipsTab
            release={release}
            releaseMediaToProductRelationships={releaseMediaToProductRelationships}
            releaseMediaToProductRelationshipsLoading={loading}
            setReleaseMediaToProductRelationships={onReleaseMediaToProductRelationshipsChange}
          />
        ),
      },
      {
        key: "releaseTrackToProductRelationshipsTab",
        label: "Release-Track-to-Product Relationships",
        children: release && (
          <ReleaseEditPageReleaseTrackToProductRelationshipsTab
            release={release}
            releaseTrackToProductRelationships={releaseTrackToProductRelationships}
            releaseTrackToProductRelationshipsLoading={loading}
            setReleaseTrackToProductRelationships={onReleaseTrackToProductRelationshipsChange}
          />
        ),
      },
      {
        key: "releaseTrackToWorkRelationshipsTab",
        label: "Release-Track-to-Work Relationships",
        children: release && (
          <ReleaseEditPageReleaseTrackToWorkRelationshipsTab
            release={release}
            releaseTrackToWorkRelationships={releaseTrackToWorkRelationships}
            releaseTrackToWorkRelationshipsLoading={loading}
            setReleaseTrackToWorkRelationships={onReleaseTrackToWorkRelationshipsChange}
          />
        ),
      },
    ],
    [
      release,
      loading,
      releaseMediaToProductRelationships,
      releaseTrackToProductRelationships,
      releaseTrackToWorkRelationships,
      onReleaseRelationshipsChange,
      onReleaseToProductRelationshipsChange,
      onReleaseToReleaseGroupRelationshipsChange,
      onReleaseMediaToProductRelationshipsChange,
      onReleaseTrackToProductRelationshipsChange,
      onReleaseTrackToWorkRelationshipsChange,
    ]
  );

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Title level={4}>{mode === ReleaseEditPageMode.Create ? "Create" : "Edit"} Release</Title>
        <Button type="primary" loading={loading} onClick={onSaveButtonClick}>
          <SaveOutlined /> Save
        </Button>
        {mode === ReleaseEditPageMode.Edit && (
          <Button danger type="primary" onClick={onDeleteButtonClick}>
            <DeleteOutlined /> Delete
          </Button>
        )}
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined /> Cancel
        </Button>
      </Space>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form
            form={form}
            initialValues={releaseFormValues}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item label="Id" name="id">
              <Input readOnly={mode === ReleaseEditPageMode.Edit} />
            </Form.Item>
            <Form.Item label="Title" name="title" rules={[{ required: true, message: "The 'Title' property must not be empty." }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Disambiguation Text" name="disambiguationText">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Barcode" name="barcode" rules={[{ max: 32, message: "The 'Barcode' property must be shorter than 32 characters." }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Catalog Number"
              name="catalogNumber"
              rules={[{ max: 32, message: "The 'Catalog Number' property must be shorter than 32 characters." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Media Format"
              name="mediaFormat"
              rules={[{ max: 256, message: "The 'Media Format' property must be shorter than 256 characters." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Publish Format"
              name="publishFormat"
              rules={[{ max: 256, message: "The 'Publish Format' property must be shorter than 256 characters." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Released On" name="releasedOn" rules={[{ required: true, message: "The 'Released On' property must not be empty." }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item
              label="Released On"
              name="releasedOnYearOnly"
              rules={[{ required: true, message: "The 'Released On (Year Only)' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === ReleaseEditPageMode.Create ? false : undefined}
            >
              <Checkbox>Display Year Only</Checkbox>
            </Form.Item>
            <Form.Item
              label="Enabled"
              name="enabled"
              rules={[{ required: true, message: "The 'Enabled' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === ReleaseEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Artists" name="releaseArtists">
                <EntitySelect
                  mode="multiple"
                  options={releaseArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleaseArtistOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Featured Artists" name="releaseFeaturedArtists">
                <EntitySelect
                  mode="multiple"
                  options={releaseFeaturedArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleaseFeaturedArtistOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Performers" name="releasePerformers">
                <EntitySelect
                  mode="multiple"
                  options={releasePerformerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleasePerformerOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Composers" name="releaseComposers">
                <EntitySelect
                  mode="multiple"
                  options={releaseComposerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleaseComposerOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Genres" name="releaseGenres">
                <EntitySelect
                  mode="multiple"
                  options={releaseGenreOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleaseGenreOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Created On" name="createdOn">
                <Input readOnly />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Updated On" name="updatedOn">
                <Input readOnly />
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
      {release && mode === ReleaseEditPageMode.Edit && (
        <Space direction="vertical" style={{ display: "flex" }}>
          <Card
            size="small"
            title={
              <Space wrap className={styles.cardHeader} direction="horizontal" align="baseline">
                Release Content
                <Button onClick={onCreateReleaseTrackButtonClick}>
                  <FileAddOutlined /> Create Track
                </Button>
                <Button onClick={onCreateReleaseMediaButtonClick}>
                  <FolderAddOutlined /> Create Media
                </Button>
                <Button onClick={onRenumberReleaseContentButtonClick}>
                  <FieldNumberOutlined /> Reorder & Renumber Content
                </Button>
              </Space>
            }
          >
            {releaseInfoCardText && <Paragraph>{releaseInfoCardText}</Paragraph>}
          </Card>
          {release.releaseMediaCollection.map((releaseMedia) => (
            <Card
              key={getReleaseMediaKey(releaseMedia)}
              size="small"
              title={
                <Space wrap className={styles.cardHeader} direction="horizontal" align="baseline">
                  <Space wrap direction="horizontal" align="baseline">
                    {`${formatReleaseMediaNumber(releaseMedia.mediaNumber, releaseMedia.totalMediaCount)} - ${releaseMedia.title}`}
                    {releaseMedia.disambiguationText && (
                      <Tooltip title={releaseMedia.disambiguationText}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    )}
                  </Space>
                  <Button onClick={() => onEditReleaseMediaButtonClick(releaseMedia)}>
                    <EditOutlined /> Edit
                  </Button>
                  <Button danger onClick={() => onDeleteReleaseMediaButtonClick(releaseMedia)}>
                    <DeleteOutlined /> Delete
                  </Button>
                </Space>
              }
            >
              <Space direction="vertical" style={{ display: "flex" }}>
                {(releaseMedia.description ||
                  releaseMedia.catalogNumber ||
                  releaseMedia.mediaFormat ||
                  releaseMedia.tableOfContentsChecksum ||
                  releaseMedia.tableOfContentsChecksumLong) && (
                  <Collapse>
                    <Collapse.Panel key="release-media-details" header="Release Media Details">
                      {releaseMedia.description && <Paragraph>{releaseMedia.description}</Paragraph>}
                      {releaseMedia.description &&
                        (releaseMedia.catalogNumber ||
                          releaseMedia.mediaFormat ||
                          releaseMedia.tableOfContentsChecksum ||
                          releaseMedia.tableOfContentsChecksumLong) && <Divider />}
                      {releaseMedia.catalogNumber && (
                        <Paragraph>
                          Catalog Number: <Text keyboard>{releaseMedia.catalogNumber}</Text>
                        </Paragraph>
                      )}
                      {releaseMedia.mediaFormat && (
                        <Paragraph>
                          Media Format: <Text>{releaseMedia.mediaFormat}</Text>
                        </Paragraph>
                      )}
                      {releaseMedia.tableOfContentsChecksum && (
                        <Paragraph>
                          CDDB Checksum: <Text keyboard>{releaseMedia.tableOfContentsChecksum}</Text>
                        </Paragraph>
                      )}
                      {releaseMedia.tableOfContentsChecksumLong && (
                        <Paragraph>
                          MusicBrainz Checksum: <Text keyboard>{releaseMedia.tableOfContentsChecksumLong}</Text>
                        </Paragraph>
                      )}
                    </Collapse.Panel>
                  </Collapse>
                )}
                {releaseMedia.releaseTrackCollection.length > 0 && (
                  <Table
                    size="small"
                    columns={releaseTrackTableColumns}
                    rowKey={getReleaseTrackKey}
                    dataSource={releaseMedia.releaseTrackCollection}
                    loading={loading}
                    pagination={false}
                  />
                )}
              </Space>
            </Card>
          ))}
          {release && <Tabs items={tabs} />}
        </Space>
      )}
      {release && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Release"
          message={`Confirm that you want to delete the "${release.title}" release. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      )}
      {release && (
        <CreateReleaseMediaModal
          edit
          open={createReleaseMediaModalOpen}
          releaseMedia={releaseMediaToEdit}
          onOk={onCreateReleaseMediaModalOk}
          onCancel={onCreateReleaseMediaModalCancel}
        />
      )}
      {release && (
        <CreateReleaseTrackModal
          edit
          open={createReleaseTrackModalOpen}
          releaseTrack={releaseTrackToEdit}
          onOk={onCreateReleaseTrackModalOk}
          onCancel={onCreateReleaseTrackModalCancel}
        />
      )}
    </>
  );
};

export default ReleaseEditPage;
