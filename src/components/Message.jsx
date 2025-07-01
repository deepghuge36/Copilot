import React from "react";
import "../styles/message.css";

const Message = ({ message }) => {
  const { content, sender, timestamp } = message;
  const isUser = sender === "user";

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`message-container ${
        isUser ? "user-container" : "bot-container"
      }`}
    >
      <div className={`message ${isUser ? "user-message" : "bot-message"}`}>
        <div className="message-content">{content}</div>
        <div className="message-timestamp">{formattedTime}</div>
      </div>
    </div>
  );
};

export default Message;
