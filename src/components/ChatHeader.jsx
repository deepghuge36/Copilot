import React from "react";
import "../styles/chatHeader.css";
import { useChatContext } from "../context/ChatContext";

const ChatHeader = ({ onSettingsClick }) => {
  const { copyAndSendPageText, connectionStatus } = useChatContext();

  const handleCopyPageText = () => {
    copyAndSendPageText().catch((error) => {
      console.error("Failed to copy page text:", error);
    });
  };

  return (
    <div className="chat-header">
      <h1>Opinary AI</h1>
      <div className="header-buttons">
        <button
          className="copy-page-button"
          onClick={handleCopyPageText}
          disabled={connectionStatus !== "connected"}
          aria-label="Copy page text"
          title="Copy current page text and send to AI"
        >
          📄
        </button>
        <button
          className="settings-button"
          onClick={onSettingsClick}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
