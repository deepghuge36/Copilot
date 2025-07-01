// Test MCP server response parsing
const testResponse = {
  response: {
    id: "msg_01XB94PACPT14PCYN0YY08W59N",
    type: "message",
    role: "assistant",
    model: "claude-3-opus-20240229",
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: 18,
      output_tokens: 48,
    },
    content: [
      {
        type: "text",
        text: "Hello! How can I assist you today?",
      },
    ],
  },
};

// Log the parsed response structure
console.log(JSON.stringify(testResponse, null, 2));

// Test the parsing function
const parseMcpResponse = (response) => {
  console.log("Parsing response:", JSON.stringify(response, null, 2));

  // Handle nested response structure with Claude API format
  if (
    response.response &&
    response.response.content &&
    Array.isArray(response.response.content)
  ) {
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

  console.log("Response not matched with main parsing rule");

  // Fallback
  return {
    id: Date.now().toString(),
    content: "Could not parse response",
    timestamp: new Date().toISOString(),
    type: "text",
  };
};

const parsed = parseMcpResponse(testResponse);
console.log("Final parsed result:", parsed);
