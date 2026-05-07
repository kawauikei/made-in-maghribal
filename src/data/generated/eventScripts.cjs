/**
 * Generated Event Scripts
 * Do not edit manually. Use tools/sync-events.cjs
 */
const EVENT_SCRIPTS = {
  "EV_DARIYA_01": [
    {
      "type": "bg",
      "id": "bg_shop_exterior_night",
      "transition": "fade"
    },
    {
      "type": "bgm",
      "id": "BGM_THEME_DARIYA",
      "fadeMs": 800
    },
    {
      "type": "enter",
      "characterId": "CH_DARIYA",
      "expression": "normal",
      "position": "left"
    },
    {
      "type": "line",
      "speakerId": "CH_DARIYA",
      "expression": "social",
      "text": "あら、まだ起きていたの？仕事の邪魔はしないで頂戴。"
    },
    {
      "type": "still",
      "id": "still_dariya_after_hours_01"
    },
    {
      "type": "line",
      "speakerId": "CH_NADIR",
      "text": "無理は禁物だぞ、お嬢様。"
    },
    {
      "type": "end",
      "markSeen": true
    }
  ],
  "EV_HAKIMA_01": [
    {
      "type": "bg",
      "id": "bg_shop_interior_service",
      "transition": "fade"
    },
    {
      "type": "bgm",
      "id": "BGM_THEME_HAKIMA",
      "fadeMs": 800
    },
    {
      "type": "enter",
      "characterId": "CH_HAKIMA",
      "expression": "normal",
      "position": "right"
    },
    {
      "type": "line",
      "speakerId": "CH_HAKIMA",
      "expression": "joy",
      "text": "おはよう。今日もぼんやりしてないでしょうね。"
    },
    {
      "type": "choice",
      "choices": [
        {
          "label": "しっかりしてるさ",
          "jump": "L_REPLY_A"
        },
        {
          "label": "少し眠いかもな",
          "jump": "L_REPLY_B"
        }
      ]
    },
    {
      "type": "label",
      "id": "L_REPLY_A"
    },
    {
      "type": "line",
      "speakerId": "CH_HAKIMA",
      "text": "ならいいけど。さっさと準備しなさい。"
    },
    {
      "type": "jump",
      "id": "L_STILL"
    },
    {
      "type": "label",
      "id": "L_REPLY_B"
    },
    {
      "type": "line",
      "speakerId": "CH_HAKIMA",
      "expression": "anger",
      "text": "呆れた。顔を洗ってきなさい！"
    },
    {
      "type": "label",
      "id": "L_STILL"
    },
    {
      "type": "still",
      "id": "still_hakima_morning_visit_01"
    },
    {
      "type": "line",
      "speakerId": "CH_NADIR",
      "text": "朝から手厳しいな。助かるけど。"
    },
    {
      "type": "end",
      "markSeen": true
    }
  ],
  "EV_MIRA_01": [
    {
      "type": "bg",
      "id": "bg_palace_lab",
      "transition": "fade"
    },
    {
      "type": "bgm",
      "id": "BGM_THEME_MIRA",
      "fadeMs": 800
    },
    {
      "type": "enter",
      "characterId": "CH_MIRA",
      "expression": "normal",
      "position": "center"
    },
    {
      "type": "line",
      "speakerId": "CH_MIRA",
      "expression": "fun",
      "text": "見てください！この記述、新発見かもしれません！"
    },
    {
      "type": "still",
      "id": "still_mira_after_school_01"
    },
    {
      "type": "line",
      "speakerId": "CH_NADIR",
      "text": "根を詰めすぎるなよ、ミラ。"
    },
    {
      "type": "end",
      "markSeen": true
    }
  ],
  "EV_OP_01": [
    {
      "type": "bg",
      "id": "bg_market_central",
      "transition": "fade"
    },
    {
      "type": "bgm",
      "id": "main01_title",
      "fadeMs": 1000
    },
    {
      "type": "narration",
      "text": "かつて、この砂丘の向こうには無限の緑があったという。"
    },
    {
      "type": "narration",
      "text": "今では語り草に過ぎないが、それでも人々は空を見上げる。"
    },
    {
      "type": "end",
      "markSeen": true
    }
  ]
};

if (typeof module !== 'undefined') {
  module.exports = { EVENT_SCRIPTS };
}
