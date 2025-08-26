// src/router/NoticeRouter.jsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

const Loading = <div>Loading...</div>;

// 현재 페이지 파일명 그대로 사용 (추후 리네임 가능)
const NoticeList = lazy(() => import("../pages/notice/NoticeListPage"));
const NoticeRead = lazy(() => import("../pages/notice/NoticeDetailPage"));
const NoticeModify = lazy(() => import("../pages/notice/NoticeModifyPage"));
const NoticeAdd = lazy(() => import("../pages/notice/NoticeRegisterPage"));

const NoticeRouter = () => [
  { path: "", element: <Navigate to="list" /> },
  {
    path: "list",
    element: (
      <Suspense fallback={Loading}>
        <NoticeList />
      </Suspense>
    ),
  },
  {
    path: "add",
    element: (
      <Suspense fallback={Loading}>
        <NoticeAdd />
      </Suspense>
    ),
  },
  {
    path: "read/:noticeId",
    element: (
      <Suspense fallback={Loading}>
        <NoticeRead />
      </Suspense>
    ),
  },
  {
    path: "modify/:noticeId",
    element: (
      <Suspense fallback={Loading}>
        <NoticeModify />
      </Suspense>
    ),
  },
];

export default NoticeRouter;
