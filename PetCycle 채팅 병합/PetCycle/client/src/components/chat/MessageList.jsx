// src/components/chat/MessageList.jsx
import React, { useEffect, useRef } from "react";

const MessageList = ({ messages, currentUser, nameResolver }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (ts) =>
    new Date(ts || Date.now()).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderMessage = (m, idx) => {
    const isOwn = m.sender === currentUser;
    const isSystem = m.type === "JOIN" || m.type === "LEAVE";

    if (isSystem) {
      return (
        <div key={idx} className="flex justify-center mb-4">
          <div className="chat-message system">
            <div className="flex items-center space-x-2">
              <span
                className={
                  m.type === "JOIN" ? "text-green-600" : "text-red-600"
                }
              >
                👋
              </span>
              <span>{m.content}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(m.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    // 표시용 이름: DTO에 nickname이 담겨오면 우선, 없으면 nameResolver, 최후엔 sender
    const displayName =
      m.senderNickname || (nameResolver ? nameResolver(m.sender) : m.sender);

    return (
      <div
        key={idx}
        className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex space-x-3 max-w-xs lg:max-w-md ${
            isOwn ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          {!isOwn && (
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(displayName || m.sender)?.charAt(0)?.toUpperCase?.()}
            </div>
          )}

          <div className={`chat-message ${isOwn ? "own" : "other"}`}>
            {!isOwn && (
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                {displayName}
              </div>
            )}
            <div className="break-words">{m.content}</div>
            <div
              className={`text-xs mt-1 ${
                isOwn ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {formatTime(m.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
          </div>
        </div>
      ) : (
        messages.map(renderMessage)
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
