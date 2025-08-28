import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import React from "react";

import UserRouter from "./UserRouter";
import BoardRouter from "./BoardRouter";
import ProductRouter from "./ProductRouter";
import NoticeRouter from "./NoticeRouter";
import PetRouter from "./PetRouter"; // ← 추가
const ChatPage = lazy(() => import("../pages/ChatPage")); // ✅ 이 줄 추가

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
    path: "/chat",
    element: (
      <Suspense fallback={Loading}>
        <ChatPage />
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

  // ✅ Notice: 네 구조(`/notice` 베이스 + list/add/read/modify)
  {
    path: "/notice",
    children: NoticeRouter(),
  },

  // ✅ Product: 다른 라우터와 동일하게 children 함수 호출
  { path: "/product", children: ProductRouter() },

  // ✅ Pet: 다른 라우터와 동일한 스타일(children: 함수호출)
  {
    path: "/pet",
    children: PetRouter(),
  },

  // ✅ 과거 팀원 경로 호환: /notices/* → /notice/list
  { path: "/notices/*", element: <Navigate replace to="/notice/list" /> },

  // ✅ /products 로 들어오면 /product/list 로 리다이렉트 (와일드카드 포함)
  { path: "/products/*", element: <Navigate replace to="/product/list" /> },

  // (선택) 팀원 경로 호환: /pets/* → /pet/list
  { path: "/pets/*", element: <Navigate replace to="/pet/list" /> },
]);

export default root;
