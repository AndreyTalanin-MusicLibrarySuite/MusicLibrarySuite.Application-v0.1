import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Space, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { IRelease, Release } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import useApplicationClient from "../../../hooks/useApplicationClient";
import useQueryStringId from "../../../hooks/useQueryStringId";
import styles from "./ReleaseEditPage.module.css";
import "antd/dist/antd.min.css";

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

  const onCancelButtonClick = () => {
    navigate("/catalog/releases/list");
  };

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

  return (
    <>
      <Space className={styles.pageHeader} direction="horizontal" align="baseline">
        <Typography.Title level={4}>{mode === ReleaseEditPageMode.Create ? "Create" : "Edit"} Release</Typography.Title>
        <Button type="primary" loading={loading} onClick={onSaveButtonClick}>
          <SaveOutlined />
          Save
        </Button>
        {mode === ReleaseEditPageMode.Edit && (
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
      {release && (
        <ConfirmDeleteModal
          open={confirmDeleteModalOpen}
          title="Delete Release"
          message={`Confirm that you want to delete the "${release.title}" release. This operation can not be undone.`}
          onOk={onConfirmDeleteModalOk}
          onCancel={onConfirmDeleteModalCancel}
        />
      )}
    </>
  );
};

export default ReleaseEditPage;
