// client/src/components/products/ProductCard.jsx
import { Link } from "react-router-dom";

const DEFAULT_IMG = "/no_image.png";

export default function ProductCard({ item = {} }) {
  const {
    productId,
    title,
    price,
    thumbnailUrl, // productApi.listProducts에서 이미 정규화 되어 올 수 있음
    tradeLocation,
    conditionStatus,
  } = item;

  const imgSrc = thumbnailUrl || DEFAULT_IMG;

  return (
    <Link
      to={`/product/read/${productId}`}
      className="block bg-white rounded-2xl shadow hover:shadow-md transition p-3"
    >
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
        <img
          src={imgSrc}
          alt={title || "상품 이미지"}
          className="w-full h-full object-cover"
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
      </div>
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
