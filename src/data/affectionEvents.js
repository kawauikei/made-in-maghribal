/**
 * Affection Event Definitions for Made in Maghribal
 *
 * Normal route text lives in `text`.
 * Route-specific IF text lives in `routePages.long_history`.
 */

export const AFFECTION_EVENTS = {
  hakima: [
    {
      id: "hakima_5",
      heroineId: "hakima",
      threshold: 5,
      title: "もう一度、隣に",
      speaker: "ハキマ",
      expression: "joy",
      text: "ナーディル、さっきの品選び……なんだかあんたが店を継いだばかりの頃を思い出したよ。一人前になろうと必死なのは、見てればわかる。……あの時より、ずっと頼もしくなったね。",
      routePages: {
        long_history: [
          "ナーディル、さっきの品選び……あんたが店を継いだ日のことを思い出したよ。",
          "あの頃からずっと、あんたの隣にいるけど……今じゃ、立派な店主だね。あたしも鼻が高いよ。"
        ]
      },
      routePages: {
        long_history: [
          "また会えたね、ナーディル。前に交わした約束、ちゃんと覚えてる。",
          "遠回りしてきた分だけ、今のこの距離がうれしい。これからも隣で学ばせて。"
        ]
      },
      stillImageId: "hakimaMorningVisit01"
    },
    {
      id: "hakima_10",
      heroineId: "hakima",
      threshold: 10,
      title: "狐の耳は嘘をつかない",
      speaker: "ハキマ",
      expression: "fun",
      text: "……あ、あんまり耳をジロジロ見ないでよ！ ほら、次の鑑定依頼が来てるみたいだよ。……ったく、あんたのそういう真っ直ぐなところ、たまに困るんだから。（耳がピコピコと嬉しそうに動いている）"
    }
  ],
  mira: [
    {
      id: "mira_5",
      heroineId: "mira",
      threshold: 5,
      title: "普通の女の子として",
      speaker: "ミラ",
      expression: "fun",
      text: "……ふふっ。先輩とこうして品物を見つめていると、商会の義務も学園の課題も、すべて忘れてしまえそうです。ただの『私』でいられるこの場所が、少しずつ特別になってきました。",
      routePages: {
        long_history: [
          "……ふふっ。先輩とこうしていると、子供の頃に路地裏を駆け回っていたのを思い出します。",
          "今は立場こそ違いますが、先輩の隣が一番落ち着くのは……昔から変わりませんね。"
        ]
      },
      routePages: {
        long_history: [
          "やっぱり、君とは前にもこうして話していた気がする。",
          "昔の記憶でも、今の私でも、笑って並べる相手がいるのはうれしいよ。"
        ]
      },
      stillImageId: "miraAfterSchool01"
    },
    {
      id: "mira_10",
      heroineId: "mira",
      threshold: 10,
      title: "商人の目利き",
      speaker: "ミラ",
      expression: "joy",
      text: "先輩、今の品選び……実に見事でした。ただ価値を見るだけでなく、持ち主の心まで汲み取る。商人として、そして一人の人間として、深く尊敬してしまいます。……私も、負けていられませんね。"
    }
  ],
  dariya: [
    {
      id: "dariya_5",
      heroineId: "dariya",
      threshold: 5,
      title: "安らぎの工房",
      speaker: "ダリヤ",
      expression: "joy",
      text: "……ふぅ。王宮や研究所の喧騒を離れて、ここで君の話を聞いていると、不思議と心が凪いでいくのがわかるよ。この工房の空気は、どんな霊薬よりも私に効くらしい。感謝しているよ、ナーディル。",
      routePages: {
        long_history: [
          "……ふぅ。君がまだ薬草の区別もつかなかった頃からの付き合いだが……。",
          "今や、私の最も信頼する鑑定士だ。君の工房の空気は、どんな霊薬よりも私を安らげてくれるよ。"
        ]
      },
      routePages: {
        long_history: [
          "長い時間を経ても、こうして同じ答えに戻ってこられるのは不思議ですね。",
          "過去から続く縁でも、今こうして選び直せることに意味があるのでしょう。"
        ]
      },
      stillImageId: "dariyaAfterHours01"
    },
    {
      id: "dariya_10",
      heroineId: "dariya",
      threshold: 10,
      title: "共鳴する真理",
      speaker: "ダリヤ",
      expression: "fun",
      text: "君の調合理論は、時に王立研究所の教授たちよりも核心を突いているね。真理を求める瞳……私はそれが大好きだ。……面白いな、君という人間を、もっと深く研究してみたくなったよ。"
    }
  ]
};

/**
 * Returns all events for a given heroine
 * @param {string} heroineId 
 * @returns {Array}
 */
export function getEventsByHeroine(heroineId) {
  return AFFECTION_EVENTS[heroineId] || [];
}
