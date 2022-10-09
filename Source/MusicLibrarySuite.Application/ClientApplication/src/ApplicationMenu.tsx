import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router";
import ApplicationMenuItemDescriptor from "./ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "./ApplicationPageDescriptor";
import "antd/dist/antd.min.css";

interface MenuItem {
  key: string;
  label: string;
  children?: MenuItem[];
}

interface ApplicationMenuProps {
  applicationPageDescriptors: ApplicationPageDescriptor[];
  applicationMenuItemDescriptors: ApplicationMenuItemDescriptor[];
}

const ApplicationMenu = ({ applicationPageDescriptors, applicationMenuItemDescriptors }: ApplicationMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItemKeysByPaths = new Map<string, string>();
  const pathsByMenuItemKeys = new Map<string, string>();

  const createMenuItem = (applicationMenuItemDescriptor: ApplicationMenuItemDescriptor) => {
    const { key, type, text } = applicationMenuItemDescriptor;
    const applicationPageDescriptor = applicationPageDescriptors.find((applicationPageDescriptor) => applicationPageDescriptor.key === key);

    let menuItem: MenuItem;
    switch (type) {
      case "item":
        menuItem = { key: key, label: text };
        break;
      case "menu":
        menuItem = {
          key: key,
          label: text,
          children: applicationMenuItemDescriptor.items?.map((childApplicationMenuItemDescriptor) => createMenuItem(childApplicationMenuItemDescriptor)),
        };
        break;
    }

    if (applicationPageDescriptor) {
      menuItemKeysByPaths.set(applicationPageDescriptor.path, applicationPageDescriptor.key);
      pathsByMenuItemKeys.set(applicationPageDescriptor.key, applicationPageDescriptor.path);
    }

    return menuItem;
  };

  const menuItems = applicationMenuItemDescriptors.map((applicationMenuItemDescriptor) => createMenuItem(applicationMenuItemDescriptor));

  let selectedMenuItemKeys: string[] = [];
  for (const [path, key] of Array.from(menuItemKeysByPaths.entries())) {
    if (path === location.pathname) {
      selectedMenuItemKeys = [key];
    }
  }

  const onSelect = (key: string) => {
    const path = pathsByMenuItemKeys.get(key);
    if (path) {
      navigate(path);
    }
  };

  return <Menu mode="horizontal" theme="dark" items={menuItems} selectedKeys={selectedMenuItemKeys} onSelect={({ key }) => onSelect(key)} />;
};

export default ApplicationMenu;
