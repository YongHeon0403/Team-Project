// src/layouts/BasicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";

const BasicLayout = () => {
  return (
    <>
      <BasicMenu />
      <div className="container mx-auto my-5 px-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <main className="bg-blue-300 p-4 lg:w-3/4">
            <Outlet /> {/* ✅ 자식 라우트 렌더링 */}
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
