import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Space, Tabs, Typography } from "antd";
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
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import WorkEditPageWorkRelationshipsTab from "./WorkEditPageWorkRelationshipsTab";
import WorkEditPageWorkToProductRelationshipsTab from "./WorkEditPageWorkToProductRelationshipsTab";
import styles from "./WorkEditPage.module.css";
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

  const onSaveButtonClick = () => {
    form.submit();
  };

  const onDeleteButtonClick = useCallback(() => {
    if (work) {
      setConfirmDeleteModalOpen(true);
    }
  }, [work]);

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

  const onCancelButtonClick = () => {
    navigate("/catalog/works/list");
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
        workFormValues.workGenres = workGenreIds.map((genreId) => new WorkGenre({ workId: work.id, genreId: genreId, order: 0 }));
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
            setLoading(false);
            fetchWork();
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      }
    },
    [mode, navigate, work, applicationClient, fetchWork]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const fetchWorkArtistOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setWorkArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkArtistOptions(undefined, () => void 0), [fetchWorkArtistOptions]);

  const fetchWorkFeaturedArtistOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setWorkFeaturedArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkFeaturedArtistOptions(undefined, () => void 0), [fetchWorkFeaturedArtistOptions]);

  const fetchWorkPerformerOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setWorkPerformerOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkPerformerOptions(undefined, () => void 0), [fetchWorkPerformerOptions]);

  const fetchWorkComposerOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setWorkComposerOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkComposerOptions(undefined, () => void 0), [fetchWorkComposerOptions]);

  const fetchWorkGenreOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedGenres(20, 0, nameFilter, undefined)
        .then((genreResponse) => {
          setLoading(false);
          setWorkGenreOptions(genreResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchWorkGenreOptions(undefined, () => void 0), [fetchWorkGenreOptions]);

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
    ],
    [work, loading, onWorkRelationshipsChange, onWorkToProductRelationshipsChange]
  );

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>{mode === WorkEditPageMode.Create ? "Create" : "Edit"} Work</Typography.Title>
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
      </Space>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form form={form} initialValues={workFormValues} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <Form.Item label="Id" name="id">
              <Input readOnly={mode === WorkEditPageMode.Edit} />
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
            <Form.Item label="ISWC" name="internationalStandardMusicalWorkCode">
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
              <Form.Item label="Work Artists" name="workArtists">
                <EntitySelect
                  mode="multiple"
                  options={workArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkArtistOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Work Featured Artists" name="workFeaturedArtists">
                <EntitySelect
                  mode="multiple"
                  options={workFeaturedArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkFeaturedArtistOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Work Performers" name="workPerformers">
                <EntitySelect
                  mode="multiple"
                  options={workPerformerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkPerformerOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Work Composers" name="workComposers">
                <EntitySelect
                  mode="multiple"
                  options={workComposerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkComposerOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Work Genres" name="workGenres">
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
      {work && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Work"
          message={`Confirm that you want to delete the "${work.title}" work. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      )}
      {work && <Tabs items={tabs} />}
    </>
  );
};

export default WorkEditPage;
