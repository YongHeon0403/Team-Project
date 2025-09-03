// src/layouts/BasicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";

const BasicLayout = ({ children }) => {
  return (
    <>
      <BasicMenu />
      <div className="container mx-auto my-5 px-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <main className="bg-blue-300 p-4 lg:w-3/4">
            {children ?? <Outlet />}{" "}
            {/* ← ★ 여기! children 있으면 그걸, 없으면 Outlet */}
          </main>
          <aside className="bg-green-400 p-4 flex items-center justify-center lg:w-1/4">
            <h1 className="text-2xl lg:text-3xl">Sidebar</h1>
          </aside>
        </div>
      </div>
    </>
  );
};

export default BasicLayout;
