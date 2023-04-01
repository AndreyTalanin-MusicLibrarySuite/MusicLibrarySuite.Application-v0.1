import { Button, Card, Checkbox, Col, Collapse, DatePicker, Divider, Form, Input, Row, Space, Table, Tabs, Tooltip, Typography } from "antd";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Artist,
  Genre,
  Release,
  ReleaseMedia,
  ReleaseMediaToProductRelationship,
  ReleaseRelationship,
  ReleaseToProductRelationship,
  ReleaseToReleaseGroupRelationship,
  ReleaseTrack,
  ReleaseTrackToProductRelationship,
  ReleaseTrackToWorkRelationship,
} from "../../../api/ApplicationClient";
import EntitySelect from "../../../components/inputs/EntitySelect";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import EditReleaseMediaModal from "../../../components/modals/EditReleaseMediaModal";
import EditReleaseTrackModal from "../../../components/modals/EditReleaseTrackModal";
import ActionPage from "../../../components/pages/ActionPage";
import { mapReleaseFormInitialValues, mergeReleaseFormValues } from "../../../entities/forms/ReleaseFormValues";
import { DefaultPageSize } from "../../../helpers/ApplicationConstants";
import { GuidPattern } from "../../../helpers/RegularExpressionConstants";
import { formatReleaseMediaNumber, getReleaseMediaKey, getReleaseMediaKeyByComponents } from "../../../helpers/ReleaseMediaHelpers";
import { formatReleaseTrackNumber, getReleaseTrackKey, getReleaseTrackKeyByComponents } from "../../../helpers/ReleaseTrackHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useEntityForm from "../../../hooks/useEntityForm";
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
  const [releaseInitialValues, setReleaseInitialValues] = useState<Release>();
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

  const fetchRelease = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getRelease(id)
        .then((release) => {
          release.releaseRelationships.forEach((releaseRelationship) => (releaseRelationship.release = release));
          release.releaseToProductRelationships.forEach((releaseToProductRelationship) => (releaseToProductRelationship.release = release));
          release.releaseToReleaseGroupRelationships.forEach((releaseToReleaseGroupRelationship) => (releaseToReleaseGroupRelationship.release = release));

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

          setRelease(release);
          setReleaseInitialValues(release);

          applicationClient
            .getArtists(release.releaseArtists?.map((releaseArtist) => releaseArtist.artistId) ?? [])
            .then((artists) => {
              setReleaseArtistOptions(artists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(release.releaseFeaturedArtists?.map((releaseFeaturedArtist) => releaseFeaturedArtist.artistId) ?? [])
            .then((artists) => {
              setReleaseFeaturedArtistOptions(artists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(release.releasePerformers?.map((releasePerformer) => releasePerformer.artistId) ?? [])
            .then((artists) => {
              setReleasePerformerOptions(artists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(release.releaseComposers?.map((releaseComposer) => releaseComposer.artistId) ?? [])
            .then((artists) => {
              setReleaseComposerOptions(artists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getGenres(release.releaseGenres?.map((releaseGenre) => releaseGenre.genreId) ?? [])
            .then((genres) => {
              setReleaseGenreOptions(genres);
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

  useEffect(() => {
    fetchRelease();
  }, [fetchRelease]);

  const saveRelease = useCallback(
    (releaseValues: Release) => {
      releaseValues.releaseRelationships =
        release?.releaseRelationships?.map(
          (releaseRelationship) =>
            new ReleaseRelationship({
              ...releaseRelationship,
              release: undefined,
              dependentRelease: undefined,
            })
        ) ?? [];
      releaseValues.releaseToProductRelationships =
        release?.releaseToProductRelationships?.map(
          (releaseToProductRelationship) =>
            new ReleaseToProductRelationship({
              ...releaseToProductRelationship,
              release: undefined,
              product: undefined,
            })
        ) ?? [];
      releaseValues.releaseToReleaseGroupRelationships =
        release?.releaseToReleaseGroupRelationships?.map(
          (releaseToReleaseGroupRelationship) =>
            new ReleaseToReleaseGroupRelationship({
              ...releaseToReleaseGroupRelationship,
              release: undefined,
              releaseGroup: undefined,
            })
        ) ?? [];

      releaseValues.releaseMediaCollection =
        release?.releaseMediaCollection?.map((releaseMedia) => {
          releaseMedia.releaseMediaToProductRelationships =
            releaseMedia.releaseMediaToProductRelationships?.map(
              (releaseMediaToProductRelationship) =>
                new ReleaseMediaToProductRelationship({
                  ...releaseMediaToProductRelationship,
                  releaseMedia: undefined,
                  product: undefined,
                })
            ) ?? [];

          releaseMedia.releaseTrackCollection =
            releaseMedia.releaseTrackCollection?.map((releaseTrack) => {
              releaseTrack.releaseTrackToProductRelationships =
                releaseTrack.releaseTrackToProductRelationships?.map(
                  (releaseTrackToProductRelationship) =>
                    new ReleaseTrackToProductRelationship({
                      ...releaseTrackToProductRelationship,
                      releaseTrack: undefined,
                      product: undefined,
                    })
                ) ?? [];
              releaseTrack.releaseTrackToWorkRelationships =
                releaseTrack.releaseTrackToWorkRelationships?.map(
                  (releaseTrackToWorkRelationship) =>
                    new ReleaseTrackToWorkRelationship({
                      ...releaseTrackToWorkRelationship,
                      releaseTrack: undefined,
                      work: undefined,
                    })
                ) ?? [];

              return releaseTrack;
            }) ?? [];

          return releaseMedia;
        }) ?? [];

      if (mode === ReleaseEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createRelease(releaseValues)
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
          .updateRelease(releaseValues)
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

  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(releaseInitialValues, mapReleaseFormInitialValues, mergeReleaseFormValues, saveRelease),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [releaseInitialValues, form]);

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

  const onSaveButtonClick = useCallback(() => {
    form.submit();
  }, [form]);

  const onDeleteButtonClick = useCallback(() => {
    if (release) {
      setConfirmDeleteModalOpen(true);
    }
  }, [release]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/releases/list");
  }, [navigate]);

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
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setReleaseArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseArtistOptions(undefined), [fetchReleaseArtistOptions]);

  const fetchReleaseFeaturedArtistOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setReleaseFeaturedArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseFeaturedArtistOptions(undefined), [fetchReleaseFeaturedArtistOptions]);

  const fetchReleasePerformerOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setReleasePerformerOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleasePerformerOptions(undefined), [fetchReleasePerformerOptions]);

  const fetchReleaseComposerOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setReleaseComposerOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseComposerOptions(undefined), [fetchReleaseComposerOptions]);

  const fetchReleaseGenreOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedGenres(DefaultPageSize, 0, nameFilter, undefined)
        .then((genreResponse) => {
          setReleaseGenreOptions(genreResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseGenreOptions(undefined), [fetchReleaseGenreOptions]);

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

  const releaseTrackTableColumns = useMemo(
    () => [
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
    ],
    [onEditReleaseTrackButtonClick, onDeleteReleaseTrackButtonClick]
  );

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

  const title = useMemo(() => <Title level={4}>{mode === ReleaseEditPageMode.Create ? "Create" : "Edit"} Release</Title>, [mode]);

  const actionButtons = useMemo(
    () => (
      <>
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
      </>
    ),
    [mode, loading, onSaveButtonClick, onDeleteButtonClick, onCancelButtonClick]
  );

  const checkIfReleaseMediaHasDetails = (releaseMedia: ReleaseMedia) => {
    return (
      releaseMedia.description || releaseMedia.mediaFormat || releaseMedia.catalogNumber || releaseMedia.freeDbChecksum || releaseMedia.musicBrainzChecksum
    );
  };

  const checkIfReleaseMediaIsEmpty = (releaseMedia: ReleaseMedia) => {
    return releaseMedia.releaseTrackCollection.length === 0;
  };

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
      releaseMediaToProductRelationships,
      releaseTrackToProductRelationships,
      releaseTrackToWorkRelationships,
      loading,
      onReleaseRelationshipsChange,
      onReleaseToProductRelationshipsChange,
      onReleaseToReleaseGroupRelationshipsChange,
      onReleaseMediaToProductRelationshipsChange,
      onReleaseTrackToProductRelationshipsChange,
      onReleaseTrackToWorkRelationshipsChange,
    ]
  );

  const modals = useMemo(
    () => [
      release && (
        <ConfirmDeleteModal
          key="ConfirmDeleteModal"
          open={confirmDeleteModalOpen}
          title="Delete Release"
          message={`Confirm that you want to delete the "${release.title}" release. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
      release && (
        <EditReleaseMediaModal
          edit
          key="EditReleaseMediaModal"
          open={createReleaseMediaModalOpen}
          releaseMedia={releaseMediaToEdit}
          onOk={onCreateReleaseMediaModalOk}
          onCancel={onCreateReleaseMediaModalCancel}
        />
      ),
      release && (
        <EditReleaseTrackModal
          edit
          key="EditReleaseTrackModal"
          open={createReleaseTrackModalOpen}
          releaseTrack={releaseTrackToEdit}
          onOk={onCreateReleaseTrackModalOk}
          onCancel={onCreateReleaseTrackModalCancel}
        />
      ),
    ],
    [
      release,
      confirmDeleteModalOpen,
      createReleaseMediaModalOpen,
      releaseMediaToEdit,
      createReleaseTrackModalOpen,
      releaseTrackToEdit,
      onConfirmDeleteModalOk,
      onCreateReleaseMediaModalOk,
      onCreateReleaseTrackModalOk,
    ]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form
            form={form}
            initialValues={initialFormValues}
            onFinish={onFormFinish}
            onFinishFailed={onFormFinishFailed}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item label="Id" name="id" rules={[{ pattern: GuidPattern, message: "The 'Id' property must be a valid GUID (UUID)." }]}>
              <Input readOnly={mode === ReleaseEditPageMode.Edit} />
            </Form.Item>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: "The 'Title' property must not be empty." },
                { max: 256, message: "The 'Title' property must be shorter than 256 characters." },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ max: 2048, message: "The 'Description' property must be shorter than 2048 characters." }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Disambiguation Text"
              name="disambiguationText"
              rules={[{ max: 2048, message: "The 'Disambiguation Text' property must be shorter than 2048 characters." }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Media Format"
              name="mediaFormat"
              rules={[
                {
                  max: 256,
                  message: "The 'Media Format' property must be shorter than 256 characters.",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Publish Format"
              name="publishFormat"
              rules={[
                {
                  max: 256,
                  message: "The 'Publish Format' property must be shorter than 256 characters.",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Catalog Number"
              name="catalogNumber"
              rules={[
                {
                  max: 32,
                  message: "The 'Catalog Number' property must be shorter than 32 characters.",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Barcode"
              name="barcode"
              rules={[
                {
                  max: 32,
                  message: "The 'Barcode' property must be shorter than 32 characters.",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Released On"
              name="releasedOn"
              rules={[
                {
                  required: true,
                  message: "The 'Released On' property must not be empty.",
                },
              ]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              label="Released On"
              name="releasedOnYearOnly"
              rules={[
                {
                  required: true,
                  message: "The 'Released On (Year Only)' property must not be empty.",
                },
              ]}
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
              <Form.Item label="Artists" name="releaseArtistIds">
                <EntitySelect
                  mode="multiple"
                  options={releaseArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleaseArtistOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Featured Artists" name="releaseFeaturedArtistIds">
                <EntitySelect
                  mode="multiple"
                  options={releaseFeaturedArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleaseFeaturedArtistOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Performers" name="releasePerformerIds">
                <EntitySelect
                  mode="multiple"
                  options={releasePerformerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleasePerformerOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Composers" name="releaseComposerIds">
                <EntitySelect
                  mode="multiple"
                  options={releaseComposerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchReleaseComposerOptions}
                />
              </Form.Item>
            )}
            {mode === ReleaseEditPageMode.Edit && (
              <Form.Item label="Genres" name="releaseGenreIds">
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
        <>
          <Card
            size="small"
            title={
              <Space wrap className={styles.cardHeader} direction="horizontal" align="baseline">
                <Space wrap direction="horizontal" align="baseline">
                  Release Content
                </Space>
                <Space wrap direction="horizontal" align="baseline">
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
                  <Space wrap direction="horizontal" align="baseline">
                    <Button onClick={() => onEditReleaseMediaButtonClick(releaseMedia)}>
                      <EditOutlined /> Edit
                    </Button>
                    <Button danger onClick={() => onDeleteReleaseMediaButtonClick(releaseMedia)}>
                      <DeleteOutlined /> Delete
                    </Button>
                  </Space>
                </Space>
              }
            >
              <Space direction="vertical" style={{ display: "flex" }}>
                {checkIfReleaseMediaHasDetails(releaseMedia) && (
                  <Collapse>
                    <Collapse.Panel key="release-media-details" header="Release Media Details">
                      {releaseMedia.description && <Paragraph>{releaseMedia.description}</Paragraph>}
                      {releaseMedia.description &&
                        (releaseMedia.mediaFormat || releaseMedia.catalogNumber || releaseMedia.freeDbChecksum || releaseMedia.musicBrainzChecksum) && (
                          <Divider />
                        )}
                      {releaseMedia.mediaFormat && (
                        <Paragraph>
                          Media Format: <Text>{releaseMedia.mediaFormat}</Text>
                        </Paragraph>
                      )}
                      {releaseMedia.catalogNumber && (
                        <Paragraph>
                          Catalog Number: <Text keyboard>{releaseMedia.catalogNumber}</Text>
                        </Paragraph>
                      )}
                      {releaseMedia.freeDbChecksum && (
                        <Paragraph>
                          FreeDb Checksum: <Text keyboard>{releaseMedia.freeDbChecksum}</Text>
                        </Paragraph>
                      )}
                      {releaseMedia.musicBrainzChecksum && (
                        <Paragraph>
                          MusicBrainz Checksum: <Text keyboard>{releaseMedia.musicBrainzChecksum}</Text>
                        </Paragraph>
                      )}
                    </Collapse.Panel>
                  </Collapse>
                )}
                {!checkIfReleaseMediaIsEmpty(releaseMedia) && (
                  <Table
                    size="small"
                    columns={releaseTrackTableColumns}
                    rowKey={getReleaseTrackKey}
                    dataSource={releaseMedia.releaseTrackCollection}
                    loading={loading}
                    pagination={false}
                  />
                )}
                {!checkIfReleaseMediaHasDetails(releaseMedia) && checkIfReleaseMediaIsEmpty(releaseMedia) && (
                  <Paragraph>This release media is empty.</Paragraph>
                )}
              </Space>
            </Card>
          ))}
        </>
      )}
      {mode === ReleaseEditPageMode.Edit && <Tabs items={tabs} />}
    </ActionPage>
  );
};

export default ReleaseEditPage;
