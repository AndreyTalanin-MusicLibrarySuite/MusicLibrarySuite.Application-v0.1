import { Select, Spin } from "antd";
import { useState } from "react";
import "antd/dist/antd.min.css";

export interface EntitySelectProps {
  mode?: "multiple" | "tags";
  value?: string[];
  defaultValue?: string[];
  options: { value: string; label: string }[];
  onChange?: (value: string[]) => void;
  onSearch: (value: string | undefined, setLoading: (value: boolean) => void) => void;
}

const EntitySelect = ({ mode, value, defaultValue, options, onChange, onSearch }: EntitySelectProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <Select
      showSearch
      value={value}
      defaultValue={defaultValue}
      placeholder="Search"
      options={options}
      filterOption={false}
      notFoundContent={loading ? <Spin size="small" /> : null}
      mode={mode}
      onChange={onChange}
      onSearch={(value) => {
        setLoading(true);
        onSearch(value, setLoading);
      }}
    />
  );
};

export default EntitySelect;
