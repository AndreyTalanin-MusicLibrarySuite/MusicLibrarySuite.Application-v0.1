import { Menu } from "antd";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import ApplicationMenuItemDescriptor from "../entities/application/ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "../entities/application/ApplicationPageDescriptor";
import "antd/dist/antd.min.css";

interface ApplicationMenuItem {
  key: string;
  label: string;
  children?: ApplicationMenuItem[];
}

export interface ApplicationMenuProps {
  applicationPageDescriptors: ApplicationPageDescriptor[];
  applicationMenuItemDescriptors: ApplicationMenuItemDescriptor[];
}

const ApplicationMenu = ({ applicationPageDescriptors, applicationMenuItemDescriptors }: ApplicationMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const applicationMenuItems = useMemo(() => {
    const createApplicationMenuItem = ({ key, type, label, items }: ApplicationMenuItemDescriptor) => {
      let applicationMenuItem: ApplicationMenuItem;
      switch (type) {
        case "item":
          applicationMenuItem = { key: key, label: label };
          break;
        case "menu":
          applicationMenuItem = {
            key: key,
            label: label,
            children: items?.map((childApplicationMenuItemDescriptor) => createApplicationMenuItem(childApplicationMenuItemDescriptor)) ?? [],
          };
          break;
      }

      return applicationMenuItem;
    };

    return applicationMenuItemDescriptors.map((applicationMenuItemDescriptor) => createApplicationMenuItem(applicationMenuItemDescriptor));
  }, [applicationMenuItemDescriptors]);

  const selectedKeys = useMemo(() => {
    let selectedKey: string | undefined = undefined;

    const checkApplicationMenuItem = ({ key, children }: ApplicationMenuItem) => {
      const applicationPageDescriptor = applicationPageDescriptors.find((applicationPageDescriptor) => applicationPageDescriptor.key === key);
      if (applicationPageDescriptor) {
        if (location.pathname.startsWith(applicationPageDescriptor.path)) {
          selectedKey = applicationPageDescriptor.key;
        }
        if (location.pathname === applicationPageDescriptor.path) {
          return true;
        }
      }

      if (children) {
        for (const child of children) {
          if (checkApplicationMenuItem(child)) {
            return true;
          }
        }
      }

      return false;
    };

    for (const applicationMenuItem of applicationMenuItems) {
      if (checkApplicationMenuItem(applicationMenuItem)) {
        break;
      }
    }

    return selectedKey ? [selectedKey] : [];
  }, [applicationPageDescriptors, location, applicationMenuItems]);

  const onSelect = useCallback(
    (key: string) => {
      const applicationPageDescriptor = applicationPageDescriptors.find((applicationPageDescriptor) => applicationPageDescriptor.key === key);
      if (applicationPageDescriptor?.path) {
        navigate(applicationPageDescriptor.path);
      }
    },
    [applicationPageDescriptors, navigate]
  );

  return <Menu mode="horizontal" theme="dark" items={applicationMenuItems} selectedKeys={selectedKeys} onSelect={({ key }) => onSelect(key)} />;
};

export default ApplicationMenu;
