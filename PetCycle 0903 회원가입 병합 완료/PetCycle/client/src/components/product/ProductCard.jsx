// client/src/components/product/ProductCard.jsx
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const DEFAULT_IMG = "/no_image.png";

export default function ProductCard({ item = {} }) {
  const {
    productId,
    title,
    price,
    thumbnailUrl,
    addr,
    conditionStatus,
    status,
  } = item;

  // 서버(new) seller.nicname / 서버(구) sellerNicname 모두 대응
  const sellerName = item?.seller?.nicname ?? item?.sellerNickname ?? "";

  const isSold = status === "SOLD";
  const imgSrc = thumbnailUrl || DEFAULT_IMG;

  return (
    <Link
      to={`/product/read/${productId}`}
      className="
        block rounded-xl overflow-hidden border border-slate-200
        hover:shadow-sm transition
        h-full flex flex-col        /* ★ 카드가 그리드 셀 높이를 꽉 채움 */
        bg-white
      "
    >
      {/* 이미지 (고정 비율) */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {status && (
          <StatusBadge status={status} className="absolute top-2 left-2" />
        )}

        <img
          src={imgSrc}
          alt={title || "상품 이미지"}
          className={`w-full h-full object-cover ${isSold ? "grayscale" : ""}`}
          loading="lazy"
          onError={(e) => {
            const t = e.target;
            if (t.dataset.err) return;
            t.dataset.err = "1";
            t.src = DEFAULT_IMG;
          }}
        />
      </div>

      {/* 본문 (flex-1로 채우고, 가격은 맨 아래로 고정) */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="font-semibold text-slate-900 truncate">{title}</div>

        <div className="mt-1 text-sm text-slate-500 truncate">
          {sellerName ? `${sellerName} · ` : ""}
          {addr || "위치 미입력"}
          {conditionStatus ? ` · ${conditionStatus}` : ""}
        </div>

        <div className="mt-auto pt-2 font-bold text-slate-900">
          {Number(price)?.toLocaleString?.() ?? price}원
        </div>
      </div>
    </Link>
  );
}
