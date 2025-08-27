// client/src/components/product/ProductModifyComponent.jsx
// ------------------------------------------------------------------
// 상품 수정 컴포넌트
// - 상태 변경(SELLING/RESERVED/SOLD)
// - 기존 이미지 표시 + 개별 삭제 토글
// - 새 이미지 추가(미리보기) + 개별 제거
// - 제출 시: 텍스트 + 새 이미지(images[]) + 삭제 목록(removeFileNames[])
//   => productApi.updateProduct 가 uploadFileNames/삭제 계산까지 처리
// ------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProduct, updateProduct, getImageUrl } from "../../api/productApi";

const MAX_IMAGES = 5;
const STATUS_OPTIONS = [
  { value: "SELLING", label: "판매 중" },
  { value: "RESERVED", label: "예약 중" },
  { value: "SOLD", label: "거래 완료" }, // 서버 값이 다르면 value만 서버 enum에 맞춰 수정
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

export default function ProductModifyComponent({ productId }) {
  const nav = useNavigate();

  // 폼(텍스트) 상태
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    status: "SELLING",
    // 필요시 추가 필드: conditionStatus, tradeMethod, tradeLocation, categoryId 등
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

    // 삭제 목록(파일명 배열)
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
    <div className="bg-gray-50 rounded p-4">
      <h2 className="text-xl font-semibold mb-4">상품 수정</h2>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className="input input-bordered w-full"
            placeholder="상품 제목"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium mb-1">내용</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="textarea textarea-bordered w-full h-36"
            placeholder="상품 설명"
          />
        </div>

        {/* 가격 */}
        <div>
          <label className="block text-sm font-medium mb-1">가격</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={onChange}
            className="input input-bordered w-full"
            placeholder="가격(원)"
          />
        </div>

        {/* 상태 */}
        <div>
          <label className="block text-sm font-medium mb-1">상태</label>
          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="select select-bordered w-full"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* 기존 이미지 */}
        <div>
          <div className="text-sm font-medium mb-2">
            기존 이미지 ({keptCount}/{MAX_IMAGES})
          </div>

          {!existing.length ? (
            <div className="text-sm text-gray-500">
              등록된 이미지가 없습니다.
            </div>
          ) : (
            <ul className="flex flex-wrap gap-3">
              {existing.map(({ name, url }) => {
                const marked = removeSet.has(name);
                return (
                  <li key={name} className="relative">
                    <img
                      src={url || getImageUrl(name)}
                      alt={name}
                      className={`w-28 h-28 object-cover rounded border ${
                        marked ? "opacity-40" : ""
                      }`}
                      title={name}
                    />
                    {/* 삭제 토글 버튼 */}
                    <button
                      type="button"
                      onClick={() => toggleRemove(name)}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full border bg-white"
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
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onAddFiles}
            disabled={remainSlots <= 0}
          />
          {!!previews.length && (
            <ul className="mt-3 flex flex-wrap gap-3">
              {previews.map((p, idx) => (
                <li key={idx} className="relative">
                  <img
                    src={p.url}
                    alt={p.file.name}
                    className="w-28 h-28 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFileAt(idx)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full border bg-white"
                    title="새 이미지 제거"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 제출 */}
        <div className="pt-2">
          <button type="submit" className="btn btn-primary">
            수정
          </button>
        </div>
      </form>
    </div>
  );
}
