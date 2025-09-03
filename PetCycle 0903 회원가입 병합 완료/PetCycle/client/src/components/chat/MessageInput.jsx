import React, { useState } from "react";

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const emojis = ["😀", "😂", "❤️", "👍", "👎", "😢", "😮", "😡"];

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* 이모지 버튼들 */}
      <div className="flex space-x-2 mb-3">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => addEmoji(emoji)}
            className="text-xl hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition duration-200"
            disabled={disabled}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              disabled
                ? "연결 중..."
                : "메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            }
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 disabled:bg-gray-100"
            rows="2"
            maxLength={500}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {message.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 font-semibold flex items-center space-x-2"
        >
          <span>전송</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
