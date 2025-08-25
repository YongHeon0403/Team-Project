// src/router/ProductRouter.jsx
import React, { lazy, Suspense } from "react";
import BasicLayout from "../layouts/BasicLayout";

const List = lazy(() => import("../pages/product/ListPage"));
const Read = lazy(() => import("../pages/product/ReadPage"));
const Add = lazy(() => import("../pages/product/AddPage"));
const Modify = lazy(() => import("../pages/product/ModifyPage"));

const Loading = <div className="p-6">Loading...</div>;

export default [
  {
    path: "/product",
    element: <BasicLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <List />
          </Suspense>
        ),
      },
      {
        path: "list",
        element: (
          <Suspense fallback={Loading}>
            <List />
          </Suspense>
        ),
      },
      {
        path: "read/:productId",
        element: (
          <Suspense fallback={Loading}>
            <Read />
          </Suspense>
        ),
      },
      {
        path: "add",
        element: (
          <Suspense fallback={Loading}>
            <Add />
          </Suspense>
        ),
      },
      {
        path: "modify/:productId",
        element: (
          <Suspense fallback={Loading}>
            <Modify />
          </Suspense>
        ),
      },
    ],
  },
];
