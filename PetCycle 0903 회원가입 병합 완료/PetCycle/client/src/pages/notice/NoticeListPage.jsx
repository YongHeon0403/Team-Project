// src/pages/notice/NoticeListPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNoticeList } from "../../api/noticeApi";

const NoticeListPage = () => {
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(0); // UI는 0-based
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await getNoticeList(page + 1, 10); // 서버는 1-based
        const noticeList = res.data.content || [];
        setNotices(noticeList);
        setTotalPages(res.data.totalPages ?? 0);
      } catch (error) {
        console.error("공지사항 불러오기 실패:", error);
        alert("공지사항을 불러오지 못했습니다.");
      }
    })();
  }, [page]);

  const handlePageChange = (newPage) => setPage(newPage);

  const pageGroupSize = 10;
  const currentGroup = Math.floor(page / pageGroupSize);
  const startPage = currentGroup * pageGroupSize;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages - 1);

  const pageButtons = [];
  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <button
        key={i}
        onClick={() => handlePageChange(i)}
        disabled={page === i}
        className={`p-2 rounded-md ${
          page === i
            ? "bg-blue-500 text-white"
            : "bg-transparent border border-blue-500 text-blue-500"
        } mx-1`}
      >
        {i + 1}
      </button>
    );
  }

  return (
    <div className="container mx-auto p-4 md:w-10/12">
      <h2 className="text-2xl font-bold mb-4">공지사항</h2>

      <div className="mb-3 text-right">
        {/* 현재 경로는 /notice/list 이므로 상위로 올라가서 /notice/add 로 이동 */}
        <Link to="../add">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            공지사항 등록
          </button>
        </Link>
      </div>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-2 border border-gray-300 w-1/12">ID</th>
            <th className="p-2 border border-gray-300 w-1/2">제목</th>
            <th className="p-2 border border-gray-300 w-1/12">작성자</th>
            <th className="p-2 border border-gray-300 w-2/12">작성일</th>
            <th className="p-2 border border-gray-300 w-1/12">조회수</th>
          </tr>
        </thead>
        <tbody>
          {notices.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center p-4 border border-gray-300"
              >
                공지사항이 없습니다.
              </td>
            </tr>
          ) : (
            notices.map((notice) => (
              <tr key={notice.noticeId} className="hover:bg-gray-100">
                <td className="p-2 border border-gray-300 text-center">
                  {notice.noticeId}
                </td>
                <td className="p-2 border border-gray-300">
                  {/* /notice/list → ../read/:id 로 이동 */}
                  <Link
                    to={`../read/${notice.noticeId}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {notice.title}
                  </Link>
                </td>
                <td className="p-2 border border-gray-300 text-center">
                  {notice.writerName}
                </td>
                <td className="p-2 border border-gray-300 text-center">
                  {notice.createdAt
                    ? new Date(notice.createdAt).toLocaleString()
                    : "-"}
                </td>
                <td className="p-2 border border-gray-300 text-center">
                  {notice.viewCount}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-center mt-3">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l-lg me-2"
          onClick={() => handlePageChange(startPage - 1)}
          disabled={startPage === 0}
        >
          이전
        </button>
        {pageButtons}
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r-lg ms-2"
          onClick={() => handlePageChange(endPage + 1)}
          disabled={endPage === totalPages - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default NoticeListPage;
