import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Tabs, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Artist,
  Genre,
  IWork,
  ReleaseTrackToWorkRelationship,
  Work,
  WorkArtist,
  WorkComposer,
  WorkFeaturedArtist,
  WorkGenre,
  WorkPerformer,
  WorkRelationship,
  WorkToProductRelationship,
} from "../../../api/ApplicationClient";
import EntitySelect from "../../../components/inputs/EntitySelect";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import { GuidPattern } from "../../../helpers/RegularExpressionConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import WorkEditPageReleaseTrackToWorkRelationshipsTab from "./WorkEditPageReleaseTrackToWorkRelationshipsTab";
import WorkEditPageWorkRelationshipsTab from "./WorkEditPageWorkRelationshipsTab";
import WorkEditPageWorkToProductRelationshipsTab from "./WorkEditPageWorkToProductRelationshipsTab";
import "antd/dist/antd.min.css";

dayjs.extend(weekday);
dayjs.extend(localeData);

export enum WorkEditPageMode {
  Create,
  Edit,
}

export interface WorkEditPageProps {
  mode: WorkEditPageMode;
}

const WorkEditPage = ({ mode }: WorkEditPageProps) => {
  const navigate = useNavigate();

  const [work, setWork] = useState<Work>();
  const [workFormValues, setWorkFormValues] = useState<Store>({});
  const [workArtistOptions, setWorkArtistOptions] = useState<Artist[]>([]);
  const [workFeaturedArtistOptions, setWorkFeaturedArtistOptions] = useState<Artist[]>([]);
  const [workPerformerOptions, setWorkPerformerOptions] = useState<Artist[]>([]);
  const [workComposerOptions, setWorkComposerOptions] = useState<Artist[]>([]);
  const [workGenreOptions, setWorkGenreOptions] = useState<Genre[]>([]);
  const [releaseTrackToWorkRelationships, setReleaseTrackToWorkRelationships] = useState<ReleaseTrackToWorkRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === WorkEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchWork = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getWork(id)
        .then((work) => {
          work.workRelationships = work.workRelationships.map((workRelationship) => new WorkRelationship({ ...workRelationship, work: work }));

          work.workToProductRelationships = work.workToProductRelationships.map(
            (workToProductRelationship) => new WorkToProductRelationship({ ...workToProductRelationship, work: work })
          );

          work.workArtists = work.workArtists.map((workArtist) => new WorkArtist({ ...workArtist, work: work }));
          work.workFeaturedArtists = work.workFeaturedArtists.map((workFeaturedArtist) => new WorkFeaturedArtist({ ...workFeaturedArtist, work: work }));
          work.workPerformers = work.workPerformers.map((workPerformer) => new WorkPerformer({ ...workPerformer, work: work }));
          work.workComposers = work.workComposers.map((workComposer) => new WorkComposer({ ...workComposer, work: work }));
          work.workGenres = work.workGenres.map((workGenre) => new WorkGenre({ ...workGenre, work: work }));

          setWork(work);
          setWorkFormValues({
            ...work,
            releasedOn: dayjs(work.releasedOn),
            workArtists: work?.workArtists.map((workArtist) => workArtist.artistId) ?? [],
            workFeaturedArtists: work?.workFeaturedArtists.map((workFeaturedArtist) => workFeaturedArtist.artistId) ?? [],
            workPerformers: work?.workPerformers.map((workPerformer) => workPerformer.artistId) ?? [],
            workComposers: work?.workComposers.map((workComposer) => workComposer.artistId) ?? [],
            workGenres: work?.workGenres.map((workGenre) => workGenre.genreId) ?? [],
          });

          applicationClient
            .getArtists(work.workArtists?.map((workArtist) => workArtist.artistId) ?? [])
            .then((workArtists) => {
              setWorkArtistOptions(workArtists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(work.workFeaturedArtists?.map((workFeaturedArtist) => workFeaturedArtist.artistId) ?? [])
            .then((workFeaturedArtists) => {
              setWorkFeaturedArtistOptions(workFeaturedArtists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(work.workPerformers?.map((workPerformer) => workPerformer.artistId) ?? [])
            .then((workPerformers) => {
              setWorkPerformerOptions(workPerformers);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(work.workComposers?.map((workComposer) => workComposer.artistId) ?? [])
            .then((workComposers) => {
              setWorkComposerOptions(workComposers);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getGenres(work.workGenres?.map((workGenre) => workGenre.genreId) ?? [])
            .then((workGenres) => {
              setWorkGenreOptions(workGenres);
            })
            .catch((error) => {
              alert(error);
            });

          applicationClient
            .getReleaseTrackToWorkRelationshipsByWork(id)
            .then((releaseTrackToWorkRelationships) => {
              setReleaseTrackToWorkRelationships(releaseTrackToWorkRelationships);
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

  const onWorkRelationshipsChange = useCallback(
    (workRelationships: WorkRelationship[]) => {
      if (work) {
        setWork(new Work({ ...work, workRelationships: workRelationships }));
      }
    },
    [work]
  );

  const onWorkToProductRelationshipsChange = useCallback(
    (workToProductRelationships: WorkToProductRelationship[]) => {
      if (work) {
        setWork(new Work({ ...work, workToProductRelationships: workToProductRelationships }));
      }
    },
    [work]
  );

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  useEffect(() => {
    form.resetFields();
  }, [workFormValues, form]);

  const onSaveButtonClick = useCallback(() => {
    form.submit();
  }, [form]);

  const onDeleteButtonClick = useCallback(() => {
    if (work) {
      setConfirmDeleteModalOpen(true);
    }
  }, [work]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/works/list");
  }, [navigate]);

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (work) {
        setModalLoading(true);
        applicationClient
          .deleteWork(work.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            navigate("/catalog/works/list");
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [navigate, work, applicationClient]
  );

  const onConfirmDeleteModalCancel = () => {
    setConfirmDeleteModalOpen(false);
  };

  const onFinish = useCallback(
    (workFormValues: Store) => {
      const releasedOn = workFormValues.releasedOn as Dayjs;
      workFormValues.releasedOn = releasedOn.startOf("day").add(releasedOn.utcOffset(), "minute").toDate();

      const workArtistIds = workFormValues.workArtists as string[];
      const workFeaturedArtistIds = workFormValues.workFeaturedArtists as string[];
      const workPerformerIds = workFormValues.workPerformers as string[];
      const workComposerIds = workFormValues.workComposers as string[];
      const workGenreIds = workFormValues.workGenres as string[];
      if (work?.id) {
        workFormValues.workArtists = workArtistIds.map((artistId) => new WorkArtist({ workId: work.id, artistId: artistId }));
        workFormValues.workFeaturedArtists = workFeaturedArtistIds.map((artistId) => new WorkFeaturedArtist({ workId: work.id, artistId: artistId }));
        workFormValues.workPerformers = workPerformerIds.map((artistId) => new WorkPerformer({ workId: work.id, artistId: artistId }));
        workFormValues.workComposers = workComposerIds.map((artistId) => new WorkComposer({ workId: work.id, artistId: artistId }));
        workFormValues.workGenres = workGenreIds.map((genreId) => new WorkGenre({ workId: work.id, genreId: genreId }));
      } else {
        workFormValues.workArtists = [];
        workFormValues.workFeaturedArtists = [];
        workFormValues.workPerformers = [];
        workFormValues.workComposers = [];
        workFormValues.workGenres = [];
      }

      const workModel = new Work({ ...work, ...(workFormValues as IWork) });
      workModel.id = workModel.id?.trim();
      workModel.title = workModel.title?.trim();
      workModel.description = workModel.description?.trim();
      workModel.disambiguationText = workModel.disambiguationText?.trim();
      workModel.internationalStandardMusicalWorkCode = workModel.internationalStandardMusicalWorkCode?.trim();
      if (workModel.id !== undefined && workModel.id.length === 0) {
        workModel.id = EmptyGuidString;
      }
      if (workModel.description !== undefined && workModel.description.length === 0) {
        workModel.description = undefined;
      }
      if (workModel.disambiguationText !== undefined && workModel.disambiguationText.length === 0) {
        workModel.disambiguationText = undefined;
      }
      if (workModel.internationalStandardMusicalWorkCode !== undefined && workModel.internationalStandardMusicalWorkCode.length === 0) {
        workModel.internationalStandardMusicalWorkCode = undefined;
      }

      workModel.workRelationships =
        workModel.workRelationships?.map((workRelationship) => new WorkRelationship({ ...workRelationship, work: undefined, dependentWork: undefined })) ?? [];

      workModel.workToProductRelationships =
        workModel.workToProductRelationships?.map(
          (workToProductRelationship) => new WorkToProductRelationship({ ...workToProductRelationship, work: undefined, product: undefined })
        ) ?? [];

      if (mode === WorkEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createWork(workModel)
          .then((work) => {
            setLoading(false);
            navigate(`/catalog/works/edit?id=${work.id}`);
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      } else {
        setLoading(true);
        applicationClient
          .updateWork(workModel)
          .then(() => {
            Promise.all([applicationClient.updateReleaseTrackToWorkRelationshipsOrder(true, releaseTrackToWorkRelationships)])
              .then(() => {
                setLoading(false);
                fetchWork();
              })
              .catch((error) => {
                setLoading(false);
                alert(error);
              });
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      }
    },
    [mode, navigate, work, releaseTrackToWorkRelationships, applicationClient, fetchWork]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const fetchWorkArtistOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setWorkArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkArtistOptions(undefined), [fetchWorkArtistOptions]);

  const fetchWorkFeaturedArtistOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setWorkFeaturedArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkFeaturedArtistOptions(undefined), [fetchWorkFeaturedArtistOptions]);

  const fetchWorkPerformerOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setWorkPerformerOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkPerformerOptions(undefined), [fetchWorkPerformerOptions]);

  const fetchWorkComposerOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setWorkComposerOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkComposerOptions(undefined), [fetchWorkComposerOptions]);

  const fetchWorkGenreOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedGenres(20, 0, nameFilter, undefined)
        .then((genreResponse) => {
          setWorkGenreOptions(genreResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkGenreOptions(undefined), [fetchWorkGenreOptions]);

  const title = useMemo(() => <Typography.Title level={4}>{mode === WorkEditPageMode.Create ? "Create" : "Edit"} Work</Typography.Title>, [mode]);

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" loading={loading} onClick={onSaveButtonClick}>
          <SaveOutlined />
          Save
        </Button>
        {mode === WorkEditPageMode.Edit && (
          <Button danger type="primary" onClick={onDeleteButtonClick}>
            <DeleteOutlined />
            Delete
          </Button>
        )}
        <Button onClick={onCancelButtonClick}>
          <RollbackOutlined />
          Cancel
        </Button>
      </>
    ),
    [mode, loading, onSaveButtonClick, onDeleteButtonClick, onCancelButtonClick]
  );

  const tabs = useMemo(
    () => [
      {
        key: "workRelationshipsTab",
        label: "Work Relationships",
        children: work && (
          <WorkEditPageWorkRelationshipsTab
            work={work}
            workRelationships={work.workRelationships}
            workRelationshipsLoading={loading}
            setWorkRelationships={onWorkRelationshipsChange}
          />
        ),
      },
      {
        key: "workToProductRelationshipsTab",
        label: "Work-to-Product Relationships",
        children: work && (
          <WorkEditPageWorkToProductRelationshipsTab
            work={work}
            workToProductRelationships={work.workToProductRelationships}
            workToProductRelationshipsLoading={loading}
            setWorkToProductRelationships={onWorkToProductRelationshipsChange}
          />
        ),
      },
      {
        key: "releaseTrackToWorkRelationshipsTab",
        label: "Release-Track-to-Work Relationships",
        children: work && (
          <WorkEditPageReleaseTrackToWorkRelationshipsTab
            releaseTrackToWorkRelationships={releaseTrackToWorkRelationships}
            releaseTrackToWorkRelationshipsLoading={loading}
            setReleaseTrackToWorkRelationships={setReleaseTrackToWorkRelationships}
          />
        ),
      },
    ],
    [work, loading, onWorkRelationshipsChange, releaseTrackToWorkRelationships, onWorkToProductRelationshipsChange]
  );

  const modals = useMemo(
    () => [
      work && (
        <ConfirmDeleteModal
          key="ConfirmDeleteModal"
          open={confirmDeleteModalOpen}
          title="Delete Work"
          message={`Confirm that you want to delete the "${work.title}" work. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
    ],
    [work, confirmDeleteModalOpen, onConfirmDeleteModalOk]
  );

  return (
    <ActionPage title={title} actionButtons={actionButtons} modals={modals}>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form form={form} initialValues={workFormValues} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <Form.Item label="Id" name="id" rules={[{ pattern: GuidPattern, message: "The 'Id' property must be a valid GUID (UUID)." }]}>
              <Input readOnly={mode === WorkEditPageMode.Edit} />
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
              label="ISWC"
              name="internationalStandardMusicalWorkCode"
              rules={[{ max: 32, message: "The 'ISWC' property must be shorter than 32 characters." }]}
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
              initialValue={mode === WorkEditPageMode.Create ? false : undefined}
            >
              <Checkbox>Display Year Only</Checkbox>
            </Form.Item>
            <Form.Item
              label="System Entity"
              name="systemEntity"
              rules={[{ required: true, message: "The 'System Entity' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === WorkEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Enabled"
              name="enabled"
              rules={[{ required: true, message: "The 'Enabled' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === WorkEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Artists" name="workArtists">
                <EntitySelect
                  mode="multiple"
                  options={workArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkArtistOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Featured Artists" name="workFeaturedArtists">
                <EntitySelect
                  mode="multiple"
                  options={workFeaturedArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkFeaturedArtistOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Performers" name="workPerformers">
                <EntitySelect
                  mode="multiple"
                  options={workPerformerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkPerformerOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Composers" name="workComposers">
                <EntitySelect
                  mode="multiple"
                  options={workComposerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkComposerOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Genres" name="workGenres">
                <EntitySelect
                  mode="multiple"
                  options={workGenreOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkGenreOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Created On" name="createdOn">
                <Input readOnly />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Updated On" name="updatedOn">
                <Input readOnly />
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
      <Tabs items={tabs} />
    </ActionPage>
  );
};

export default WorkEditPage;
