// Content script for the Chrome extension
// This runs in the context of web pages

console.log("React Chatbox Extension content script loaded");

// Function to extract all visible text from the page
function getAllTextFromPage() {
  // Get all text nodes in the body
  const textNodes = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        // Filter out script and style text nodes
        if (
          node.parentNode.tagName === "SCRIPT" ||
          node.parentNode.tagName === "STYLE" ||
          node.parentNode.tagName === "NOSCRIPT" ||
          node.textContent.trim() === ""
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        // Check if the node is visible
        const style = window.getComputedStyle(node.parentNode);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode.textContent.trim());
  }

  // Combine all text and clean it up
  let allText = textNodes.join("\n").replace(/\s+/g, " ").trim();

  // Add page title and URL
  const pageInfo = `Title: ${document.title}\nURL: ${window.location.href}\n\nContent:\n`;

  return pageInfo + allText;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getPageContent") {
    // Example of collecting page content for MCP context
    const pageContent = {
      title: document.title,
      url: window.location.href,
      selection: window.getSelection().toString(),
      metaDescription:
        document.querySelector('meta[name="description"]')?.content || "",
    };
    sendResponse(pageContent);
  }

  if (message.action === "getAllPageText") {
    try {
      const allText = getAllTextFromPage();
      sendResponse({
        success: true,
        text: allText,
        url: window.location.href,
        title: document.title,
      });
    } catch (error) {
      console.error("Error extracting page text:", error);
      sendResponse({
        success: false,
        error: error.message,
      });
    }
  }

  return true;
});

// Optional: Create an in-page chatbox element
// This would be used if you want to inject the chatbox directly into web pages
// rather than just using the popup

/* 
function createChatboxContainer() {
  const container = document.createElement('div');
  container.id = 'mcp-chatbox-container';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    z-index: 9999;
    overflow: hidden;
    display: none;
  `;
  document.body.appendChild(container);
  return container;
}

// Create toggle button
function createToggleButton() {
  const button = document.createElement('button');
  button.id = 'mcp-chatbox-toggle';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #4285f4;
    color: white;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    border: none;
  `;
  button.textContent = '+';
  
  document.body.appendChild(button);
  return button;
}

// Initialize in-page chatbox if needed
// const container = createChatboxContainer();
// const toggleButton = createToggleButton();

// toggleButton.addEventListener('click', () => {
//   const isVisible = container.style.display === 'block';
//   container.style.display = isVisible ? 'none' : 'block';
//   toggleButton.textContent = isVisible ? '+' : '×';
// });
*/
