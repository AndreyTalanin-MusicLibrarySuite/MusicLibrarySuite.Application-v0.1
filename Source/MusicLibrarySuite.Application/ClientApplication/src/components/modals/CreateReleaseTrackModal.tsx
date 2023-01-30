import { Form, Input, Modal } from "antd";
import { Store } from "antd/lib/form/interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Artist,
  IReleaseTrack,
  ReleaseTrack,
  ReleaseTrackArtist,
  ReleaseTrackComposer,
  ReleaseTrackFeaturedArtist,
  ReleaseTrackPerformer,
} from "../../api/ApplicationClient";
import useApplicationClient from "../../hooks/useApplicationClient";
import EntitySelect from "../inputs/EntitySelect";
import "antd/dist/antd.min.css";

export interface CreateReleaseTrackModalProps {
  edit?: boolean;
  open?: boolean;
  releaseTrack?: ReleaseTrack;
  onOk: (releaseTrack: ReleaseTrack, resetFormFields: () => void) => void;
  onCancel: () => void;
}

const CreateReleaseTrackModal = ({ edit, open, releaseTrack, onOk: onModalOk, onCancel: onModalCancel }: CreateReleaseTrackModalProps) => {
  const [releaseTrackFormValues, setReleaseTrackFormValues] = useState<Store>({});
  const [releaseTrackArtistOptions, setReleaseTrackArtistOptions] = useState<Artist[]>([]);
  const [releaseTrackFeaturedArtistOptions, setReleaseTrackFeaturedArtistOptions] = useState<Artist[]>([]);
  const [releaseTrackPerformerOptions, setReleaseTrackPerformerOptions] = useState<Artist[]>([]);
  const [releaseTrackComposerOptions, setReleaseTrackComposerOptions] = useState<Artist[]>([]);

  const applicationClient = useApplicationClient();

  const [form] = Form.useForm();

  useEffect(() => {
    setReleaseTrackFormValues({
      ...releaseTrack,
      releaseTrackArtists: releaseTrack?.releaseTrackArtists.map((releaseTrackArtist) => releaseTrackArtist.artistId) ?? [],
      releaseTrackFeaturedArtists: releaseTrack?.releaseTrackFeaturedArtists.map((releaseTrackFeaturedArtist) => releaseTrackFeaturedArtist.artistId) ?? [],
      releaseTrackPerformers: releaseTrack?.releaseTrackPerformers.map((releaseTrackPerformer) => releaseTrackPerformer.artistId) ?? [],
      releaseTrackComposers: releaseTrack?.releaseTrackComposers.map((releaseTrackComposer) => releaseTrackComposer.artistId) ?? [],
    });

    applicationClient
      .getArtists(releaseTrack?.releaseTrackArtists?.map((releaseTrackArtist) => releaseTrackArtist.artistId) ?? [])
      .then((releaseTrackArtists) => {
        setReleaseTrackArtistOptions(releaseTrackArtists);
      })
      .catch((error) => {
        alert(error);
      });
    applicationClient
      .getArtists(releaseTrack?.releaseTrackFeaturedArtists?.map((releaseTrackFeaturedArtist) => releaseTrackFeaturedArtist.artistId) ?? [])
      .then((releaseTrackFeaturedArtists) => {
        setReleaseTrackFeaturedArtistOptions(releaseTrackFeaturedArtists);
      })
      .catch((error) => {
        alert(error);
      });
    applicationClient
      .getArtists(releaseTrack?.releaseTrackPerformers?.map((releaseTrackPerformer) => releaseTrackPerformer.artistId) ?? [])
      .then((releaseTrackPerformers) => {
        setReleaseTrackPerformerOptions(releaseTrackPerformers);
      })
      .catch((error) => {
        alert(error);
      });
    applicationClient
      .getArtists(releaseTrack?.releaseTrackComposers?.map((releaseTrackComposer) => releaseTrackComposer.artistId) ?? [])
      .then((releaseTrackComposers) => {
        setReleaseTrackComposerOptions(releaseTrackComposers);
      })
      .catch((error) => {
        alert(error);
      });
  }, [releaseTrack, applicationClient]);

  useEffect(() => {
    form.resetFields();
  }, [releaseTrackFormValues, form]);

  const onOk = () => {
    form.submit();
  };

  const onCancel = () => {
    onModalCancel();
    form.resetFields();
  };

  const onFinish = useCallback(
    (releaseTrackFormValues: Store) => {
      const trackNumber = releaseTrackFormValues.trackNumber as string;
      releaseTrackFormValues.trackNumber = parseInt(trackNumber);
      const mediaNumber = releaseTrackFormValues.mediaNumber as string;
      releaseTrackFormValues.mediaNumber = parseInt(mediaNumber);

      const releaseTrackArtistIds = releaseTrackFormValues.releaseTrackArtists as string[];
      const releaseTrackFeaturedArtistIds = releaseTrackFormValues.releaseTrackFeaturedArtists as string[];
      const releaseTrackPerformerIds = releaseTrackFormValues.releaseTrackPerformers as string[];
      const releaseTrackComposerIds = releaseTrackFormValues.releaseTrackComposers as string[];
      if (releaseTrack) {
        releaseTrackFormValues.releaseTrackArtists = releaseTrackArtistIds.map(
          (artistId) =>
            new ReleaseTrackArtist({
              trackNumber: releaseTrack?.trackNumber,
              mediaNumber: releaseTrack.mediaNumber,
              releaseId: releaseTrack.releaseId,
              artistId: artistId,
            })
        );
        releaseTrackFormValues.releaseTrackFeaturedArtists = releaseTrackFeaturedArtistIds.map(
          (artistId) =>
            new ReleaseTrackFeaturedArtist({
              trackNumber: releaseTrack?.trackNumber,
              mediaNumber: releaseTrack.mediaNumber,
              releaseId: releaseTrack.releaseId,
              artistId: artistId,
            })
        );
        releaseTrackFormValues.releaseTrackPerformers = releaseTrackPerformerIds.map(
          (artistId) =>
            new ReleaseTrackPerformer({
              trackNumber: releaseTrack?.trackNumber,
              mediaNumber: releaseTrack.mediaNumber,
              releaseId: releaseTrack.releaseId,
              artistId: artistId,
            })
        );
        releaseTrackFormValues.releaseTrackComposers = releaseTrackComposerIds.map(
          (artistId) =>
            new ReleaseTrackComposer({
              trackNumber: releaseTrack?.trackNumber,
              mediaNumber: releaseTrack.mediaNumber,
              releaseId: releaseTrack.releaseId,
              artistId: artistId,
            })
        );
      } else {
        releaseTrackFormValues.releaseTrackArtists = [];
        releaseTrackFormValues.releaseTrackFeaturedArtists = [];
        releaseTrackFormValues.releaseTrackPerformers = [];
        releaseTrackFormValues.releaseTrackComposers = [];
      }

      const releaseTrackModel = new ReleaseTrack({ ...releaseTrack, ...(releaseTrackFormValues as IReleaseTrack) });
      releaseTrackModel.title = releaseTrackModel.title?.trim();
      releaseTrackModel.description = releaseTrackModel.description?.trim();
      releaseTrackModel.disambiguationText = releaseTrackModel.disambiguationText?.trim();
      releaseTrackModel.internationalStandardRecordingCode = releaseTrackModel.internationalStandardRecordingCode?.trim();
      if (releaseTrackModel.description !== undefined && releaseTrackModel.description.length === 0) {
        releaseTrackModel.description = undefined;
      }
      if (releaseTrackModel.disambiguationText !== undefined && releaseTrackModel.disambiguationText.length === 0) {
        releaseTrackModel.disambiguationText = undefined;
      }
      if (releaseTrackModel.internationalStandardRecordingCode !== undefined && releaseTrackModel.internationalStandardRecordingCode.length === 0) {
        releaseTrackModel.internationalStandardRecordingCode = undefined;
      }

      onModalOk(releaseTrackModel, () => form.resetFields());
    },
    [releaseTrack, onModalOk, form]
  );

  const onFinishFailed = () => {
    alert("Form validation failed. Please ensure that you have filled all the required fields.");
  };

  const fetchReleaseTrackArtistOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setReleaseTrackArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackArtistOptions(undefined, () => void 0), [fetchReleaseTrackArtistOptions]);

  const fetchReleaseTrackFeaturedArtistOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setReleaseTrackFeaturedArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackFeaturedArtistOptions(undefined, () => void 0), [fetchReleaseTrackFeaturedArtistOptions]);

  const fetchReleaseTrackPerformerOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setReleaseTrackPerformerOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackPerformerOptions(undefined, () => void 0), [fetchReleaseTrackPerformerOptions]);

  const fetchReleaseTrackComposerOptions = useCallback(
    (nameFilter: string | undefined, setLoading: (value: boolean) => void) => {
      applicationClient
        .getPagedArtists(20, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setLoading(false);
          setReleaseTrackComposerOptions(artistResponse.items);
        })
        .catch((error) => {
          setLoading(false);
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackComposerOptions(undefined, () => void 0), [fetchReleaseTrackComposerOptions]);

  const title = useMemo(() => {
    return `${edit ? (releaseTrack ? "Edit" : "Create") : "View"} Release Track`;
  }, [edit, releaseTrack]);

  return (
    <Modal forceRender open={open} title={title} onOk={onOk} onCancel={onCancel}>
      <Form
        form={form}
        initialValues={releaseTrackFormValues}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="Track Number"
          name="trackNumber"
          rules={[
            { required: true, message: "The 'Track Number' property must not be empty." },
            { pattern: new RegExp(/^[0-9]+$/), message: "The 'Track Number' property must be a number." },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="Media Number"
          name="mediaNumber"
          rules={[
            { required: true, message: "The 'Media Number' property must not be empty." },
            { pattern: new RegExp(/^[0-9]+$/), message: "The 'Media Number' property must be a number." },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Title" name="title" rules={[{ required: true, message: "The 'Title' property must not be empty." }]}>
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Disambiguation Text" name="disambiguationText">
          <Input.TextArea readOnly={!edit} />
        </Form.Item>
        <Form.Item label="ISRC" name="internationalStandardRecordingCode">
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Artists" name="releaseTrackArtists">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
            onSearch={fetchReleaseTrackArtistOptions}
          />
        </Form.Item>
        <Form.Item label="Featured Artists" name="releaseTrackFeaturedArtists">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackFeaturedArtistOptions.map((option) => ({ value: option.id, label: option.name }))}
            onSearch={fetchReleaseTrackFeaturedArtistOptions}
          />
        </Form.Item>
        <Form.Item label="Performers" name="releaseTrackPerformers">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackPerformerOptions.map((option) => ({ value: option.id, label: option.name }))}
            onSearch={fetchReleaseTrackPerformerOptions}
          />
        </Form.Item>
        <Form.Item label="Composers" name="releaseTrackComposers">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackComposerOptions.map((option) => ({ value: option.id, label: option.name }))}
            onSearch={fetchReleaseTrackComposerOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateReleaseTrackModal;
