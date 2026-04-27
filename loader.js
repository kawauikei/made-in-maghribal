import React from "react";

// Canvas環境では、実行時にこの変数へ自動的にAPIキーが渡されます
const apiKey = "";

export default function App() {
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
      try {
        rootElement.innerHTML = '<div style="padding: 20px;">[SYSTEM] FETCHING https://kawauikei.github.io/made-in-maghribal/main.js ...</div>';
        
        // 外部URLのモジュールをインポート
        const module = await import("https://kawauikei.github.io/made-in-maghribal/main.js");
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
        <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#111" }}>
            <div style={{ padding: "12px 20px", color: "#ccc", fontSize: "14px", borderBottom: "1px solid #333", fontFamily: "sans-serif", background: "#222" }}>
                <strong>External URL Loader</strong>: <a href="https://kawauikei.github.io/made-in-maghribal/main.js" target="_blank" rel="noreferrer" style={{ color: "#4da6ff" }}>https://kawauikei.github.io/made-in-maghribal/main.js</a>
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