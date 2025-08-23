import React from "react";
import { useParams } from "react-router-dom";
import BoardReadComponent from "../../components/board/BoardReadComponent";
import BasicMenu from "../../components/menus/BasicMenu";

const ReadPage = () => {
  const { postId } = useParams();

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 본문 영역 */}
      <div className="flex-grow overflow-auto flex justify-center items-start bg-white">
        <div className="w-full max-w-3xl p-4">
          <BoardReadComponent postId={postId} />
        </div>
      </div>
    </div>
  );
};

export default ReadPage;
