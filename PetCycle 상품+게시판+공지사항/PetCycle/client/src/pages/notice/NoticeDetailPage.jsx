// src/pages/notice/NoticeDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { getNotice, removeNotice } from "../../api/noticeApi";

const NoticeDetailPage = () => {
  const { noticeId } = useParams(); // /notice/read/:noticeId
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 작성자 동일 여부 확인(팀원 로직 유지)
  const loggedInUserId = Number(Cookies.get("userId"));

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!noticeId) return;
      try {
        const res = await getNotice(noticeId); // GET /api/notices/{id}
        if (!ignore) setNotice(res.data);
      } catch (err) {
        console.error("공지사항 상세 조회 실패:", err);
        alert("공지사항을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [noticeId]);

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) return;
    try {
      await removeNotice(noticeId); // DELETE /api/notices/{id} (jwtAxios 사용)
      alert("공지사항이 삭제되었습니다.");
      navigate("/notice"); // /notice → NoticeRouter가 list로 리다이렉트
    } catch (error) {
      console.error("공지사항 삭제 실패:", error);
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        alert("삭제 권한이 없거나 로그인 정보가 만료되었습니다.");
      } else {
        alert("삭제에 실패했습니다.");
      }
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!notice)
    return <div className="text-center p-4">공지사항이 없습니다.</div>;

  const isWriter = notice.writerId === loggedInUserId;

  return (
    <div className="container mx-auto p-4 md:w-10/12 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{notice.title}</h2>
      <div className="text-sm text-gray-500 mb-4 flex justify-between items-center">
        <div>
          <span className="font-semibold">작성자:</span> {notice.writerName}
        </div>
        <div>
          <span className="font-semibold">조회수:</span> {notice.viewCount}
        </div>
        <div>
          <span className="font-semibold">작성일:</span>{" "}
          {notice.createdAt ? new Date(notice.createdAt).toLocaleString() : "-"}
        </div>
      </div>
      <hr className="my-4 border-t border-gray-300" />
      <div className="prose max-w-none text-gray-700 leading-relaxed">
        <p>{notice.content}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-end">
        <button
          onClick={() => navigate("/notice")}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          목록으로
        </button>

        {isWriter && (
          <>
            {/* /notice/read/:noticeId → ../modify/:noticeId */}
            <Link to={`../modify/${noticeId}`}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                수정
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NoticeDetailPage;
