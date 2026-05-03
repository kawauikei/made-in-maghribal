/**
 * Time Phase Helper for Made in Maghribal
 * Resolves the time phase label/icon based on screen and context.
 */

export const TIME_PHASES = {
  NONE: { key: 'none', label: '', icon: '', color: 'transparent', description: '' },
  PRE_OPEN: { key: 'pre_open', label: '開店前', icon: '🌅', color: '#f59e0b', description: '朝の支度' },
  OPEN: { key: 'open', label: '営業中', icon: '🛍', color: '#10b981', description: 'お客様対応中' },
  POST_OPEN: { key: 'post_open', label: '営業後', icon: '🌆', color: '#f97316', description: '営業直後' },
  CLOSED: { key: 'closed', label: '閉店後', icon: '🌙', color: '#6366f1', description: '夜の支度' },
  FINALE: { key: 'finale', label: '総決算', icon: '✨', color: '#8b5cf6', description: '5 日の総括' },
  MEMORY: { key: 'memory', label: '回想', icon: '📖', color: '#94a3b8', description: '愛着の記録' }
};

/**
 * Resolves time phase from screen and context.
 * @param {string} screen - Current screen name
 * @param {object|null} activeDailyTalk - Current DailyTalk object (optional)
 * @param {boolean} isRecallMode - Whether in memories recall mode (optional)
 * @returns {object} Time phase object from TIME_PHASES
 */
export function resolveTimePhase(screen, activeDailyTalk = null, isRecallMode = false) {
  // Memories recall mode
  if (isRecallMode) {
    return TIME_PHASES.MEMORY;
  }

  switch (screen) {
    case 'START':
    case 'HEROINE_SELECT':
      return TIME_PHASES.NONE;

    case 'PROLOGUE':
    case 'INTRO':
      return TIME_PHASES.PRE_OPEN;

    case 'QUIZ':
      return TIME_PHASES.OPEN;

    case 'RESULT':
      return TIME_PHASES.POST_OPEN;

    case 'DAILY_TALK':
      // Use DailyTalk timing to determine phase
      if (activeDailyTalk?.timing === 'day_end') {
        return TIME_PHASES.CLOSED;
      } else if (activeDailyTalk?.timing === 'after_result') {
        return TIME_PHASES.POST_OPEN;
      } else if (activeDailyTalk?.timing === 'intro') {
        return TIME_PHASES.PRE_OPEN;
      }
      return TIME_PHASES.PRE_OPEN;

    case 'DAY_END':
      return TIME_PHASES.CLOSED;

    case 'FINAL_RESULT':
      return TIME_PHASES.FINALE;

    case 'EVENT':
    case 'MEMORIES':
      return TIME_PHASES.MEMORY;

    case 'VISUAL_TEST':
    case 'OPTIONS':
    case 'LOG':
    case 'HELP':
    case 'SOUND_TEST':
      return TIME_PHASES.NONE;

    default:
      return TIME_PHASES.NONE;
  }
}
