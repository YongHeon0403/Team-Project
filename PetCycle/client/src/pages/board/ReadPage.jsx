import React from "react";
import { useParams } from "react-router-dom";
import BoardReadComponent from "../../components/board/BoardReadComponent";
import BasicMenu from "../../components/menus/BasicMenu";
import BoardCommentListComponent from "../../components/board/comment/BoardCommentListComponent";

const ReadPage = () => {
  const { postId } = useParams();

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 본문 영역 */}
      <div className="flex-grow overflow-auto flex justify-center items-start bg-white">
        <div className="w-full max-w-3xl p-4">
          {/* 게시글 본문 */}
          <BoardReadComponent postId={postId} />

          {/* 본문과 댓글 구분 */}
          <div className="mt-8 border-t pt-6">
            <BoardCommentListComponent postId={Number(postId)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadPage;
