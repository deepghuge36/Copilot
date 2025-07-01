// Background script for the Chrome extension
// This runs in the background and manages communication with MCP backend

// Initialize connection with the MCP backend
chrome.runtime.onInstalled.addListener(() => {
  console.log("Chrome extension installed");

  // Set default configuration
  chrome.storage.local.set({
    mcpServerUrl: "http://10.90.21.212:8000/mcp/", // Default MCP server URL
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
    const response = await fetch(`${serverUrl}/v1/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
    // Import MCP utilities
    const {
      formatMcpMessage,
      parseMcpResponse,
      createMcpContext,
      formatChatHistory,
    } = await import("./utils/mcpUtils.js");

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

    // Get the current active tab for context
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });

    let pageContext = null;

    // Get page content from content script if available
    if (tabs && tabs.length > 0) {
      try {
        const pageInfo = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "getPageContent" },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(
                  response || {
                    url: tabs[0].url,
                    title: tabs[0].title,
                  }
                );
              }
            }
          );
        });

        pageContext = createMcpContext(pageInfo);
      } catch (e) {
        console.warn("Failed to get page context:", e);
        // Fallback to basic context
        if (tabs[0]) {
          pageContext = createMcpContext({
            url: tabs[0].url,
            title: tabs[0].title,
          });
        }
      }
    }

    // Get message history from storage if needed
    // const messageHistory = await new Promise(resolve => {
    //   chrome.storage.local.get(['messageHistory'], result => {
    //     resolve(result.messageHistory || []);
    //   });
    // });

    // Format user message
    const userMessage = formatMcpMessage(content);

    // Create the MCP request payload
    const payload = {
      messages: [
        // ...formatChatHistory(messageHistory.slice(-5)), // Last 5 messages for context
        userMessage,
      ],
      context: pageContext,
      // Add any other MCP parameters your server supports
      stream: false, // Set to true if your server supports streaming
    };

    // Send the request to the MCP server
    const response = await fetch(`${serverUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any authentication headers needed for your MCP server
        // 'Authorization': `Bearer ${serverConfig.apiKey}`
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
    console.log("MCP server response:", data);

    // Parse the response using our utility
    const formattedResponse = parseMcpResponse(data);

    return formattedResponse;
  } catch (error) {
    console.error("MCP service error:", error);
    // Return a formatted error message that can be displayed to the user
    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      content: `Error: ${error.message}`,
      type: "error",
    };
  }
}
