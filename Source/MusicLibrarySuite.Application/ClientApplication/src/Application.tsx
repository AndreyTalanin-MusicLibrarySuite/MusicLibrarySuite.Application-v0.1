import React from "react";
import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import ApplicationLayout from "./ApplicationLayout";
import ApplicationMenuItemDescriptor from "./ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "./entities/ApplicationPageDescriptor";
import HomePage from "./pages/HomePage";
import InvalidRoutePage from "./pages/InvalidRoutePage";

const applicationPageDescriptors: ApplicationPageDescriptor[] = [
  { key: "home-page", path: "/home", name: "Home", componentFactory: () => <HomePage /> },
  { key: "invalid-route-page", path: "*", name: "Invalid Route", componentFactory: () => <InvalidRoutePage /> },
];

const applicationMenuItemDescriptors: ApplicationMenuItemDescriptor[] = [
  { key: "home-page", text: "Home", type: "item" },
];

const Application = () => {
  const createApplicationLayout = (componentFactory: () => React.ReactNode) => {
    return (
      <ApplicationLayout
        currentApplicationPage={componentFactory()}
        applicationPageDescriptors={applicationPageDescriptors}
        applicationMenuItemDescriptors={applicationMenuItemDescriptors}
      />
    );
  };

  const createApplicationRoutes = () => {
    return applicationPageDescriptors
      .filter((applicationPageDescriptor) => applicationPageDescriptor.componentFactory)
      .map((applicationPageDescriptor, index) => {
        const { path, componentFactory } = applicationPageDescriptor;
        return <Route key={index} path={path} element={createApplicationLayout(componentFactory as () => React.ReactNode)} />;
      });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        {createApplicationRoutes()}
      </Routes>
    </BrowserRouter>
  );
};

export default Application;
