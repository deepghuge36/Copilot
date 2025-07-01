// Background script for the Chrome extension
// This runs in the background and manages communication with MCP backend
// Note: This is a service worker context - document/window references are not available

// Import MCP utilities directly at the top level to avoid dynamic imports
// which can cause issues in service workers
import { formatMcpMessage, parseMcpResponse } from "./utils/mcpUtils.js";

// Initialize connection with the MCP backend
chrome.runtime.onInstalled.addListener(() => {
  console.log("Chrome extension installed");

  // Set default configuration
  chrome.storage.local.set({
    mcpServerUrl: "http://10.90.23.45:3000", // Default MCP server URL
    connectionStatus: "disconnected",
    settings: {
      autoConnect: true,
      notifications: true,
      theme: "light",
    },
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONNECT_MCP") {
    connectToMcp(message.serverUrl)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }

  if (message.type === "DISCONNECT_MCP") {
    disconnectFromMcp()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === "SEND_MESSAGE") {
    sendMessageToMcp(message.content)
      .then((response) => sendResponse({ success: true, data: response }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === "GET_PAGE_TEXT") {
    getActiveTabPageText()
      .then((pageText) => sendResponse({ success: true, data: pageText }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// MCP connection functions
async function connectToMcp(serverUrl) {
  try {
    // Implementation of MCP connection protocol
    console.log(`Connecting to MCP server at ${serverUrl}`);

    // Validate the server URL
    if (!serverUrl) {
      throw new Error("Server URL is required");
    }

    // Store the server URL for future use
    const serverConfig = { url: serverUrl };

    // Try to establish a connection with the MCP server
    const response = await fetch(`${serverUrl}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("MCP server response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Failed to connect to MCP server: ${response.statusText}`
      );
    }

    // Parse the server response if available
    let serverInfo = { url: serverUrl };
    try {
      const data = await response.json();
      serverInfo = { ...serverInfo, ...data };
    } catch (e) {
      console.warn("Could not parse server info:", e);
    }

    // Update connection status in storage
    chrome.storage.local.set({
      mcpServerUrl: serverUrl,
      connectionStatus: "connected",
      serverConfig,
    });

    return { status: "connected", serverInfo };
  } catch (error) {
    console.error("MCP connection error:", error);
    chrome.storage.local.set({ connectionStatus: "error" });
    throw error;
  }
}

async function disconnectFromMcp() {
  try {
    // Implementation of MCP disconnection protocol
    console.log("Disconnecting from MCP server");

    // Get the server URL from storage
    const storageData = await new Promise((resolve) => {
      chrome.storage.local.get(["mcpServerUrl"], resolve);
    });

    const serverUrl = storageData.mcpServerUrl;

    // If we have a server URL, we could notify the server that we're disconnecting
    // This depends on your MCP implementation
    if (serverUrl) {
      try {
        // Optional: Notify the server that we're disconnecting
        // await fetch(`${serverUrl}/v1/disconnect`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' }
        // });
      } catch (e) {
        console.warn("Failed to notify server of disconnection:", e);
      }
    }

    // Update connection status
    chrome.storage.local.set({ connectionStatus: "disconnected" });

    return true;
  } catch (error) {
    console.error("MCP disconnection error:", error);
    throw error;
  }
}

async function sendMessageToMcp(content) {
  try {
    // Get the server URL from storage
    const storageData = await new Promise((resolve) => {
      chrome.storage.local.get(["mcpServerUrl", "serverConfig"], resolve);
    });

    const serverUrl = storageData.mcpServerUrl;
    const serverConfig = storageData.serverConfig || {};

    if (!serverUrl) {
      throw new Error(
        "MCP server URL not found. Please connect to a server first."
      );
    }

    console.log("Sending message to MCP server:", content);

    // Format user message
    const userMessage = formatMcpMessage(content);

    // Create the MCP request payload according to the Anthropic API endpoint format
    const payload = {
      prompt: content,
    };

    console.log("Sending payload to Anthropic API endpoint:", payload);

    // Send the request to the MCP server
    const response = await fetch(`${serverUrl}/api/llm/anthropic-mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Ignore parsing errors for error responses
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("MCP server response:", JSON.stringify(data, null, 2));

    // Parse the response using our utility
    const formattedResponse = parseMcpResponse(data);
    console.log("Formatted response for UI:", formattedResponse);

    return formattedResponse;
  } catch (error) {
    console.error("MCP service error:", error);

    // Return a mock response for testing when the MCP server is unavailable
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network Error")
    ) {
      console.log("MCP server unavailable, returning mock response");
      return {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        content:
          "This is a mock response for testing. The actual server appears to be unavailable right now. Please check your connection settings.",
        type: "text",
      };
    }

    // Return a formatted error message that can be displayed to the user
    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      content: `Error: ${error.message}`,
      type: "error",
    };
  }
}

// Function to get text content from the active tab
async function getActiveTabPageText() {
  try {
    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      throw new Error("No active tab found");
    }

    const activeTab = tabs[0];

    // Check if we can access the tab (some URLs like chrome://, extension://, etc. can't be accessed)
    if (!activeTab.url || !activeTab.url.startsWith("http")) {
      throw new Error(
        "Cannot access this page. Only http/https pages are supported."
      );
    }

    // Ensure the content script is injected
    try {
      // First try messaging - this will work if the content script is already there
      const response = await chrome.tabs
        .sendMessage(activeTab.id, {
          action: "ping",
        })
        .catch(() => null);

      // If no response, inject the content script
      if (!response) {
        console.log("Content script not detected, injecting it now...");
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ["contentScript.js"],
        });

        // Wait a short time for the script to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.warn("Error checking/injecting content script:", error);
      // Continue anyway, we'll catch any issues in the next step
    }

    // Now try to get the page content
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, {
        action: "getPageContent",
      });

      if (!response) {
        throw new Error("No response from content script");
      }

      // Format the response in a readable way
      const formattedText = `
      Create a Poll for the following page:
Page Title: ${response.title}
URL: ${response.url}
Timestamp: ${response.timestamp}

CONTENT:
${response.bodyText}
      `.trim();

      return formattedText;
    } catch (error) {
      console.error("Error getting page content:", error);
      throw new Error(
        `Failed to get page content: ${error.message}. Please refresh the page and try again.`
      );
    }
  } catch (error) {
    console.error("Error getting page text:", error);
    throw error;
  }
}
