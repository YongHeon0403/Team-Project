// src/router/UserRouter.jsx
import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const Login = lazy(() => import("../pages/user/LoginPage"));
const Logout = lazy(() => import("../pages/user/LogoutPage"));

const UserRouter = () => [
  {
    path: "login", // 부모 라우트가 /user 라면 최종 경로는 /user/login
    element: (
      <Suspense fallback={Loading}>
        <Login />
      </Suspense>
    ),
  },

  // logout 라우터 추가 .. 
  {
    path: "logout", // 최종 경로: /user/logout
    element: (
      <Suspense fallback={Loading}>
        <Logout />
      </Suspense>
    ),
  },
];

export default UserRouter;
