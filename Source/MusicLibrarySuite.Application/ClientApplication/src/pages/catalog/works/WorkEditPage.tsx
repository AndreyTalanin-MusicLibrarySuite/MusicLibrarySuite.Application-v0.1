import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Space, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import { DeleteOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { IWork, Work } from "../../../api/ApplicationClient";
import ConfirmDeleteModal from "../../../components/modals/ConfirmDeleteModal";
import { EmptyGuidString } from "../../../helpers/ApplicationConstants";
import useQueryStringId from "../../../hooks/useQueryStringId";
import useApplicationClient from "../../../hooks/useApplicationClient";
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
          setWork(work);
          setWorkFormValues({ ...work, releasedOn: dayjs(work.releasedOn) });
        })
        .catch((error) => {
          alert(error);
        });
    }
  }, [id, applicationClient]);

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
    (workValues: Store) => {
      const releasedOn: Dayjs = workValues.releasedOn as Dayjs;
      workValues.releasedOn = releasedOn.startOf("day").add(releasedOn.utcOffset(), "minute").toDate();

      const workModel = new Work({ ...work, ...(workValues as IWork) });
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
          <Form form={form} initialValues={workFormValues} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={onFinish} onFinishFailed={onFinishFailed}>
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
    </>
  );
};

export default WorkEditPage;
