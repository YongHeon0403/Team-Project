// client/src/components/product/ProductAddComponent.jsx
// [변경 요약]
// - 점선 업로드 박스 아래에 "선택한 새 이미지 미리보기" 그리드 추가
// - 각 썸네일 우측 상단에 X 버튼으로 개별 제거(Modify와 동일한 UX)
// - MAX_IMAGES 초과 선택 방지 및 남은 슬롯 표시
// - 버튼/입력 톤은 게시판과 동일한 Tailwind 유틸 스타일

import { useEffect, useMemo, useState } from "react";
import { addProduct, listCategories } from "../../api/productApi";
import MapComponent from "./MapComponent";

const MAX_TITLE = 30;
const MAX_DESC = 2000;
const MAX_TAGS = 3;
const MAX_IMAGES = 5;

export default function ProductAddComponent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    conditionStatus: "중고A",
    tradeMethod: "직거래",
    addr: "",
    categoryId: "",
    tagNames: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]); // [변경] 선택한 새 이미지들
  const [categories, setCategories] = useState([]);

  // 카테고리 로드(프로젝트 응답 형태 방어)
  useEffect(() => {
    listCategories()
      .then((raw) => {
        const arr = Array.isArray(raw) ? raw
          : Array.isArray(raw?.content) ? raw.content
          : Array.isArray(raw?.dtoList) ? raw.dtoList
          : Array.isArray(raw?.list) ? raw.list
          : [];
        setCategories(arr);
      })
      .catch(() => setCategories([]));
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // [변경] 파일 추가: 총합이 MAX_IMAGES를 넘지 않도록 제한
  const onImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remainSlots = Math.max(0, MAX_IMAGES - images.length);
    const picked = files.slice(0, remainSlots);
    setImages((prev) => [...prev, ...picked]);
    e.target.value = ""; // 같은 파일 재선택 가능
  };

  // [변경] 선택한 파일 개별 제거 (modify와 동일 UX)
  const removeImageAt = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // [변경] 미리보기 URL 생성/해제
  const previews = useMemo(
    () => images.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [images]
  );
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tagNames.includes(t) || form.tagNames.length >= MAX_TAGS) return;
    setForm((f) => ({ ...f, tagNames: [...f.tagNames, t] }));
    setTagInput("");
  };
  const removeTag = (t) =>
    setForm((f) => ({ ...f, tagNames: f.tagNames.filter((x) => x !== t) }));

  const validate = () => {
    if (!form.title || form.title.length > MAX_TITLE) {
      alert(`제목은 1~${MAX_TITLE}자`);
      return false;
    }
    if (!form.description || form.description.length > MAX_DESC) {
      alert(`설명은 1~${MAX_DESC}자`);
      return false;
    }
    if (!form.price || Number.isNaN(Number(form.price))) {
      alert("가격을 숫자로 입력하세요");
      return false;
    }
    if (!form.categoryId) {
      alert("카테고리를 선택하세요");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await addProduct(form, images); // [유지] 서버로 새 이미지들과 함께 전송
    window.location.href = "/product/list";
  };

  const remainSlots = Math.max(0, MAX_IMAGES - images.length);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6">상품 등록</h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* 제목 */}
        <div>
          <label className="block mb-1 font-medium">제목</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            maxLength={MAX_TITLE}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block mb-1 font-medium">설명</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={6}
            maxLength={MAX_DESC}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 가격 / 상태 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">가격</label>
            <input
              name="price"
              value={form.price}
              onChange={onChange}
              placeholder="숫자만 입력"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">상태</label>
            <select
              name="conditionStatus"
              value={form.conditionStatus}
              onChange={onChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>중고A</option>
              <option>중고B</option>
              <option>미개봉</option>
            </select>
          </div>
        </div>

        {/* 거래 방식 / 지역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">거래방식</label>
            <select
              name="tradeMethod"
              value={form.tradeMethod}
              onChange={onChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>직거래</option>
              <option>택배</option>
              <option>나눔</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">거래 주소</label>
            <input
              name="addr"
              value={form.addr}
              readOnly
              placeholder="지도를 클릭해 주소를 선택하세요"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2 bg-gray-50"
            />
            <MapComponent
              addr={form.addr}
              setAddr={(addr) => setForm((prev) => ({ ...prev, addr }))}
            />
          </div>
        </div>

        {/* 카테고리 / 태그 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">카테고리</label>
            <select
              name="categoryId"
              value={String(form.categoryId ?? "")}
              onChange={onChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">선택</option>
              {categories.map((c) => (
                <option key={c.categoryId ?? c.id} value={c.categoryId ?? c.id}>
                  {c.name ?? c.categoryName ?? c.title ?? "카테고리"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              태그 <span className="text-xs text-gray-500">(최대 {MAX_TAGS})</span>
            </label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="엔터로 추가"
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
              >
                추가
              </button>
            </div>
            {form.tagNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.tagNames.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded border border-gray-300 bg-gray-50"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 이미지 (최대 5) */}
        <div>
          <label className="block mb-1 font-medium">
            이미지 (최대 {MAX_IMAGES}){" "}
            <span className="text-sm text-gray-500">(남은 슬롯: {remainSlots})</span>
          </label>

          {/* 점선 업로드 박스 */}
          <div className="border border-dashed border-gray-300 rounded p-4">
            <label
              htmlFor="productImages"
              className={`cursor-pointer flex items-center justify-center h-28 border border-gray-200 rounded-md text-gray-600 hover:border-blue-400 transition ${
                remainSlots <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span>파일 선택</span>
            </label>
            <input
              id="productImages"
              type="file"
              accept="image/*"
              multiple
              onChange={onImagesChange}
              disabled={remainSlots <= 0}
              className="hidden"
            />

            {/* [수정] 미리보기 + X 제거 버튼 */}
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {previews.map((p, idx) => (
                  // [변경] 카드에서 overflow-hidden 제거
                  <div key={idx} className="relative border rounded bg-gray-50">
                    {/* [추가] 이미지 영역만 둥근 모서리 + overflow-hidden */}
                    <div className="rounded-t overflow-hidden">
                      <img src={p.url} alt="" className="w-full h-32 object-cover" />
                    </div>

                   <div className="px-2 py-1 text-xs truncate">{p.file.name}</div>

                   {/* [변경] 버튼을 카드 안쪽으로(top-1/right-1) */}
                   <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full border bg-white text-gray-700 hover:bg-gray-100 shadow"
                      title="이미지 제거"
                    >
                      ✕
                   </button>
                  </div>
              ))}
              </div>
            )}
          </div>
        </div>

        {/* 제출 */}
        <div className="pt-2">
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}
