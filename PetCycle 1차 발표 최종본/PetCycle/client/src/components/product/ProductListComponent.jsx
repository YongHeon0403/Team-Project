import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listProducts } from "../../api/productApi";
import ProductCard from "./ProductCard";

export default function ProductListComponent() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const [data, setData] = useState({ items: [], pageInfo: {} });

  useEffect(() => {
    listProducts({ page }).then((res) => {
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
  }, [page]);

  const movePage = (p) => setParams({ page: String(p) });

  return (
    // [변경] 좌우 여백을 게시판 페이지와 톤 맞춤(px-4 추가)
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">상품 목록</h2>
        {/* [변경] DaisyUI 버튼 → 게시판과 동일한 Tailwind 유틸 버튼 */}
        <Link
          to="/product/add"
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
        >
          등록
        </Link>
      </div>

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

      {/* [변경] 페이지네이션 버튼 톤을 게시판과 동일하게 통일 */}
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
