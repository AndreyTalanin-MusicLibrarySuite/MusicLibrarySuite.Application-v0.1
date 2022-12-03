import { Input } from "antd";
import styles from "./StringValueFilterDropdown.module.css";
import "antd/dist/antd.min.css";

export interface StringValueFilterDropdownProps {
  value?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

const StringValueFilterDropdown = ({ value, placeholder, onValueChange }: StringValueFilterDropdownProps) => {
  return <Input.Search allowClear className={styles.input} defaultValue={value} placeholder={placeholder} onSearch={onValueChange} />;
};

export default StringValueFilterDropdown;
