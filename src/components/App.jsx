import React, { useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ConnectionStatus from "./ConnectionStatus";
import SettingsPanel from "./SettingsPanel";
import "../styles/app.css";
import { useChatContext } from "../context/ChatContext";

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { connectionStatus, connect, disconnect } = useChatContext();

  useEffect(() => {
    // Load settings from storage when app starts
    chrome.storage.local.get(
      ["mcpServerUrl", "connectionStatus", "settings"],
      (result) => {
        // Auto-connect if enabled in settings
        if (
          result.settings?.autoConnect &&
          result.connectionStatus !== "connected"
        ) {
          connect(result.mcpServerUrl);
        }
      }
    );
  }, []);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="app-container">
      <ChatHeader onSettingsClick={toggleSettings} />

      <ConnectionStatus status={connectionStatus} />

      {showSettings ? (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      ) : (
        <>
          <MessageList />
          <ChatInput />
        </>
      )}
    </div>
  );
};

export default App;
