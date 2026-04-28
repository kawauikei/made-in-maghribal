/**
 * Ending Scenario Definitions for Made in Maghribal
 */
import { BACKGROUND_IMAGES } from './imageAssets';

export const ENDINGS = {
  hakima: {
    good: {
      title: "星瓶堂の灯が、やさしく続く",
      expression: "joy",
      bgId: "shopInteriorService",
      text: "今日までの積み重ねが、ちゃんとここまで届いている。ハキマは笑って、また明日も星瓶堂を手伝うと言った。"
    },
    normal: {
      title: "いつもの一日が、少し特別になる",
      expression: "normal",
      bgId: "shopInteriorService",
      text: "星瓶堂で重ねた会話は、静かに次の約束へつながっていく。"
    },
    bad: {
      title: "言えなかった言葉",
      expression: "sad",
      bgId: "shopInteriorService",
      text: "少しすれ違いは残ったけれど、星瓶堂で過ごした時間が消えるわけではない。"
    }
  },
  mira: {
    good: {
      title: "ひらめきが、未来を照らす",
      expression: "joy",
      bgId: "shopInteriorService",
      text: "ミラは新しい発想を携えて、また星瓶堂にやってくる。次の相談が、もう楽しみだ。"
    },
    normal: {
      title: "学びの途中で",
      expression: "normal",
      bgId: "shopInteriorService",
      text: "まだまだ途中。でも、二人でなら次の一歩も見つけられる。"
    },
    bad: {
      title: "少し遠回り",
      expression: "sad",
      bgId: "shopInteriorService",
      text: "距離は少しだけ離れたまま。それでも、また会えば言葉を交わせるはずだ。"
    }
  },
  dariya: {
    good: {
      title: "静かな信頼",
      expression: "joy",
      bgId: "shopInteriorService",
      text: "ダリヤは星瓶堂に、気を抜ける場所を見つけた。そうしてまた、少しだけ笑った。"
    },
    normal: {
      title: "気配を残して",
      expression: "normal",
      bgId: "shopInteriorService",
      text: "短い時間でも、言葉を重ねれば距離は変わる。星瓶堂には、その余韻が残る。"
    },
    bad: {
      title: "まだほどけない心",
      expression: "sad",
      bgId: "shopInteriorService",
      text: "話し足りない気持ちはある。それでも、星瓶堂での記憶はここにある。"
    }
  }
};
