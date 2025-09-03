// src/pages/notice/NoticeModifyPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNotice, updateNotice } from "../../api/noticeApi";

const NoticeModifyPage = () => {
  const { noticeId } = useParams(); // /notice/modify/:noticeId
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);

  // 기존 데이터 로드
  useEffect(() => {
    if (!noticeId) return;
    let ignore = false;
    (async () => {
      try {
        const res = await getNotice(noticeId); // GET /api/notices/{id}
        if (!ignore) {
          const n = res.data || {};
          setForm({
            title: n.title || "",
            content: n.content || "",
          });
        }
      } catch (err) {
        console.error("공지 불러오기 실패:", err);
        alert("공지사항을 불러오지 못했습니다.");
        navigate("/notice");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [noticeId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateNotice(noticeId, {
        title: form.title,
        content: form.content,
      }); // PUT /api/notices/{id} (jwtAxios)
      alert("수정되었습니다.");
      navigate(`/notice/read/${noticeId}`);
    } catch (err) {
      console.error("공지 수정 실패:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert("수정 권한이 없거나 로그인 정보가 만료되었습니다.");
      } else {
        alert("수정에 실패했습니다.");
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-4 md:w-10/12">
      <h2 className="text-2xl font-bold mb-4">공지사항 수정</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        {/* 제목 */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="제목을 입력하세요."
          />
        </div>

        {/* 내용 */}
        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-gray-700 font-bold mb-2"
          >
            내용
          </label>
          <textarea
            id="content"
            name="content"
            rows="8"
            value={form.content}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="내용을 입력하세요."
          />
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoticeModifyPage;
