/**
 * MCP Protocol Utilities
 *
 * This file contains utilities for working with the Model Context Protocol (MCP)
 * specification for connecting to AI model backends.
 *
 * Note: This file avoids DOM/browser APIs that might not be available in service workers
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
    console.error("No response received");
    return {
      content: "No response received",
      type: "error",
    };
  }

  console.log("Parsing response:", JSON.stringify(response, null, 2));

  // Handle direct string response
  if (typeof response === "string") {
    console.log("Processing direct string response");
    return {
      id: Date.now().toString(),
      content: response,
      timestamp: new Date().toISOString(),
      type: "text",
    };
  }

  // Handle the specific format from your MCP server (primary format)
  // response.response.content[{type:"text", text:"message"}]
  if (
    response.response &&
    response.response.content &&
    Array.isArray(response.response.content)
  ) {
    console.log(
      "Processing Anthropic Claude API format (response.response.content)"
    );
    const textContents = response.response.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\n\n");

    console.log("Extracted text content:", textContents);

    return {
      id: response.response.id || Date.now().toString(),
      content: textContents || "No text content found in response",
      timestamp: new Date().toISOString(),
      type: "text",
    };
  }

  // Handle Claude API format (content array with text objects)
  if (response.content && Array.isArray(response.content)) {
    const textContents = response.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\n\n");

    return {
      id: response.id || Date.now().toString(),
      content: textContents || "No text content found in response",
      timestamp: new Date().toISOString(),
      type: "text",
    };
  }

  // Handle the specific format from the provided endpoint
  if (response.response || response.content || response.result) {
    // Check if response.response is a Claude API object
    if (
      response.response &&
      typeof response.response === "object" &&
      response.response.content &&
      Array.isArray(response.response.content)
    ) {
      const textContents = response.response.content
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n\n");

      return {
        id: response.response.id || Date.now().toString(),
        content: textContents || "No text content found in response",
        timestamp: new Date().toISOString(),
        type: "text",
      };
    }

    return {
      id: response.id || Date.now().toString(),
      content: response.response || response.content || response.result || "",
      timestamp: response.timestamp || new Date().toISOString(),
      type: "text",
    };
  }

  // Handle the Anthropic API specific format (response.completion)
  if (response.completion) {
    return {
      id: response.id || Date.now().toString(),
      content: response.completion || "",
      timestamp: new Date().toISOString(),
      type: "text",
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
    const response = await fetch(`${url}/api/health`, {
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
