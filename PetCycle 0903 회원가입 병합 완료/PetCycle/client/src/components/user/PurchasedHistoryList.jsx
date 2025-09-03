import React, { useEffect, useState } from "react";
import { listMyPurchasedProducts } from "../../api/productApi";
import ProductCard from "../product/ProductCard";

export default function PurchasedHistoryList({ pageSize = 6 }) {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    listMyPurchasedProducts({ page, size: pageSize })
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  if (loading) return <div className="text-sm text-gray-500">로딩중…</div>;
  if (!data.items.length)
    return <div className="text-sm text-gray-500">구매 내역이 없습니다.</div>;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((it) => (
          <ProductCard key={it.productId} item={it} />
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {!data.pageInfo.first && (
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage(page - 1)}
          >
            이전
          </button>
        )}
        {!data.pageInfo.last && (
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage(page + 1)}
          >
            다음
          </button>
        )}
      </div>
    </>
  );
}
