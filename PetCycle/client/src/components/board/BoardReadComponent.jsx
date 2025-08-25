import React, { useEffect, useState } from "react";
import { getPostOne, getFile } from "../../api/board/PostApi";
import useCustomMove from "../../hooks/useCustomMove";
import { getCookie } from "../../util/CookieUtil";

const initState = {
  postId: 0,
  userInfo: null, // 작성자 PK(Long)
  title: "",
  nickname: "",
  content: "",
  viewCount: 0,
  isDeleted: false,
  categoryName: "",
  uploadFileNames: [],
  createdAt: null,
  updatedAt: null,
};

// 작성일/수정일 포맷 함수 (yyyy-MM-dd HH:mm)
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
};

const BoardReadComponent = ({ postId }) => {
  const [post, setPost] = useState(initState);
  const [modalImage, setModalImage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { moveToList, moveToModify } = useCustomMove();

  useEffect(() => {
    // 게시글 불러오기
    getPostOne(postId)
      .then((data) => setPost(data))
      .catch((e) => console.error("getPostOne error:", e));

    // 쿠키에서 사용자 정보(객체) 그대로 사용
    const userObj = getCookie("user");
    setCurrentUserId(userObj?.userId ?? null);
  }, [postId]);

  const imageFileRegex = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
  const imageFiles = (post.uploadFileNames || []).filter((name) =>
    imageFileRegex.test(name)
  );
  const otherFiles = (post.uploadFileNames || []).filter(
    (name) => !imageFileRegex.test(name)
  );
  const paragraphs = (post.content || "").split(/\n{2,}/);

  // 본인 글인지 여부(작성자 PK === 로그인 사용자 PK)
  const canEdit =
    post.userInfo != null &&
    currentUserId != null &&
    post.userInfo === currentUserId;

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="bg-white shadow-sm rounded-md">
        <div className="p-6">
          {/* 제목 */}
          <h2 className="text-2xl font-bold mb-3">{post.title}</h2>

          {/* 작성자/작성일/조회수 */}
          <div className="flex text-gray-500 text-sm mb-4">
            <div className="mr-4">✍ {post.nickname}</div>
            <div className="mr-auto">{formatDateTime(post.createdAt)}</div>
            <div>👁 {post.viewCount}</div>
          </div>

          {/* 이미지 썸네일 (클릭 시 원본 모달) */}
          {imageFiles.length > 0 && (
            <div className="text-center mb-4 flex flex-wrap justify-center gap-4">
              {imageFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={getFile("s_" + file)}
                  alt={`thumbnail-${idx + 1}`}
                  className="rounded shadow-sm cursor-zoom-in object-cover max-w-[200px] max-h-[150px] md:max-w-[250px] md:max-h-[200px]"
                  onClick={() => setModalImage(getFile(file))}
                />
              ))}
            </div>
          )}

          {/* 본문 */}
          {paragraphs.length === 1 && paragraphs[0] === "" ? (
            <p className="text-gray-500">내용이 없습니다.</p>
          ) : (
            paragraphs.map((para, idx) => (
              <div key={idx} className="mb-3 whitespace-pre-wrap">
                {para}
              </div>
            ))
          )}

          {/* 이미지 외 첨부파일 */}
          {otherFiles.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <h6 className="font-bold mb-2">📎 첨부파일</h6>
              <ul className="list-none">
                {otherFiles.map((file, idx) => (
                  <li key={idx}>
                    <a
                      href={getFile(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 이미지 모달 */}
          {modalImage && (
            <div
              onClick={() => setModalImage(null)}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-[95vw] max-h-[95vh] overflow-y-auto"
              >
                <img
                  src={modalImage}
                  alt="원본 이미지"
                  className="w-full h-auto object-contain rounded-lg shadow-lg"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-white bg-opacity-75 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-opacity-100 transition-all"
                  onClick={() => setModalImage(null)}
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              onClick={() => moveToList()}
            >
              목록
            </button>

            {canEdit && (
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                onClick={() => moveToModify(post.postId)}
              >
                수정
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardReadComponent;
