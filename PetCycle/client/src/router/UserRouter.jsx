// src/router/UserRouter.jsx
import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;
const Login = lazy(() => import("../pages/user/LoginPage"));

const UserRouter = () => [
    {
        path: "login",
        element: <Suspense fallback={Loading}><Login /></Suspense>,
    },
];

export default UserRouter;
