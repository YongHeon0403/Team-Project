import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import React from "react";

import UserRouter from "./UserRouter";
import BoardRouter from "./BoardRouter";
import ProductRouter from "./ProductRouter";

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

  // user/board 라우트는 기존 그대로
  {
    path: "/user",
    children: UserRouter(),
  },
  {
    path: "/board",
    children: BoardRouter(),
  },

  // ✅ ProductRouter는 배열이므로 스프레드로 합침
  ...ProductRouter,

  // ✅ /products 로 들어오면 /product/list 로 리다이렉트 (와일드카드 포함)
  { path: "/products/*", element: <Navigate replace to="/product/list" /> },
]);

export default root;
