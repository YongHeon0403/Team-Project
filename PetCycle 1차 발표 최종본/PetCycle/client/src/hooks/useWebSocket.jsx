// src/hooks/useWebSocket.js
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

  useEffect(() => {
    if (username) connect();
    return () => {
      if (stompClient) disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const connect = useCallback(() => {
    const socket = new SockJS("https://petcycle.dxcom.co.kr:8021/ws");
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
  }, [username]);

  const disconnect = useCallback(() => {
    if (!stompClient) return;
    stompClient.deactivate();
    setStompClient(null);
    setConnected(false);
    setOnlineUsers(new Set());
    setDmThreads({});
  }, [stompClient]);

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

  return {
    connected,
    onlineUsers: Array.from(onlineUsers),
    disconnect,
    dmThreads,
    sendDirectMessage,
  };
};

export default useWebSocket;
