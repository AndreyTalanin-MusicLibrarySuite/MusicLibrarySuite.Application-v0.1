import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import ApplicationLayout from "./ApplicationLayout";
import ApplicationMenuItemDescriptor from "../entities/ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "../entities/ApplicationPageDescriptor";
import HomePage from "../pages/HomePage";
import InvalidRoutePage from "../pages/InvalidRoutePage";

// prettier-ignore
const applicationPageDescriptors: ApplicationPageDescriptor[] = [
  { key: "home-page", path: "/home", name: "Home", componentFactory: () => <HomePage /> },
  { key: "invalid-route-page", path: "*", name: "Invalid Route", componentFactory: () => <InvalidRoutePage /> },
];

// prettier-ignore
const applicationMenuItemDescriptors: ApplicationMenuItemDescriptor[] = [
  { key: "home-page", label: "Home", type: "item" },
];

const Application = () => {
  const [routes, setRoutes] = useState<React.ReactNode[]>();

  useEffect(() => {
    setRoutes(
      applicationPageDescriptors
        .filter((applicationPageDescriptor) => applicationPageDescriptor.componentFactory)
        .map((applicationPageDescriptor, index) => {
          const { path, componentFactory } = applicationPageDescriptor;
          return (
            <Route
              key={index}
              path={path}
              element={
                <ApplicationLayout
                  currentApplicationPage={(componentFactory as () => React.ReactNode)()}
                  applicationPageDescriptors={applicationPageDescriptors}
                  applicationMenuItemDescriptors={applicationMenuItemDescriptors}
                />
              }
            />
          );
        })
    );
  }, []);

  return (
    <>
      {routes && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            {routes}
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default Application;
