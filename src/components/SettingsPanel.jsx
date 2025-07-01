import React, { useState, useEffect } from "react";
import { useChatContext } from "../context/ChatContext";
import "../styles/settingsPanel.css";

const SettingsPanel = ({ onClose }) => {
  const { connect, disconnect, connectionStatus } = useChatContext();
  const [serverUrl, setServerUrl] = useState("");
  const [settings, setSettings] = useState({
    autoConnect: true,
    notifications: true,
    theme: "light",
  });

  // Load settings from storage
  useEffect(() => {
    chrome.storage.local.get(["mcpServerUrl", "settings"], (result) => {
      if (result.mcpServerUrl) {
        setServerUrl(result.mcpServerUrl);
      }
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  // Save settings to storage
  const saveSettings = () => {
    chrome.storage.local.set(
      {
        mcpServerUrl: serverUrl,
        settings,
      },
      () => {
        // Apply theme
        document.body.classList.toggle("dark-theme", settings.theme === "dark");
      }
    );
  };

  const handleConnect = () => {
    saveSettings();
    connect(serverUrl);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSettingChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleSave = () => {
    saveSettings();
    onClose();
  };

  const isConnected = connectionStatus === "connected";
  const isConnecting = connectionStatus === "connecting";

  return (
    <div className="settings-panel">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>MCP Connection</h3>
        <div className="form-group">
          <label htmlFor="server-url">MCP Server URL</label>
          <input
            id="server-url"
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="e.g. http://localhost:8000"
          />
          <small className="form-help">
            Enter the URL of your Model Context Protocol (MCP) server
          </small>
        </div>

        <div className="connection-buttons">
          <button
            onClick={handleConnect}
            disabled={!serverUrl || isConnected || isConnecting}
            className="connect-button"
          >
            {isConnecting
              ? "Connecting..."
              : isConnected
              ? "Connected"
              : "Connect"}
          </button>

          <button
            onClick={handleDisconnect}
            disabled={!isConnected}
            className="disconnect-button"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Preferences</h3>

        <div className="form-group checkbox">
          <input
            id="auto-connect"
            type="checkbox"
            checked={settings.autoConnect}
            onChange={(e) =>
              handleSettingChange("autoConnect", e.target.checked)
            }
          />
          <label htmlFor="auto-connect">Auto-connect on startup</label>
        </div>

        <div className="form-group checkbox">
          <input
            id="notifications"
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) =>
              handleSettingChange("notifications", e.target.checked)
            }
          />
          <label htmlFor="notifications">Enable notifications</label>
        </div>

        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(e) => handleSettingChange("theme", e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div className="settings-actions">
        <button onClick={handleSave} className="save-button">
          Save
        </button>
        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
