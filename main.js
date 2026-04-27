import React from "react";
function App({ apiKey }) {
  const hasApiKey = Boolean(apiKey);
  return /* @__PURE__ */ React.createElement("div", { style: {
    padding: "20px",
    fontFamily: "sans-serif",
    background: "#1a1a1a",
    color: "#eee",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  } }, /* @__PURE__ */ React.createElement("h1", { style: { color: "#ffcc00" } }, "Made in Maghribal"), /* @__PURE__ */ React.createElement("div", { style: {
    padding: "20px",
    border: "1px solid #444",
    borderRadius: "16px",
    background: "#2a2a2a",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
  } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "1.2em" } }, "API Key: ", hasApiKey ? "✅ 接続済み" : "❌ 未設定"), hasApiKey ? /* @__PURE__ */ React.createElement("p", { style: { color: "#88ff88" } }, "生成モードで動作中") : /* @__PURE__ */ React.createElement("p", { style: { color: "#ff8888" } }, "非生成モードで動作中")), /* @__PURE__ */ React.createElement("footer", { style: { marginTop: "30px", color: "#666", fontSize: "0.9em" } }, "Minimal Build Environment v2.0"));
}
export {
  App as default
};
