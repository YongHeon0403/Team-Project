// src/components/chat/ChatComponent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ChatRoom from "./ChatRoom";
import { getCookie } from "../../util/CookieUtil";

/** JWT에서 userId, nickname 보완 추출 */
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
  if (!raw) return { userId: "", nickname: "" };

  let obj = raw;
  try {
    if (typeof raw === "string") obj = JSON.parse(raw);
  } catch {
    /* no-op */
  }

  const payload = parseJwt(obj?.accessToken);
  const userId =
    obj?.userId ??
    obj?.id ??
    payload?.userId ??
    payload?.uid ??
    payload?.sub ??
    "";
  const nickname = obj?.nickname ?? payload?.nickname ?? ""; // 프로젝트 JWT에 nickname 있으면 잡힘

  return { userId: String(userId || ""), nickname: String(nickname || "") };
}

/** [임시 스텁] userId -> nickname 조회 (백엔드 API 붙이면 교체) */
async function fetchNicknameByUserId(userId) {
  // TODO: 팀원 API 붙이면 아래를 교체하세요. 예) GET /api/users/{id}
  // const { data } = await jwtAxios.get(`/api/users/${userId}`);
  // return data.nickname;
  return `user#${userId}`; // 임시
}

const ChatComponent = () => {
  const nav = useNavigate();

  // 쿼리에서 상대 userId 받음: /chat?peer={userId}
  const { search } = useLocation();
  const peer = useMemo(() => {
    const usp = new URLSearchParams(search);
    return usp.get("peer") || "";
  }, [search]);

  // 내 userId/nickname: Redux -> 쿠키 보완
  const reduxUserId = useSelector(
    (s) => s.login?.user?.userId ?? s.loginSlice?.user?.userId ?? null
  );
  const reduxNickname = useSelector(
    (s) => s.login?.user?.nickname ?? s.loginSlice?.user?.nickname ?? null
  );
  const cookieAuth = getAuthFromCookie();
  const meId = String(reduxUserId ?? cookieAuth.userId ?? "");
  const meNick = String(reduxNickname ?? cookieAuth.nickname ?? "");

  // 상대 닉네임 상태
  const [peerNickname, setPeerNickname] = useState("");

  // 자동 입장
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!peer) return;
      if (!meId) return;

      // 본인과 채팅 방지
      if (String(meId) === String(peer)) {
        alert("본인과는 채팅할 수 없어요.");
        nav(-1);
        return;
      }

      // 상대 닉네임 조회
      try {
        const nick = await fetchNicknameByUserId(peer);
        if (alive) setPeerNickname(nick || "");
      } catch {
        if (alive) setPeerNickname("");
      }

      setUsername(meId); // 실제 라우팅/구독은 userId로
      setIsJoined(true); // 바로 입장
    })();
    return () => {
      alive = false;
    };
  }, [peer, meId, nav]);

  // 나가기 → 메인
  const handleLeave = () => {
    setIsJoined(false);
    setUsername("");
    nav("/", { replace: true });
  };

  // 가드
  if (!peer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        상대 정보가 없습니다.{" "}
        <span className="ml-2 text-gray-400">/chat?peer=상대ID</span>
      </div>
    );
  }
  if (!meId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        로그인 후 이용해주세요.
      </div>
    );
  }

  // 정상
  if (isJoined && username) {
    return (
      <ChatRoom
        username={username} // 내 userId
        usernameNickname={meNick} // 내 닉네임(표시용, 없으면 빈 문자열)
        peer={peer} // 상대 userId
        peerNickname={peerNickname} // 상대 닉네임(표시용)
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
      채팅방 준비 중…
    </div>
  );
};

export default ChatComponent;
