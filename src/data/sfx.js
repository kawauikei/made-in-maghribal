/**
 * SFX Manifest for Made in Maghribal
 * 
 * Defines sound effects with organic, tactile qualities suitable for 
 * a fantasy alchemy workshop (glass, ceramic, wood, sand, etc.).
 */

export const SFX = {
  // --- UI Interactions ---
  uiTapBottle: {
    id: "uiTapBottle",
    usage: "ui_tap",
    src: "audio/se/ui_tap_bottle_01.mp3",
    volume: 0.45,
    description: "Small glass bottle tap for general selection"
  },
  uiConfirmChime: {
    id: "uiConfirmChime",
    usage: "ui_confirm",
    src: "audio/se/ui_confirm_chime_01.mp3",
    volume: 0.5,
    description: "Soft brass chime for confirmation"
  },

  // --- Quiz Interactions ---
  quizChoicePick: {
    id: "quizChoicePick",
    usage: "quiz_choice",
    src: "audio/se/quiz_choice_pick_01.mp3",
    volume: 0.45,
    description: "Ceramic click when picking an item"
  },
  quizCorrectStarChime: {
    id: "quizCorrectStarChime",
    usage: "quiz_correct",
    src: "audio/se/quiz_correct_star_chime_01.mp3",
    volume: 0.55,
    description: "Tiny star-like crystalline chime for correct answers"
  },
  quizWrongSandTap: {
    id: "quizWrongSandTap",
    usage: "quiz_wrong",
    src: "audio/se/quiz_wrong_sand_tap_01.mp3",
    volume: 0.45,
    description: "Muffled sand-like tap for wrong answers"
  },

  // --- Workshop Events ---
  workshopDayEnd: {
    id: "workshopDayEnd",
    usage: "workshop_day_end",
    src: "audio/se/workshop_day_end_01.mp3",
    volume: 0.5,
    description: "Wooden door latch or shop bell for day end"
  }
};

/**
 * Get SFX data by its unique ID
 */
export function getSfxById(id) {
  return SFX[id] || null;
}

/**
 * Get the first matching SFX data by its usage
 */
export function getSfxByUsage(usage) {
  const found = Object.values(SFX).find(s => s.usage === usage);
  return found || null;
}
