import { Input } from "antd";
import styles from "./StringValueFilterDropdown.module.css";
import "antd/dist/antd.min.css";

export interface StringValueFilterDropdownProps {
  value?: string;
  placeholder?: string;
  onApplyFilter?: (value: string) => void;
}

const StringValueFilterDropdown = ({ value, placeholder, onApplyFilter }: StringValueFilterDropdownProps) => {
  return <Input.Search allowClear className={styles.input} defaultValue={value} placeholder={placeholder} onSearch={onApplyFilter} />;
};

export default StringValueFilterDropdown;
