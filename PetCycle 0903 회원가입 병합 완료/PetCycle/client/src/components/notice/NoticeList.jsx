import React from "react";
import { Link } from "react-router-dom";

const NoticeList = ({ notices = [] }) => {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">공지사항 목록</h2>
        <Link to="add">
          <button className="px-3 py-2 rounded-2xl shadow border hover:shadow-md transition">
            공지사항 등록
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">제목</th>
              <th className="p-3">작성자</th>
              <th className="p-3">작성일</th>
              <th className="p-3">조회수</th>
            </tr>
          </thead>
          <tbody>
            {notices.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              notices.map((n) => (
                <tr key={n.noticeId} className="border-t">
                  <td className="p-3">{n.noticeId}</td>
                  <td className="p-3">
                    <Link
                      to={`read/${n.noticeId}`}
                      className="underline hover:no-underline"
                    >
                      {n.title}
                    </Link>
                  </td>
                  <td className="p-3">{n.writerName}</td>
                  <td className="p-3">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-3">{n.viewCount ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NoticeList;
