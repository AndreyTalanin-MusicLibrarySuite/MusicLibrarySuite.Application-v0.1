import { Breadcrumb, Layout, Typography } from "antd";
import React, { useMemo } from "react";
import { matchPath, useLocation } from "react-router";
import ApplicationMenu from "./ApplicationMenu";
import ApplicationMenuItemDescriptor from "../entities/application/ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "../entities/application/ApplicationPageDescriptor";
import styles from "./ApplicationLayout.module.css";
import "antd/dist/antd.min.css";

export interface ApplicationLayoutProps {
  currentApplicationPage: React.ReactNode;
  applicationPageDescriptors: ApplicationPageDescriptor[];
  applicationMenuItemDescriptors: ApplicationMenuItemDescriptor[];
}

const ApplicationLayout = ({ currentApplicationPage, applicationPageDescriptors, applicationMenuItemDescriptors }: ApplicationLayoutProps) => {
  const location = useLocation();

  const breadcrumb = useMemo(() => {
    let matchedLeafRoute = false;
    let matchedApplicationPageDescriptors = applicationPageDescriptors.filter((route) => {
      const trimTrailingPathSeparator = (path: string): string => {
        return path.endsWith("/") ? path.substring(0, path.length - 1) : path;
      };

      if (route.path === "*") {
        return false;
      }

      if (matchPath(route.path, location.pathname)) {
        matchedLeafRoute ||= true;
        return true;
      } else if (matchPath(`${trimTrailingPathSeparator(route.path)}/*`, location.pathname)) {
        return true;
      }

      return false;
    });

    if (!matchedLeafRoute) {
      matchedApplicationPageDescriptors = [...matchedApplicationPageDescriptors, ...applicationPageDescriptors.filter((route) => route.path === "*")];
    }

    return (
      <Breadcrumb className={styles.applicationBreadcrumb}>
        {matchedApplicationPageDescriptors.map((route, index) => (
          <Breadcrumb.Item key={index}>{route.name}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  }, [applicationPageDescriptors, location]);

  return (
    <Layout className={styles.application}>
      <Layout.Header className={styles.applicationHeader}>
        <Typography.Paragraph className={styles.applicationTitle}>Music Library Suite</Typography.Paragraph>
        <ApplicationMenu applicationMenuItemDescriptors={applicationMenuItemDescriptors} applicationPageDescriptors={applicationPageDescriptors} />
      </Layout.Header>
      <Layout>
        <Layout className={styles.applicationPageWrapper}>
          {breadcrumb}
          <Layout.Content className={styles.applicationPageWrapperContent}>{currentApplicationPage}</Layout.Content>
          <Layout.Footer className={styles.applicationFooter}>Copyright © 2022 Andrey Talanin. See the Home page for project details.</Layout.Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ApplicationLayout;
