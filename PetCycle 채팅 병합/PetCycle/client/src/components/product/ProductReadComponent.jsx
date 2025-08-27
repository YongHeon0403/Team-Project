// client/src/components/products/ProductReadComponent.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct, deleteProduct, toggleLike } from "../../api/productApi";
import { registerTransaction } from "../../api/orderApi";
import { getCookie } from "../../util/CookieUtil"; // 쿠키에서 사용자 토큰/정보 읽기
import StatusBadge from "./StatusBadge"; // ★ 상태 배지 추가

/* ===================== JWT에서 사용자/권한 보완적으로 꺼내는 유틸 ===================== */
// 페이지 새로고침 시 Redux가 초기화되면 userId가 없어지는 문제를 대비해서,
// 쿠키의 accessToken을 디코딩하여 userId/roles를 보완적으로 구한다.
function parseJwt(token) {
  try {
    const base64 = token?.split(".")?.[1] || "";
    return JSON.parse(atob(base64)) || {};
  } catch {
    return {};
  }
}
function getAuthFromCookie() {
  const raw = getCookie("user");
  if (!raw) return null;

  let obj = raw;
  try {
    if (typeof raw === "string") obj = JSON.parse(raw); // CookieUtil이 문자열 저장 시 파싱
  } catch {
    /* ignore */
  }

  const payload = parseJwt(obj?.accessToken);

  // 프로젝트마다 키가 달라서 가능한 후보들을 모두 시도
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

const DEFAULT_IMG = "/no_image.png"; // 이미지 깨질 때 사용할 로컬 플레이스홀더

export default function ProductReadComponent() {
  const { productId } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);

  // Redux에서 로그인 사용자 ID 조회
  const reduxUserId = useSelector(
    (s) => s.login?.user?.userId ?? s.loginSlice?.user?.userId ?? null
  );

  // Redux가 비어 있는 경우(새로고침 등) 쿠키/JWT로 보완
  const cookieAuth = getAuthFromCookie();
  const currentUserId = String(reduxUserId ?? cookieAuth?.userId ?? "");

  useEffect(() => {
    getProduct(productId).then(setData);
  }, [productId]);

  if (!data) return null;

  // 상세 응답에서 판매자 ID/닉네임 파싱(서버 구조 대응)
  const sellerId =
    data?.sellerId ?? data?.seller?.userId ?? data?.seller?.id ?? null;

  // 닉네임 후보(응답 구조에 맞게 하나라도 잡히게)
  const sellerNickname =
    data?.seller?.nickname ?? data?.sellerNickname ?? data?.seller?.name ?? "";

  // 권한 분기
  const isOwner =
    currentUserId && sellerId && String(currentUserId) === String(sellerId);
  const isAdmin = (cookieAuth?.roles || cookieAuth?.roleNames || []).some((r) =>
    String(r).toUpperCase().includes("ADMIN")
  );

  const canManage = isOwner || isAdmin; // 최종 분기 기준: 판매자 또는 관리자

  // 상태 표시용
  const status = data.status; // SELLING / RESERVED / SOLD ...
  const isSold = status === "SOLD";

  const onDelete = async () => {
    // 판매자 또는 관리자만 삭제 가능
    if (!canManage) return alert("본인(또는 관리자)만 삭제할 수 있어요.");
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteProduct(productId);
    nav("/product/list");
  };

  const onLike = async () => {
    // 비로그인 가드
    if (!currentUserId) return alert("로그인이 필요합니다.");
    const res = await toggleLike(productId);
    // likeCount까지 같이 갱신
    setData((d) => ({ ...d, isLiked: res.liked, likeCount: res.likeCount }));
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
      alert(
        "이미 진행 중인 거래가 있거나 실패했습니다. 채팅으로 계속 진행합니다."
      );
    }

    // ✅ 여기서 peer(상대 userId)와 peerNick(상대 닉네임)을 쿼리로 전달
    const qs =
      `/chat?peer=${encodeURIComponent(String(sellerId))}` +
      `${
        sellerNickname ? `&peerNick=${encodeURIComponent(sellerNickname)}` : ""
      }` +
      `${txId ? `&tx=${txId}` : ""}`;

    nav(qs);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* 메인 이미지 */}
        <div className="w-1/2">
          <div className="relative aspect-square bg-gray-50 rounded overflow-hidden">
            {/* ★ 상태 배지: 이미지 좌상단 오버레이 */}
            {status && (
              <StatusBadge status={status} className="absolute top-2 left-2" />
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

          {/* 썸네일 리스트 */}
          <div className="mt-2 grid grid-cols-5 gap-2">
            {(data.images || []).slice(0, 5).map((img) => (
              <img
                key={img.imageId ?? img.imageUrl}
                className="h-20 object-cover rounded"
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
        </div>

        {/* 우측 정보 */}
        <div className="flex-1 space-y-2">
          {/* ★ 제목 + 상태 배지 */}
          <div className="flex items-start gap-2">
            <div className="text-2xl font-bold flex-1">{data.title}</div>
            {status && <StatusBadge status={status} />}
          </div>

          <div className="text-xl">{data.price?.toLocaleString?.()}원</div>
          <div className="text-sm text-gray-500">
            {data.tradeLocation} · {data.conditionStatus}
          </div>
          <div className="flex gap-2 mt-2">
            {data.tags?.map((t) => (
              <span key={t} className="badge badge-outline">
                #{t}
              </span>
            ))}
          </div>

          <div className="pt-2 flex gap-2">
            {/* ✅ 목록 버튼 추가 */}
            <Link to="/product/list" className="btn btn-outline">
              목록
            </Link>

            {canManage ? (
              <>
                <Link to={`/product/modify/${productId}`} className="btn">
                  수정
                </Link>
                <button className="btn btn-error" onClick={onDelete}>
                  삭제
                </button>
              </>
            ) : (
              <>
                <button className="btn" onClick={onLike}>
                  {data.isLiked ? "찜취소" : "찜하기"}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={onChatAndDealStart}
                >
                  채팅하기(바로 거래)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="prose max-w-none">
        <h3>상세 설명</h3>
        <p>{data.description}</p>
      </div>
    </div>
  );
}
