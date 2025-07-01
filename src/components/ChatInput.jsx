import React, { useState } from "react";
import { useChatContext } from "../context/ChatContext";
import "../styles/chatInput.css";

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, connectionStatus } = useChatContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && connectionStatus === "connected") {
      sendMessage(message.trim());
      setMessage("");
    }
  };

  const isDisabled = connectionStatus !== "connected";

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <textarea
        className="chat-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          isDisabled
            ? "Connect to MCP server to start chatting..."
            : "Type a message..."
        }
        disabled={isDisabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        className="send-button"
        disabled={isDisabled || !message.trim()}
        aria-label="Send message"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;
