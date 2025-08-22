// src/pages/product/Read.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ 현재 로그인 사용자 조회
import { getProduct, deleteProduct, toggleLike } from "../../api/productApi";

// ✅ chatApi가 아직 없어서 Vite가 import 해석 중 에러가 납니다.
//    → 빌드/실행을 막지 않기 위해 임시로 주석 처리하고, 아래에 스텁 함수를 정의합니다.
// import { createOrGetRoom } from "../../api/chatApi";

import { registerTransaction } from "../../api/orderApi"; // 기존 추가 유지

/* --------------------------------------------------------------------------------------
 * [임시 스텁] chatApi가 준비되기 전까지 빌드가 깨지지 않도록 제공하는 대체 구현입니다.
 * - 실제 chatApi.jsx가 준비되면 위 import 주석을 해제하고, 아래 스텁을 삭제하세요.
 * - 필요 시 여기서 서버 호출(jwtAxios.post("/chat/rooms", {...}))로 바꿔도 됩니다.
 * ------------------------------------------------------------------------------------ */
async function createOrGetRoom(productId) {
  // TODO: 실제 채팅 API 연동 시 이 스텁을 제거하고 real API로 교체
  console.warn(
    "[stub] createOrGetRoom: chatApi 파일이 없어 임시 roomId=0을 반환합니다.",
    { productId }
  );
  // 임시로 0번 방으로 이동시키거나, 제품 ID를 방 번호로 사용하는 등 원하는 규칙으로 수정 가능
  return 0;
}

// ✅ Base64URL → JSON payload 디코더 (JWT 페이로드에서 userId 추출용)
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // base64url → base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function ProductRead() {
  const { productId } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);

  // ✅ Redux 로그인 유저 우선 사용, 없으면 JWT에서 userId 폴백
  const reduxUser = useSelector((s) => s.login?.user || s.loginSlice?.user);
  const reduxUserId = reduxUser?.userId ?? reduxUser?.id ?? null;

  let tokenUserId = null;
  if (!reduxUserId) {
    const accessToken =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("ACCESS_TOKEN");
    if (accessToken) {
      const payload = decodeJwt(accessToken);
      tokenUserId =
        payload?.userId ?? payload?.uid ?? payload?.sub ?? payload?.id ?? null;
    }
  }
  const currentUserId = reduxUserId ?? tokenUserId ?? null; // ✅ 현재 로그인 사용자 ID(문자/숫자 모두 대비)

  useEffect(() => {
    getProduct(productId).then(setData);
  }, [productId]);

  // ✅ 판매자 ID를 응답 구조 변화에 안전하게 매핑
  const sellerId =
    data?.seller?.userId ?? data?.sellerId ?? data?.seller?.id ?? null;

  // ✅ 소유자 여부
  const isOwner =
    currentUserId && sellerId && String(currentUserId) === String(sellerId);

  const onDelete = async () => {
    // ✅ 안전장치: 소유자만 삭제 가능
    if (!isOwner) return alert("본인 게시글만 삭제할 수 있어요.");
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteProduct(productId);
    nav("/product/list");
  };

  const onLike = async () => {
    // ✅ 미로그인 가드
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    const res = await toggleLike(productId);
    setData((d) => ({ ...d, isLiked: res.liked }));
  };

  // ✅ 채팅 + 거래 동시 시작 (미로그인/에러 대비)
  const onChatAndDealStart = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const pid = Number(productId);

    // 1) 채팅방 생성/가져오기(현재는 스텁)
    const roomId = await createOrGetRoom(pid);

    // 2) 거래 생성 (실패해도 채팅은 열어줌)
    let txId = null;
    try {
      txId = await registerTransaction({
        productId: pid,
        finalPrice: data?.price,
      });
    } catch (e) {
      console.warn("registerTransaction failed:", e?.message || e);
      alert(
        "이미 진행 중인 거래가 있거나 생성에 실패했어요. 채팅으로 계속 진행합니다."
      );
    }

    // 3) 채팅방으로 이동(+ 생성된 거래 id 전달)
    nav(`/chat/room/${roomId}${txId ? `?tx=${txId}` : ""}`);
  };

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-1/2">
          <div className="aspect-square bg-gray-50 rounded overflow-hidden">
            {data.images?.[0] && (
              <img
                src={data.images[0].imageUrl}
                className="w-full h-full object-cover"
                alt=""
              />
            )}
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {data.images?.slice(0, 5).map((img) => (
              <img
                key={img.imageId}
                className="h-20 object-cover rounded"
                src={img.imageUrl}
                alt=""
              />
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="text-2xl font-bold">{data.title}</div>
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

          {/* ✅ 버튼 영역: 소유자/비소유자에 따라 분기 */}
          <div className="pt-2 flex gap-2">
            {isOwner ? (
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
