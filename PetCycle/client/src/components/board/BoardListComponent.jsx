import React, { useEffect, useState } from "react";
import { getPostList } from "../../api/board/PostApi"; // API 호출 함수
import useCustomMove from "../../hooks/useCustomMove";
import PageComponent from "../common/PageComponent";

// 초기 상태 정의
const initState = {
  boardList: [], // 게시글(Board) 목록
  pageNumList: [], // 페이지 번호 목록
  pageRequestDTO: null, // 페이지 요청 DTO
  prev: false, // 이전 페이지 존재 여부
  next: false, // 다음 페이지 존재 여부
  totalCount: 0, // 전체 항목 수
  prevPage: 0, // 이전 페이지 번호 (0이면 이전 페이지 없음 또는 초기 상태)
  nextPage: 0, // 다음 페이지 번호
  totalPage: 0, // 전체 페이지 수
  current: 0, // 현재 페이지 번호
};

/**
 * 게시판 목록을 표시하는 컴포넌트
 */
const BoardListComponent = () => {
  // useCustomMove 훅을 사용하여 페이지, 사이즈, 리프레시 상태 및 페이지 이동 함수들을 가져옴
  // ✨ type, keyword도 함께 가져옴 ✨
  const { page, size, refresh, moveToList, moveToRead, type, keyword } =
    useCustomMove();

  // serverData 상태를 관리하고 초기값으로 initState를 설정
  const [serverData, setServerData] = useState(initState);

  // 컴포넌트 마운트 시, 또는 page, size, refresh, type, keyword 값이 변경될 때마다 getPostList API를 호출
  useEffect(() => {
    // ✨ getPostList에 type, keyword 파라미터 전달 ✨
    getPostList({ page, size, type, keyword }).then((data) => {
      console.log(data);
      setServerData({ ...data, boardList: data.dtoList });
    });
  }, [page, size, refresh, type, keyword]); // 의존성 배열에 type, keyword 추가

  // ✨ 카테고리 변경 핸들러 ✨
  const handleCategoryChange = (newCategory) => {
    // 카테고리 변경 시 1페이지로 이동하고, type을 'c', keyword에 선택된 카테고리 이름을 설정
    // '전체' 선택 시 newCategory가 빈 문자열이므로, type과 keyword가 모두 비워져 전체 게시글을 가져옴.
    moveToList({
      page: 1,
      size: 10,
      type: newCategory ? "c" : "",
      keyword: newCategory,
    });
  };

  return (
    <div className="border border-primary mt-4 mx-2">
      {/* 카테고리 선택 UI 추가 */}
      <div className="d-flex justify-content-start mb-3 mt-2 ms-3">
        {" "}
        {/* 왼쪽 정렬, 하단 마진, 상단 마진, 왼쪽 마진 */}
        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            id="categoryDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            카테고리: {keyword || "전체"} {/* 현재 선택된 카테고리 표시 */}
          </button>
          <ul className="dropdown-menu" aria-labelledby="categoryDropdown">
            {/* '전체' 카테고리: keyword를 빈 문자열로 설정하여 백엔드에서 모든 게시글을 가져오도록 */}
            <li>
              <a
                className="dropdown-item"
                href="#"
                onClick={() => handleCategoryChange("")}
              >
                전체
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                href="#"
                onClick={() => handleCategoryChange("자유게시판")}
              >
                자유게시판
              </a>
            </li>{" "}
            <li>
              <a
                className="dropdown-item"
                href="#"
                onClick={() => handleCategoryChange("Q&A")}
              >
                Q&A
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                href="#"
                onClick={() => handleCategoryChange("정보공유게시판")}
              >
                정보공유게시판
              </a>
            </li>
            {/* 더 많은 카테고리가 있다면 여기에 추가 */}
          </ul>
        </div>
      </div>

      {/* 게시글 목록 (Board List Component) */}
      <div className="d-flex flex-wrap justify-content-center p-3">
        {serverData.boardList.map((board) => (
          <div
            key={board.postId}
            className="card w-100 mb-2 p-2 shadow-sm"
            style={{ minWidth: "400px" }}
            onClick={() => moveToRead(board.postId)}
          >
            <div className="d-flex align-items-center">
              <div className="fw-bolder fs-4 p-2 me-2">{board.postId}</div>
              <div className="fs-5 m-1 p-2 flex-grow-1 fw-bolder">
                {board.title}
                {/* ✨ 카테고리 이름 표시 ✨ */}
                {board.categoryName && (
                  <span className="badge bg-info text-dark ms-2">
                    {board.categoryName}
                  </span>
                )}
              </div>
              <div className="fs-6 m-1 p-2 text-secondary text-center">
                {board.nickname}
              </div>
              <div className="fs-6 m-1 p-2 text-muted text-end">
                {board.createdAt ? board.createdAt.substring(0, 10) : ""}
              </div>
              <div className="fs-6 m-1 p-2 text-info text-end">
                조회: {board.viewCount}
              </div>
            </div>
          </div>
        ))}
      </div>

      <PageComponent
        serverData={serverData}
        movePage={moveToList}
      ></PageComponent>
    </div>
  );
};

export default BoardListComponent;
