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
    monologue: "（今日もいい天気だ。この日差しなら、ガラスの輝きも一段と増すだろうな……）",
    greeting: "「おはよう。朝から熱心ね。その顔、何か良い品でも入ったのかしら？」",
    response: "「いらっしゃい。ええ、ちょうど朝日に透かして見ていたところです」",
    farewell: "「ふふ、職人の目ね。それじゃ、私はこれで。今日も良い縁があるといいわね」"
  },
  {
    id: "greet_2",
    monologue: "（……暑い。砂漠の朝は早いというが、今日は一段と厳しいな。冷えた水が恋しい……）",
    greeting: "「おはよう。あら、あなたもバテ気味？ 砂の熱に負けてちゃ、商売にならないわよ」",
    response: "「……おはようございます。面目ない。しっかり水分を摂って、シャキッとしないと」",
    farewell: "「そうよ。はい、これ。……それじゃ、私も仕事に戻るわ。無理しすぎないようにね」"
  },
  {
    id: "greet_3",
    monologue: "（今日は風が穏やかだな。街の喧騒もどこか遠くに感じる。……さて、開店の準備だ）",
    greeting: "「いらっしゃい。今日は珍しく静かな朝ね。あなたの店も、心なしか落ち着いて見えるわ」",
    response: "「ええ、心地よい静寂です。たまにはこういう、ゆったりとした時間も悪くないですね」",
    farewell: "「ええ、同感よ。さて、私も行くわ。いい品ができるのを楽しみにしてる」"
  },
  {
    id: "greet_4",
    monologue: "（曇りか……。だが、こういう日の方が影が消えて、宝石の地色がよく見えるんだよな）",
    greeting: "「お疲れ様。熱心に素材を眺めて……何か新しいインスピレーションでも湧いた？」",
    response: "「いらっしゃい。ええ、曇天の下での輝きも、また一興だと思って見ていたんです」",
    farewell: "「流石は星瓶堂の店主ね。それじゃ、開店の邪魔はしないわ。また後でね」"
  }
];

const PROHIBITED_WORDS = ["店番", "働く", "雇う", "再建", "一緒に営業する", "父が遺した", "遺品", "形見"];

console.log("--- Master Narrative Audit Starting ---");

function checkText(text, id, errors) {
    if (!text) return;
    PROHIBITED_WORDS.forEach(word => {
        if (text.includes(word)) {
            errors.push(`${id}: Prohibited word "${word}" found in "${text.substring(0, 20)}..."`);
        }
    });
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
    talk.pages.forEach(p => checkText(p.text, talk.id, talkErrors));
    auditResults.dailyTalks.push({ ...talk, errors: talkErrors });
    if (talkErrors.length > 0) auditResults.errors.push(...talkErrors);
});

// 2. Audit AffectionEvents
Object.values(AFFECTION_EVENTS).flat().forEach(event => {
    const eventErrors = [];
    event.pages.forEach(p => checkText(p.text, event.id, eventErrors));
    if (event.routePages?.long_history) {
        event.routePages.long_history.forEach(p => checkText(p.text, `${event.id} (IF)`, eventErrors));
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
GREETING_VARIATIONS.forEach(g => {
    const gErrors = [];
    checkText(g.monologue, g.id, gErrors);
    checkText(g.greeting, g.id, gErrors);
    checkText(g.response, g.id, gErrors);
    checkText(g.farewell, g.id, gErrors);
    auditResults.greetings.push({ ...g, errors: gErrors });
    if (gErrors.length > 0) auditResults.errors.push(...gErrors);
});

// --- HTML Generation ---

const generateMasterHtml = (results) => {
    const heroineColors = { hakima: '#ffcc00', mira: '#3d5afe', dariya: '#f44336' };

    const renderPages = (pages, hColor) => pages.map(p => `
        <div class="page-item" style="border-left: 4px solid ${hColor || '#555'}; background: rgba(0,0,0,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
            <div style="font-weight: bold; color: ${hColor || '#aaa'}; font-size: 0.85em;">${p.speaker || '(Narration)'} [${p.expression || 'normal'}]</div>
            <div style="margin-top: 4px; white-space: pre-wrap;">${p.text}</div>
        </div>
    `).join('');

    const renderCard = (item, type, hColor) => `
        <div class="card ${item.errors.length > 0 ? 'error' : ''}">
            <div class="card-header">
                <span class="badge">${type}</span>
                <span class="id">${item.id}</span>
                ${item.heroineId ? `<span class="badge" style="background: ${heroineColors[item.heroineId]}22; color: ${heroineColors[item.heroineId]}">${item.heroineId}</span>` : ''}
                ${item.errors.length > 0 ? '<span class="status-fail">FAIL</span>' : '<span class="status-pass">PASS</span>'}
            </div>
            <div class="card-body">
                ${item.pages ? renderPages(item.pages, hColor) : ''}
                ${item.routePages?.long_history ? `<div style="margin-top: 15px; border-top: 1px dashed #444; padding-top: 10px;"><strong style="color: #38bdf8; font-size: 0.8em;">[Long History Route]</strong>${renderPages(item.routePages.long_history, hColor)}</div>` : ''}
                ${item.monologue ? `
                    <div class="page-item" style="border-left-color: #555;"><strong>Monologue:</strong> ${item.monologue}</div>
                    <div class="page-item" style="border-left-color: ${hColor};"><strong>Greeting:</strong> ${item.greeting}</div>
                    <div class="page-item" style="border-left-color: #555;"><strong>Response:</strong> ${item.response}</div>
                    <div class="page-item" style="border-left-color: ${hColor};"><strong>Farewell:</strong> ${item.farewell}</div>
                ` : ''}
                ${item.errors.length > 0 ? `<div class="error-list"><ul>${item.errors.map(e => `<li>${e}</li>`).join('')}</ul></div>` : ''}
            </div>
        </div>
    `;

    const html = `<!DOCTYPE html>
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
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Master Narrative Audit</h1>
            <p>Verification Summary: ${results.errors.length === 0 ? '<span class="status-pass">ALL PASS</span>' : `<span class="status-fail">${results.errors.length} ERRORS</span>`}</p>
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
                    <p style="font-size: 0.85em; color: #94a3b8; margin-bottom: 10px;">以下のキーのみが有効です。アセット名と連動しています。</p>
                    <ul style="font-size: 0.85em; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                        <li><code>normal</code>: 標準</li>
                        <li><code>joy</code>: 喜び/笑顔</li>
                        <li><code>fun</code>: 楽しみ/皮肉</li>
                        <li><code>sorrow</code>: 悲しみ/困惑</li>
                        <li><code>cry</code>: 泣き</li>
                        <li><code>anger</code>: 怒り/ツン</li>
                        <li><code>surprise</code>: 驚き/動揺</li>
                        <li><code>blush</code>: 照れ/赤面</li>
                        <li><code>student</code>: 制服（ミラ専用）</li>
                        <li><code>social</code>: 社交（ダリヤ専用）</li>
                        <li><code>maid</code>: メイド（ハキマ専用）</li>
                    </ul>
                </div>
                <div>
                    <h3 style="color: #f59e0b; font-size: 1em;">2. デイリートークの構造</h3>
                    <p style="font-size: 0.85em; color: #94a3b8; margin-bottom: 10px;">以下の4フェーズで構成されます。1と4はシステム側で自動挿入されます。</p>
                    <ol style="font-size: 0.85em; padding-left: 20px;">
                        <li><strong>Monologue (独り言)</strong>: ナーディルの内心。()で括る。</li>
                        <li><strong>Greeting (挨拶)</strong>: ヒロイン来訪時の会話。</li>
                        <li><strong>DailyTalk (本編)</strong>: 本レポートに記載されているメイン会話。</li>
                        <li><strong>Farewell (別れ)</strong>: ヒロイン退出時の挨拶。</li>
                    </ol>
                </div>
            </div>

            <div style="margin-top: 25px; border-top: 1px solid rgba(56, 189, 248, 0.2); paddingTop: 20px;">
                <h3 style="color: #f59e0b; font-size: 1em;">3. 視覚的制約とIFルート</h3>
                <ul style="font-size: 0.85em;">
                    <li><strong>立ち絵表示</strong>: 常に一人まで（中央固定）。ヒロインがいる間、ナーディルは表示されません。</li>
                    <li><strong>Route Mode (IF)</strong>: <code>long_history</code> ルートは、前世や「もしも」の記憶を示唆する特殊会話です。</li>
                    <li><strong>禁則事項</strong>: 借金再建、店番、父の遺品など、旧設定（リファクタリング前）を彷彿とさせるワードは禁止されています。</li>
                </ul>
            </div>
        </section>

        <h2 id="greetings">System Greetings</h2>
        ${results.greetings.map(g => renderCard(g, 'GREET', null)).join('')}

        <h2 id="daily">DailyTalks</h2>
        ${results.dailyTalks.map(t => renderCard(t, 'DAILY', t.heroineId ? heroineColors[t.heroineId] : null)).join('')}

        <h2 id="affection">Affection Events (Stills)</h2>
        ${results.affectionEvents.map(e => renderCard(e, 'EVENT', heroineColors[e.heroineId])).join('')}

        <h2 id="endings">Endings</h2>
        ${results.endings.map(e => renderCard(e, 'ENDING', heroineColors[e.heroineId])).join('')}
    </div>
</body>
</html>`;
    return html;
};

const auditResultsJson = JSON.stringify(auditResults, null, 2);
const htmlContent = generateMasterHtml(auditResults);
const reportPath = './docs/master_narrative_report.html';
if (!fs.existsSync('./docs')) fs.mkdirSync('./docs');
fs.writeFileSync(reportPath, htmlContent);

console.log(`\n✅ Audit complete. Found ${auditResults.errors.length} errors.`);
console.log(`Report generated at: ${reportPath}`);

if (auditResults.errors.length > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
