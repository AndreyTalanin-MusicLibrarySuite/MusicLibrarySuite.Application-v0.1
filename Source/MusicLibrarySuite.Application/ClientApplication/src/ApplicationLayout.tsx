import { Breadcrumb, Layout } from "antd";
import { matchPath, useLocation } from "react-router";
import ApplicationMenu from "./components/ApplicationMenu";
import ApplicationMenuItemDescriptor from "./entities/ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "./entities/ApplicationPageDescriptor";
import "antd/dist/antd.min.css";
import "./ApplicationLayout.css";

export interface ApplicationLayoutProps {
  currentApplicationPage: React.ReactNode;
  applicationPageDescriptors: ApplicationPageDescriptor[];
  applicationMenuItemDescriptors: ApplicationMenuItemDescriptor[];
}

const ApplicationLayout = ({ currentApplicationPage, applicationPageDescriptors, applicationMenuItemDescriptors }: ApplicationLayoutProps) => {
  const location = useLocation();

  const createBreadcrumb = () => {
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
      <Breadcrumb className="application-breadcrumb">
        {matchedApplicationPageDescriptors.map((route, index) => (
          <Breadcrumb.Item key={index}>{route.name}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };

  return (
    <Layout className="application">
      <Layout.Header>
        <p className="application-title">Music Library Suite</p>
        <ApplicationMenu applicationMenuItemDescriptors={applicationMenuItemDescriptors} applicationPageDescriptors={applicationPageDescriptors} />
      </Layout.Header>
      <Layout>
        <Layout className="application-page-wrapper">
          {createBreadcrumb()}
          <Layout.Content className="application-page-wrapper-content">{currentApplicationPage}</Layout.Content>
          <Layout.Footer className="application-footer">Copyright © 2022 Andrey Talanin. See the Home page for project details.</Layout.Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ApplicationLayout;
