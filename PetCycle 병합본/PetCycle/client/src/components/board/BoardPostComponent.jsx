import React, { useState } from "react";
import { registerPost } from "../../api/board/PostApi";
import { useNavigate } from "react-router-dom";

const BoardPostComponent = () => {
  const navigate = useNavigate();
  const MAX_FILE_COUNT = 5;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryName: "자유게시판",
  });

  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles = files.length + selectedFiles.length;

    if (totalFiles > MAX_FILE_COUNT) {
      alert(`파일은 최대 ${MAX_FILE_COUNT}개까지 첨부할 수 있습니다.`);
      e.target.value = null;
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleFileRemove = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      boardPostDTO: {
        title: formData.title,
        content: formData.content,
        categoryName: formData.categoryName,
      },
      files,
    };

    try {
      const result = await registerPost(postData);
      console.log("등록 완료:", result);

      const postId = result?.postId;
      if (!postId) {
        alert("등록된 게시글 ID를 가져오지 못했습니다.");
        return;
      }

      navigate(`/board/read/${postId}`);
    } catch (err) {
      console.error("게시글 등록 오류:", err);
      alert("게시글 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6">게시글 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 카테고리 선택 */}
        <div>
          <label className="block mb-1 font-medium">카테고리</label>
          <select
            name="categoryName"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.categoryName}
            onChange={handleChange}
          >
            <option value="자유게시판">자유게시판</option>
            <option value="Q&A">Q&A</option>
            <option value="정보공유게시판">정보공유게시판</option>
          </select>
        </div>

        {/* 제목 입력 */}
        <div>
          <label className="block mb-1 font-medium">제목</label>
          <input
            type="text"
            name="title"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* 내용 입력 */}
        <div>
          <label className="block mb-1 font-medium">내용</label>
          <textarea
            name="content"
            rows="6"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.content}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* 첨부파일 업로드 */}
        <div>
          <label className="block mb-1 font-medium">첨부파일</label>
          <div className="border border-gray-300 rounded p-4">
            <div className="relative mb-2">
              <label
                htmlFor="fileInput"
                className="cursor-pointer flex items-center justify-center p-2 border-dashed border-2 border-gray-400 rounded-md text-gray-600 hover:border-blue-400 transition"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
                <span>파일 선택</span>
              </label>
              <input
                id="fileInput"
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {files.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium mb-1">선택된 파일:</p>
                <ul className="list-disc list-inside space-y-1">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleFileRemove(file)}
                        className="ml-2 text-red-500 hover:text-red-700 font-bold cursor-pointer"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">
              최대 {MAX_FILE_COUNT}개까지 첨부 가능합니다.
            </p>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-500"
        >
          등록
        </button>
      </form>
    </div>
  );
};

export default BoardPostComponent;
