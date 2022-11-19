import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ApplicationMenuItemDescriptor from "../entities/ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "../entities/ApplicationPageDescriptor";
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

  const [applicationMenuItems, setApplicationMenuItems] = useState<ApplicationMenuItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
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

    setApplicationMenuItems(applicationMenuItemDescriptors.map((applicationMenuItemDescriptor) => createApplicationMenuItem(applicationMenuItemDescriptor)));
  }, [applicationMenuItemDescriptors, location]);

  useEffect(() => {
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

    setSelectedKeys(selectedKey ? [selectedKey] : []);
  }, [applicationPageDescriptors, location, applicationMenuItems]);

  const onSelect = (key: string) => {
    const applicationPageDescriptor = applicationPageDescriptors.find((applicationPageDescriptor) => applicationPageDescriptor.key === key);
    if (applicationPageDescriptor?.path) {
      navigate(applicationPageDescriptor.path);
    }
  };

  return <Menu mode="horizontal" theme="dark" items={applicationMenuItems} selectedKeys={selectedKeys} onSelect={({ key }) => onSelect(key)} />;
};

export default ApplicationMenu;
