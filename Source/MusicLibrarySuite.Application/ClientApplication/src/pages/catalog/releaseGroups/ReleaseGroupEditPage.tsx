import { Button, Checkbox, Col, Form, Input, Row, Space, Tabs, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { IReleaseGroup, ReleaseGroup, ReleaseGroupRelationship, ReleaseToReleaseGroupRelationship } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import ReleaseGroupEditPageReleaseGroupRelationshipsTab from "./ReleaseGroupEditPageReleaseGroupRelationshipsTab";
import ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTab from "./ReleaseGroupEditPageReleaseToReleaseGroupRelationshipsTab";
import styles from "./ReleaseGroupEditPage.module.css";
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
  const [releaseGroupFormValues, setReleaseGroupFormValues] = useState<Store>({});
  const [releaseToReleaseGroupRelationships, setReleaseToReleaseGroupRelationships] = useState<ReleaseToReleaseGroupRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);

  const [id] = useQueryStringId(mode === ReleaseGroupEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchReleaseGroup = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getReleaseGroup(id)
        .then((releaseGroup) => {
          releaseGroup.releaseGroupRelationships = releaseGroup.releaseGroupRelationships.map(
            (releaseGroupRelationship) => new ReleaseGroupRelationship({ ...releaseGroupRelationship, releaseGroup: releaseGroup })
          );

          setReleaseGroup(releaseGroup);
          setReleaseGroupFormValues(releaseGroup);

          applicationClient.getReleaseToReleaseGroupRelationshipsByReleaseGroup(id).then((releaseToReleaseGroupRelationships) => {
            setReleaseToReleaseGroupRelationships(releaseToReleaseGroupRelationships);
          });
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

  const onReleaseGroupRelationshipsChange = useCallback(
    (releaseGroupRelationships: ReleaseGroupRelationship[]) => {
      if (releaseGroup) {
        setReleaseGroup(new ReleaseGroup({ ...releaseGroup, releaseGroupRelationships: releaseGroupRelationships }));
      }
    },
    [releaseGroup]
  );

  useEffect(() => {
    fetchReleaseGroup();
  }, [fetchReleaseGroup]);

  useEffect(() => {
    form.resetFields();
  }, [releaseGroupFormValues, form]);

  const onSaveButtonClick = () => {
    form.submit();
  };

  const onDeleteButtonClick = useCallback(() => {
    if (releaseGroup) {
      setConfirmDeleteModalOpen(true);
    }
  }, [releaseGroup]);

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

  const onCancelButtonClick = () => {
    navigate("/catalog/releaseGroups/list");
  };

  const onFinish = useCallback(
    (releaseGroupFormValues: Store) => {
      const releaseGroupModel = new ReleaseGroup({ ...releaseGroup, ...(releaseGroupFormValues as IReleaseGroup) });
      releaseGroupModel.id = releaseGroupModel.id?.trim();
      releaseGroupModel.title = releaseGroupModel.title?.trim();
      releaseGroupModel.description = releaseGroupModel.description?.trim();
      releaseGroupModel.disambiguationText = releaseGroupModel.disambiguationText?.trim();
      if (releaseGroupModel.id !== undefined && releaseGroupModel.id.length === 0) {
        releaseGroupModel.id = EmptyGuidString;
      }
      if (releaseGroupModel.description !== undefined && releaseGroupModel.description.length === 0) {
        releaseGroupModel.description = undefined;
      }
      if (releaseGroupModel.disambiguationText !== undefined && releaseGroupModel.disambiguationText.length === 0) {
        releaseGroupModel.disambiguationText = undefined;
      }

      releaseGroupModel.releaseGroupRelationships =
        releaseGroupModel.releaseGroupRelationships?.map(
          (releaseGroupRelationship) => new ReleaseGroupRelationship({ ...releaseGroupRelationship, releaseGroup: undefined, dependentReleaseGroup: undefined })
        ) ?? [];

      if (mode === ReleaseGroupEditPageMode.Create) {
        setLoading(true);
        applicationClient
          .createReleaseGroup(releaseGroupModel)
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
          .updateReleaseGroup(releaseGroupModel)
          .then(() => {
            Promise.all([applicationClient.updateReleaseToReleaseGroupRelationshipsOrder(true, releaseToReleaseGroupRelationships)])
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

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

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
    [releaseGroup, loading, releaseToReleaseGroupRelationships, onReleaseGroupRelationshipsChange]
  );

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>{mode === ReleaseGroupEditPageMode.Create ? "Create" : "Edit"} Release Group</Typography.Title>
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
      </Space>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form
            form={form}
            initialValues={releaseGroupFormValues}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item label="Id" name="id">
              <Input readOnly={mode === ReleaseGroupEditPageMode.Edit} />
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
      {releaseGroup && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Release Group"
          message={`Confirm that you want to delete the "${releaseGroup.title}" release group. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      )}
      {releaseGroup && <Tabs items={tabs} />}
    </>
  );
};

export default ReleaseGroupEditPage;
