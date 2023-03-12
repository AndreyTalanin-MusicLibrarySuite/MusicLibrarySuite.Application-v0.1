import { Select } from "antd";
import "antd/dist/antd.min.css";

export interface EntitySelectProps {
  mode?: "multiple" | "tags";
  value?: string[];
  defaultValue?: string[];
  options: { value: string; label: string }[];
  readOnly?: boolean;
  onChange?: (value: string[]) => void;
  onSearch?: (value: string | undefined) => void;
}

const EntitySelect = ({ mode, value, defaultValue, options, readOnly, onChange, onSearch }: EntitySelectProps) => {
  return (
    <Select
      showSearch
      mode={mode}
      value={value}
      defaultValue={defaultValue}
      placeholder="Search"
      options={options}
      optionFilterProp="label"
      style={readOnly ? { pointerEvents: "none" } : undefined}
      open={readOnly ? false : undefined}
      allowClear={readOnly ? false : undefined}
      onChange={!readOnly ? onChange : undefined}
      onSearch={!readOnly ? onSearch : undefined}
    />
  );
};

export default EntitySelect;
