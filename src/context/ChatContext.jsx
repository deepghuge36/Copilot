import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [loading, setLoading] = useState(false);

  // Listen for connection status changes
  useEffect(() => {
    chrome.storage.local.get("connectionStatus", (result) => {
      if (result.connectionStatus) {
        setConnectionStatus(result.connectionStatus);
      }
    });

    // Listen for storage changes
    const handleStorageChange = (changes, area) => {
      if (area === "local" && changes.connectionStatus) {
        setConnectionStatus(changes.connectionStatus.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Connect to MCP server
  const connect = async (serverUrl) => {
    try {
      setConnectionStatus("connecting");

      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "CONNECT_MCP", serverUrl },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!response.success) {
              reject(
                new Error(response.error || "Failed to connect to MCP server")
              );
            } else {
              resolve(response.data);
            }
          }
        );
      });

      console.log("MCP connection established:", response);
      setConnectionStatus("connected");

      return response;
    } catch (error) {
      console.error("Failed to connect to MCP server:", error);
      setConnectionStatus("error");
      throw error;
    }
  };

  // Disconnect from MCP server
  const disconnect = async () => {
    try {
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "DISCONNECT_MCP" }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!response.success) {
            reject(
              new Error(
                response.error || "Failed to disconnect from MCP server"
              )
            );
          } else {
            resolve(response);
          }
        });
      });

      setConnectionStatus("disconnected");
    } catch (error) {
      console.error("Failed to disconnect from MCP server:", error);
      throw error;
    }
  };

  // Send message to MCP server
  const sendMessage = async (content) => {
    try {
      if (connectionStatus !== "connected") {
        throw new Error("Not connected to MCP server");
      }

      // Add user message to chat
      const userMessage = {
        id: Date.now().toString(),
        content,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setLoading(true);

      // Send message to background script
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "SEND_MESSAGE", content },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!response.success) {
              reject(
                new Error(
                  response.error || "Failed to send message to MCP server"
                )
              );
            } else {
              resolve(response.data);
            }
          }
        );
      });

      // Add bot response to chat
      const botMessage = {
        id: response.id || Date.now().toString() + "-response",
        content: response.content,
        sender: "bot",
        timestamp: response.timestamp || new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setLoading(false);

      return botMessage;
    } catch (error) {
      console.error("Failed to send message:", error);
      setLoading(false);
      throw error;
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
  };

  // The context value that will be provided
  const contextValue = {
    messages,
    connectionStatus,
    loading,
    connect,
    disconnect,
    sendMessage,
    clearChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};
