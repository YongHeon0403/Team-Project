// src/router/root.jsx
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import UserRouter from "./UserRouter";
import React from "react";

const Loading = <div>Loading...</div>;
const Main = lazy(() => import("../pages/MainPages"));

const root = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={Loading}>
        <Main />
      </Suspense>
    ),
  },
  {
    path: "/user",
    children: UserRouter(), // 여기서 children로 넣어야 함
  },
]);

export default root;
