// client/src/components/product/ProductModifyComponent.jsx
// ------------------------------------------------------------------
// 상품 수정 컴포넌트 (게시판 UI 톤으로 통일)
// [변경 요약]
// - DaisyUI 클래스(input/select/textarea/btn) 제거 → Tailwind 유틸로 통일
// - 페이지 레이아웃: bg-white shadow-sm rounded-md p-6 카드 스타일 적용
// - 파일 업로드 UI: 점선 박스(게시판과 동일) + 미리보기 그리드
// - 기존 이미지에 삭제 토글 버튼 오버레이 유지
// ------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, updateProduct, getImageUrl } from "../../api/productApi";

const MAX_IMAGES = 5;
const STATUS_OPTIONS = [
  { value: "SELLING", label: "판매 중" },
  { value: "RESERVED", label: "예약 중" },
  { value: "SOLD", label: "거래 완료" },
];

// URL 또는 파일명 문자열 → "파일명"만 추출
function fileNameFromUrl(u) {
  if (!u) return u;
  const s = String(u);
  if (!s.includes("/")) return s;
  try {
    return decodeURIComponent(s.split("/").pop());
  } catch {
    return s.split("/").pop();
  }
}

export default function ProductModifyComponent(props) {
  const { productId: paramId } = useParams();
  const productId = Number(props?.productId ?? paramId); // ✅ 프롭 우선, 없으면 라우트
  const nav = useNavigate();

  // ✅ 필수 파라미터 가드
  if (!Number.isFinite(productId)) {
    return <div className="p-4 text-red-600">잘못된 접근입니다. (productId 없음)</div>;
  }

  // 폼(텍스트) 상태
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    status: "SELLING",
    // 필요시 추가: conditionStatus, tradeMethod, tradeLocation, categoryId 등
  });

  // 서버에 이미 저장돼있는 이미지들: [{name, url}]
  const [existing, setExisting] = useState([]);
  // 기존 이미지 중 삭제로 표시한 파일명 집합
  const [removeSet, setRemoveSet] = useState(() => new Set());
  // 새로 추가한 파일들
  const [newFiles, setNewFiles] = useState([]);

  const [loading, setLoading] = useState(true);

  // 초기 로드: 단건 조회 → 폼/이미지 세팅
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const d = await getProduct(productId);
        setForm({
          title: d.title ?? "",
          description: d.description ?? "",
          price: d.price ?? "",
          status: d.status || "SELLING",
        });

        // 상세의 images[].imageUrl 은 이미 절대 URL(ToViewUrl) 상태
        const ex = Array.isArray(d.images)
          ? d.images.map((img) => ({
              url: img.imageUrl,
              name: fileNameFromUrl(img.imageUrl), // 삭제/유지 계산용 파일명
            }))
          : [];
        setExisting(ex);
        setRemoveSet(new Set());
        setNewFiles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // 입력 변경
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 기존 이미지 삭제 토글
  const toggleRemove = (name) => {
    setRemoveSet((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  // 새 파일 추가
  const onAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 총합(기존-삭제표시 + 새파일)이 MAX_IMAGES를 넘지 않도록 제한
    const currentCnt = existing.filter((x) => !removeSet.has(x.name)).length;
    const remainSlots = Math.max(0, MAX_IMAGES - currentCnt);
    const picked = files.slice(0, remainSlots);

    setNewFiles((prev) => [...prev, ...picked]);
    e.target.value = ""; // 같은 파일 재선택 가능
  };

  // 새 파일 제거
  const removeNewFileAt = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // 새 파일 미리보기 URL
  const previews = useMemo(
    () => newFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newFiles]
  );
  useEffect(() => {
    // 메모리 해제
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  // 제출
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.title?.trim()) return alert("제목을 입력하세요.");
    if (!String(form.price).trim()) return alert("가격을 입력하세요.");

    const removeFileNames = Array.from(removeSet);
    try {
      await updateProduct(productId, form, newFiles, { removeFileNames });
      alert("수정되었습니다.");
      nav(`/product/read/${productId}`);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="p-4 text-sm text-gray-500">로딩중…</div>;

  const keptCount = existing.filter((x) => !removeSet.has(x.name)).length;
  const remainSlots = Math.max(0, MAX_IMAGES - keptCount);

  return (
    // [변경] 게시판 톤의 카드 레이아웃 적용
    <div className="container mx-auto mt-8 px-4">
      <div className="bg-white shadow-sm rounded-md p-6">
        <h2 className="text-2xl font-bold mb-6">상품 수정</h2>

        {/* [변경] 폼 요소 Tailwind 유틸로 통일 */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* 제목 */}
          <div>
            <label className="block mb-1 font-medium">제목</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="상품 제목"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block mb-1 font-medium">내용</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={6}
              placeholder="상품 설명"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* 가격 / 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">가격</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={onChange}
                placeholder="가격(원)"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">상태</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 기존 이미지 */}
          <div>
            <div className="text-sm font-medium mb-2">
              기존 이미지 ({keptCount}/{MAX_IMAGES})
            </div>

            {!existing.length ? (
              <div className="text-sm text-gray-500">등록된 이미지가 없습니다.</div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {existing.map(({ name, url }) => {
                  const marked = removeSet.has(name);
                  return (
                    <li key={name} className="relative">
                      <img
                        src={url || getImageUrl(name)}
                        alt={name}
                        className={`w-full h-28 object-cover rounded border ${marked ? "opacity-40" : ""}`}
                        title={name}
                      />
                      {/* [변경] 삭제 토글 버튼 스타일 통일 */}
                      <button
                        type="button"
                        onClick={() => toggleRemove(name)}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full border bg-white text-gray-700 hover:bg-gray-100"
                        title={marked ? "삭제 취소" : "삭제 표시"}
                      >
                        {marked ? "↺" : "✕"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {removeSet.size > 0 && (
              <div className="mt-2 text-xs text-red-600">
                {removeSet.size}개의 기존 이미지가 삭제 대상입니다.
              </div>
            )}
          </div>

          {/* 새 이미지 추가 */}
          <div>
            <div className="text-sm font-medium mb-2">
              새 이미지 추가 (남은 슬롯: {remainSlots})
            </div>

            {/* [변경] 점선 업로드 박스 + 숨겨진 input */}
            <div className="border border-dashed border-gray-300 rounded p-4">
              <label
                htmlFor="newProductImages"
                className="cursor-pointer flex items-center justify-center h-28 border border-gray-200 rounded-md text-gray-600 hover:border-blue-400 transition"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                <span>파일 선택</span>
              </label>
              <input
                id="newProductImages"
                type="file"
                accept="image/*"
                multiple
                onChange={onAddFiles}
                disabled={remainSlots <= 0}
                className="hidden"
              />

              {/* 미리보기 */}
              {!!previews.length && (
                <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previews.map((p, idx) => (
                    <li key={idx} className="relative">
                      <img
                        src={p.url}
                        alt={p.file.name}
                        className="w-full h-28 object-cover rounded border"
                      />
                      <div className="px-2 py-1 text-xs truncate">{p.file.name}</div>
                      <button
                        type="button"
                        onClick={() => removeNewFileAt(idx)}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full border bg-white text-gray-700 hover:bg-gray-100"
                        title="새 이미지 제거"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 제출 */}
          <div className="pt-2">
            {/* [변경] 버튼 스타일 통일 */}
            <button
              type="submit"
              className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
            >
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
