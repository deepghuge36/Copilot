import React from "react";
import "../styles/connectionStatus.css";

const ConnectionStatus = ({ status }) => {
  let statusText = "Disconnected";
  let statusClass = "disconnected";

  switch (status) {
    case "connected":
      statusText = "Connected to MCP Server";
      statusClass = "connected";
      break;
    case "connecting":
      statusText = "Connecting...";
      statusClass = "connecting";
      break;
    case "error":
      statusText = "Connection Error";
      statusClass = "error";
      break;
    default:
      statusText = "Disconnected";
      statusClass = "disconnected";
  }

  return (
    <div className={`connection-status ${statusClass}`}>
      <div className="status-indicator"></div>
      <span>{statusText}</span>
    </div>
  );
};

export default ConnectionStatus;
