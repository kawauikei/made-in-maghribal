import fs from 'fs';
import path from 'path';

function loadData(filePath, varNames) {
  const code = fs.readFileSync(filePath, 'utf-8');
  let cleanCode = code.replace(/^import\s+.*?;\s*$/gm, '');
  cleanCode = cleanCode.replace(/^export\s+(default\s+)?/gm, '');
  
  const evalCode = `
    ${cleanCode}
    ({ ${varNames.join(', ')} })
  `;
  return eval(evalCode);
}

try {
  const { HEROINES } = loadData('./src/data/heroines.js', ['HEROINES']);
  const { AFFECTION_EVENTS } = loadData('./src/data/affectionEvents.js', ['AFFECTION_EVENTS']);
  const { ENDINGS } = loadData('./src/data/endings.js', ['ENDINGS']);
  const { WORLD, PROTAGONIST, SHOP } = loadData('./src/data/world.js', ['WORLD', 'PROTAGONIST', 'SHOP']);
  const { BACKGROUND_IMAGES, STILL_IMAGES } = loadData('./src/data/imageAssets.js', ['BACKGROUND_IMAGES', 'STILL_IMAGES']);
  const { TRACKS } = loadData('./src/data/tracks.js', ['TRACKS']);
  const { SFX } = loadData('./src/data/sfx.js', ['SFX']);

  let md = `# M10-2A Story Data Pack\n\n`;
  md += `本資料は M10-2 Scenario Enrichment に向けた既存データ、世界観設定、UI仕様、および利用可能素材の集約版です。\n`;
  md += `ChatGPT や世界観担当とのストーリー作成・文体統一のインプットとして利用してください。\n`;
  md += `（※本資料は自動抽出されたものであり、このフェーズでの改稿・実装は行っていません）\n\n---\n\n`;

  md += `## 1. Heroine Data\n\n`;
  HEROINES.forEach(h => {
    md += `### ${h.fullName} (${h.name})\n`;
    md += `- **ID**: ${h.id}\n`;
    md += `- **Role**: ${h.role}\n`;
    md += `- **Age**: ${h.age}\n`;
    md += `- **Theme Color**: ${h.themeColor}\n`;
    md += `- **Theme Track ID**: ${h.themeTrackId}\n`;
    md += `- **Music Mood**: ${h.musicMood}\n`;
    md += `- **Route Theme**: ${h.routeTheme}\n`;
    md += `- **Visual Config**: facePosition: ${h.visualConfig?.facePosition || '未定義'}\n`;
    md += `- **Available Expressions**: \`anger\`, \`cry\`, \`fun\`, \`joy\`, \`maid\`, \`normal\`, \`social\`, \`sorrow\`, \`student\`, \`surprise\`\n`;
    md += `\n**Description**:\n> ${h.description}\n`;
    md += `\n**Route Description**:\n> ${h.routeDescription || '(none)'}\n`;
    md += `\n**Personality**:\n> ${h.personality}\n`;
    md += `\n**Relationship**:\n> ${h.relationship}\n`;
    md += `\n**Route Relationship**:\n> ${h.routeRelationship || '(none)'}\n`;
    md += `\n**Greeting**:\n> ${h.greeting}\n\n`;
  });

  md += `---\n\n## 2. Affection Events\n\n`;
  let eventCount = 0;
  ['hakima', 'mira', 'dariya'].forEach(hid => {
    const evts = AFFECTION_EVENTS[hid] || [];
    evts.forEach(ev => {
      eventCount++;
      md += `### [${hid}] Threshold ${ev.threshold}: ${ev.title}\n`;
      md += `- **Event ID**: ${ev.id}\n`;
      md += `- **Speaker**: ${ev.speaker || 'なし'}\n`;
      md += `- **Expression**: ${ev.expression || 'なし'}\n`;
      md += `- **IF(long_history) 差分有無**: ${ev.routePages?.long_history ? 'あり' : 'なし'}\n`;
      
      const normalPages = ev.pages ? ev.pages.length : (ev.text ? 1 : 0);
      md += `- **Normal Route Pages**: ${normalPages}\n`;
      const ifPages = ev.routePages?.long_history ? ev.routePages.long_history.length : 0;
      md += `- **IF Route Pages**: ${ifPages}\n`;
      
      if (ev.stillImageId) {
        md += `- **Still Image**: ${ev.stillImageId}\n`;
        const st = STILL_IMAGES[ev.stillImageId];
        if (st) {
          md += `  - Title: ${st.label}\n`;
          md += `  - Src: ${st.src}\n`;
        }
        md += `- **表示形式**: stillあり (全画面スチル)\n`;
      } else {
        md += `- **表示形式**: standingのみ (立ち絵表示)\n`;
      }
      md += `- **M10-2 本文拡充対象**: はい\n\n`;

      md += `**通常ルート本文 (pages / text)**:\n`;
      if (ev.pages) {
        ev.pages.forEach(p => md += `> ${p}\n`);
      } else if (ev.text) {
        md += `> ${ev.text}\n`;
      }
      
      if (ev.routePages && ev.routePages.long_history) {
        md += `\n**IFルート本文 (long_history)**:\n`;
        ev.routePages.long_history.forEach(p => md += `> ${p}\n`);
      }
      md += `\n`;
    });
  });

  md += `---\n\n## 3. Endings\n\n`;
  let endingCount = 0;
  ['hakima', 'mira', 'dariya'].forEach(hid => {
    const ends = ENDINGS[hid];
    if (!ends) return;
    Object.keys(ends).forEach(route => {
      endingCount++;
      const end = ends[route];
      md += `### [${hid}] ${route} Ending: ${end.title}\n`;
      let condition = '';
      if (route === 'good' || route === 'best') condition = 'Affection 80以上 かつ Reputation(評判) 40以上';
      else if (route === 'bad') condition = 'Affection 40未満';
      else condition = 'Affection 40以上79以下 または (Affection 80以上だがReputation 40未満)';
      
      md += `- **条件**: ${condition} (App.jsx判定)\n`;
      md += `- **Expression**: ${end.expression || 'なし'}\n`;
      md += `- **Background ID**: ${end.bgId || 'なし'}\n\n`;
      md += `**本文 (text/pages)**:\n`;
      if (end.pages) {
        end.pages.forEach(p => md += `> ${p}\n`);
      } else if (end.text) {
        md += `> ${end.text}\n`;
      }
      md += `\n`;
    });
  });

  md += `---\n\n## 4. World / Protagonist / Shop\n\n`;
  md += `### SHOP: ${SHOP.name} (${SHOP.reading} / ${SHOP.localName})\n`;
  md += `- **Location**: ${SHOP.location || '未定義'}\n`;
  md += `- **Description**: ${SHOP.description || '未定義'}\n\n`;

  md += `### PROTAGONIST: ${PROTAGONIST.name} (${PROTAGONIST.shortName})\n`;
  md += `- **Role**: ${PROTAGONIST.role}\n`;
  md += `- **Age**: ${PROTAGONIST.age}\n`;
  md += `- **Background**: ${PROTAGONIST.background}\n`;
  md += `- **Personality**: ${PROTAGONIST.personality}\n`;
  md += `- **Goal**: ${PROTAGONIST.goal}\n\n`;

  md += `### WORLD: ${WORLD.kingdomName}\n`;
  md += `- **Tone**: ${WORLD.tone || '未定義'}\n`;
  md += `- **Keywords**: ${(WORLD.keywords || []).join(', ')}\n`;
  md += `- **Music Direction**: ${WORLD.musicDirection || '未定義'}\n\n`;

  md += `---\n\n## 5. UI / VN表示仕様\n\n`;
  md += `- **VNBoxの仕様**:\n  - 全てのシナリオ・イベントは画面下部の \`VNBox\` (オーバーレイテキストボックス) を通して表示される。\n  - スピーカー名はボックス上部に、指定した色 (\`themeColor\`) で表示される。\n  - クリックで1ページずつ進む。\n`;
  md += `- **1ページあたりの安全な文字量**: \n  - スマホや小窓での可読性を考慮し、最大でも **60〜80文字** 程度。3〜4行に収まる分量が望ましい。\n`;
  md += `- **各シーンでの表示概要**:\n  - **PROLOGUE**: 立ち絵なし、背景 + VNBox のみで状況説明。\n  - **INTRO (毎営業開始)**: ヒロインの \`greeting\` を表示。\n  - **RESULT (毎営業終了)**: 営業成績に応じた短文と、ヒロインの好感度上昇を表示。\n  - **DAY_END**: セーブ画面と次の営業への導線。\n  - **EVENT**: 閾値(5, 10)到達時に挿入。スチルまたは立ち絵とともに、複数ページのイベント本文を展開。\n  - **ENDING**: 10回の営業終了後、最終成績とヒロインの好感度により結末を表示。\n`;
  md += `- **画像仕様**:\n  - イベント中は \`stillImageId\` が指定されていれば全画面スチルを表示。指定がなければ立ち絵を中央に表示。\n`;

  md += `\n---\n\n## 6. Assets / BGM / SE\n\n`;
  md += `### Background Images\n`;
  Object.values(BACKGROUND_IMAGES).forEach(bg => {
    md += `- **${bg.id}**: ${bg.label} (src: ${bg.src})\n`;
  });

  md += `\n### Still Images\n`;
  Object.values(STILL_IMAGES).forEach(st => {
    md += `- **${st.id}**: ${st.label} (src: ${st.src})\n`;
  });

  md += `\n### Heroine Visuals\n`;
  md += `- 全ヒロインに対して \`standing_proc\` (立ち絵) と \`face_proc\` (顔アイコン)、一部 \`bustup_proc\` が提供されています。\n`;
  md += `- 表情差分は face_proc の存在確認に基づく。standing_proc / bustup_proc の実在差分はイベント実装前に個別確認すること。\n`;

  md += `\n### BGM Tracks\n`;
  Object.values(TRACKS).forEach(trk => {
    md += `- **${trk.id}**: ${trk.title} (${trk.category}) [${trk.src}]\n`;
  });

  md += `\n### SE\n`;
  Object.values(SFX).forEach(se => {
    md += `- **${se.id}**: ${se.description} (${se.usage}) [${se.src}]\n`;
  });

  md += `\n---\n\n## 7. Story Writing Fixed Rules (禁則事項・世界観注意点)\n\n`;
  md += `- **ヒロインの立ち位置**: ヒロインは星瓶堂の従業員・常駐者ではない。あくまで「客」「協力者」「訪問者」として関わる。\n`;
  md += `- **禁則語**: 以下の語句の使用は禁止されている。\n  - ❌ \`店番\`\n  - ❌ \`働く\`\n  - ❌ \`雇う\`\n  - ❌ \`再建\`\n`;
  md += `- **ルートの概念**:\n  - **通常ルート**: 「現在から育つ縁」 (UI表示: 現在の縁)\n  - **IFルート**: 「過去から続く縁」 (UI表示: 過去の縁)\n  - IFルートは通常ルートの直接的な続編や「真ルート」ではなく、二周目以降を想定した別世界線・パラレルである。\n`;
  md += `- **営業単位**: \n  - 10ターンは厳密な「10日間」という暦上の日数ではなく、ゲーム上の「営業単位」である。\n  - 表記上は「営業」「10回の営業」「次の営業」等を使用すること。\n`;

  fs.writeFileSync('./docs/scenario_data_pack_m10.md', md, 'utf-8');
  console.log(JSON.stringify({ eventCount, endingCount }));
} catch (e) {
  console.error(e);
}
