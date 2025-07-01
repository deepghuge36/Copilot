import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/message.css";

const Message = ({ message }) => {
  console.log("Rendering message:", message);
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
        <div className="message-content">
          {isUser ? (
            content
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          )}
        </div>
        <div className="message-timestamp">{formattedTime}</div>
      </div>
    </div>
  );
};

export default Message;
