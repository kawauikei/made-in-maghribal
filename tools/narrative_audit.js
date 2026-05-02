/**
 * Master Narrative Audit Tool
 * 
 * Aggregates all story content (DailyTalks, Greetings, AffectionEvents, Endings)
 * and performs global validation & HTML report generation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { DAILY_TALKS } from '../src/data/dailyTalks.js';
import { AFFECTION_EVENTS } from '../src/data/affectionEvents.js';
import { ENDINGS } from '../src/data/endings.js';

// Mock/Extract System Greetings (Normally in IntroScreen.jsx)
const GREETING_VARIATIONS = [
  {
    id: "greet_1",
    monologue: "（今日もいい天気だ。この日差しなら、ガラス瓶の輝きも一段と増すだろうな……）",
    greeting: "「こんにちは。店先の瓶、今日はずいぶん綺麗に光っているわね」",
    response: "「いらっしゃい。ちょうど光に透かして、色の出方を見ていたところです」",
    farewell: "「ふふ、職人の目ね。それじゃ、営業前の邪魔はこのくらいにしておくわ」"
  },
  {
    id: "greet_2",
    monologue: "（……暑い。砂漠の朝は早いというが、今日は一段と厳しいな。冷えた水が恋しい……）",
    greeting: "「あら、少し顔が赤いわね。砂の熱に負けていたら、目利きも鈍るわよ」",
    response: "「面目ない。水を足して、香草の冷茶でも用意しておきます」",
    farewell: "「それがいいわ。無理をする店主より、涼しい顔で品を選ぶ店主の方が頼れるもの」"
  },
  {
    id: "greet_3",
    monologue: "（今日は風が穏やかだな。街の喧騒もどこか遠くに感じる。……さて、営業の準備だ）",
    greeting: "「いらっしゃい。今日は珍しく静かね。星瓶堂の棚まで、少し落ち着いて見えるわ」",
    response: "「ええ。こういう日は、香りも音もいつもよりよく分かる気がします」",
    farewell: "「いい品が見つかりそうね。それじゃ、また後で顔を出すわ」"
  },
  {
    id: "greet_4",
    monologue: "（曇りか……。だが、こういう日の方が影が言えて、宝石の地色がよく見えるんだよな）",
    greeting: "「熱心に素材を眺めているわね。曇り空でも、何か見えるものがあるの？」",
    response: "「ええ。強い光がない日ほど、石や瓶の地色が素直に見えるんです」",
    farewell: "「なるほどね。星瓶堂の店主らしい見方だわ。今日の目利き、少し楽しみにしている」"
  }
];

const PROHIBITED_WORDS = ["店番", "再建", "借金", "遺品", "一緒に営業する", "働かせる", "スタッフ", "店員"];
const MAIN_SCENARIO_EXPRESSIONS = ['normal', 'joy', 'fun', 'sorrow', 'anger', 'surprise', 'cry', 'blush'];
const GALLERY_ONLY_EXPRESSIONS = ['student', 'social', 'maid'];

console.log("--- Master Narrative Audit Starting ---");

function checkText(text, id, errors) {
    if (!text) return;
    PROHIBITED_WORDS.forEach(word => {
        if (text.includes(word)) {
            errors.push(`${id}: Prohibited word "${word}" found in "${text.substring(0, 20)}..."`);
        }
    });
    // Check for outer quotation marks (warning, not error)
    const trimmed = text.trim();
    if (trimmed.startsWith('「') && trimmed.endsWith('」')) {
        errors.push(`${id}: Warning - Outer quotation marks「」found in "${text.substring(0, 30)}...". Consider removing since VNBox shows speaker separately.`);
    }
}

function checkExpression(expr, id, pageIdx, errors) {
    if (!expr) return;
    if (GALLERY_ONLY_EXPRESSIONS.includes(expr)) {
        errors.push(`${id} (page ${pageIdx + 1}): Gallery-only expression "${expr}" found in main scenario. Use one of: ${MAIN_SCENARIO_EXPRESSIONS.join(', ')}`);
    } else if (!MAIN_SCENARIO_EXPRESSIONS.includes(expr)) {
        errors.push(`${id} (page ${pageIdx + 1}): Unknown expression "${expr}". Valid: ${MAIN_SCENARIO_EXPRESSIONS.join(', ')}`);
    }
}

const auditResults = {
    dailyTalks: [],
    affectionEvents: [],
    endings: [],
    greetings: [],
    errors: []
};

// 1. Audit DailyTalks
DAILY_TALKS.forEach(talk => {
    const talkErrors = [];
    talk.pages.forEach((p, idx) => {
        checkText(p.text, talk.id, talkErrors);
        checkExpression(p.expression, talk.id, idx, talkErrors);
    });
    auditResults.dailyTalks.push({ ...talk, errors: talkErrors });
    if (talkErrors.length > 0) auditResults.errors.push(...talkErrors);
});

// 2. Audit AffectionEvents
Object.values(AFFECTION_EVENTS).flat().forEach(event => {
    const eventErrors = [];
    event.pages.forEach((p, idx) => {
        checkText(p.text, event.id, eventErrors);
        checkExpression(p.expression, event.id, idx, eventErrors);
    });
    if (event.routePages?.long_history) {
        event.routePages.long_history.forEach((p, idx) => {
            checkText(p.text, `${event.id} (IF)`, eventErrors);
            checkExpression(p.expression, `${event.id} (IF)`, idx, eventErrors);
        });
    }
    auditResults.affectionEvents.push({ ...event, errors: eventErrors });
    if (eventErrors.length > 0) auditResults.errors.push(...eventErrors);
});

// 3. Audit Endings
Object.entries(ENDINGS).forEach(([heroineId, heroineEndings]) => {
    Object.entries(heroineEndings).forEach(([type, ending]) => {
        const id = `${heroineId}_${type}`;
        const endingErrors = [];
        ending.pages.forEach(p => checkText(p.text, id, endingErrors));
        auditResults.endings.push({ ...ending, id, heroineId, type, errors: endingErrors });
        if (endingErrors.length > 0) auditResults.errors.push(...endingErrors);
    });
});

// 4. Audit Greetings
GREETING_VARIATIONS.forEach(greet => {
    const greetErrors = [];
    checkText(greet.monologue, greet.id, greetErrors);
    checkText(greet.greeting, greet.id, greetErrors);
    checkText(greet.response, greet.id, greetErrors);
    checkText(greet.farewell, greet.id, greetErrors);
    auditResults.greetings.push({ ...greet, errors: greetErrors });
    if (greetErrors.length > 0) auditResults.errors.push(...greetErrors);
});

// --- HTML Report Generation ---

const generateReport = (results) => {
    const hasErrors = results.errors.length > 0;
    const statusClass = hasErrors ? "status-fail" : "status-pass";
    const statusText = hasErrors ? `${results.errors.length} ERRORS FOUND` : "ALL PASS";

    let html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Master Narrative Audit - Made in Maghribal</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 50px; }
        h1 { color: #f59e0b; font-size: 2.5em; }
        h2 { border-bottom: 2px solid #334155; padding-bottom: 10px; margin: 40px 0 20px 0; color: #38bdf8; }
        .card { background: #1e293b; border-radius: 16px; border: 1px solid #334155; margin-bottom: 20px; overflow: hidden; }
        .card.error { border-color: #ef4444; }
        .card-header { padding: 12px 20px; background: rgba(0,0,0,0.2); display: flex; align-items: center; gap: 15px; }
        .card-body { padding: 20px; }
        .badge { font-size: 0.7em; padding: 2px 10px; border-radius: 999px; background: #334155; font-weight: bold; }
        .id { font-family: monospace; font-weight: bold; flex-grow: 1; }
        .status-pass { color: #10b981; font-weight: bold; }
        .status-fail { color: #ef4444; font-weight: bold; }
        .error-list { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 10px; border-radius: 8px; margin-top: 15px; font-size: 0.85em; color: #fca5a5; }
        .nav { position: sticky; top: 20px; background: rgba(15, 23, 42, 0.9); padding: 10px; border-radius: 8px; margin-bottom: 20px; z-index: 100; display: flex; gap: 10px; backdrop-filter: blur(4px); border: 1px solid #334155; }
        .nav a { color: #94a3b8; text-decoration: none; font-size: 0.8em; }
        .nav a:hover { color: #f59e0b; }
        .page-item { border-left: 4px solid #38bdf8; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 4px; margin-bottom: 8px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Master Narrative Audit</h1>
            <p>Verification Summary: <span class="${statusClass}">${statusText}</span></p>
        </header>

        <div class="nav">
            <a href="#specs">Technical Specs</a>
            <a href="#greetings">Greetings</a>
            <a href="#daily">DailyTalks</a>
            <a href="#affection">AffectionEvents</a>
            <a href="#endings">Endings</a>
        </div>

        <section id="specs" style="background: rgba(56, 189, 248, 0.05); border: 1px solid #38bdf8; padding: 25px; border-radius: 16px; margin-bottom: 40px;">
            <h2 style="margin-top: 0; color: #38bdf8;">シナリオ執筆用：システム仕様・制約</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div>
                    <h3 style="color: #f59e0b; font-size: 1em;">1. 表情キー（Expression Taxonomy）</h3>
                    <p style="font-size: 0.85em; color: #94a3b8; margin-bottom: 10px;">本編シナリオで使用可能な表情キーのみが有効です。</p>
                    <ul style="font-size: 0.85em; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                        <li><code>normal</code>: 標準</li>
                        <li><code>joy</code>: 喜び/笑顔</li>
                        <li><code>fun</code>: 楽しみ/皮肉</li>
                        <li><code>sorrow</code>: 悲しみ/困惑</li>
                        <li><code>cry</code>: 泣き</li>
                        <li><code>anger</code>: 怒り/ツン</li>
                        <li><code>surprise</code>: 驚き/動揺</li>
                        <li><code>blush</code>: 照れ/赤面</li>
                    </ul>
                    <p style="font-size: 0.85em; color: #f59e0b; margin-top: 10px;">※ ギャラリー/素材専用（本編禁止）: <code>student</code>, <code>social</code>, <code>maid</code></p>
                </div>
                <div>
                    <h3 style="color: #f59e0b; font-size: 1em;">2. デイリートークの構造</h3>
                    <p style="font-size: 0.85em; color: #94a3b8; margin-bottom: 10px;">DailyTalk は以下の4フェーズで構成されます。1と4はシステム側で自動挿入されます。</p>
                    <ol style="font-size: 0.85em; padding-left: 20px;">
                        <li><strong>Monologue (独り言)</strong>: ナーディルの内心。店・天気・素材・営業前の気配を示す。</li>
                        <li><strong>Greeting (挨拶)</strong>: ヒロイン来訪時の短い挨拶。出勤・常駐に見えないようにする。</li>
                        <li><strong>DailyTalk (本編)</strong>: 本レポートに記載されているメイン会話。</li>
                        <li><strong>Farewell (別れ)</strong>: ヒロイン退出時、または会話を切り上げる一言。</li>
                    </ol>
                </div>
            </div>

            <div style="margin-top: 25px; border-top: 1px solid rgba(56, 189, 248, 0.2); paddingTop: 20px;">
                <h3 style="color: #f59e0b; font-size: 1em;">3. 視覚的制約とIFルート</h3>
                <ul style="font-size: 0.85em;">
                    <li><strong>立ち絵表示</strong>: 常に一人まで（中央固定）。ヒロインがいる間、ナーディルは表示されません。</li>
                    <li><strong>Route Mode (IF)</strong>: <code>long_history</code> ルートは、過去から関係が続いていた別世界線IFです。</li>
                    <li><strong>禁則事項</strong>: 借金再建、店番、働く、雇う、スタッフ、店員など、旧設定や従業員感のある表現は禁止です。</li>
                    <li><strong>キャラクター設定</strong>: ヒロインは星瓶堂の従業員ではなく、客・協力者・訪問者として関わります。</li>
                </ul>
            </div>
        </section>

        <h2 id="greetings">System Greetings</h2>
        ${results.greetings.map(g => `
        <div class="card ${g.errors.length > 0 ? "error" : ""}">
            <div class="card-header">
                <span class="badge">GREET</span>
                <span class="id">${g.id}</span>
                <span class="${g.errors.length > 0 ? "status-fail" : "status-pass"}">${g.errors.length > 0 ? "FAIL" : "PASS"}</span>
            </div>
            <div class="card-body">
                <div class="page-item" style="border-left-color: #555;"><strong>Monologue:</strong> ${g.monologue}</div>
                <div class="page-item"><strong>Greeting:</strong> ${g.greeting}</div>
                <div class="page-item" style="border-left-color: #555;"><strong>Response:</strong> ${g.response}</div>
                <div class="page-item"><strong>Farewell:</strong> ${g.farewell}</div>
                ${g.errors.length > 0 ? `<div class="error-list">${g.errors.join("<br>")}</div>` : ""}
            </div>
        </div>`).join("")}

        <h2 id="daily">DailyTalks</h2>
        ${results.dailyTalks.map(t => `
        <div class="card ${t.errors.length > 0 ? "error" : ""}">
            <div class="card-header">
                <span class="badge">DAILY</span>
                <span class="id">${t.id}</span>
                ${t.heroineId ? `<span class="badge" style="background: ${getHeroineColor(t.heroineId)}22; color: ${getHeroineColor(t.heroineId)}">${t.heroineId}</span>` : ""}
                <span class="${t.errors.length > 0 ? "status-fail" : "status-pass"}">${t.errors.length > 0 ? "FAIL" : "PASS"}</span>
            </div>
            <div class="card-body">
                ${t.pages.map(p => `
                <div class="page-item" style="border-left-color: ${p.speaker === 'ナーディル' ? '#555' : getHeroineColor(t.heroineId)}">
                    <strong>${p.speaker} [${p.expression}]:</strong> ${p.text}
                </div>`).join("")}
                ${t.errors.length > 0 ? `<div class="error-list">${t.errors.join("<br>")}</div>` : ""}
            </div>
        </div>`).join("")}

        <h2 id="affection">Affection Events</h2>
        ${results.affectionEvents.map(e => `
        <div class="card ${e.errors.length > 0 ? "error" : ""}">
            <div class="card-header">
                <span class="badge">EVENT</span>
                <span class="id">${e.id}</span>
                <span class="badge" style="background: ${getHeroineColor(e.heroineId)}22; color: ${getHeroineColor(e.heroineId)}">${e.heroineId} (T:${e.threshold})</span>
                <span class="${e.errors.length > 0 ? "status-fail" : "status-pass"}">${e.errors.length > 0 ? "FAIL" : "PASS"}</span>
            </div>
            <div class="card-body">
                <p style="font-size: 0.8em; color: #94a3b8;">Base Pages:</p>
                ${e.pages.map(p => `<div class="page-item" style="border-left-color: ${getHeroineColor(e.heroineId)}"><strong>${p.speaker}:</strong> ${p.text}</div>`).join("")}
                ${e.routePages?.long_history ? `
                <p style="font-size: 0.8em; color: #f59e0b; margin-top: 15px;">IF Route (Long History):</p>
                ${e.routePages.long_history.map(p => `<div class="page-item" style="border-left-color: #f59e0b"><strong>${p.speaker}:</strong> ${p.text}</div>`).join("")}
                ` : ""}
                ${e.errors.length > 0 ? `<div class="error-list">${e.errors.join("<br>")}</div>` : ""}
            </div>
        </div>`).join("")}

        <h2 id="endings">Endings</h2>
        ${results.endings.map(e => `
        <div class="card ${e.errors.length > 0 ? "error" : ""}">
            <div class="card-header">
                <span class="badge">ENDING</span>
                <span class="id">${e.id}</span>
                <span class="badge" style="background: ${getHeroineColor(e.heroineId)}22; color: ${getHeroineColor(e.heroineId)}">${e.heroineId} (${e.type})</span>
                <span class="${e.errors.length > 0 ? "status-fail" : "status-pass"}">${e.errors.length > 0 ? "FAIL" : "PASS"}</span>
            </div>
            <div class="card-body">
                ${e.pages.map(p => `<div class="page-item" style="border-left-color: ${getHeroineColor(e.heroineId)}"><strong>${p.speaker}:</strong> ${p.text}</div>`).join("")}
                ${e.errors.length > 0 ? `<div class="error-list">${e.errors.join("<br>")}</div>` : ""}
            </div>
        </div>`).join("")}
    </div>
</body>
</html>`;
    return html;
};

function getHeroineColor(id) {
    if (id === 'hakima') return "#ffcc00";
    if (id === 'mira') return "#3d5afe";
    if (id === 'dariya') return "#f44336";
    return "#334155";
}

const reportPath = path.resolve('./docs/master_narrative_report.html');
fs.writeFileSync(reportPath, generateReport(auditResults), 'utf8');

console.log(`✅ Audit complete. Found ${auditResults.errors.length} errors.`);
console.log(`Report generated at: ./docs/master_narrative_report.html`);
