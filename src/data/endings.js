/**
 * Ending Scenario Definitions for Made in Maghribal
 */
import { BACKGROUND_IMAGES } from './imageAssets';

export const ENDINGS = {
  hakima: {
    good: {
      title: "再会の約束、黄昏の街で",
      expression: "joy",
      bgId: "shopInteriorService",
      text: "「星瓶堂、活気が出てきたね……。あんたの目利き、立派なものだったよ。……ねえ、ナーディル。これからもこうして、隣にいてもいいかな？ ……あたしにとってあんたは、もうただの同業者じゃない。もっと別の……その、大切な人なんだから」"
    },
    normal: {
      title: "日常の続き、隣の距離",
      expression: "normal",
      bgId: "shopInteriorService",
      text: "「お疲れ様。なんとかお店、形になったね。これからも忙しくなりそうだけど、あたしもできる限り手伝うから。……あんたが困った時、一番に頼るのはあたしなんだからね。わかった？」"
    },
    bad: {
      title: "すれ違う足音",
      expression: "sad",
      bgId: "shopInteriorService",
      text: "「お店、やっぱり畳んじゃうんだね……。あたしも力になれなくてごめん。……ナーディル、あんたのこれからの道が、どこに繋がっていても……あたしは応援してるから。じゃあね」"
    }
  },
  mira: {
    good: {
      title: "黄金の砂漠に咲く花",
      expression: "joy",
      bgId: "shopInteriorService",
      text: "「先輩、おめでとうございます。星瓶堂のさらなる発展、商会の人間としても、一人のファンとしても、これほど嬉しいことはありません。……もしよろしければ、これからもずっと、お傍であなたの鑑定を見届けてもよろしいでしょうか？」"
    },
    normal: {
      title: "商人たちの静かな午後",
      expression: "normal",
      bgId: "shopInteriorService",
      text: "「一区切りですね、先輩。星瓶堂の評判も安定してきました。私も商会の仕事がありますが、時間を見つけては顔を出します。……あなたの選ぶ品々を、私はもっと見ていたいのです」"
    },
    bad: {
      title: "遠ざかる学舎の鐘",
      expression: "sad",
      bgId: "shopInteriorService",
      text: "「残念です、先輩……。星瓶堂がなくなってしまうなんて。私の力不足です。……いつかまた、あなたがどこかで鑑定の旗を掲げる日が来ると信じています。さようなら」"
    }
  },
  dariya: {
    good: {
      title: "叡智の果て、君の隣",
      expression: "joy",
      bgId: "shopInteriorService",
      text: "「素晴らしい結果だ、ナーディル。君の目利きは、王宮の宝物庫すら凌駕する真実を捉えていた。……私は決めたよ。王立研究所よりも、君の隣にいる方が、私の求める真理に近い。これからも、共に歩ませてくれないか？」"
    },
    normal: {
      title: "真理への緩やかな道",
      expression: "normal",
      bgId: "shopInteriorService",
      text: "「再建成功、おめでとう。君という人間は、やはり私の予測を超えてくる。これからも研究の合間に、君の鑑定を観察させてもらうよ。……ふふ、断っても無駄だ。君の理論は、あまりに魅力的すぎるからね」"
    },
    bad: {
      title: "霧に消える研究室",
      expression: "sad",
      bgId: "shopInteriorService",
      text: "「……そうか。星瓶堂の灯が消えてしまうのだね。この場所で君と語った時間は、私にとって最も貴重なデータ……いや、思い出だった。……君の未来に、幸いがあらんことを」"
    }
  }
};
