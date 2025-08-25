import React from "react";
import BasicMenu from "../../components/menus/BasicMenu";
import BoardPostComponent from "../../components/board/BoardPostComponent";

const PostPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 본문 영역 */}
      <main className="flex-grow flex justify-center items-start py-8 px-4">
        <div className="w-full max-w-3xl">
          <BoardPostComponent />
        </div>
      </main>
    </div>
  );
};

export default PostPage;
