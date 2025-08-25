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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">상품 목록</h2>
        <Link to="/product/add" className="btn btn-primary">
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

      <div className="flex justify-center gap-2 mt-6">
        {data.pageInfo.prev && (
          <button
            className="btn"
            onClick={() => movePage(data.pageInfo.prevPage ?? page - 1)}
          >
            Prev
          </button>
        )}
        {(data.pageInfo.pageNumList ?? []).map((n) => (
          <button
            key={n}
            className={`btn ${Number(n) === Number(page) ? "btn-active" : ""}`}
            onClick={() => movePage(n)}
          >
            {n}
          </button>
        ))}
        {data.pageInfo.next && (
          <button
            className="btn"
            onClick={() => movePage(data.pageInfo.nextPage ?? page + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
