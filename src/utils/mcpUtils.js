/**
 * MCP Protocol Utilities
 *
 * This file contains utilities for working with the Model Context Protocol (MCP)
 * specification for connecting to AI model backends.
 */

/**
 * Formats a message according to MCP protocol
 * @param {string} content - The message content
 * @param {Object} options - Additional options
 * @returns {Object} - MCP formatted message
 */
export const formatMcpMessage = (content, options = {}) => {
  return {
    role: options.role || "user",
    content: content,
    metadata: {
      timestamp: new Date().toISOString(),
      ...options.metadata,
    },
  };
};

/**
 * Parses an MCP response
 * @param {Object} response - Raw MCP response
 * @returns {Object} - Parsed response for the chat UI
 */
export const parseMcpResponse = (response) => {
  // Handle different response formats based on MCP specification
  if (!response) {
    return {
      content: "No response received",
      type: "error",
    };
  }

  // Handle standard MCP response format
  if (response.choices && response.choices.length > 0) {
    const choice = response.choices[0];
    return {
      id: response.id || Date.now().toString(),
      content: choice.message?.content || "",
      timestamp: response.created
        ? new Date(response.created * 1000).toISOString()
        : new Date().toISOString(),
      type: "text",
    };
  }

  // Basic format conversion for other formats
  return {
    id: response.id || Date.now().toString(),
    content: response.content || response.text || response.message || "",
    timestamp:
      response.timestamp ||
      response.metadata?.timestamp ||
      new Date().toISOString(),
    type: response.type || "text",
  };
};

/**
 * Creates a context object for MCP
 * @param {Object} pageInfo - Information about the current page
 * @returns {Object} - MCP context object
 */
export const createMcpContext = (pageInfo) => {
  return {
    type: "page_context",
    url: pageInfo.url,
    title: pageInfo.title,
    selection: pageInfo.selection || "",
    html: pageInfo.html,
    metadata: {
      source: "chrome_extension",
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Creates a chat history object for MCP
 * @param {Array} messages - Chat history messages
 * @returns {Array} - Formatted messages for MCP
 */
export const formatChatHistory = (messages) => {
  return messages.map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.content,
    timestamp: msg.timestamp,
  }));
};

/**
 * Validates if a string is a valid MCP server URL
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidMcpServerUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:", "ws:", "wss:"].includes(parsedUrl.protocol);
  } catch (e) {
    return false;
  }
};

/**
 * Check if an MCP server is available
 * @param {string} url - Server URL to check
 * @returns {Promise<boolean>} - Whether the server is available
 */
export const checkMcpServerAvailability = async (url) => {
  try {
    const response = await fetch(`${url}/v1/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (e) {
    console.error("MCP server availability check failed:", e);
    return false;
  }
};
