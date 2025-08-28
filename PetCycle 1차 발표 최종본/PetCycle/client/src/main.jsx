if (typeof window !== "undefined" && typeof window.global === "undefined") {
  window.global = window;
}

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store.jsx";
import { RouterProvider } from "react-router-dom";
import root from "./router/root.jsx";
import React from "react";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={root}></RouterProvider>
  </Provider>
);
