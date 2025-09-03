// client/src/hooks/useWebSocket.jsx
import { useState, useEffect, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * 옵션: { myNickname?: string, peerNickname?: string }
 */
const useWebSocket = (username, opts = {}) => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [dmThreads, setDmThreads] = useState({});
  const [hasNewChat, setHasNewChat] = useState(false); // 상단 배지 상태

  useEffect(() => {
    if (username) connect();
    return () => {
      if (stompClient) disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const connect = useCallback(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (s) => console.log("STOMP:", s),
      onConnect: (frame) => {
        console.log("Connected:", frame);
        setConnected(true);

        client.subscribe("/topic/onlineUsers", (msg) => {
          try {
            const list = JSON.parse(msg.body);
            setOnlineUsers(new Set(list));
          } catch {
            const raw = (msg.body || "").replace(/[\[\]\"]/g, "");
            const arr = raw
              ? raw
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];
            setOnlineUsers(new Set(arr));
          }
        });

        // 내 DM 인박스
        client.subscribe(`/topic/inbox.${username}`, (msg) => {
          const dm = JSON.parse(msg.body || "{}");
          const peer = dm.sender === username ? dm.receiver : dm.sender;
          if (!peer) return;
          setDmThreads((prev) => ({
            ...prev,
            [peer]: [...(prev[peer] || []), dm],
          }));
        });

        // 내 알림
        client.subscribe(`/topic/notice.${username}`, (msg) => {
          try {
            const notice = JSON.parse(msg.body || "{}");
            if (notice.type === "NEW_MESSAGE") {
              setHasNewChat(true); // 배지 ON
              if (typeof opts.onNotice === "function") {
                opts.onNotice(notice); // 선택: 외부 콜백
              }
              console.log("새 메세지 알림:", notice); // 객체 로깅
            }
          } catch (e) {
            console.error("알림 파싱 실패:", e);
          }
        });

        // JOIN
        client.publish({
          destination: "/app/chat.addUser",
          body: JSON.stringify({ sender: username, type: "JOIN" }),
        });
      },
      onStompError: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    setStompClient(client);
  }, [username, opts.onNotice]);

  const disconnect = useCallback(() => {
    if (!stompClient) return;
    stompClient.deactivate();
    setStompClient(null);
    setConnected(false);
    setOnlineUsers(new Set());
    setDmThreads({});
    setHasNewChat(false); // 배지 상태 초기화
  }, [stompClient]);

  // ✅ [ADD] REST로 받은 과거 내역을 특정 상대(peer) 스레드로 심는 유틸
  // - 웹소켓은 실시간만 담당하므로, 과거 대화는 방 입장 시 한 번 주입
  const seedThread = useCallback((peer, messages) => {
    if (!peer) return;
    setDmThreads((prev) => ({
      ...prev,
      [peer]: Array.isArray(messages) ? messages : [],
    }));
  }, []);

  // ✅ DM 보내기: 닉네임 필드(표시용)도 같이 전달
  const sendDirectMessage = useCallback(
    (to, messageContent) => {
      if (
        !stompClient ||
        !connected ||
        !username ||
        !to ||
        !messageContent?.trim()
      )
        return;

      const payload = {
        type: "CHAT",
        sender: username,
        receiver: to,
        content: messageContent,
        // 화면용(서버 라우팅에는 안 씀) — DTO에 필드 있어도 되고 없어도 동작
        senderNickname: opts.myNickname || "",
        receiverNickname: opts.peerNickname || "",
      };

      stompClient.publish({
        destination: "/app/chat.dm",
        body: JSON.stringify(payload),
      });
    },
    [stompClient, connected, username, opts.myNickname, opts.peerNickname]
  );

  // 상단 배지 끄기 (채팅 탭/채팅방 진입 시 호출)
  const clearChatBadge = useCallback(() => setHasNewChat(false), []);

  return {
    connected,
    onlineUsers: Array.from(onlineUsers),
    disconnect,
    dmThreads,
    sendDirectMessage,
    seedThread, // ✅ [ADD] 외부에서 과거 내역 주입
    hasNewChat,
    clearChatBadge,
  };
};

export default useWebSocket;
