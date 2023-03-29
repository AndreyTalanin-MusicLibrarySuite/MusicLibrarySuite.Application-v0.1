import { Button, Checkbox, Col, Form, Input, Row, Tabs, Typography } from "antd";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ReleaseGroup, ReleaseGroupRelationship, ReleaseToReleaseGroupRelationship } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import ActionPage from "../../../components/pages/ActionPage";
import { mapReleaseGroupFormInitialValues, mergeReleaseGroupFormValues } from "../../../entities/forms/ReleaseGroupFormValues";
import { GuidPattern } from "../../../helpers/RegularExpressionConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useEntityForm from "../../../hooks/useEntityForm";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ReleaseGroupEditPageReleaseGroupRelationshipsTab from "./ReleaseGroupEditPageReleaseGroupRelationshipsTab";
import ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTab from "./ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTab";
import "antd/dist/antd.min.css";

export enum ReleaseGroupEditPageMode {
  Create,
  Edit,
}

export interface ReleaseGroupEditPageProps {
  mode: ReleaseGroupEditPageMode;
}

const ReleaseGroupEditPage = ({ mode }: ReleaseGroupEditPageProps) => {
  const navigate = useNavigate();

  const [releaseGroup, setReleaseGroup] = useState<ReleaseGroup>();
  const [releaseGroupInitialValues, setReleaseGroupInitialValues] = useState<ReleaseGroup>();
  const [releaseToReleaseGroupRelationships, setReleaseToReleaseGroupRelationships] = useState<ReleaseToReleaseGroupRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === ReleaseGroupEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const fetchReleaseGroup = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getReleaseGroup(id)
        .then((releaseGroup) => {
          releaseGroup.releaseGroupRelationships.forEach((releaseGroupRelationship) => (releaseGroupRelationship.releaseGroup = releaseGroup));

          setReleaseGroup(releaseGroup);
          setReleaseGroupInitialValues(releaseGroup);

          applicationClient
            .getReleaseToReleaseGroupRelationshipsByReleaseGroup(id)
            .then((releaseToReleaseGroupRelationships) => {
              setReleaseToReleaseGroupRelationships(releaseToReleaseGroupRelationships);
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
    fetchReleaseGroup();
  }, [fetchReleaseGroup]);

  const saveReleaseGroup = useCallback(
    (releaseGroupValues: ReleaseGroup) => {
      releaseGroupValues.releaseGroupRelationships =
        releaseGroup?.releaseGroupRelationships?.map(
          (releaseGroupRelationship) =>
            new ReleaseGroupRelationship({
              ...releaseGroupRelationship,
              releaseGroup: undefined,
              dependentReleaseGroup: undefined,
            })
        ) ?? [];

      if (mode === ReleaseGroupEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createReleaseGroup(releaseGroupValues)
          .then((releaseGroup) => {
            setLoading(false);
            navigate(`/catalog/releaseGroups/edit?id=${releaseGroup.id}`);
          })
          .catch((error) => {
            setLoading(false);
            alert(error);
          });
      } else {
        setLoading(true);
        applicationClient
          .updateReleaseGroup(releaseGroupValues)
          .then(() => {
            const releaseToReleaseGroupRelationshipModels = releaseToReleaseGroupRelationships.map(
              (releaseToReleaseGroupRelationship) =>
                new ReleaseToReleaseGroupRelationship({
                  ...releaseToReleaseGroupRelationship,
                  release: undefined,
                  releaseGroup: undefined,
                })
            );

            Promise.all([applicationClient.updateReleaseToReleaseGroupRelationshipsOrder(true, releaseToReleaseGroupRelationshipModels)])
              .then(() => {
                setLoading(false);
                fetchReleaseGroup();
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
    [mode, navigate, releaseGroup, releaseToReleaseGroupRelationships, applicationClient, fetchReleaseGroup]
  );

  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(releaseGroupInitialValues, mapReleaseGroupFormInitialValues, mergeReleaseGroupFormValues, saveReleaseGroup),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [releaseGroupInitialValues, form]);

  const onReleaseGroupRelationshipsChange = useCallback(
    (releaseGroupRelationships: ReleaseGroupRelationship[]) => {
      if (releaseGroup) {
        setReleaseGroup(new ReleaseGroup({ ...releaseGroup, releaseGroupRelationships: releaseGroupRelationships }));
      }
    },
    [releaseGroup]
  );

  const onSaveButtonClick = useCallback(() => {
    form.submit();
  }, [form]);

  const onDeleteButtonClick = useCallback(() => {
    if (releaseGroup) {
      setConfirmDeleteModalOpen(true);
    }
  }, [releaseGroup]);

  const onCancelButtonClick = useCallback(() => {
    navigate("/catalog/releaseGroups/list");
  }, [navigate]);

  const onConfirmDeleteModalOk = useCallback(
    (setModalLoading: (value: boolean) => void) => {
      if (releaseGroup) {
        setModalLoading(true);
        applicationClient
          .deleteReleaseGroup(releaseGroup.id)
          .then(() => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            navigate("/catalog/releaseGroups/list");
          })
          .catch((error) => {
            setModalLoading(false);
            setConfirmDeleteModalOpen(false);
            alert(error);
          });
      }
    },
    [navigate, releaseGroup, applicationClient]
  );

  const onConfirmDeleteModalCancel = () => {
    setConfirmDeleteModalOpen(false);
  };

  const title = useMemo(
    () => <Typography.Title level={4}>{mode === ReleaseGroupEditPageMode.Create ? "Create" : "Edit"} Release Group</Typography.Title>,
    [mode]
  );

  const actionButtons = useMemo(
    () => (
      <>
        <Button type="primary" loading={loading} onClick={onSaveButtonClick}>
          <SaveOutlined />
          Save
        </Button>
        {mode === ReleaseGroupEditPageMode.Edit && (
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
        key: "releaseGroupRelationshipsTab",
        label: "Release Group Relationships",
        children: releaseGroup && (
          <ReleaseGroupEditPageReleaseGroupRelationshipsTab
            releaseGroup={releaseGroup}
            releaseGroupRelationships={releaseGroup.releaseGroupRelationships}
            releaseGroupRelationshipsLoading={loading}
            setReleaseGroupRelationships={onReleaseGroupRelationshipsChange}
          />
        ),
      },
      {
        key: "releaseToReleaseGroupRelationshipsTab",
        label: "Release-to-Release-Group Relationships",
        children: releaseGroup && (
          <ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTab
            releaseToReleaseGroupRelationships={releaseToReleaseGroupRelationships}
            releaseToReleaseGroupRelationshipsLoading={loading}
            setReleaseToReleaseGroupRelationships={setReleaseToReleaseGroupRelationships}
          />
        ),
      },
    ],
    [releaseGroup, releaseToReleaseGroupRelationships, loading, onReleaseGroupRelationshipsChange]
  );

  const modals = useMemo(
    () => [
      releaseGroup && (
        <ConfirmDeleteModal
          key="ConfirmDeleteModal"
          open={confirmDeleteModalOpen}
          title="Delete Release Group"
          message={`Confirm that you want to delete the "${releaseGroup.title}" release group. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      ),
    ],
    [releaseGroup, confirmDeleteModalOpen, onConfirmDeleteModalOk]
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
              <Input readOnly={mode === ReleaseGroupEditPageMode.Edit} />
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
              label="Enabled"
              name="enabled"
              rules={[{ required: true, message: "The 'Enabled' property must not be empty." }]}
              valuePropName="checked"
              initialValue={mode === ReleaseGroupEditPageMode.Create ? false : undefined}
            >
              <Checkbox />
            </Form.Item>
            {mode === ReleaseGroupEditPageMode.Edit && (
              <Form.Item label="Created On" name="createdOn">
                <Input readOnly />
              </Form.Item>
            )}
            {mode === ReleaseGroupEditPageMode.Edit && (
              <Form.Item label="Updated On" name="updatedOn">
                <Input readOnly />
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
      {mode === ReleaseGroupEditPageMode.Edit && <Tabs items={tabs} />}
    </ActionPage>
  );
};

export default ReleaseGroupEditPage;
