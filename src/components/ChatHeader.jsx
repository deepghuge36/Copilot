import React from "react";
import "../styles/chatHeader.css";

const ChatHeader = ({ onSettingsClick }) => {
  return (
    <div className="chat-header">
      <h1>Opinary AI</h1>
      <div className="header-buttons">
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
