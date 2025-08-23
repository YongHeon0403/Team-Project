import React, { useEffect, useRef, useState } from "react";
import { getPostList } from "../../api/board/PostApi";
import useCustomMove from "../../hooks/useCustomMove";
import PageComponent from "../common/PageComponent";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../util/CookieUtil";

const initState = {
  boardList: [],
  pageNumList: [],
  pageRequestDTO: null,
  prev: false,
  next: false,
  totalCount: 0,
  prevPage: 0,
  nextPage: 0,
  totalPage: 0,
  current: 0,
};

const BoardListComponent = () => {
  const navigate = useNavigate();
  const { page, size, refresh, moveToList, moveToRead, type, keyword } =
    useCustomMove();
  const [serverData, setServerData] = useState(initState);

  // 드롭다운 상태 및 ref
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    getPostList({ page, size, type, keyword }).then((data) => {
      setServerData({ ...data, boardList: data.dtoList });
    });
  }, [page, size, refresh, type, keyword]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategoryChange = (newCategory) => {
    moveToList({
      page: 1,
      size: 10,
      type: newCategory ? "c" : "",
      keyword: newCategory,
    });
    closeDropdown();
  };

  const handleWriteClick = () => {
    const userCookie = getCookie("user");
    if (userCookie) {
      navigate("/board/post");
    } else {
      alert("로그인이 필요합니다!");
      navigate("/user/login");
    }
  };

  return (
    <div className="border border-blue-600 mt-4 mx-2 rounded">
      {/* 상단: 카테고리 + 글쓰기 버튼 */}
      <div className="flex justify-between items-center mb-3 mt-2 px-3">
        {/* 왼쪽: 카테고리 */}
        <div ref={dropdownRef} className="relative inline-block text-left">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
            onClick={toggleDropdown}
          >
            카테고리: {keyword || "전체"}
          </button>

          {dropdownOpen && (
            <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-white z-10">
              <ul className="py-1">
                <li>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleCategoryChange("")}
                  >
                    전체
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleCategoryChange("자유게시판")}
                  >
                    자유게시판
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleCategoryChange("Q&A")}
                  >
                    Q&A
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleCategoryChange("정보공유게시판")}
                  >
                    정보공유게시판
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* 오른쪽: 게시글 작성 버튼 */}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          onClick={handleWriteClick}
        >
          게시글 작성
        </button>
      </div>

      {/* 게시글 목록 */}
      <div className="flex flex-wrap justify-center p-3 gap-3">
        {serverData.boardList.map((board) => (
          <div
            key={board.postId}
            className="bg-white shadow-sm rounded p-2 w-full min-w-[400px] cursor-pointer hover:shadow-md"
            onClick={() => moveToRead(board.postId)}
          >
            <div className="flex items-center">
              <div className="font-bold text-lg p-2 mr-2">{board.postId}</div>
              <div className="flex-grow p-2 text-lg font-semibold">
                {board.title}
                {board.categoryName && (
                  <span className="ml-2 bg-blue-200 text-blue-800 text-sm px-2 py-1 rounded">
                    {board.categoryName}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 p-2 text-center">
                {board.nickname}
              </div>
              <div className="text-sm text-gray-500 p-2 text-end">
                {board.createdAt ? board.createdAt.substring(0, 10) : ""}
              </div>
              <div className="text-sm text-blue-500 p-2 text-end">
                조회: {board.viewCount}
              </div>
            </div>
          </div>
        ))}
      </div>

      <PageComponent serverData={serverData} movePage={moveToList} />
    </div>
  );
};

export default BoardListComponent;
