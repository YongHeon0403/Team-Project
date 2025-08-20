import React from "react";
import BasicMenu from "../components/menus/BasicMenu";

// children 속성을 이용해서 컴포넌트 내부에 다른 컴포넌트를 적용할 수 있습니다.
const BasicLayout = ({ children }) => {
  return (
    <>
      <BasicMenu />

      <div className="container mx-auto my-5 px-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 메인 콘텐츠 영역 */}
          <main className="bg-blue-300 p-4 lg:w-3/4">
            {children} {/* 입력받은 컴포넌트가 여기서 적용된다. */}
          </main>

          {/* 사이드바 영역 */}
          <aside className="bg-green-400 p-4 flex items-center justify-center lg:w-1/4">
            <h1 className="text-2xl lg:text-3xl">Sidebar</h1>
          </aside>
        </div>
      </div>
    </>
  );
};

export default BasicLayout;
