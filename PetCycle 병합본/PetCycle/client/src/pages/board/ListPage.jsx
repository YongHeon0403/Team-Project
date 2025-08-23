import React from "react";
import { useSearchParams } from "react-router-dom";
import BoardListComponent from "../../components/board/BoardListComponent";
import BasicMenu from "../../components/menus/BasicMenu";

const ListPage = () => {
  const [queryParams] = useSearchParams();
  const page = queryParams.get("page") ? parseInt(queryParams.get("page")) : 1;
  const size = queryParams.get("size") ? parseInt(queryParams.get("size")) : 10;
  const keyword = queryParams.get("keyword") || "";
  const categoryBase = keyword ? keyword : "전체";

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-grow overflow-auto flex justify-center items-start bg-white">
        <div className="w-full max-w-[1000px] p-4">
          {/* 페이지 제목 */}
          <div className="text-2xl font-bold mb-3">
            {categoryBase}
          </div>

          {/* 게시판 목록 */}
          <BoardListComponent />
        </div>
      </div>
    </div>
  );
};

export default ListPage;
