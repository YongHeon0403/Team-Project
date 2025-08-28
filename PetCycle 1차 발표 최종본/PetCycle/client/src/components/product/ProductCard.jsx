// client/src/components/products/ProductCard.jsx
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const DEFAULT_IMG = "/no_image.png";

export default function ProductCard({ item = {} }) {
  const {
    productId,
    title,
    price,
    thumbnailUrl, // productApi.listProducts에서 이미 정규화 되어 옴
    tradeLocation,
    conditionStatus,
    status, // ← 상태(SELLING/RESERVED/SOLD)
  } = item;

  const imgSrc = thumbnailUrl || DEFAULT_IMG;
  const isSold = status === "SOLD";

  return (
    <Link
      to={`/product/read/${productId}`}
      className="block bg-white rounded-2xl shadow hover:shadow-md transition p-3"
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        {/* 상태 배지 오버레이 */}
        {status && (
          <StatusBadge status={status} className="absolute top-2 left-2" />
        )}

        <img
          src={imgSrc}
          alt={title || "상품 이미지"}
          className={`w-full h-full object-cover ${isSold ? "grayscale" : ""}`}
          loading="lazy"
          onError={(e) => {
            // 깨진 이미지면 로컬 플레이스홀더로 1회만 교체
            const fallback = window.location.origin + DEFAULT_IMG;
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = DEFAULT_IMG;
              e.currentTarget.onerror = null;
            }
          }}
        />

        {/* SOLD 시 옅은 오버레이(선택) */}
        {isSold && (
          <div className="absolute inset-0 bg-white/40 pointer-events-none" />
        )}
      </div>

      {/* 본문 */}
      <div className="mt-2 space-y-1">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-sm text-gray-600">
          {tradeLocation} · {conditionStatus}
        </div>
        <div className="font-bold">
          {Number(price)?.toLocaleString?.() ?? price}원
        </div>
      </div>
    </Link>
  );
}
