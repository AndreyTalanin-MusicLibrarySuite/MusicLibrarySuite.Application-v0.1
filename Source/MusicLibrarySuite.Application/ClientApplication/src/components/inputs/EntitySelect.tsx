import { Select, Spin } from "antd";
import { useState } from "react";
import "antd/dist/antd.min.css";

export interface EntitySelectProps {
  mode?: "multiple" | "tags";
  value?: string[];
  defaultValue?: string[];
  options: { value: string; label: string }[];
  readOnly?: boolean;
  onChange?: (value: string[]) => void;
  onSearch: (value: string | undefined, setLoading: (value: boolean) => void) => void;
}

const EntitySelect = ({ mode, value, defaultValue, options, readOnly, onChange, onSearch }: EntitySelectProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <Select
      showSearch
      mode={mode}
      value={value}
      defaultValue={defaultValue}
      placeholder="Search"
      options={options}
      filterOption={false}
      notFoundContent={loading ? <Spin size="small" /> : null}
      style={readOnly ? { pointerEvents: "none" } : undefined}
      open={readOnly ? false : undefined}
      allowClear={readOnly ? false : undefined}
      onChange={!readOnly ? onChange : undefined}
      onSearch={(value) => {
        setLoading(true);
        onSearch(value, setLoading);
      }}
    />
  );
};

export default EntitySelect;
