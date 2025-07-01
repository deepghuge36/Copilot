import React from "react";
import { useChatContext } from "../context/ChatContext";
import "../styles/chatHeader.css";

const ChatHeader = ({ onSettingsClick }) => {
  const { sendMessage } = useChatContext();

  const handleCopyPageText = async () => {
    try {
      // Get the active tab
      const tabs = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      });

      if (!tabs || !tabs.length) {
        alert("No active tab found");
        return;
      }

      // Ask the content script to extract all text from the page
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getAllPageText" },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      });

      if (response && response.text) {
        // Notify the user
        alert(
          `Text extracted (${response.text.length} characters). Sending to MCP...`
        );

        // Send the extracted text to MCP
        sendMessage(
          `Analyze this page content: ${response.text.substring(0, 3000)}...`
        );
      } else {
        alert("Failed to extract text from the page");
      }
    } catch (error) {
      console.error("Error copying page text:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="chat-header">
      <h1>React Chatbox</h1>
      <div className="header-buttons">
        <button
          className="copy-text-button"
          onClick={handleCopyPageText}
          aria-label="Copy Page Text"
          title="Copy and analyze text from current page"
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
