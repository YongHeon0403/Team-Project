// client/src/components/products/ProductReadComponent.jsx
// [변경 요약]
// - DaisyUI 버튼/뱃지 → Tailwind 유틸로 통일(게시판 톤과 맞춤)
// - "좋아요" 관련 로직/버튼/임포트 전부 제거
// - 상세 전체를 카드 레이아웃(bg-white shadow rounded p-6)으로 감싸 가독성 개선
// - 썸네일/이미지 에러 핸들링 유지, 판매완료 시 그레이스케일 유지

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProduct, deleteProduct } from "../../api/productApi"; // [변경] toggleLike 제거
import { registerTransaction } from "../../api/orderApi";
import { getCookie } from "../../util/CookieUtil";
import StatusBadge from "./StatusBadge";

/* ===================== JWT에서 사용자/권한 보완적으로 꺼내는 유틸 ===================== */
function parseJwt(token) {
  try {
    // base64url → base64 안전 변환
    const base64 = token?.split(".")?.[1] || "";
    const padded = base64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) || {};
  } catch {
    return {};
  }
}
function getAuthFromCookie() {
  const raw = getCookie("user");
  if (!raw) return null;

  let obj = raw;
  try {
    if (typeof raw === "string") obj = JSON.parse(raw);
  } catch {}

  const payload = parseJwt(obj?.accessToken);

  const userId =
    obj?.userId ??
    obj?.id ??
    payload?.userId ??
    payload?.uid ??
    payload?.sub ??
    null;

  const roles = obj?.roles ?? payload?.roles ?? payload?.authorities ?? [];

  return userId ? { userId: String(userId), roles } : null;
}
/* ===================================================================================== */

const DEFAULT_IMG = "/no_image.png";

export default function ProductReadComponent({ productId }) {
  if (!Number.isFinite(Number(productId))) {
    return <div className="p-4 text-red-600">잘못된 접근입니다. (productId 없음)</div>;
  }

  const nav = useNavigate();
  const [data, setData] = useState(null);

  // 쿠키/JWT만으로 현재 사용자 식별
  const cookieAuth = getAuthFromCookie();
  const currentUserId = String(cookieAuth?.userId ?? "");

  useEffect(() => {
    getProduct(productId).then(setData);
  }, [productId]);

  if (!data) return null;

  // 판매자/닉네임 파싱(응답 구조 대응)
  const sellerId = data?.sellerId ?? data?.seller?.userId ?? data?.seller?.id ?? null;
  const sellerNickname = data?.seller?.nickname ?? data?.sellerNickname ?? data?.seller?.name ?? "";

  // 권한 분기
  const isOwner = currentUserId && sellerId && String(currentUserId) === String(sellerId);
  const isAdmin = (cookieAuth?.roles || []).some((r) => String(r).toUpperCase().includes("ADMIN"));
  const canManage = isOwner || isAdmin;

  // 상태
  const status = data.status; // SELLING / RESERVED / SOLD ...
  const isSold = status === "SOLD";

  const onDelete = async () => {
    if (!canManage) return alert("본인(또는 관리자)만 삭제할 수 있어요.");
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteProduct(productId);
    nav("/product/list");
  };

  const onChatAndDealStart = async () => {
    if (!currentUserId) return alert("로그인이 필요합니다.");

    let txId = null;
    try {
      txId = await registerTransaction({
        productId: Number(productId),
        finalPrice: data?.price,
      });
    } catch {
      alert("이미 진행 중인 거래가 있거나 실패했습니다. 채팅으로 계속 진행합니다.");
    }

    const qs =
      `/chat?peer=${encodeURIComponent(String(sellerId))}` +
      `${sellerNickname ? `&peerNick=${encodeURIComponent(sellerNickname)}` : ""}` +
      `${txId ? `&tx=${txId}` : ""}`;

    nav(qs);
  };

  return (
    // [변경] 게시판 상세와 동일한 카드 레이아웃 적용
    <div className="container mx-auto mt-10 px-4">
      <div className="bg-white shadow-sm rounded-md p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 메인 이미지 */}
          <div className="md:w-1/2">
            <div className="relative aspect-square bg-gray-50 rounded overflow-hidden">
              {/* 상태 배지: 이미지 좌상단 오버레이 */}
              {status && <StatusBadge status={status} className="absolute top-2 left-2" />}
              <img
                src={data.images?.[0]?.imageUrl || DEFAULT_IMG}
                className={`w-full h-full object-cover ${isSold ? "grayscale" : ""}`}
                alt=""
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + DEFAULT_IMG) {
                    e.currentTarget.src = DEFAULT_IMG;
                    e.currentTarget.onerror = null;
                  }
                }}
              />
              {isSold && <div className="absolute inset-0 bg-white/40 pointer-events-none" />}
            </div>

            {/* 썸네일 리스트 */}
            {Array.isArray(data.images) && data.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {data.images.slice(0, 10).map((img, i) => (
                  <img
                    key={img.imageId ?? i}
                    className="w-full h-20 object-cover rounded border"
                    src={img.imageUrl || DEFAULT_IMG}
                    alt=""
                    onError={(e) => {
                      if (e.currentTarget.src !== window.location.origin + DEFAULT_IMG) {
                        e.currentTarget.src = DEFAULT_IMG;
                        e.currentTarget.onerror = null;
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 우측 정보 */}
          <div className="flex-1 space-y-2">
            {/* 제목 + 상태 배지 */}
            <div className="flex items-start gap-2">
              <h1 className="text-2xl font-bold flex-1">{data.title}</h1>
              {status && <StatusBadge status={status} />}
            </div>

            <div className="text-xl font-semibold">{data.price?.toLocaleString?.()}원</div>
            <div className="text-sm text-gray-500">
              {data.tradeLocation} · {data.conditionStatus}
            </div>

            {/* 태그 */}
            {data.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 text-sm rounded border border-gray-300 bg-gray-50"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="pt-3 flex flex-wrap gap-2">
              {/* [변경] 버튼들을 Tailwind 유틸로 통일 */}
              <Link
                to="/product/list"
                className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100"
              >
                목록
              </Link>

              {canManage ? (
                <>
                  <Link
                    to={`/product/modify/${productId}`}
                    className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
                  >
                    수정
                  </Link>
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-500"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  onClick={onChatAndDealStart}
                  className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
                >
                  채팅하기(바로 거래)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="prose max-w-none mt-6">
          <h3>상세 설명</h3>
          <p>{data.description}</p>
        </div>
      </div>
    </div>
  );
}
