import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Tabs, Typography } from "antd";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Artist, Genre, ReleaseTrackToWorkRelationship, Work, WorkRelationship, WorkToProductRelationship } from "../../../api/ApplicationClient";
import EntitySelect from "../../../components/inputs/EntitySelect";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { DefaultPageSize } from "../../../constants/applicationConstants";
import { GuidPattern } from "../../../constants/regularExpressionConstants";
import { mapWorkFormInitialValues, mergeWorkFormValues } from "../../../entities/forms/WorkFormValues";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useEntityForm from "../../../hooks/useEntityForm";
import useQueryStringId from "../../../hooks/useQueryStringId";
import WorkEditPageReleaseTrackToWorkRelationshipsTab from "./WorkEditPageReleaseTrackToWorkRelationshipsTab";
import WorkEditPageWorkRelationshipsTab from "./WorkEditPageWorkRelationshipsTab";
import WorkEditPageWorkToProductRelationshipsTab from "./WorkEditPageWorkToProductRelationshipsTab";
import "antd/dist/antd.min.css";

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
  const [workInitialValues, setWorkInitialValues] = useState<Work>();
  const [releaseTrackToWorkRelationships, setReleaseTrackToWorkRelationships] = useState<ReleaseTrackToWorkRelationship[]>([]);
  const [workArtistOptions, setWorkArtistOptions] = useState<Artist[]>([]);
  const [workFeaturedArtistOptions, setWorkFeaturedArtistOptions] = useState<Artist[]>([]);
  const [workPerformerOptions, setWorkPerformerOptions] = useState<Artist[]>([]);
  const [workComposerOptions, setWorkComposerOptions] = useState<Artist[]>([]);
  const [workGenreOptions, setWorkGenreOptions] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === WorkEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const fetchWork = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getWork(id)
        .then((work) => {
          work.workRelationships.forEach((workRelationship) => (workRelationship.work = work));
          work.workToProductRelationships.forEach((workToProductRelationship) => (workToProductRelationship.work = work));

          setWork(work);
          setWorkInitialValues(work);

          applicationClient
            .getReleaseTrackToWorkRelationshipsByWork(id)
            .then((releaseTrackToWorkRelationships) => {
              setReleaseTrackToWorkRelationships(releaseTrackToWorkRelationships);
            })
            .catch((error) => {
              alert(error);
            });

          applicationClient
            .getArtists(work.workArtists?.map((workArtist) => workArtist.artistId) ?? [])
            .then((artists) => {
              setWorkArtistOptions(artists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(work.workFeaturedArtists?.map((workFeaturedArtist) => workFeaturedArtist.artistId) ?? [])
            .then((artists) => {
              setWorkFeaturedArtistOptions(artists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(work.workPerformers?.map((workPerformer) => workPerformer.artistId) ?? [])
            .then((artists) => {
              setWorkPerformerOptions(artists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getArtists(work.workComposers?.map((workComposer) => workComposer.artistId) ?? [])
            .then((artists) => {
              setWorkComposerOptions(artists);
            })
            .catch((error) => {
              alert(error);
            });
          applicationClient
            .getGenres(work.workGenres?.map((workGenre) => workGenre.genreId) ?? [])
            .then((genres) => {
              setWorkGenreOptions(genres);
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
    fetchWork();
  }, [fetchWork]);

  const saveWork = useCallback(
    (workValues: Work) => {
      workValues.workRelationships =
        work?.workRelationships?.map(
          (workRelationship) =>
            new WorkRelationship({
              ...workRelationship,
              work: undefined,
              dependentWork: undefined,
            })
        ) ?? [];
      workValues.workToProductRelationships =
        work?.workToProductRelationships?.map(
          (workToProductRelationship) =>
            new WorkToProductRelationship({
              ...workToProductRelationship,
              work: undefined,
              product: undefined,
            })
        ) ?? [];

      if (mode === WorkEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createWork(workValues)
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
          .updateWork(workValues)
          .then(() => {
            const releaseTrackToWorkRelationshipModels = releaseTrackToWorkRelationships.map(
              (releaseTrackToWorkRelationship) =>
                new ReleaseTrackToWorkRelationship({
                  ...releaseTrackToWorkRelationship,
                  releaseTrack: undefined,
                  work: undefined,
                })
            );

            Promise.all([applicationClient.updateReleaseTrackToWorkRelationshipsOrder(true, releaseTrackToWorkRelationshipModels)])
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

  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(workInitialValues, mapWorkFormInitialValues, mergeWorkFormValues, saveWork),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [workInitialValues, form]);

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

  const fetchWorkArtistOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
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
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
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
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
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
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
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
        .getPagedGenres(DefaultPageSize, 0, nameFilter, undefined)
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
    [work, releaseTrackToWorkRelationships, loading, onWorkRelationshipsChange, onWorkToProductRelationshipsChange]
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
          <Form
            form={form}
            initialValues={initialFormValues}
            onFinish={onFormFinish}
            onFinishFailed={onFormFinishFailed}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
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
              <Form.Item label="Artists" name="workArtistIds">
                <EntitySelect
                  mode="multiple"
                  options={workArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkArtistOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Featured Artists" name="workFeaturedArtistIds">
                <EntitySelect
                  mode="multiple"
                  options={workFeaturedArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkFeaturedArtistOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Performers" name="workPerformerIds">
                <EntitySelect
                  mode="multiple"
                  options={workPerformerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkPerformerOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Composers" name="workComposerIds">
                <EntitySelect
                  mode="multiple"
                  options={workComposerOptions.map((option) => ({ value: option.id, label: option.name }))}
                  onSearch={fetchWorkComposerOptions}
                />
              </Form.Item>
            )}
            {mode === WorkEditPageMode.Edit && (
              <Form.Item label="Genres" name="workGenreIds">
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
      {mode === WorkEditPageMode.Edit && <Tabs items={tabs} />}
    </ActionPage>
  );
};

export default WorkEditPage;
