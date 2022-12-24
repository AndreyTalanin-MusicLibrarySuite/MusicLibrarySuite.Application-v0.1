import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import ApplicationLayout from "./ApplicationLayout";
import ApplicationMenuItemDescriptor from "../entities/ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "../entities/ApplicationPageDescriptor";
import ArtistEditPage, { ArtistEditPageMode } from "../pages/catalog/artists/ArtistEditPage";
import ArtistListPage from "../pages/catalog/artists/ArtistListPage";
import ArtistViewPage from "../pages/catalog/artists/ArtistViewPage";
import GenreEditPage, { GenreEditPageMode } from "../pages/catalog/genres/GenreEditPage";
import GenreListPage from "../pages/catalog/genres/GenreListPage";
import GenreViewPage from "../pages/catalog/genres/GenreViewPage";
import HomePage from "../pages/HomePage";
import InvalidRoutePage from "../pages/InvalidRoutePage";
import ProductEditPage, { ProductEditPageMode } from "../pages/catalog/products/ProductEditPage";
import ProductListPage from "../pages/catalog/products/ProductListPage";
import ProductViewPage from "../pages/catalog/products/ProductViewPage";

// prettier-ignore
const applicationPageDescriptors: ApplicationPageDescriptor[] = [
  { key: "home-page", path: "/home", name: "Home", componentFactory: () => <HomePage /> },
  { key: "catalog-node", path: "/catalog", name: "Catalog" },
  { key: "catalog-artist-node", path: "/catalog/artists", name: "Artists" },
  { key: "catalog-artist-list-page", path: "/catalog/artists/list", name: "Browse All", componentFactory: () => <ArtistListPage /> },
  { key: "catalog-artist-view-page", path: "/catalog/artists/view", name: "View", componentFactory: () => <ArtistViewPage /> },
  { key: "catalog-artist-create-page", path: "/catalog/artists/create", name: "Create", componentFactory: () => <ArtistEditPage mode={ArtistEditPageMode.Create} />, },
  { key: "catalog-artist-edit-page", path: "/catalog/artists/edit", name: "Edit", componentFactory: () => <ArtistEditPage mode={ArtistEditPageMode.Edit} /> },
  { key: "catalog-genre-node", path: "/catalog/genres", name: "Genres" },
  { key: "catalog-genre-list-page", path: "/catalog/genres/list", name: "Browse All", componentFactory: () => <GenreListPage /> },
  { key: "catalog-genre-view-page", path: "/catalog/genres/view", name: "View", componentFactory: () => <GenreViewPage /> },
  { key: "catalog-genre-create-page", path: "/catalog/genres/create", name: "Create", componentFactory: () => <GenreEditPage mode={GenreEditPageMode.Create} />, },
  { key: "catalog-genre-edit-page", path: "/catalog/genres/edit", name: "Edit", componentFactory: () => <GenreEditPage mode={GenreEditPageMode.Edit} /> },
  { key: "catalog-product-node", path: "/catalog/products", name: "Products" },
  { key: "catalog-product-list-page", path: "/catalog/products/list", name: "Browse All", componentFactory: () => <ProductListPage /> },
  { key: "catalog-product-view-page", path: "/catalog/products/view", name: "View", componentFactory: () => <ProductViewPage /> },
  { key: "catalog-product-create-page", path: "/catalog/products/create", name: "Create", componentFactory: () => <ProductEditPage mode={ProductEditPageMode.Create} />, },
  { key: "catalog-product-edit-page", path: "/catalog/products/edit", name: "Edit", componentFactory: () => <ProductEditPage mode={ProductEditPageMode.Edit} /> },
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
      { key: "catalog-artist-list-page", label: "Artists", type: "item" },
      { key: "catalog-genre-list-page", label: "Genres", type: "item" },
      { key: "catalog-product-list-page", label: "Products", type: "item" },
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
