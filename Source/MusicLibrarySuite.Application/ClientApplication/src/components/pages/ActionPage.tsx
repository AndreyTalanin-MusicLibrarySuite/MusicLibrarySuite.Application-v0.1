import { Space } from "antd";
import { PropsWithChildren, ReactNode } from "react";
import styles from "./ActionPage.module.css";
import "antd/dist/antd.min.css";

export interface ActionPageProps extends PropsWithChildren {
  title: ReactNode;
  actionButtons: ReactNode;
  modals?: ReactNode[];
}

const ActionPage = ({ title, actionButtons, modals, children }: ActionPageProps) => {
  return (
    <>
      <Space className={styles.page} direction="vertical">
        <Space wrap className={styles.pageHeader} direction="horizontal" align="baseline">
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

export default ActionPage;
