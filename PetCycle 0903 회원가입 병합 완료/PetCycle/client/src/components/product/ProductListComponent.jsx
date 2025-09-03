// client/src/components/product/ProductListComponent.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listProducts } from "../../api/productApi";
import ProductCard from "./ProductCard";

export default function ProductListComponent() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const keyword = params.get("keyword") || "";
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [text, setText] = useState(keyword);

  useEffect(() => {
    listProducts({ page, keyword }).then((res) => {
      const raw = res?.data ?? res;
      const items =
        raw.items ??
        raw.dtoList ??
        raw.content ??
        raw.list ??
        (Array.isArray(raw) ? raw : []);
      const pageInfo = raw.pageInfo ?? {
        page,
        prev: raw.prev,
        next: raw.next,
        prevPage: raw.prevPage,
        nextPage: raw.nextPage,
        pageNumList: raw.pageNumList ?? [],
      };
      setData({ items, pageInfo });
    });
  }, [page, keyword]); // ★ keyword 변경 시에도 재조회

  // ★ 페이지 이동 시 현재 keyword 유지
  const movePage = (p) => {
    const q = { page: String(p) };
    if (keyword) q.keyword = keyword;
    setParams(q);
  };

  // ★ 검색 제출 핸들러: page를 1로 리셋, keyword 세팅
  const onSearch = (e) => {
    e.preventDefault();
    const q = { page: "1" };
    const k = text.trim();
    if (k) q.keyword = k;
    setParams(q);
  };

  // ★ 검색어 초기화
  const onReset = () => {
    setText("");
    setParams({ page: "1" }); // keyword 제거
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* 헤더: 제목 / 검색 / 등록버튼 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold">상품 목록</h2>

        <div className="flex items-center gap-2">
          {/* ★ 검색 박스 (제목/태그 통합 검색) */}
          <form className="flex items-center gap-2" onSubmit={onSearch}>
            <input
              type="text"
              name="keyword"
              placeholder="제목 또는 태그로 검색"
              className="w-56 px-3 py-2 border border-gray-300 rounded"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
            >
              검색
            </button>
            {keyword && (
              <button
                type="button"
                className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100"
                onClick={onReset}
                aria-label="검색어 초기화"
                title="검색어 초기화"
              >
                초기화
              </button>
            )}
          </form>

          {/* 기존 등록 버튼 유지 */}
          <Link
            to="/product/add"
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
          >
            등록
          </Link>
        </div>
      </div>

      {/* 검색어 배지(선택): 현재 검색어 표시 */}
      {keyword && (
        <div className="mb-3 text-sm text-gray-600">
          검색어: <span className="font-medium">“{keyword}”</span>
        </div>
      )}

      {data.items.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          등록된 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.items.map((item) => (
            <ProductCard key={item.productId} item={item} />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-6">
        {data.pageInfo.prev && (
          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
            onClick={() => movePage(data.pageInfo.prevPage ?? page - 1)}
          >
            이전
          </button>
        )}
        {(data.pageInfo.pageNumList ?? []).map((n) => (
          <button
            key={n}
            onClick={() => movePage(n)}
            className={`px-3 py-1 rounded border ${
              Number(n) === Number(page)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            aria-current={Number(n) === Number(page) ? "page" : undefined}
          >
            {n}
          </button>
        ))}
        {data.pageInfo.next && (
          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
            onClick={() => movePage(data.pageInfo.nextPage ?? page + 1)}
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}
