import { Form, Input, Modal } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Artist, Genre, ReleaseTrack } from "../../api/ApplicationClient";
import {
  DefaultPageSize,
  MaxReleaseMediaNumber,
  MaxReleaseTrackNumber,
  MinReleaseMediaNumber,
  MinReleaseTrackNumber,
} from "../../constants/applicationConstants";
import { mapReleaseTrackModalFormInitialValues, mergeReleaseTrackModalFormValues } from "../../entities/forms/ReleaseTrackModalFormValues";
import { validateReleaseMediaNumber } from "../../helpers/releaseMediaHelpers";
import { validateReleaseTrackNumber } from "../../helpers/releaseTrackHelpers";
import useApplicationClient from "../../hooks/useApplicationClient";
import useEntityForm from "../../hooks/useEntityForm";
import EntitySelect from "../inputs/EntitySelect";
import "antd/dist/antd.min.css";

export interface EditReleaseTrackModalProps {
  edit?: boolean;
  open?: boolean;
  releaseTrack?: ReleaseTrack;
  onOk: (releaseTrack: ReleaseTrack, resetFormFields: () => void) => void;
  onCancel: () => void;
}

const EditReleaseTrackModal = ({ edit, open, releaseTrack, onOk: onModalOk, onCancel: onModalCancel }: EditReleaseTrackModalProps) => {
  const [releaseTrackArtistOptions, setReleaseTrackArtistOptions] = useState<Artist[]>([]);
  const [releaseTrackFeaturedArtistOptions, setReleaseTrackFeaturedArtistOptions] = useState<Artist[]>([]);
  const [releaseTrackPerformerOptions, setReleaseTrackPerformerOptions] = useState<Artist[]>([]);
  const [releaseTrackComposerOptions, setReleaseTrackComposerOptions] = useState<Artist[]>([]);
  const [releaseTrackGenreOptions, setReleaseTrackGenreOptions] = useState<Genre[]>([]);

  const applicationClient = useApplicationClient();

  const fetchInitialOptions = useCallback(() => {
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
    applicationClient
      .getGenres(releaseTrack?.releaseTrackGenres?.map((releaseTrackGenre) => releaseTrackGenre.genreId) ?? [])
      .then((releaseTrackGenres) => {
        setReleaseTrackGenreOptions(releaseTrackGenres);
      })
      .catch((error) => {
        alert(error);
      });
  }, [releaseTrack, applicationClient]);

  const mapReleaseTrackModalFormInitialValuesProxy = useCallback(
    (initialValues?: ReleaseTrack) => {
      fetchInitialOptions();
      return mapReleaseTrackModalFormInitialValues(initialValues);
    },
    [fetchInitialOptions]
  );

  const [form, initialFormValues, onFormFinish, onFormFinishFailed] = [
    ...useEntityForm(releaseTrack, mapReleaseTrackModalFormInitialValuesProxy, mergeReleaseTrackModalFormValues, onModalOk),
    () => {
      alert("Form validation failed. Please ensure that you have filled all the required fields.");
    },
  ];

  useEffect(() => {
    form.resetFields();
  }, [releaseTrack, form]);

  const onOk = useCallback(() => {
    form.submit();
  }, [form]);

  const onCancel = useCallback(() => {
    onModalCancel();
    form.resetFields();
  }, [onModalCancel, form]);

  const fetchReleaseTrackArtistOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setReleaseTrackArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackArtistOptions(undefined), [fetchReleaseTrackArtistOptions]);

  const fetchReleaseTrackFeaturedArtistOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setReleaseTrackFeaturedArtistOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackFeaturedArtistOptions(undefined), [fetchReleaseTrackFeaturedArtistOptions]);

  const fetchReleaseTrackPerformerOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setReleaseTrackPerformerOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackPerformerOptions(undefined), [fetchReleaseTrackPerformerOptions]);

  const fetchReleaseTrackComposerOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedArtists(DefaultPageSize, 0, nameFilter, undefined)
        .then((artistResponse) => {
          setReleaseTrackComposerOptions(artistResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackComposerOptions(undefined), [fetchReleaseTrackComposerOptions]);

  const fetchReleaseTrackGenreOptions = useCallback(
    (nameFilter: string | undefined) => {
      applicationClient
        .getPagedGenres(DefaultPageSize, 0, nameFilter, undefined)
        .then((genreResponse) => {
          setReleaseTrackGenreOptions(genreResponse.items);
        })
        .catch((error) => {
          alert(error);
        });
    },
    [applicationClient]
  );

  useEffect(() => fetchReleaseTrackGenreOptions(undefined), [fetchReleaseTrackGenreOptions]);

  const title = useMemo(() => {
    return `${edit ? (releaseTrack ? "Edit" : "Create") : "View"} Release Track`;
  }, [edit, releaseTrack]);

  return (
    <Modal forceRender open={open} title={title} onOk={onOk} onCancel={onCancel}>
      <Form
        form={form}
        initialValues={initialFormValues}
        onFinish={onFormFinish}
        onFinishFailed={onFormFinishFailed}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="Track Number"
          name="trackNumber"
          rules={[
            {
              required: true,
              message: "The 'Track Number' property must not be empty.",
            },
            {
              validator: (_, value: string) => validateReleaseTrackNumber(value),
              message: `The 'Track Number' property must be a number in range [${MinReleaseTrackNumber} - ${MaxReleaseTrackNumber - 1}].`,
            },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="Media Number"
          name="mediaNumber"
          rules={[
            {
              required: true,
              message: "The 'Media Number' property must not be empty.",
            },
            {
              validator: (_, value: string) => validateReleaseMediaNumber(value),
              message: `The 'Media Number' property must be a number in range [${MinReleaseMediaNumber} - ${MaxReleaseMediaNumber - 1}].`,
            },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: "The 'Title' property must not be empty." },
            { max: 256, message: "The 'Title' property must be shorter than 256 characters." },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              max: 2048,
              message: "The 'Description' property must be shorter than 2048 characters.",
            },
          ]}
        >
          <Input.TextArea readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="Disambiguation Text"
          name="disambiguationText"
          rules={[
            {
              max: 2048,
              message: "The 'Disambiguation Text' property must be shorter than 2048 characters.",
            },
          ]}
        >
          <Input.TextArea readOnly={!edit} />
        </Form.Item>
        <Form.Item
          label="ISRC"
          name="internationalStandardRecordingCode"
          rules={[
            {
              max: 64,
              message: "The 'ISRC' property must be shorter than 32 characters.",
            },
          ]}
        >
          <Input readOnly={!edit} />
        </Form.Item>
        <Form.Item label="Artists" name="releaseTrackArtistIds">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackArtistOptions.map((artist) => ({ value: artist.id, label: artist.name }))}
            onSearch={fetchReleaseTrackArtistOptions}
          />
        </Form.Item>
        <Form.Item label="Featured Artists" name="releaseTrackFeaturedArtistIds">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackFeaturedArtistOptions.map((artist) => ({ value: artist.id, label: artist.name }))}
            onSearch={fetchReleaseTrackFeaturedArtistOptions}
          />
        </Form.Item>
        <Form.Item label="Performers" name="releaseTrackPerformerIds">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackPerformerOptions.map((artist) => ({ value: artist.id, label: artist.name }))}
            onSearch={fetchReleaseTrackPerformerOptions}
          />
        </Form.Item>
        <Form.Item label="Composers" name="releaseTrackComposerIds">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackComposerOptions.map((artist) => ({ value: artist.id, label: artist.name }))}
            onSearch={fetchReleaseTrackComposerOptions}
          />
        </Form.Item>
        <Form.Item label="Genres" name="releaseTrackGenreIds">
          <EntitySelect
            mode="multiple"
            readOnly={!edit}
            options={releaseTrackGenreOptions.map((genre) => ({ value: genre.id, label: genre.name }))}
            onSearch={fetchReleaseTrackGenreOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditReleaseTrackModal;
