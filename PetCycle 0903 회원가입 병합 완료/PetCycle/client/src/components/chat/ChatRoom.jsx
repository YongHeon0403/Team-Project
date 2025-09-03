// client/src/components/chat/ChatRoom.jsx
// [FIX] 실시간 배열 전체를 계속 붙이지 않고, "새로 늘어난 부분만" 추가(중복 방지)

import React, { useEffect, useMemo, useRef, useState } from "react";
import useWebSocket from "../../hooks/useWebSocket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatRoom({
  username,
  usernameNickname,
  peer,
  peerNickname,
  roomId,
  initialMessages = [],
  onLeave,
}) {
  const { connected, onlineUsers, dmThreads, sendDirectMessage, disconnect, seedThread } =
  useWebSocket(username, {
    myNickname: usernameNickname,
    peerNickname,
    activePeer: peer, // ★ 지금 열어둔 상대 id
  });

  const [messages, setMessages] = useState(initialMessages);

  // [FIX] 실시간 메시지 중복 방지용 길이 기록
  const liveLenRef = useRef(0);

  useEffect(() => {
    setMessages(initialMessages || []);
    // 초기 로딩 시점에 실시간 길이 기준점 리셋
    liveLenRef.current = 0;
  }, [initialMessages, peer]);

  // 해당 peer의 실시간 스레드
  const liveThread = useMemo(
    () => (peer ? dmThreads[peer] || [] : []),
    [dmThreads, peer]
  );

  // [FIX] 새로 늘어난 부분만 이어 붙임
  useEffect(() => {
    if (!peer) return;
    const prevLen = liveLenRef.current;
    const curLen = Array.isArray(liveThread) ? liveThread.length : 0;
    if (curLen > prevLen) {
      const added = liveThread.slice(prevLen);
      setMessages(prev => [...prev, ...added]);
      liveLenRef.current = curLen;
    }
  }, [liveThread, peer]);

  const isPeerOnline = peer && onlineUsers.includes(peer);

  const resolveName = (userId) => {
    if (String(userId) === String(username)) return usernameNickname || userId;
    if (String(userId) === String(peer)) return peerNickname || userId;
    return userId;
  };

  const handleLeave = () => {
    disconnect();
    onLeave && onLeave();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">🔒 1:1 채팅</h1>
            <p className="text-sm text-gray-500">
              상대: <span className="font-medium">{peerNickname || `사용자 ${peer}`}</span>
              <span className={`ml-2 ${isPeerOnline ? "text-green-500" : "text-gray-400"}`}>
                {isPeerOnline ? "온라인" : "오프라인"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {(usernameNickname || username)?.charAt(0)?.toUpperCase?.()}
            </div>
            <div className="text-sm text-gray-700">{usernameNickname || username}</div>

            <button
              onClick={handleLeave}
              className="px-3 py-1 text-xs rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-200"
              title="채팅방 나가기"
            >
              나가기
            </button>
          </div>
        </div>

        {/* 메시지 목록: 오래된→최신 순서로 렌더 */}
        <MessageList
          messages={messages}
          currentUser={username}
          nameResolver={resolveName}
        />

        {/* 입력 */}
        <MessageInput
          onSendMessage={(text) => sendDirectMessage(peer, text)}
          disabled={!connected || !peer}
        />
      </div>
    </div>
  );
}
