import { Space } from "antd";
import { PropsWithChildren, ReactNode } from "react";
import styles from "./ActionTab.module.css";
import "antd/dist/antd.min.css";

export interface ActionTabProps extends PropsWithChildren {
  title: ReactNode;
  actionButtons?: ReactNode;
  modals?: ReactNode[];
}

const ActionTab = ({ title, actionButtons, children, modals }: ActionTabProps) => {
  return (
    <>
      <Space className={styles.tab} direction="vertical">
        <Space wrap className={styles.tabHeader} direction="horizontal" align="baseline">
          <Space wrap direction="horizontal" align="baseline">
            {title}
          </Space>
          <Space wrap direction="horizontal" align="baseline">
            {actionButtons}
          </Space>
        </Space>
        {children}
      </Space>
      {modals}
    </>
  );
};

export default ActionTab;
