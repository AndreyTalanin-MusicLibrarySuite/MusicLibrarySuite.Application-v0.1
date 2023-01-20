import { Button, Card, Checkbox, Col, Collapse, DatePicker, Divider, Form, Input, Row, Space, Tooltip, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import {
  DeleteOutlined,
  EditOutlined,
  FieldNumberOutlined,
  FolderAddOutlined,
  QuestionCircleOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { IRelease, Release, ReleaseMedia } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import CreateReleaseMediaModal from "../../../components/modals/CreateReleaseMediaModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import { formatReleaseMediaNumber, getReleaseMediaKey } from "../../../helpers/ReleaseMediaHelpers";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState<boolean>(false);
  const [createReleaseMediaModalOpen, setCreateReleaseMediaModalOpen] = useState<boolean>(false);
  const [releaseMediaToEdit, setReleaseMediaToEdit] = useState<ReleaseMedia>();

  const [id] = useQueryStringId(mode === ReleaseEditPageMode.Edit);
  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  const fetchRelease = useCallback(() => {
    if (id !== undefined) {
      applicationClient
        .getRelease(id)
        .then((release) => {
          setRelease(release);
          setReleaseFormValues({ ...release, releasedOn: dayjs(release.releasedOn) });
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

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

  const onCreateReleaseMediaButtonClick = useCallback(() => {
    if (release) {
      setReleaseMediaToEdit(undefined);
      setCreateReleaseMediaModalOpen(true);
    }
  }, [release]);

  const onRenumberReleaseContentButtonClick = useCallback(() => {
    if (release) {
      const orderedReleaseMediaCollection = [...release.releaseMediaCollection].sort(
        (item, otherItem) => (item.mediaNumber ?? 0) - (otherItem.mediaNumber ?? 0)
      );
      setRelease(
        new Release({
          ...release,
          releaseMediaCollection: orderedReleaseMediaCollection.map(
            (releaseMedia, index) =>
              new ReleaseMedia({
                ...releaseMedia,
                mediaNumber: index + 1,
              })
          ),
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

  const onFinish = useCallback(
    (releaseFormValues: Store) => {
      const releasedOn = releaseFormValues.releasedOn as Dayjs;
      releaseFormValues.releasedOn = releasedOn.startOf("day").add(releasedOn.utcOffset(), "minute").toDate();

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
                <Button onClick={onCreateReleaseMediaButtonClick}>
                  <FolderAddOutlined /> Create Media
                </Button>
                <Button onClick={onRenumberReleaseContentButtonClick}>
                  <FieldNumberOutlined /> Reorder & Renumber Content
                </Button>
              </Space>
            }
          >
            <Paragraph>The current release contains {release.releaseMediaCollection.length ?? 0} release media.</Paragraph>
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
            </Card>
          ))}
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
    </>
  );
};

export default ReleaseEditPage;
