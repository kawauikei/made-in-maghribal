/**
 * Sample Scenario Data for MadeInMaghribal project.
 */
const SCENARIO_SAMPLES = {
  SC_OP_OPENING: [
    {
      text: "マグリバルに朝日が昇る。",
      backgroundId: "AS_BG_TOWN"
    },
    {
      speakerId: "CH_NADIR",
      speakerExpression: "normal",
      text: "新しいターンが始まる。どんな客が来るだろうか。"
    },
    {
      speakerId: "CH_HAKIMA",
      speakerExpression: "joy",
      standingCharacterId: "CH_HAKIMA",
      standingExpression: "joy",
      text: "おはよう、ナーディル！ 錬成の準備はできているかしら？",
      jump: "SC_TURN_1_START"
    }
  ]
};

module.exports = { SCENARIO_SAMPLES };
