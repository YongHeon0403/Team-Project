import React from "react";

/**
 * 페이지네이션 컴포넌트
 * @param {object} props
 * @param {object} props.serverData - 서버 데이터 (예: { prev: true, prevPage: 9, pageNumList: [10, 11, 12], current: 10, next: true, nextPage: 11 })
 * @param {function} props.movePage - 페이지 이동 함수
 */
const PageComponent = ({ serverData, movePage }) => {
  return (
    // 전체 컨테이너: 가로 중앙 정렬 및 상하 마진
    <div className="my-4 flex justify-center items-center">
      {/* '이전' 버튼 */}
      {serverData.prev && (
        <button
          className="text-blue-600 font-bold mx-2 hover:text-blue-400"
          onClick={() => movePage({ page: serverData.prevPage })}
        >
          Prev
        </button>
      )}

      {/* 페이지 번호 목록 */}
      {serverData.pageNumList.map((pageNum) => (
        <button
          key={pageNum}
          className={`
            mx-1 px-3 py-1 rounded shadow
            ${
              serverData.current === pageNum
                ? "bg-gray-800 text-white"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }
          `}
          onClick={() => movePage({ page: pageNum })}
        >
          {pageNum}
        </button>
      ))}

      {/* '다음' 버튼 */}
      {serverData.next && (
        <button
          className="text-blue-600 font-bold mx-2 hover:text-blue-400"
          onClick={() => movePage({ page: serverData.nextPage })}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default PageComponent;
