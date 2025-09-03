// client/src/components/products/ProductReadComponent.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getProduct,
  deleteProduct,
  toggleLike,
  markProductSold, // [KEEP]
  confirmPurchase, // [KEEP]
} from "../../api/productApi";
import { registerTransaction, hasActiveTransaction } from "../../api/orderApi";
import { getCookie } from "../../util/CookieUtil";
import StatusBadge from "./StatusBadge";
import ReadMapComponent from "./ReadMapComponent";

/* ===================== JWT에서 사용자/권한 보완적으로 꺼내는 유틸 ===================== */
function parseJwt(token) {
  try {
    const base64 = token?.split(".")?.[1] || "";
    const padded = base64
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(base64.length / 4) * 4, "=");
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
    return (
      <div className="p-4 text-red-600">
        잘못된 접근입니다. (productId 없음)
      </div>
    );
  }

  const nav = useNavigate();
  const { pathname, search: currentSearch } = useLocation();
  const fromHere = encodeURIComponent(`${pathname}${currentSearch || ""}`);

  const [data, setData] = useState(null);
  const [liked, setLiked] = useState(false);
  const [hasActiveTx, setHasActiveTx] = useState(false); // [ADD] 활성 거래 여부

  // 현재 로그인 유저
  const cookieAuth = getAuthFromCookie();
  const currentUserId = String(cookieAuth?.userId ?? "");

  useEffect(() => {
    getProduct(productId).then((res) => {
      setData(res);
      if (typeof res?.isLiked === "boolean") {
        setLiked(!!res.isLiked);
      }
    });

    // ===== [ADD] 활성 거래 여부 조회 =====
    if (currentUserId) {
      hasActiveTransaction(Number(productId))
        .then((active) => setHasActiveTx(!!active))
        .catch(() => setHasActiveTx(false));
    } else {
      setHasActiveTx(false);
    }
    // ====================================
  }, [productId]); // [NOTE] productId 변경 시 재조회 (로그인 변경은 보통 페이지 리로드로 처리)

  if (!data) return null;

  // 판매자 정보
  const sellerId =
    data?.sellerId ?? data?.seller?.userId ?? data?.seller?.id ?? null;
  const sellerNickname =
    data?.seller?.nickname ?? data?.sellerNickname ?? data?.seller?.name ?? "";

  // 권한 분기
  const isOwner =
    currentUserId && sellerId && String(currentUserId) === String(sellerId);
  const isAdmin = (cookieAuth?.roles || []).some((r) =>
    String(r).toUpperCase().includes("ADMIN")
  );
  const canManage = isOwner || isAdmin;

  const status = data.status;
  const isSold = status === "SOLD";

  // ===================== [ADD] 거래 확인 상태 (서버 DTO 보강 사용) =====================
  const buyerId = data?.buyerId ?? null;
  const sellerConfirmed = !!data?.sellerConfirmedAt; // [ADD]
  const buyerConfirmed = !!data?.buyerConfirmedAt; // [ADD]
  const bothConfirmed = sellerConfirmed && buyerConfirmed; // [ADD]
  // =============================================================================

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
      setHasActiveTx(true); // [ADD] 거래 생성 성공 → 즉시 플래그 ON
    } catch {
      alert(
        "이미 진행 중인 거래가 있거나 실패했습니다. 채팅으로 계속 진행합니다."
      );
      // [ADD] 실패했어도 서버에 이미 활성 거래가 있을 수 있으니 재확인
      try {
        const active = await hasActiveTransaction(Number(productId));
        setHasActiveTx(!!active);
      } catch {}
    }

    const qs =
      `/chat?peer=${encodeURIComponent(String(sellerId))}` +
      `${
        sellerNickname ? `&peerNick=${encodeURIComponent(sellerNickname)}` : ""
      }` +
      `${txId ? `&tx=${txId}` : ""}` +
      `&from=${fromHere}`;

    nav(qs);
  };

  const onToggleLike = async () => {
    try {
      if (!currentUserId) {
        alert("로그인이 필요합니다.");
        return;
      }
      setLiked((prev) => !prev); // 낙관적 업데이트
      const res = await toggleLike(Number(productId));
      if (typeof res?.liked === "boolean") {
        setLiked(!!res.liked);
      }
    } catch (e) {
      console.error(e);
      alert("찜 처리에 실패했습니다.");
      setLiked((prev) => !prev); // 실패 롤백
    }
  };

  // ============================ [CHG] 판매자: '판매완료' ============================
  // 프롬프트/구매자 식별 입력 절차 제거 → 클릭만 하면 판매자 확인 기록
  const onMarkSold = async () => {
    if (!canManage) return alert("권한이 없습니다.");
    if (isSold) return alert("이미 거래 완료된 상품입니다.");

    try {
      await markProductSold({ productId: Number(productId) }); // [CHG] 바디 없이 호출
      alert("판매자 확인이 처리되었습니다.");
      const res = await getProduct(productId);
      setData(res);
      // SOLD가 되면 서버가 찜을 삭제하므로, 안전하게 해제
      if (res?.status === "SOLD") setLiked(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "판매 완료 처리 실패");
    }
  };
  // ==============================================================================

  // ============================ [CHG] 구매자: '구매완료' ============================
  // 클릭만 하면 현재 로그인 사용자를 구매자로 확정 + 구매자 확인 기록
  const onConfirmPurchase = async () => {
    try {
      await confirmPurchase(Number(productId));
      alert("구매자 확인이 처리되었습니다.");
      const res = await getProduct(productId);
      setData(res);
      if (res?.status === "SOLD") setLiked(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "구매 완료 처리 실패");
    }
  };
  // ==============================================================================

  // ============================== [CHG] 버튼 노출/상태 ==============================
  // 판매자 버튼: 판매자(또는 관리자)만 보이게 + 양측 미완료일 때만 표시
  const showSellerBtn = canManage && !bothConfirmed;

  // [CHG] 구매자 버튼: 채팅/거래를 시작한 사용자에게만 보이도록 hasActiveTx 추가
  // - 판매자가 아니고
  // - 양측 미완료이며
  // - 활성 거래가 나에게 존재하고
  // - (buyerId가 아직 없거나) buyerId가 나와 동일
  const showBuyerBtn =
    !isOwner &&
    !bothConfirmed &&
    hasActiveTx && // [ADD] 핵심: 채팅/거래 시작 사용자만
    (buyerId == null || String(buyerId) === String(currentUserId));

  // 라벨/비활성: 한쪽만 누른 상태 → "대기 중"(회색, disabled)
  const sellerBtnDisabled = sellerConfirmed && !buyerConfirmed;
  const buyerBtnDisabled = buyerConfirmed && !sellerConfirmed;
  const sellerBtnLabel =
    sellerConfirmed && !buyerConfirmed ? "대기 중" : "판매완료";
  const buyerBtnLabel =
    buyerConfirmed && !sellerConfirmed ? "대기 중" : "구매완료";
  // ==============================================================================

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="bg-white shadow-sm rounded-md p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 메인 이미지 */}
          <div className="md:w-1/2">
            <div className="relative aspect-square bg-gray-50 rounded overflow-hidden">
              {status && (
                <StatusBadge
                  status={status}
                  className="absolute top-2 left-2"
                />
              )}
              <img
                src={data.images?.[0]?.imageUrl || DEFAULT_IMG}
                className={`w-full h-full object-cover ${
                  isSold ? "grayscale" : ""
                }`}
                alt=""
                onError={(e) => {
                  if (
                    e.currentTarget.src !==
                    window.location.origin + DEFAULT_IMG
                  ) {
                    e.currentTarget.src = DEFAULT_IMG;
                    e.currentTarget.onerror = null;
                  }
                }}
              />
              {isSold && (
                <div className="absolute inset-0 bg-white/40 pointer-events-none" />
              )}
            </div>

            {/* 썸네일 */}
            {Array.isArray(data.images) && data.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {data.images.slice(0, 10).map((img, i) => (
                  <img
                    key={img.imageId ?? i}
                    className="w-full h-20 object-cover rounded border"
                    src={img.imageUrl || DEFAULT_IMG}
                    alt=""
                    onError={(e) => {
                      if (
                        e.currentTarget.src !==
                        window.location.origin + DEFAULT_IMG
                      ) {
                        e.currentTarget.src = DEFAULT_IMG;
                        e.currentTarget.onerror = null;
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 상세 우측 */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <h1 className="text-2xl font-bold flex-1">{data.title}</h1>
              {status && <StatusBadge status={status} />}
            </div>

            {/* 판매자 닉네임 */}
            {sellerNickname && (
              <div className="text-sm text-slate-600">
                판매자{" "}
                <span className="font-medium text-slate-900">
                  {sellerNickname}
                </span>
              </div>
            )}

            <div className="text-xl font-semibold">
              {data.price?.toLocaleString?.()}원
            </div>
            <div className="text-sm text-gray-500">
              {data.addr} · {data.conditionStatus}
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
              <Link
                to="/product/list"
                className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100"
              >
                목록
              </Link>

              {/* 판매자 본인이거나 SOLD면 찜 버튼 숨김 (기존 유지) */}
              {!isOwner && !isSold && (
                <button
                  onClick={onToggleLike}
                  className={`px-4 py-2 rounded border font-semibold ${
                    liked
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-white text-pink-600 border-pink-600"
                  }`}
                  title={liked ? "찜 해제" : "찜하기"}
                >
                  {liked ? "♥ 찜해제" : "♡ 찜하기"}
                </button>
              )}

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

                  {/* =================== [CHG] 판매자: 판매완료 버튼 =================== */}
                  {!bothConfirmed && ( // 양측 완료 전까지만 표시
                    <button
                      onClick={!sellerConfirmed ? onMarkSold : undefined} // 이미 눌렀으면 클릭 막기
                      disabled={sellerBtnDisabled}
                      className={`px-4 py-2 rounded font-semibold ${
                        sellerBtnDisabled
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                      title={
                        sellerBtnDisabled
                          ? "구매자 확인 대기 중"
                          : "판매 완료(판매자 확인)"
                      }
                    >
                      {sellerBtnLabel}
                    </button>
                  )}
                  {/* ================================================================== */}
                </>
              ) : (
                <>
                  {/* 이미 최종 SOLD면 채팅 숨김 */}
                  {!isSold && (
                    <button
                      onClick={onChatAndDealStart}
                      className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
                    >
                      채팅하기(바로 거래)
                    </button>
                  )}

                  {/* =================== [CHG] 구매자: 구매완료 버튼 =================== */}
                  {showBuyerBtn && (
                    <button
                      onClick={!buyerConfirmed ? onConfirmPurchase : undefined}
                      disabled={buyerBtnDisabled}
                      className={`px-4 py-2 rounded font-semibold ${
                        buyerBtnDisabled
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                      title={
                        buyerBtnDisabled
                          ? "판매자 확인 대기 중"
                          : "구매 완료(구매자 확인)"
                      }
                    >
                      {buyerBtnLabel}
                    </button>
                  )}
                  {/* ================================================================== */}
                </>
              )}
            </div>
          </div>
        </div>

        {data.addr && (
          <div className="mt-6">
            <ReadMapComponent addr={data.addr} />
          </div>
        )}

        <div className="prose max-w-none mt-6">
          <h3>상세 설명</h3>
          <p>{data.description}</p>
        </div>
      </div>
    </div>
  );
}
