import React from "react";

// Canvas環境では、実行時にこの変数へ自動的にAPIキーが渡されます
const apiKey = "";

export default function App() {
    const [showStatus, setShowStatus] = React.useState(false);
    // Reactの多重読み込み（Canvas環境のReactと外部モジュールのReactの衝突）による
    // フックエラーを回避するため、iframe内で独立したReact環境を構築して読み込みます。
    const iframeSrcDoc = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>External Module Runner</title>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; background: #000; color: #00ff00; font-family: monospace; }
    #root { height: 100%; box-sizing: border-box; }
  </style>
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18",
        "react-dom/client": "https://esm.sh/react-dom@18/client"
      }
    }
  </script>
</head>
<body>
  <div id="root">
    <div style="padding: 20px;">[SYSTEM] PREPARING ISOLATED ENVIRONMENT...</div>
  </div>
  <script type="module">
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    
    // iframe内のエラーを画面に表示するためのハンドラ
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      document.getElementById('root').innerHTML = 
        '<div style="padding: 20px; color: #ff5555;">' +
        '[ERROR] ' + msg + '<br/><br/>' + 
        'See browser console for details.' +
        '</div>';
      return false;
    };

    async function loadExternalApp() {
      const rootElement = document.getElementById('root');
      const MAIN_URL = "https://kawauikei.github.io/made-in-maghribal/main.js";
      try {
        rootElement.innerHTML = '<div style="padding: 20px;">[SYSTEM] FETCHING ' + MAIN_URL + ' ...</div>';
        
        // ローカル（またはデプロイ先）の main.js をインポート
        // 注意: 開発時は相対パス、本番公開時は絶対URLになる場合があります
        const module = await import(MAIN_URL);
        const ExternalComponent = module.default;
        
        // React 18のcreateRootを使用してマウント
        const root = createRoot(rootElement);
        
        // APIキーをPropsとして渡してレンダリング
        root.render(React.createElement(ExternalComponent, { apiKey: "${apiKey}" }));
        
      } catch (err) {
        console.error("Iframe Load Error:", err);
        rootElement.innerHTML = 
          '<div style="padding: 20px; color: #ff5555; border: 1px solid #ff5555;">' +
          '[ERROR] Failed to load module:<br/><br/>' + err.message + 
          '</div>';
      }
    }
    
    loadExternalApp();
  </script>
</body>
</html>
  `;

    return (
        <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#111", overflow: "hidden" }}>
            <div style={{ minHeight: "24px", height: "24px", color: "#bbb", fontSize: "11px", borderBottom: "1px solid #333", fontFamily: "sans-serif", background: "#1f1f1f", display: "flex", alignItems: "center", gap: "8px", padding: "0 8px", boxSizing: "border-box", flexShrink: 0 }}>
                <button
                    onClick={() => setShowStatus(!showStatus)}
                    title={showStatus ? "Hide loader status" : "Show loader status"}
                    style={{ width: "18px", height: "18px", border: "1px solid #444", background: showStatus ? "#444" : "#2b2b2b", color: "#ddd", borderRadius: "50%", fontSize: "10px", padding: 0, cursor: "pointer", lineHeight: "16px" }}
                >
                    i
                </button>
            </div>

            <iframe
                title="External Component Preview"
                srcDoc={iframeSrcDoc}
                style={{ flex: 1, border: "none", width: "100%" }}
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
}
