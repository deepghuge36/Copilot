# React Chatbox Chrome Extension with MCP Connection

A Chrome extension built with React that implements a chatbox with Model Context Protocol (MCP) connection to a backend server.

## Features

- React-based UI with responsive design
- Chrome Extension Manifest V3 compatibility
- MCP (Model Context Protocol) connection to backend services
- Light/Dark theme support
- Message history
- Settings panel for configuration

## Project Structure

```
react-chatbox-extension/
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   └── tasks.json
├── public/
│   ├── manifest.json
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   ├── ChatHeader.jsx
│   │   ├── ChatInput.jsx
│   │   ├── ConnectionStatus.jsx
│   │   ├── Message.jsx
│   │   ├── MessageList.jsx
│   │   └── SettingsPanel.jsx
│   ├── context/
│   │   └── ChatContext.jsx
│   ├── hooks/
│   │   └── useBrowser.js
│   ├── services/
│   ├── styles/
│   │   ├── app.css
│   │   ├── chatHeader.css
│   │   ├── chatInput.css
│   │   ├── connectionStatus.css
│   │   ├── message.css
│   │   ├── messageList.css
│   │   ├── popup.css
│   │   └── settingsPanel.css
│   ├── utils/
│   │   └── mcpUtils.js
│   ├── background.js
│   ├── contentScript.js
│   ├── popup.html
│   └── popup.jsx
├── .babelrc
├── package.json
├── webpack.common.js
├── webpack.dev.js
└── webpack.prod.js
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

For development with hot-reloading:

```bash
npm run start
```

This will create a `dist` folder with the compiled extension. You can then load this unpacked extension in Chrome:

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder

### Production Build

To create a production build:

```bash
npm run build
```

## MCP Connection

This extension connects to a backend server that implements the Model Context Protocol (MCP). By default, it tries to connect to `http://localhost:8000`, but you can change this in the settings panel.

### Configuring MCP Connection

1. Click the gear icon in the header to open settings
2. Enter your MCP server URL
3. Click "Connect"

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
