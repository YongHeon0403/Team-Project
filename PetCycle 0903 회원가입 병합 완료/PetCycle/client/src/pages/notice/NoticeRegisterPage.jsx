// src/pages/notice/NoticeRegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addNotice } from "../../api/noticeApi"; // axios 대신 API 래퍼 사용

const NoticeRegisterPage = () => {
  const [notice, setNotice] = useState({
    title: "",
    content: "",
    isPublished: true, // UI만 유지, 서버에는 전송하지 않음
    isPrivate: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "status") {
      setNotice((prev) => ({
        ...prev,
        isPublished: value === "published",
        isPrivate: value === "private",
      }));
    } else {
      setNotice((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 서버 DTO는 title, content만 받음
    const payload = { title: notice.title, content: notice.content };

    try {
      await addNotice(payload); // POST /api/notices (jwtAxios)
      alert("공지사항 등록 완료");
      navigate("/notice"); // /notice → /notice/list 로 라우터에서 리다이렉트
    } catch (error) {
      console.error("공지사항 등록 실패:", error);
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        alert("권한이 없거나 로그인 정보가 만료되었습니다.");
      } else {
        alert("공지사항 등록에 실패했습니다. 로그인 상태를 확인해주세요.");
      }
    }
  };

  return (
    <div className="container mx-auto p-4 md:w-10/12">
      <h2 className="text-2xl font-bold mb-4">공지사항 등록</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        {/* 제목 입력 필드 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
            제목
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={notice.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="제목을 입력하세요."
          />
        </div>

        {/* 내용 입력 필드 */}
        <div className="mb-6">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="content"
          >
            내용
          </label>
          <textarea
            id="content"
            name="content"
            rows="8"
            value={notice.content}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="내용을 입력하세요."
          />
        </div>

        {/* 게시 상태 드롭다운 (UI만) */}
        <div className="mb-6">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="status"
          >
            게시 상태
          </label>
          <select
            id="status"
            name="status"
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={notice.isPublished ? "published" : "private"}
          >
            <option value="published">게시</option>
            <option value="private">숨김</option>
          </select>
        </div>

        {/* 등록 버튼 */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoticeRegisterPage;
