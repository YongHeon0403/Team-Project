// src/components/chat/ChatRoom.jsx
import React, { useMemo } from "react";
import useWebSocket from "../../hooks/useWebSocket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatRoom = ({
  username,
  usernameNickname,
  peer,
  peerNickname,
  onLeave,
}) => {
  const { connected, onlineUsers, dmThreads, sendDirectMessage, disconnect } =
    useWebSocket(username, { myNickname: usernameNickname, peerNickname });

  const handleLeave = () => {
    disconnect();
    onLeave && onLeave();
  };

  // 현재 대화 스레드
  const thread = useMemo(
    () => (peer ? dmThreads[peer] || [] : []),
    [dmThreads, peer]
  );

  // 상대 온라인 여부
  const isPeerOnline = peer && onlineUsers.includes(peer);

  // 화면용 이름 리졸버
  const resolveName = (userId) => {
    if (String(userId) === String(username)) return usernameNickname || userId;
    if (String(userId) === String(peer)) return peerNickname || userId;
    return userId;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">🔒 1:1 채팅</h1>
            <p className="text-sm text-gray-500">
              상대:{" "}
              <span className="font-medium">
                {peerNickname || `사용자 ${peer}`}
              </span>
              <span
                className={`ml-2 ${
                  isPeerOnline ? "text-green-500" : "text-gray-400"
                }`}
              >
                {isPeerOnline ? "온라인" : "오프라인"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {(usernameNickname || username)?.charAt(0)?.toUpperCase?.()}
            </div>
            <div className="text-sm text-gray-700">
              {usernameNickname || username}
            </div>
            <button
              onClick={handleLeave}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-200"
            >
              나가기
            </button>
          </div>
        </div>

        {/* 메시지 목록 */}
        <MessageList
          messages={thread}
          currentUser={username}
          nameResolver={resolveName} // ← 닉네임 표시용
        />

        {/* 입력 */}
        <MessageInput
          onSendMessage={(text) => sendDirectMessage(peer, text)}
          disabled={!connected || !peer}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
