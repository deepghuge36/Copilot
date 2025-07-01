// Content script for the Chrome extension
// This runs in the context of web pages

console.log("React Chatbox Extension content script loaded");

// Function to extract all text from the current page
function extractPageText() {
  // Get the page's title and URL
  const title = document.title;
  const url = window.location.href;

  // Get all text content from the body
  const bodyText = document.body.innerText || "";

  // Get any selected text
  const selection = window.getSelection().toString();

  return {
    title,
    url,
    bodyText,
    selection,
    timestamp: new Date().toISOString(),
  };
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Respond to ping to confirm content script is loaded
  if (message.action === "ping") {
    sendResponse({ status: "ok" });
    return true;
  }

  if (message.action === "getPageContent") {
    // Extract all text from the page
    const pageContent = extractPageText();
    sendResponse(pageContent);
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
