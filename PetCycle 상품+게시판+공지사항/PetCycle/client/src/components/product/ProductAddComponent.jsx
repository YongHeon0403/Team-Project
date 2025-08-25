import { useEffect, useState } from "react";
import { addProduct, listCategories } from "../../api/productApi";

const MAX_TITLE = 30,
  MAX_DESC = 2000,
  MAX_TAGS = 3,
  MAX_IMAGES = 5;

export default function ProductAddComponent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    conditionStatus: "중고A",
    tradeMethod: "직거래",
    tradeLocation: "",
    latitude: "",
    longitude: "",
    categoryId: "",
    tagNames: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    listCategories()
      .then((res) => {
        const raw = res?.data ?? res;
        const arr = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.content)
          ? raw.content
          : Array.isArray(raw?.dtoList)
          ? raw.dtoList
          : Array.isArray(raw?.list)
          ? raw.list
          : [];
        setCategories(arr);
      })
      .catch(() => setCategories([]));
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onImagesChange = (e) =>
    setImages(Array.from(e.target.files || []).slice(0, MAX_IMAGES));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tagNames.includes(t) || form.tagNames.length >= MAX_TAGS)
      return;
    setForm((f) => ({ ...f, tagNames: [...f.tagNames, t] }));
    setTagInput("");
  };
  const removeTag = (t) =>
    setForm((f) => ({ ...f, tagNames: f.tagNames.filter((x) => x !== t) }));

  const validate = () => {
    if (!form.title || form.title.length > MAX_TITLE)
      return alert(`제목은 1~${MAX_TITLE}자`);
    if (form.description.length > MAX_DESC)
      return alert(`설명은 ${MAX_DESC}자 이하`);
    if (!form.categoryId) return alert("카테고리를 선택하세요");
    if (images.length > MAX_IMAGES)
      return alert(`이미지는 ${MAX_IMAGES}장까지`);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await addProduct(form, images);
    // pages 쪽에서 라우팅 래핑하므로 여기선 성공 후 뒤로가기/알림만 간단 처리하거나
    // 필요 시 window.location.href로 이동해도 됨.
    window.location.href = "/product/list";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">상품 등록</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">제목</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className="input input-bordered w-full"
            maxLength={MAX_TITLE}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">설명</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="textarea textarea-bordered w-full h-32"
            maxLength={MAX_DESC}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">가격</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={onChange}
              className="input input-bordered w-full"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">상태</label>
            <select
              name="conditionStatus"
              value={form.conditionStatus}
              onChange={onChange}
              className="select select-bordered w-full"
            >
              <option>미개봉</option>
              <option>새상품</option>
              <option>중고A</option>
              <option>중고B</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">거래방식</label>
            <select
              name="tradeMethod"
              value={form.tradeMethod}
              onChange={onChange}
              className="select select-bordered w-full"
            >
              <option>직거래</option>
              <option>택배</option>
              <option>나눔</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">거래지역</label>
            <input
              name="tradeLocation"
              value={form.tradeLocation}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="예: 강남구 역삼동"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">카테고리</label>
            <select
              name="categoryId"
              value={String(form.categoryId ?? "")}
              onChange={onChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">선택</option>
              {(Array.isArray(categories) ? categories : []).map((c) => (
                <option key={String(c.categoryId)} value={String(c.categoryId)}>
                  {c.categoryName ?? c.name ?? c.title ?? "이름 없음"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">태그 (최대 {MAX_TAGS})</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="input input-bordered flex-1"
                placeholder="엔터/추가 버튼"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <button type="button" className="btn" onClick={addTag}>
                추가
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.tagNames.map((t) => (
                <span key={t} className="badge badge-outline">
                  #{t}
                  <button
                    type="button"
                    className="ml-1"
                    onClick={() => removeTag(t)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">
            이미지 (최대 {MAX_IMAGES})
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImagesChange}
          />
        </div>

        <div className="pt-2">
          <button className="btn btn-primary">등록</button>
        </div>
      </form>
    </div>
  );
}
