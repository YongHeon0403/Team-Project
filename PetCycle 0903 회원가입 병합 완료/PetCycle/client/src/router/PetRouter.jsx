// src/router/PetRouter.jsx
import React, { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const Register = lazy(() => import("../pages/pet/RegisterPage"));
const Read = lazy(() => import("../pages/pet/ReadPage"));
const Modify = lazy(() => import("../pages/pet/ModifyPage"));

const PetRouter = () => [
  {
    path: "register",
    element: (
      <Suspense fallback={Loading}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "read/:petId",
    element: (
      <Suspense fallback={Loading}>
        <Read />
      </Suspense>
    ),
  },
  {
    path: "modify/:petId",
    element: (
      <Suspense fallback={Loading}>
        <Modify />
      </Suspense>
    ),
  },
];

export default PetRouter;
