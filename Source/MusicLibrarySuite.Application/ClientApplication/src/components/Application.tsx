import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import ApplicationLayout from "./ApplicationLayout";
import ApplicationMenuItemDescriptor from "../entities/ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "../entities/ApplicationPageDescriptor";
import EditGenrePage, { EditGenrePageMode } from "../pages/catalog/genres/EditGenrePage";
import GenreListPage from "../pages/catalog/genres/GenreListPage";
import ViewGenrePage from "../pages/catalog/genres/ViewGenrePage";
import HomePage from "../pages/HomePage";
import InvalidRoutePage from "../pages/InvalidRoutePage";

// prettier-ignore
const applicationPageDescriptors: ApplicationPageDescriptor[] = [
  { key: "home-page", path: "/home", name: "Home", componentFactory: () => <HomePage /> },
  { key: "catalog-node", path: "/catalog", name: "Catalog" },
  { key: "catalog-genre-node", path: "/catalog/genres", name: "Genres" },
  { key: "catalog-genre-list-page", path: "/catalog/genres/list", name: "Browse All", componentFactory: () => <GenreListPage /> },
  { key: "catalog-genre-view-page", path: "/catalog/genres/view", name: "View", componentFactory: () => <ViewGenrePage /> },
  { key: "catalog-genre-create-page", path: "/catalog/genres/create", name: "Create", componentFactory: () => <EditGenrePage mode={EditGenrePageMode.Create} />, },
  { key: "catalog-genre-edit-page", path: "/catalog/genres/edit", name: "Edit", componentFactory: () => <EditGenrePage mode={EditGenrePageMode.Edit} /> },
  { key: "invalid-route-page", path: "*", name: "Invalid Route", componentFactory: () => <InvalidRoutePage /> },
];

// prettier-ignore
const applicationMenuItemDescriptors: ApplicationMenuItemDescriptor[] = [
  { key: "home-page", label: "Home", type: "item" },
  {
    key: "catalog-node",
    label: "Catalog",
    type: "menu",
    items: [
      { key: "catalog-genre-list-page", label: "Genres", type: "item" },
    ],
  },
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
