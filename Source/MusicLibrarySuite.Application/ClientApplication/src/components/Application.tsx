import React from "react";
import { Navigate, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import ApplicationLayout from "./ApplicationLayout";
import ApplicationMenuItemDescriptor from "../entities/application/ApplicationMenuItemDescriptor";
import ApplicationPageDescriptor from "../entities/application/ApplicationPageDescriptor";
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
import ReleaseGroupEditPage, { ReleaseGroupEditPageMode } from "../pages/catalog/releaseGroups/ReleaseGroupEditPage";
import ReleaseGroupListPage from "../pages/catalog/releaseGroups/ReleaseGroupListPage";
import ReleaseGroupViewPage from "../pages/catalog/releaseGroups/ReleaseGroupViewPage";
import ReleaseEditPage, { ReleaseEditPageMode } from "../pages/catalog/releases/ReleaseEditPage";
import ReleaseListPage from "../pages/catalog/releases/ReleaseListPage";
import ReleaseViewPage from "../pages/catalog/releases/ReleaseViewPage";
import WorkEditPage, { WorkEditPageMode } from "../pages/catalog/works/WorkEditPage";
import WorkListPage from "../pages/catalog/works/WorkListPage";
import WorkViewPage from "../pages/catalog/works/WorkViewPage";

// prettier-ignore
const applicationPageDescriptors: ApplicationPageDescriptor[] = [
  { key: "home-page", path: "/home", name: "Home", componentFactory: () => <HomePage /> },
  { key: "catalog-node", path: "/catalog", name: "Catalog" },
  { key: "catalog-artist-node", path: "/catalog/artists", name: "Artists" },
  { key: "catalog-artist-list-page", path: "/catalog/artists/list", name: "Browse All", componentFactory: () => <ArtistListPage /> },
  { key: "catalog-artist-view-page", path: "/catalog/artists/view", name: "View", componentFactory: () => <ArtistViewPage /> },
  { key: "catalog-artist-create-page", path: "/catalog/artists/create", name: "Create", componentFactory: () => <ArtistEditPage mode={ArtistEditPageMode.Create} />, },
  { key: "catalog-artist-edit-page", path: "/catalog/artists/edit", name: "Edit", componentFactory: () => <ArtistEditPage mode={ArtistEditPageMode.Edit} /> },
  { key: "catalog-release-node", path: "/catalog/releases", name: "Releases" },
  { key: "catalog-release-list-page", path: "/catalog/releases/list", name: "Browse All", componentFactory: () => <ReleaseListPage /> },
  { key: "catalog-release-view-page", path: "/catalog/releases/view", name: "View", componentFactory: () => <ReleaseViewPage /> },
  { key: "catalog-release-create-page", path: "/catalog/releases/create", name: "Create", componentFactory: () => <ReleaseEditPage mode={ReleaseEditPageMode.Create} />, },
  { key: "catalog-release-edit-page", path: "/catalog/releases/edit", name: "Edit", componentFactory: () => <ReleaseEditPage mode={ReleaseEditPageMode.Edit} /> },
  { key: "catalog-release-group-node", path: "/catalog/releaseGroups", name: "Release Groups" },
  { key: "catalog-release-group-list-page", path: "/catalog/releaseGroups/list", name: "Browse All", componentFactory: () => <ReleaseGroupListPage /> },
  { key: "catalog-release-group-view-page", path: "/catalog/releaseGroups/view", name: "View", componentFactory: () => <ReleaseGroupViewPage /> },
  { key: "catalog-release-group-create-page", path: "/catalog/releaseGroups/create", name: "Create", componentFactory: () => <ReleaseGroupEditPage mode={ReleaseGroupEditPageMode.Create} />, },
  { key: "catalog-release-group-edit-page", path: "/catalog/releaseGroups/edit", name: "Edit", componentFactory: () => <ReleaseGroupEditPage mode={ReleaseGroupEditPageMode.Edit} /> },
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
  { key: "catalog-work-node", path: "/catalog/works", name: "Works" },
  { key: "catalog-work-list-page", path: "/catalog/works/list", name: "Browse All", componentFactory: () => <WorkListPage /> },
  { key: "catalog-work-view-page", path: "/catalog/works/view", name: "View", componentFactory: () => <WorkViewPage /> },
  { key: "catalog-work-create-page", path: "/catalog/works/create", name: "Create", componentFactory: () => <WorkEditPage mode={WorkEditPageMode.Create} />, },
  { key: "catalog-work-edit-page", path: "/catalog/works/edit", name: "Edit", componentFactory: () => <WorkEditPage mode={WorkEditPageMode.Edit} /> },
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
      { key: "catalog-release-list-page", label: "Releases", type: "item" },
      { key: "catalog-release-group-list-page", label: "Release Groups", type: "item" },
      { key: "catalog-genre-list-page", label: "Genres", type: "item" },
      { key: "catalog-product-list-page", label: "Products", type: "item" },
      { key: "catalog-work-list-page", label: "Works", type: "item" },
    ],
  },
];

const Application = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          {applicationPageDescriptors
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
            })}
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Application;
