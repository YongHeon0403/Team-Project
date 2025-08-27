// src/router/UserRouter.jsx
import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const Login = lazy(() => import("../pages/user/LoginPage"));
const Logout = lazy(() => import("../pages/user/LogoutPage"));
const KakaoRedirect = lazy(() => import("../pages/user/KaKaoredirectPage"));
const Modify = lazy(() => import("../pages/user/ModifyPage"));

const UserRouter = () => [
  {
    path: "login", // 부모 라우트가 /user 라면 최종 경로는 /user/login
    element: (
      <Suspense fallback={Loading}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "logout", // 최종 경로: /user/logout
    element: (
      <Suspense fallback={Loading}>
        <Logout />
      </Suspense>
    ),
  },
  {
    path: "kakao",
    element: (
      <Suspense fallback={Loading}>
        <KakaoRedirect />
      </Suspense>
    ),
  },
  {
    path: "modify",
    element: (
      <Suspense fallback={Loading}>
        <Modify />
      </Suspense>
    ),
  },
];

export default UserRouter;
