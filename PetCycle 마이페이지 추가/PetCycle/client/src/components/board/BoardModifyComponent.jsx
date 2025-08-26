import React, { useEffect, useState } from "react";
import {
  getPostOne,
  modifyPost,
  removePost,
  removeAttachment,
  getFile,
} from "../../api/board/PostApi";
import { useNavigate } from "react-router-dom";

const MAX_FILE_COUNT = 5;

const initState = {
  postId: 0,
  title: "",
  content: "",
  categoryName: "",
  nickname: "",
  // [{ attachmentId: number|null, fileName: string }]
  fileList: [],
};

const BoardModifyComponent = ({ postId }) => {
  const navigate = useNavigate();
  const [post, setPost] = useState(initState);
  const [newFiles, setNewFiles] = useState([]);
  const [busyId, setBusyId] = useState(null);

  // 모달 상태
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null); // "modify" | "delete" | null
  const [modalOpen, setModalOpen] = useState(false);

  // ----- 데이터 불러오기 -----
  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const data = await getPostOne(postId);

        // ✅ 서버 응답 정규화: attachmentList → fileList (폴백: uploadFileNames)
        const normalizedFileList =
          Array.isArray(data.attachmentList) && data.attachmentList.length
            ? data.attachmentList.map((f) => ({
              attachmentId: f.attachmentId ?? null,
              fileName: f.fileName,
            }))
            : Array.isArray(data.uploadFileNames) && data.uploadFileNames.length
              ? data.uploadFileNames.map((name) => ({
                attachmentId: null,
                fileName: name,
              }))
              : [];

        setPost({
          postId: data.postId,
          title: data.title || "",
          content: data.content || "",
          categoryName: data.categoryName || "자유게시판",
          nickname: data.nickname || "",
          fileList: normalizedFileList,
        });
        setNewFiles([]);
      } catch (err) {
        console.error("getPostOne error:", err);
        showModal("게시글 정보를 불러오지 못했습니다.");
      }
    })();
  }, [postId]);

  // ----- 입력 변경 -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  // ----- 새 파일 추가 -----
  const handleNewFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const total = post.fileList.length + newFiles.length + selected.length;

    if (total > MAX_FILE_COUNT) {
      alert(`파일은 최대 ${MAX_FILE_COUNT}개까지 첨부할 수 있습니다.`);
      e.target.value = null;
      return;
    }
    setNewFiles((prev) => [...prev, ...selected]);
  };

  // ----- 새 파일 제거(클라 UI만) -----
  const handleNewFileRemove = (fileToRemove) => {
    setNewFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  // ----- 기존 파일 개별 삭제 -----
  const handleExistingFileRemove = async (attachmentId, fileName) => {
    if (!attachmentId) {
      alert("이 파일은 개별 삭제 ID(attachmentId)가 없어 수정 저장으로만 변경 가능합니다.");
      return;
    }
    if (!window.confirm(`${fileName} 파일을 삭제하시겠습니까?`)) return;

    try {
      setBusyId(attachmentId);
      await removeAttachment(post.postId, attachmentId);
      // 상태 동기화
      setPost((prev) => ({
        ...prev,
        fileList: prev.fileList.filter((f) => f.attachmentId !== attachmentId),
      }));
      showModal("파일이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      showModal("파일 삭제 중 오류가 발생했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  // ----- 수정 저장 -----
  const handleModify = async () => {
    try {
      // ✅ 유지할 기존 파일명들을 서버에 전달해야 함 (안 보내면 삭제로 간주될 수 있음)
      const keepFileNames = post.fileList.map((f) => f.fileName);

      const payload = {
        boardPostDTO: {
          postId: post.postId,
          title: post.title,
          content: post.content,
          categoryName: post.categoryName,
          uploadFileNames: keepFileNames, // ✅ 유지 리스트
        },
        files: newFiles, // 새로 추가할 파일
      };

      await modifyPost(post.postId, payload);
      showModal("게시글이 수정되었습니다.", "modify");
    } catch (err) {
      console.error(err);
      showModal("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  // ----- 삭제 -----
  const handleDelete = async () => {
    if (!window.confirm("게시글을 정말 삭제하시겠습니까?")) return;
    try {
      await removePost(post.postId);
      showModal("게시글이 삭제되었습니다.", "delete");
    } catch (err) {
      console.error(err);
      showModal("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  // ----- 목록 -----
  const handleList = () => navigate("/board/list");

  // ----- 모달 -----
  const showModal = (message, action = null) => {
    setModalMessage(message);
    setModalAction(action);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (modalAction === "modify") navigate(`/board/read/${post.postId}`);
    else if (modalAction === "delete") navigate("/board/list");
  };

  // ----- 렌더링 보조 -----
  const imageFileRegex = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
  const imageFiles = post.fileList.filter((f) => imageFileRegex.test(f.fileName));
  const otherFiles = post.fileList.filter((f) => !imageFileRegex.test(f.fileName));
  const totalAttached = post.fileList.length + newFiles.length;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6">게시글 수정</h2>

      <div className="space-y-4">
        {/* 게시글 번호 */}
        <div>
          <label className="block mb-1 font-medium">게시글 번호</label>
          <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100">
            {post.postId}
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block mb-1 font-medium">카테고리</label>
          <select
            name="categoryName"
            value={post.categoryName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="자유게시판">자유게시판</option>
            <option value="Q&A">Q&A</option>
            <option value="정보공유게시판">정보공유게시판</option>
          </select>
        </div>

        {/* 제목 */}
        <div>
          <label className="block mb-1 font-medium">제목</label>
          <input
            type="text"
            name="title"
            value={post.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block mb-1 font-medium">내용</label>
          <textarea
            name="content"
            rows="6"
            value={post.content}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 작성자 */}
        {post.nickname && (
          <div>
            <label className="block mb-1 font-medium">작성자</label>
            <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100">
              {post.nickname}
            </div>
          </div>
        )}

        {/* 첨부파일 */}
        <div>
          <label className="block mb-1 font-medium">첨부파일</label>
          <div className="border border-gray-300 rounded p-4">
            {/* 이미지 */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {imageFiles.map((f) => (
                  <div key={f.fileName} className="border rounded p-2">
                    <img
                      src={getFile("s_" + f.fileName)}
                      alt={f.fileName}
                      className="w-full h-32 object-contain cursor-pointer"
                      onClick={() => window.open(getFile(f.fileName), "_blank")}
                    />
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="truncate mr-2">{f.fileName}</span>
                      <button
                        type="button"
                        onClick={() => handleExistingFileRemove(f.attachmentId, f.fileName)}
                        disabled={!f.attachmentId || busyId === f.attachmentId}
                        className={`ml-2 font-bold ${!f.attachmentId || busyId === f.attachmentId
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-500 hover:text-red-700"
                          }`}
                        title={
                          !f.attachmentId
                            ? "삭제 ID가 없어 개별 삭제 불가"
                            : "삭제"
                        }
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 기타 파일 */}
            {otherFiles.length > 0 && (
              <ul className="list-none space-y-1 mb-4">
                {otherFiles.map((f) => (
                  <li
                    key={f.fileName}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <a
                      href={getFile(f.fileName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {f.fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleExistingFileRemove(f.attachmentId, f.fileName)}
                      disabled={!f.attachmentId || busyId === f.attachmentId}
                      className={`ml-2 font-bold ${!f.attachmentId || busyId === f.attachmentId
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-red-500 hover:text-red-700"
                        }`}
                      title={
                        !f.attachmentId
                          ? "삭제 ID가 없어 개별 삭제 불가"
                          : "삭제"
                      }
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* 새 파일 추가 */}
            <div className="mb-2">
              <input
                id="newFileInput"
                type="file"
                multiple
                onChange={handleNewFileChange}
                className="hidden"
              />
              <label
                htmlFor="newFileInput"
                className="cursor-pointer flex items-center justify-center p-2 border-dashed border-2 border-gray-400 rounded-md text-gray-600 hover:border-blue-400 transition"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
                <span>파일 추가</span>
              </label>
            </div>

            {/* 새로 추가된 파일 목록 */}
            {newFiles.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {newFiles.map((file, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleNewFileRemove(file)}
                      className="ml-2 text-red-500 hover:text-red-700 font-bold cursor-pointer"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-gray-500 mt-2 text-center">
              총 {totalAttached} / 최대 {MAX_FILE_COUNT}개까지 첨부 가능합니다.
            </p>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleModify}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-500"
          >
            수정
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-500"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={handleList}
            className="bg-gray-600 text-white px-6 py-2 rounded font-semibold hover:bg-gray-500"
          >
            목록
          </button>
        </div>
      </div>

      {/* 알림 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="p-6 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-2">알림</h3>
            <p className="py-2">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardModifyComponent;
