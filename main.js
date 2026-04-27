// main.js
import React, { useMemo, useState } from "react";

const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

function createRuntime(apiKey) {
  const hasApiKey = Boolean(apiKey && String(apiKey).trim());

  async function generateText(prompt) {
    if (!hasApiKey) {
      return {
        ok: true,
        mode: "fallback",
        text:
          "【非生成モード】APIキーがないため、固定テキストで表示しています。\n\n店じまいのあと、主人公は帳簿を閉じた。今日の接客はまずまずだった。明日もまた、誰かの求める品を見つけるために店を開ける。",
      };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          mode: "error",
          text: `Gemini API error: ${response.status}\n${JSON.stringify(data, null, 2)}`,
        };
      }

      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("") || "";

      return {
        ok: true,
        mode: "generated",
        text: text || "生成結果が空でした。",
      };
    } catch (err) {
      return {
        ok: false,
        mode: "error",
        text: `Gemini connection failed: ${err?.message || String(err)}`,
      };
    }
  }

  return {
    hasApiKey,
    generateText,
  };
}

export default function App({ apiKey = "" }) {
  const runtime = useMemo(() => createRuntime(apiKey), [apiKey]);
  const [status, setStatus] = useState("idle");
  const [resultText, setResultText] = useState("");

  async function handleGenerateTest() {
    setStatus("loading");
    setResultText("");

    const prompt = [
      "あなたは短編恋愛ゲームのイベント文を書く作家です。",
      "以下の条件で、200字程度の短い閉店後イベントを書いてください。",
      "",
      "条件:",
      "- 主人公は20才の男性錬金術師",
      "- 学校卒業後、父の店を継いでいる",
      "- 舞台はマグリブ風の錬金術店",
      "- 今日は接客パズルのテスト営業を終えた",
      "- 文体は少ししっとり、でも軽やか",
    ].join("\n");

    const result = await runtime.generateText(prompt);
    setResultText(result.text);
    setStatus(result.ok ? result.mode : "error");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: 20,
        background: "#10100f",
        color: "#f4ead7",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: 20,
          border: "1px solid rgba(244,234,215,0.2)",
          borderRadius: 16,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Made in Maghribal</h1>

        <p style={{ color: "#d8cab2" }}>
          loader経由でも、Canvas直貼りでも動く main.js の最小テスト版です。
        </p>

        <div
          style={{
            margin: "16px 0",
            padding: 12,
            borderRadius: 12,
            background: runtime.hasApiKey
              ? "rgba(83, 190, 120, 0.15)"
              : "rgba(210, 170, 80, 0.15)",
            border: runtime.hasApiKey
              ? "1px solid rgba(83, 190, 120, 0.35)"
              : "1px solid rgba(210, 170, 80, 0.35)",
          }}
        >
          {runtime.hasApiKey
            ? "生成モード: APIキーを受け取っています。"
            : "非生成モード: APIキーなし。固定文フォールバックで動きます。"}
        </div>

        <button
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: "none",
            background: "#d7a84f",
            color: "#1b1408",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            opacity: status === "loading" ? 0.65 : 1,
          }}
          disabled={status === "loading"}
          onClick={handleGenerateTest}
        >
          {status === "loading" ? "生成中..." : "閉店後イベントをテスト生成"}
        </button>

        <div style={{ marginTop: 16, fontSize: 14, color: "#cdbf9f" }}>
          status: {status}
        </div>

        {resultText ? (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              padding: 16,
              borderRadius: 12,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {resultText}
          </pre>
        ) : (
          <p style={{ color: "#95886f" }}>まだ生成結果はありません。</p>
        )}
      </div>
    </div>
  );
}