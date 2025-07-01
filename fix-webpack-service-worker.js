/**
 * This script fixes the webpack-generated service worker code to work in Chrome extensions
 * by removing references to document and window.
 */

const fs = require("fs");
const path = require("path");

const backgroundJsPath = path.join(__dirname, "dist", "background.js");

try {
  let content = fs.readFileSync(backgroundJsPath, "utf8");

  // Replace references to document and window with null
  content = content.replace(/document\./g, "undefined && document.");
  content = content.replace(/window\./g, "undefined && window.");
  content = content.replace(/typeof document/g, '"undefined"');
  content = content.replace(/typeof window/g, '"undefined"');

  fs.writeFileSync(backgroundJsPath, content);
  console.log(
    "Successfully updated background.js for service worker compatibility"
  );
} catch (err) {
  console.error("Error updating background.js:", err);
}
