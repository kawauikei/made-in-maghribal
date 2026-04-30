/**
 * Ending Scenario Definitions for Made in Maghribal
 */
import { BACKGROUND_IMAGES } from './imageAssets';

export const ENDINGS = {
  hakima: {
    good: {
      title: "星瓶堂の灯が、やさしく続く",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-04"
      },
      summary: "星瓶堂の再出発は無事に軌道に乗った。ハキマは少しだけ素直な言葉を口にし、これからも関わっていくことを予感させる。",
      pages: [
        { speaker: "", expression: "joy", text: "星瓶堂の棚に、ルハーン商会の香り袋が並ぶようになった。\n客はその香りを、若店主と狐の鑑定士の品だと噂した。" },
        { speaker: "ハキマ", expression: "joy", text: "「少しはマシな店になったわね。……まあ、私のおかげだけど」\nハキマは得意げに笑い、カウンターに身を乗り出す。" },
        { speaker: "", expression: "joy", text: "星瓶堂の灯の下、ふたりの影が並ぶ。\n競い合う声も、笑い声も、これからの商いに溶けていった。" }
      ]
    },
    normal: {
      title: "いつもの一日が、少し特別になる",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-02"
      },
      summary: "関係に大きな変化はないが、以前よりも確実に柔らかい空気が二人の間に流れている。",
      pages: [
        { speaker: "", expression: "normal", text: "営業を重ねるうち、ハキマの目は少しだけ柔らかくなった。\nそれでも口ぶりは、相変わらず手厳しい。" },
        { speaker: "ハキマ", expression: "normal", text: "「あんたの目利き、今日は少し甘かったわよ。\n……だから、明日も私が確かめてあげる」" },
        { speaker: "ハキマ", expression: "fun", text: "彼女は耳を揺らし、少しだけ照れたように笑う。\n星瓶堂の明日は、今日より少しだけ騒がしくなりそうだ。" }
      ]
    },
    bad: {
      title: "言えなかった言葉",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MAIN-01"
      },
      summary: "すれ違いはあったものの、二人が過ごした時間とハキマの残した香材は確かに星瓶堂の礎となっている。",
      pages: [
        { speaker: "", expression: "sorrow", text: "ハキマは最後まで、素直な言葉を選べなかった。\nそれでも棚の一角には、彼女が選んだ香材が残っている。" },
        { speaker: "", expression: "sorrow", text: "扉が閉まる前、白い尻尾が一度だけ揺れた。\nまた来る、とは言わない。でも来ないとも言わなかった。" }
      ]
    }
  },
  mira: {
    good: {
      title: "ひらめきが、未来を照らす",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-04"
      },
      summary: "ミラは星瓶堂の商品企画に助言を続けるが、それは義務でも課題でもない。自分の夢としてナーディルの隣に立つ。",
      pages: [
        { speaker: "ミラ", expression: "joy", text: "ミラの提案で、星瓶堂の商品は少しずつ遠くの街へ届き始めた。\nそれでも彼女は、数字だけで喜ぶことはなかった。" },
        { speaker: "ミラ", expression: "joy", text: "「先輩、この品を受け取った人の顔まで想像しましょう」\nそう言う彼女は、もう正解だけを追っていない。" },
        { speaker: "ミラ", expression: "joy", text: "「天才だから、ではありません。私が、ここで考えたいんです」\nミラは少し頬を染め、まっすぐに笑った。" },
        { speaker: "", expression: "joy", text: "星瓶堂の灯と、夜空の星。\nふたりで選ぶ未来は、どんな答えよりも温かかった。" }
      ]
    },
    normal: {
      title: "学びの途中で",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-02"
      },
      summary: "ミラはまだ商人としての「正解」を探し続けているが、星瓶堂を訪れること自体が彼女の喜びになっている。",
      pages: [
        { speaker: "ミラ", expression: "normal", text: "「今日の課題は終わりました。だから、明日の話をしましょう」\nミラは少しだけ背伸びをして、新しい帳面を開く。" },
        { speaker: "", expression: "joy", text: "その声には、以前より少しだけ柔らかさがあった。\n答えより先に、話したい相手がいる。それだけで十分だった。" },
        { speaker: "ミラ", expression: "fun", text: "「先輩、一緒に迷ってくださいね」\n彼女の笑顔は、どんな完璧な調合よりも明るかった。" }
      ]
    },
    bad: {
      title: "少し遠回り",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MAIN-01"
      },
      summary: "星瓶堂とミラの間に少し距離は残るが、彼女は再び答えを探しに来るはずだと確信できる。",
      pages: [
        { speaker: "", expression: "sorrow", text: "ミラは最後まで、完璧な答えを探そうとしていた。\nナーディルの前でさえ、少し肩の力が抜けなかった。" },
        { speaker: "ミラ", expression: "sorrow", text: "「まだ、私の見立ては足りないみたいです」\nそう言って微笑む顔は、少しだけ寂しそうだった。" },
        { speaker: "ミラ", expression: "normal", text: "「でも、また解き直せばいいんですよね」\n彼女は課題帳を抱え、それでもしっかりとした足取りで帰っていった。" }
      ]
    }
  },
  dariya: {
    good: {
      title: "静かな信頼",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-04"
      },
      summary: "ダリヤは王宮の重圧から逃げるのではなく、星瓶堂で息を整えながら向き合う道を選ぶ。",
      pages: [
        { speaker: "", expression: "joy", text: "ダリヤは王宮を去らなかった。\nただし、もう一人で重さを抱え込むことはやめた。" },
        { speaker: "ダリヤ", expression: "fun", text: "検証品の相談という名目で、彼女は時折星瓶堂を訪れる。\n茶を飲み、少し皮肉を言い、少しだけ笑う。" },
        { speaker: "ダリヤ", expression: "joy", text: "「私はまだ完璧ではない」\nダリヤは静かに言った。\n「だが、それを君に見られるのは、もう怖くない」" },
        { speaker: "", expression: "joy", text: "夜の工房に、柔らかな灯がともる。\nその明かりは、王宮へ戻る彼女の背中を静かに支えていた。" }
      ]
    },
    normal: {
      title: "気配を残して",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-02"
      },
      summary: "王宮での時間は相変わらず厳しいが、星瓶堂という「帰れる場所」ができたことで彼女の表情は和らいでいる。",
      pages: [
        { speaker: "", expression: "normal", text: "ダリヤは以前より少しだけ長く、星瓶堂に留まるようになった。\nそれでも本音は、まだ言葉になりきらない。" },
        { speaker: "ダリヤ", expression: "normal", text: "「君の淹れる茶は、どうしてこうも香りが強いんだ」\n文句を言いながらも、彼女は空になった杯を置く。" },
        { speaker: "ダリヤ", expression: "fun", text: "「……また明日、飲みに来てやる」\n言い残した言葉には、柔らかな約束が込められていた。" }
      ]
    },
    bad: {
      title: "まだほどけない心",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MAIN-01"
      },
      summary: "ダリヤは再び王宮の重責に戻っていくが、星瓶堂で過ごした時間が完全に消えたわけではない。",
      pages: [
        { speaker: "", expression: "sorrow", text: "ダリヤは最後まで、疲れた顔を隠そうとした。\n王宮錬金術師としての姿は、美しく、少し遠かった。" },
        { speaker: "", expression: "sorrow", text: "けれど夜の店先で、彼女は一度だけ足を止める。\n星瓶堂の灯を見つめる横顔に、言えなかった弱音が残っていた。" }
      ]
    }
  }
};
