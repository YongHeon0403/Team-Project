// client/src/components/main/MainProductSection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts } from "../../api/productApi";
import ProductCard from "../product/ProductCard"; // 내부 카드로직 유지

export default function MainProductSection({
  size = 6,
  title = "지금 올라온 상품",
}) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    listProducts({ page: 1, size })
      .then((res) => {
        const raw = res?.data ?? res;
        const list =
          raw.items ??
          raw.dtoList ??
          raw.content ??
          raw.list ??
          (Array.isArray(raw) ? raw : []);
        setItems(list);
      })
      .catch((e) => {
        console.error("[MainProductSection] fetch error:", e);
        setErr(e?.message || "fetch error");
        setItems([]);
      });
  }, [size]);

  return (
    <section className="mt-6">
      {/* 섹션 헤더: 보드 톤 */}
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {title}
        </h2>
        <Link
          to="/product/list?page=1"
          className="text-sm sm:text-base text-slate-600 hover:text-slate-900"
        >
          전체 보기 →
        </Link>
      </div>

      {err && (
        <div className="p-3 rounded-md border border-red-200 text-red-700 bg-red-50 text-sm">
          메인 상품 불러오기 에러: {err}
        </div>
      )}

      {/* 로딩 스켈레톤 (화이트 카드 + 보더) */}
      {items === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 animate-pulse h-full flex flex-col"
            >
              <div className="bg-slate-100 aspect-square rounded-md" />
              <div className="mt-3 h-4 bg-slate-100 rounded" />
              <div className="mt-2 h-4 w-1/2 bg-slate-100 rounded" />
              <div className="mt-auto h-4 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* 빈 결과 */}
      {items && items.length === 0 && !err && (
        <div className="p-8 text-center text-slate-500 border border-slate-200 rounded-xl bg-white shadow-sm">
          아직 등록된 상품이 없습니다.
        </div>
      )}

      {/* 실제 목록 */}
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {items.map((it) => (
            // 바깥 래퍼는 높이만 맞춰 주고, 스타일은 ProductCard에 맡김
            <div key={it.productId ?? it.id} className="h-full">
              <ProductCard item={it} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
