// src/router/UserRouter.jsx (patched)
import { lazy, Suspense } from "react";
import React from "react";

const Loading = <div>Loading...</div>;
const Login = lazy(() => import("../pages/user/LoginPage"));
const Profile = lazy(() => import("../pages/user/ProfilePage"));

const UserRouter = () => [
  { path: "login",   element: <Suspense fallback={Loading}><Login /></Suspense> },
  { path: "profile", element: <Suspense fallback={Loading}><Profile /></Suspense> },
];

export default UserRouter;
