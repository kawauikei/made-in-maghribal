import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle, useCallback } from "react";
const THEME = {
  sand: "#e2d1b1",
  parchment: "#f4e9d5",
  brass: "#c5a059",
  brassDark: "#8e6d2e",
  nightBlue: "#1a2a3a",
  oasisTeal: "#2a5a5a",
  textDark: "#2a2a2a",
  starGold: "#ffcc00"
};
const hudModalBackdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1e3,
  backdropFilter: "blur(4px)"
};
const hudModalCard = {
  background: THEME.parchment,
  borderRadius: "16px",
  width: "90%",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  border: `1px solid ${THEME.brass}`
};
const hudCloseX = (onClose) => /* @__PURE__ */ React.createElement(
  "button",
  {
    "data-testid": "modal-x-close",
    onClick: onClose,
    style: {
      position: "absolute",
      top: "12px",
      right: "12px",
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "none",
      background: "rgba(0,0,0,0.1)",
      color: THEME.nightBlue,
      fontSize: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10
    },
    "aria-label": "Close"
  },
  "×"
);
const SELECTED_SFX = {
  uiTapBottle: "uiTapBottle03",
  uiConfirmChime: "uiConfirmChime03",
  uiClickForward: "uiTapBottle03",
  uiHeroineTab: "uiConfirmChime01",
  uiHeroineSelect: "uiConfirmChime03",
  uiGameStart: "uiConfirmChime04",
  quizChoicePick: "quizChoicePick03",
  quizCorrectStarChime: "quizCorrectStarChime01",
  quizWrongSandTap: "quizWrongSandTap03",
  workshopDayEnd: "workshopDayEnd02"
};
const SFX_CANDIDATES = [
  // --- Group: uiTapBottle ---
  { id: "uiTapBottle01", group: "uiTapBottle", variant: 1, src: "audio/se/ui_tap_bottle_01.mp3", label: "Tap Bottle 1", volume: 0.8, start: 0, end: null, note: "Standard glass tap" },
  { id: "uiTapBottle02", group: "uiTapBottle", variant: 2, src: "audio/se/ui_tap_bottle_01_2.mp3", label: "Tap Bottle 2", volume: 0.8, start: 0, end: null, note: "Soft glass tap" },
  { id: "uiTapBottle03", group: "uiTapBottle", variant: 3, src: "audio/se/ui_tap_bottle_01_3.mp3", label: "Tap Bottle 3", volume: 0.8, start: 0, end: null, note: "Sharp glass tap" },
  { id: "uiTapBottle04", group: "uiTapBottle", variant: 4, src: "audio/se/ui_tap_bottle_01_4.mp3", label: "Tap Bottle 4", volume: 0.8, start: 0, end: null, note: "Deep glass tap" },
  // --- Group: uiConfirmChime ---
  { id: "uiConfirmChime01", group: "uiConfirmChime", variant: 1, src: "audio/se/ui_confirm_chime_01.mp3", label: "Confirm Chime 1", volume: 0.7, start: 0, end: null, note: "Bright chime" },
  { id: "uiConfirmChime02", group: "uiConfirmChime", variant: 2, src: "audio/se/ui_confirm_chime_01_2.mp3", label: "Confirm Chime 2", volume: 0.7, start: 0, end: null, note: "Soft chime" },
  { id: "uiConfirmChime03", group: "uiConfirmChime", variant: 3, src: "audio/se/ui_confirm_chime_01_3.mp3", label: "Confirm Chime 3", volume: 0.7, start: 0, end: null, note: "Arabic bell style" },
  { id: "uiConfirmChime04", group: "uiConfirmChime", variant: 4, src: "audio/se/ui_confirm_chime_01_4.mp3", label: "Confirm Chime 4", volume: 0.7, start: 0, end: null, note: "Deep bell style" },
  // --- Group: quizChoicePick ---
  { id: "quizChoicePick01", group: "quizChoicePick", variant: 1, src: "audio/se/quiz_choice_pick_01.mp3", label: "Choice Pick 1", volume: 0.6, start: 0, end: null, note: "Light wooden tap" },
  { id: "quizChoicePick02", group: "quizChoicePick", variant: 2, src: "audio/se/quiz_choice_pick_01_2.mp3", label: "Choice Pick 2", volume: 0.6, start: 0, end: null, note: "Soft wooden tap" },
  { id: "quizChoicePick03", group: "quizChoicePick", variant: 3, src: "audio/se/quiz_choice_pick_01_3.mp3", label: "Choice Pick 3", volume: 0.6, start: 0, end: 1, note: "Clicky wooden tap" },
  { id: "quizChoicePick04", group: "quizChoicePick", variant: 4, src: "audio/se/quiz_choice_pick_01_4.mp3", label: "Choice Pick 4", volume: 0.6, start: 0, end: null, note: "Dull wooden tap" },
  // --- Group: quizCorrectStarChime ---
  { id: "quizCorrectStarChime01", group: "quizCorrectStarChime", variant: 1, src: "audio/se/quiz_correct_star_chime_01.mp3", label: "Correct Chime 1", volume: 0.8, start: 0, end: null, note: "Magical star sound" },
  { id: "quizCorrectStarChime02", group: "quizCorrectStarChime", variant: 2, src: "audio/se/quiz_correct_star_chime_01_2.mp3", label: "Correct Chime 2", volume: 0.8, start: 0, end: null, note: "Bright magical star" },
  { id: "quizCorrectStarChime03", group: "quizCorrectStarChime", variant: 3, src: "audio/se/quiz_correct_star_chime_01_3.mp3", label: "Correct Chime 3", volume: 0.8, start: 0, end: null, note: "Descending star sparkle" },
  { id: "quizCorrectStarChime04", group: "quizCorrectStarChime", variant: 4, src: "audio/se/quiz_correct_star_chime_01_4.mp3", label: "Correct Chime 4", volume: 0.8, start: 0, end: null, note: "Ascending star sparkle" },
  // --- Group: quizWrongSandTap ---
  { id: "quizWrongSandTap01", group: "quizWrongSandTap", variant: 1, src: "audio/se/quiz_wrong_sand_tap_01.mp3", label: "Wrong Sand 1", volume: 0.7, start: 0, end: null, note: "Dry sand spill" },
  { id: "quizWrongSandTap02", group: "quizWrongSandTap", variant: 2, src: "audio/se/quiz_wrong_sand_tap_01_2.mp3", label: "Wrong Sand 2", volume: 0.7, start: 0, end: null, note: "Soft sand spill" },
  { id: "quizWrongSandTap03", group: "quizWrongSandTap", variant: 3, src: "audio/se/quiz_wrong_sand_tap_01_3.mp3", label: "Wrong Sand 3", volume: 0.7, start: 0, end: null, note: "Heavy sand spill" },
  { id: "quizWrongSandTap04", group: "quizWrongSandTap", variant: 4, src: "audio/se/quiz_wrong_sand_tap_01_4.mp3", label: "Wrong Sand 4", volume: 0.7, start: 0, end: null, note: "Quick sand spill" },
  // --- Group: workshopDayEnd ---
  { id: "workshopDayEnd01", group: "workshopDayEnd", variant: 1, src: "audio/se/workshop_day_end_01.mp3", label: "Day End 1", volume: 0.8, start: 0, end: null, note: "Workshop closing" },
  { id: "workshopDayEnd02", group: "workshopDayEnd", variant: 2, src: "audio/se/workshop_day_end_01_2.mp3", label: "Day End 2", volume: 0.8, start: 0, end: null, note: "Workshop door close" },
  { id: "workshopDayEnd03", group: "workshopDayEnd", variant: 3, src: "audio/se/workshop_day_end_01_3.mp3", label: "Day End 3", volume: 0.8, start: 0, end: null, note: "Soft closing" },
  { id: "workshopDayEnd04", group: "workshopDayEnd", variant: 4, src: "audio/se/workshop_day_end_01_4.mp3", label: "Day End 4", volume: 0.8, start: 0, end: null, note: "Quiet closing" }
];
const clampVolume$1 = (value, fallback = 0.8) => {
  if (typeof value !== "number" && typeof value !== "string") return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
};
class SimpleAudioEngine {
  constructor() {
    this.audio = null;
    this.lastSfx = null;
    this.currentTrackId = null;
    this.isMuted = false;
    this.isUnlocked = false;
    this.bgmVolume = 0.8;
    this.seVolume = 0.8;
    this.volume = this.bgmVolume;
    this.baseUrl = "https://kawauikei.github.io/made-in-maghribal/";
    if (typeof window !== "undefined") {
      window.__madeInMaghribalAudioEngine = this;
      const unlock = () => {
        if (this.isUnlocked) return;
        this.isUnlocked = true;
        if (this.audio && this.audio.paused && !this.isMuted) {
          this.audio.play().catch(() => {
          });
        }
        ["mousedown", "keydown", "touchstart"].forEach(
          (e) => window.removeEventListener(e, unlock)
        );
      };
      ["mousedown", "keydown", "touchstart"].forEach(
        (e) => window.addEventListener(e, unlock)
      );
    }
  }
  /**
   * Play a track by its manifest data
   * @param {Object} track - Track object from tracks.js
   */
  playTrack(track) {
    if (!track || !track.src) {
      this.stop();
      return;
    }
    if (this.currentTrackId === track.id) {
      if (this.audio && this.audio.paused && this.isUnlocked && !this.isMuted) {
        this.audio.play().catch(() => {
        });
      }
      return;
    }
    this.stop();
    const fullSrc = `${this.baseUrl}${track.src}`.replace(/([^:])\/\//g, "$1/");
    try {
      this.audio = new Audio(fullSrc);
      this.audio.loop = track.loop || false;
      this.audio.volume = this.bgmVolume;
      this.audio.muted = this.isMuted;
      this.currentTrackId = track.id;
      if (!this.isUnlocked || this.isMuted) {
        return;
      }
      this.audio.play().catch((err) => {
        if (err.name === "NotAllowedError") {
          this.isUnlocked = false;
        } else {
          console.warn(`Audio playback failed for ${track.id}:`, err.message);
          this.stop();
        }
      });
    } catch (err) {
      console.error(`Failed to create Audio object for ${track.id}:`, err);
    }
  }
  /**
   * Stop the current track and cleanup
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.currentTrackId = null;
  }
  /**
   * Toggle mute state
   * @param {boolean} muted 
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (this.audio) {
      this.audio.muted = muted;
    }
  }
  /**
   * Set BGM volume (0.0 to 1.0)
   * @param {number} value 
   */
  setBgmVolume(value) {
    this.bgmVolume = clampVolume$1(value);
    this.volume = this.bgmVolume;
    if (this.audio) {
      this.audio.volume = this.bgmVolume;
    }
  }
  /**
   * Set SE volume (0.0 to 1.0)
   * @param {number} value
   */
  setSeVolume(value) {
    this.seVolume = clampVolume$1(value);
  }
  /**
   * Backward-compatible alias for callers that expect a single global volume.
   * @param {number} value
   */
  setVolume(value) {
    this.setBgmVolume(value);
    this.setSeVolume(value);
  }
  /**
   * Check if currently playing
   */
  isPlaying() {
    return !!this.audio && !this.audio.paused;
  }
  /**
   * Play an SFX candidate (used in Sound Test)
   * @param {string} candidateId 
   * @param {number} volumeScale - Optional multiplier (default 1.0)
   */
  playSfxCandidate(candidateId, volumeScale = 1) {
    if (this.isMuted) return;
    const candidate = SFX_CANDIDATES.find((c) => c.id === candidateId);
    if (!candidate) {
      console.warn(`SFX candidate not found: ${candidateId}`);
      return;
    }
    const fullSrc = `${this.baseUrl}${candidate.src}`.replace(/([^:])\/\//g, "$1/");
    try {
      const sfx = new Audio(fullSrc);
      const targetVol = (candidate.volume || 1) * this.seVolume * 1.5 * volumeScale;
      sfx.volume = Math.max(0, Math.min(1, targetVol));
      if (candidate.start) {
        sfx.currentTime = candidate.start;
      }
      if (candidate.end !== null && typeof candidate.end === "number") {
        const checkEnd = () => {
          if (sfx.currentTime >= candidate.end) {
            sfx.pause();
            sfx.removeEventListener("timeupdate", checkEnd);
          }
        };
        sfx.addEventListener("timeupdate", checkEnd);
      }
      sfx.play().catch((err) => {
        if (err.name !== "NotAllowedError") {
          console.warn(`SFX playback failed for candidate ${candidateId}:`, err.message);
        }
      });
      this.lastSfx = sfx;
    } catch (err) {
      console.error(`Failed to create SFX Audio object for candidate ${candidateId}:`, err);
    }
  }
  /**
   * Preload a track to warm up the cache
   * @param {Object} track - Track object from tracks.js
   */
  preloadTrack(track) {
    if (!track || !track.src) return;
    const fullSrc = `${this.baseUrl}${track.src}`.replace(/([^:])\/\//g, "$1/");
    try {
      const audio = new Audio(fullSrc);
      audio.preload = "auto";
    } catch (err) {
      console.warn(`Preload failed for ${track.id}:`, err);
    }
  }
  /**
   * Play a production-selected SFX by its functional key
   * @param {string} sfxKey - Key in SELECTED_SFX (e.g. "uiTapBottle")
   * @param {number} volumeScale - Optional multiplier (default 1.0)
   */
  playSfx(sfxKey, volumeScale = 1) {
    if (this.isMuted) return;
    const candidateId = SELECTED_SFX[sfxKey];
    if (!candidateId) {
      console.warn(`No production SFX selected for key: ${sfxKey}`);
      return;
    }
    this.playSfxCandidate(candidateId, volumeScale);
  }
}
const audioEngine = new SimpleAudioEngine();
const buttonStyle$2 = {
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s",
  fontFamily: "inherit",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
};
function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  const handleClose = () => {
    audioEngine.playSfx("uiTapBottle");
    onClose();
  };
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "help-modal", style: hudModalBackdrop }, /* @__PURE__ */ React.createElement("div", { style: { ...hudModalCard, maxWidth: "340px", padding: "18px 16px 14px" } }, hudCloseX(handleClose), /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 10px 0", color: THEME.nightBlue, textAlign: "center", fontSize: "1.1em", paddingRight: "30px" } }, "遊び方"), /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "help-scroll",
      className: "help-content",
      style: { flex: 1, overflowY: "auto", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "10px 4px", display: "flex", flexDirection: "column", gap: "8px" }
    },
    /* @__PURE__ */ React.createElement("p", { style: { margin: 0, color: "#444", lineHeight: 1.7, fontSize: "0.9em" } }, "・お客さんの依頼を読み、合う商品を選びます。"),
    /* @__PURE__ */ React.createElement("p", { style: { margin: 0, color: "#444", lineHeight: 1.7, fontSize: "0.9em" } }, "・正解すると工房評価と親密度が上がります。"),
    /* @__PURE__ */ React.createElement("p", { style: { margin: 0, color: "#444", lineHeight: 1.7, fontSize: "0.9em" } }, "・10回の営業を終えると、結果とエンディングに進みます（エンディングは条件により変化します）。"),
    /* @__PURE__ */ React.createElement("p", { style: { margin: 0, color: "#444", lineHeight: 1.7, fontSize: "0.9em" } }, "・親密度が上がるとイベントが発生します。"),
    /* @__PURE__ */ React.createElement("p", { style: { margin: 0, color: "#444", lineHeight: 1.7, fontSize: "0.9em" } }, "・右上のログボタン（📖）から最近の会話を確認できます。"),
    /* @__PURE__ */ React.createElement("p", { style: { margin: 0, color: "#444", lineHeight: 1.7, fontSize: "0.9em" } }, "・右上の設定ボタン（⚙️）からテキスト速度や音量を変更できます。")
  ), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "10px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "help-close",
      style: { ...buttonStyle$2, marginTop: 0, background: "#555", color: "white", width: "100%", fontSize: "0.88em" },
      onClick: handleClose
    },
    "閉じる"
  ))));
}
const logButtonStyle = {
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s",
  fontFamily: "inherit",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
};
function LogModal({ isOpen, onClose, vnBacklog, scrollRef, getFaceIcon }) {
  if (!isOpen) return null;
  const handleClose = () => {
    audioEngine.playSfx("uiTapBottle");
    onClose();
  };
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "backlog-modal", style: hudModalBackdrop }, /* @__PURE__ */ React.createElement("div", { style: { ...hudModalCard, maxWidth: "380px", padding: "16px 14px 14px", height: "85vh", display: "flex", flexDirection: "column" } }, hudCloseX(handleClose), /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 15px 0", color: THEME.nightBlue, textAlign: "center", fontSize: "1.2em", fontWeight: "bold" } }, "会話ログ"), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: scrollRef,
      "data-testid": "backlog-scroll",
      className: "log-content",
      style: {
        flex: 1,
        overflowY: "auto",
        borderTop: `2px solid ${THEME.brass}44`,
        borderBottom: `2px solid ${THEME.brass}44`,
        padding: "10px 4px",
        background: "rgba(255,255,255,0.3)"
      }
    },
    vnBacklog.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: "#777", fontSize: "0.9em", textAlign: "center", padding: "40px 0" } }, "まだログはありません") : vnBacklog.slice().reverse().map((entry, idx) => {
      var _a;
      const isNarration = !entry.speaker || entry.speaker === "ナーディル" && !entry.speakerId;
      const speakerId = entry.speakerId || (entry.speaker === "ナーディル" ? "nader" : null);
      const facePath = speakerId && getFaceIcon ? getFaceIcon(speakerId, "face", entry.expression || "normal") : null;
      const displayText = typeof entry.text === "string" ? entry.text : ((_a = entry.text) == null ? void 0 : _a.text) || "";
      if (!displayText) return null;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          "data-testid": "backlog-entry",
          key: `${entry.sequence}-${idx}`,
          style: {
            display: "flex",
            gap: "12px",
            padding: "12px 8px",
            borderBottom: `1px solid ${THEME.brass}22`,
            textAlign: "left",
            alignItems: "flex-start"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, width: "48px", height: "48px" } }, facePath ? /* @__PURE__ */ React.createElement("div", { style: {
          width: "48px",
          height: "48px",
          borderRadius: "8px",
          overflow: "hidden",
          border: `1px solid ${THEME.brass}88`,
          background: "#0c1926"
        } }, /* @__PURE__ */ React.createElement("img", { src: facePath, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } })) : /* @__PURE__ */ React.createElement("div", { style: {
          width: "48px",
          height: "48px",
          borderRadius: "8px",
          background: isNarration ? "transparent" : `${THEME.brass}22`,
          border: isNarration ? "none" : `1px solid ${THEME.brass}44`
        } })),
        /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, !isNarration && /* @__PURE__ */ React.createElement("div", { style: {
          fontSize: "0.75em",
          fontWeight: "900",
          color: THEME.brassDark,
          marginBottom: "4px",
          letterSpacing: "0.05em"
        } }, entry.speaker), /* @__PURE__ */ React.createElement("div", { style: {
          fontSize: "0.88em",
          color: isNarration ? "#666" : "#222",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontStyle: isNarration ? "italic" : "normal"
        } }, displayText))
      );
    })
  ), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "12px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "backlog-close",
      style: {
        ...logButtonStyle,
        background: THEME.nightBlue,
        color: "white",
        width: "100%",
        fontSize: "0.9em",
        border: `1px solid ${THEME.brass}`
      },
      onClick: handleClose
    },
    "閉じる"
  ))));
}
const buttonStyle$1 = {
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s",
  fontFamily: "inherit",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
};
function OptionsModal({
  isOpen,
  onClose,
  onReturnTitle,
  isAudioEnabled,
  setIsAudioEnabled,
  seVolume,
  setSeVolume,
  bgmVolume,
  setBgmVolume,
  textSpeed,
  setTextSpeed,
  instantUnreadText,
  setInstantUnreadText,
  defaultAudioVolume,
  textSpeedMeta
}) {
  if (!isOpen) return null;
  const closeOptions = () => {
    audioEngine.playSfx("uiTapBottle");
    onClose();
  };
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "options-modal", style: hudModalBackdrop }, /* @__PURE__ */ React.createElement("div", { style: { ...hudModalCard, maxWidth: "340px", padding: "20px 18px" } }, hudCloseX(closeOptions), /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 14px 0", color: THEME.nightBlue, textAlign: "center", fontSize: "1.3em", paddingRight: "30px" } }, "設定"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#f5f5f5", borderRadius: "10px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.9em", fontWeight: "bold", color: THEME.textDark } }, "BGM"), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "audio-enabled-toggle",
      "aria-pressed": isAudioEnabled,
      onClick: () => {
        audioEngine.playSfx("uiTapBottle");
        setIsAudioEnabled(!isAudioEnabled);
      },
      style: {
        background: isAudioEnabled ? THEME.starGold : "#aaa",
        color: isAudioEnabled ? THEME.textDark : "#fff",
        border: "none",
        padding: "5px 12px",
        borderRadius: "16px",
        fontSize: "0.82em",
        fontWeight: "bold",
        cursor: "pointer"
      }
    },
    isAudioEnabled ? "ON" : "OFF"
  )), /* @__PURE__ */ React.createElement("div", { style: { background: "#f5f5f5", borderRadius: "10px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.9em", fontWeight: "bold", color: THEME.textDark } }, "SE"), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "se-enabled-toggle",
      "aria-pressed": seVolume > 0,
      onClick: () => {
        audioEngine.playSfx("uiTapBottle");
        setSeVolume((prev) => prev > 0 ? 0 : defaultAudioVolume);
      },
      style: {
        background: seVolume > 0 ? THEME.starGold : "#aaa",
        color: seVolume > 0 ? THEME.textDark : "#fff",
        border: "none",
        padding: "5px 12px",
        borderRadius: "16px",
        fontSize: "0.82em",
        fontWeight: "bold",
        cursor: "pointer"
      }
    },
    seVolume > 0 ? "ON" : "OFF"
  ))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 0", borderBottom: "1px solid #eee" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85em", color: THEME.textDark, fontWeight: "bold", marginBottom: "6px" } }, "BGM音量"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      "data-testid": "bgm-volume-slider",
      "aria-label": "BGM音量",
      type: "range",
      min: "0",
      max: "100",
      step: "1",
      value: Math.round(bgmVolume * 100),
      onChange: (e) => setBgmVolume(Number(e.target.value) / 100),
      style: { flex: 1, minWidth: 0 }
    }
  ), /* @__PURE__ */ React.createElement("span", { style: { width: "44px", textAlign: "right", fontSize: "0.82em", color: THEME.textDark, fontWeight: "bold" } }, Math.round(bgmVolume * 100), "%"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 0", borderBottom: "1px solid #eee" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85em", color: THEME.textDark, fontWeight: "bold", marginBottom: "6px" } }, "SE音量"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      "data-testid": "se-volume-slider",
      "aria-label": "SE音量",
      type: "range",
      min: "0",
      max: "100",
      step: "1",
      value: Math.round(seVolume * 100),
      onChange: (e) => setSeVolume(Number(e.target.value) / 100),
      style: { flex: 1, minWidth: 0 }
    }
  ), /* @__PURE__ */ React.createElement("span", { style: { width: "44px", textAlign: "right", fontSize: "0.82em", color: THEME.textDark, fontWeight: "bold" } }, Math.round(seVolume * 100), "%"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 0", borderBottom: "1px solid #eee" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85em", color: THEME.textDark, fontWeight: "bold", marginBottom: "6px" } }, "テキスト速度"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "6px" } }, Object.entries(textSpeedMeta).map(([mode, meta]) => {
    const isSelected = textSpeed === mode;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: mode,
        "data-testid": `text-speed-${mode}`,
        "aria-pressed": isSelected,
        onClick: () => {
          audioEngine.playSfx("uiTapBottle");
          setTextSpeed(mode);
        },
        style: {
          ...buttonStyle$1,
          margin: 0,
          padding: "8px 6px",
          fontSize: "0.74em",
          lineHeight: 1.2,
          background: isSelected ? THEME.starGold : "#eef1f4",
          color: isSelected ? THEME.textDark : "#445",
          border: `1px solid ${isSelected ? THEME.starGold : "#ccd6dd"}`,
          boxShadow: isSelected ? "0 0 0 2px rgba(255,204,0,0.16)" : "none"
        }
      },
      meta.label
    );
  }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85em", color: THEME.textDark, fontWeight: "bold" } }, "既読表示"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.72em", color: "#777", marginTop: "2px" } }, "未読テキストをすぐ表示")), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "instant-unread-toggle",
      "aria-pressed": instantUnreadText,
      onClick: () => {
        audioEngine.playSfx("uiTapBottle");
        setInstantUnreadText((prev) => !prev);
      },
      style: {
        background: instantUnreadText ? THEME.starGold : "#999",
        color: instantUnreadText ? THEME.textDark : "#fff",
        border: "none",
        padding: "6px 14px",
        borderRadius: "16px",
        fontSize: "0.82em",
        fontWeight: "bold",
        cursor: "pointer",
        flexShrink: 0
      }
    },
    instantUnreadText ? "ON" : "OFF"
  ))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { ...buttonStyle$1, marginTop: 0, background: "#ff5555", color: "white", width: "100%", fontSize: "0.9em" },
      onClick: () => {
        audioEngine.playSfx("uiTapBottle");
        if (window.confirm("タイトルに戻りますか？")) {
          onReturnTitle == null ? void 0 : onReturnTitle();
        }
      }
    },
    "タイトルへ戻る"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "options-close",
      style: { ...buttonStyle$1, marginTop: 0, background: "#555", color: "white", width: "100%", fontSize: "0.9em" },
      onClick: closeOptions
    },
    "閉じる"
  ))));
}
const ROUTE_MODE_META = {
  normal: {
    label: "現在の縁",
    description: "はじめて出会う、現在から育つ縁"
  },
  long_history: {
    label: "過去の縁",
    description: "通常ルートとは別の関係性で始まる、過去から続く縁"
  }
};
const getRouteModeMeta = (routeMode) => ROUTE_MODE_META[routeMode] || ROUTE_MODE_META.normal;
const renderRouteModeBadge = (routeMode, compact = false) => {
  const meta = getRouteModeMeta(routeMode);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "route-mode-badge",
      "data-route-mode": routeMode,
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: compact ? "5px 8px" : "6px 10px",
        borderRadius: "999px",
        border: `1px solid \${THEME.brass}`,
        background: "rgba(255,255,255,0.9)",
        color: THEME.nightBlue,
        fontSize: compact ? "0.7em" : "0.78em",
        fontWeight: "bold",
        lineHeight: 1,
        textAlign: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        maxWidth: "100%",
        whiteSpace: "nowrap"
      }
    },
    meta.label
  );
};
const GameHud = ({
  screen,
  routeMode,
  onOpenLog,
  onOpenOptions,
  onOpenHelp
}) => {
  const isHudVisible = !["ENDING", "FINAL_RESULT", "VISUAL_TEST", "SOUND_TEST"].includes(screen);
  if (!isHudVisible) return null;
  const isLongHistory = routeMode === "long_history";
  const hudBtnStyle = {
    background: isLongHistory ? "rgba(255, 220, 235, 0.96)" : "rgba(255, 255, 255, 0.92)",
    border: `2px solid ${THEME.brass}`,
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
    padding: 0,
    flexShrink: 0
  };
  return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "8px", right: "8px", zIndex: 1e3, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "6px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "backlog-hud-open",
      onClick: () => {
        audioEngine.playSfx("uiTapBottle");
        onOpenLog();
      },
      style: hudBtnStyle,
      "aria-label": "ログ"
    },
    "📖"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "options-open",
      onClick: () => {
        audioEngine.playSfx("uiTapBottle");
        onOpenOptions();
      },
      style: hudBtnStyle,
      "aria-label": "設定"
    },
    "⚙️"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "help-hud-open",
      onClick: () => {
        audioEngine.playSfx("uiTapBottle");
        onOpenHelp();
      },
      style: hudBtnStyle,
      "aria-label": "ヘルプ"
    },
    "？"
  )));
};
const shouldIgnoreVnAdvanceClick = (e, { showOptions, showLog, showHelp, showSoundTest }) => {
  if (showOptions || showLog || showHelp || showSoundTest) return true;
  const target = e.target;
  if (target.closest("button, a, input, select, textarea, [data-no-vn-advance]")) {
    return true;
  }
  return false;
};
const safeAdvanceVnBox = (vnRef) => {
  if (vnRef && vnRef.current && typeof vnRef.current.advance === "function") {
    vnRef.current.advance();
  }
};
const shouldSkipTypewriter = (isInstantTextSpeed, isSeen = false) => {
  return isInstantTextSpeed || isSeen;
};
const BACKGROUND_IMAGES = {
  shopExteriorDay: { id: "shopExteriorDay", label: "shop exterior day", src: "images/background/bg_shop_exterior_day.jpeg" },
  shopExteriorNight: { id: "shopExteriorNight", label: "shop exterior night", src: "images/background/bg_shop_exterior_night.jpeg" },
  shopInteriorService: { id: "shopInteriorService", label: "shop interior service", src: "images/background/bg_shop_interior_service.jpeg" },
  marketCentral: { id: "marketCentral", label: "market central", src: "images/background/bg_market_central.jpeg" },
  palaceCorridor: { id: "palaceCorridor", label: "palace corridor", src: "images/background/bg_palace_corridor.jpeg" },
  palaceLab: { id: "palaceLab", label: "palace lab", src: "images/background/bg_palace_lab.jpeg" },
  spotFountain: { id: "spotFountain", label: "spot fountain", src: "images/background/bg_spot_fountain.jpeg" },
  spotFestivalStreet: { id: "spotFestivalStreet", label: "spot festival street", src: "images/background/bg_spot_festival_street.jpeg" },
  spotPortView: { id: "spotPortView", label: "spot port view", src: "images/background/bg_spot_port_view.jpeg" },
  spotOasisView: { id: "spotOasisView", label: "spot oasis view", src: "images/background/bg_spot_oasis_view.jpeg" },
  spotRuins: { id: "spotRuins", label: "spot ruins", src: "images/background/bg_spot_ruins.jpeg" },
  spotStarView: { id: "spotStarView", label: "spot star view", src: "images/background/bg_spot_star_view.jpeg" }
};
const STILL_IMAGES = {
  hakimaMorningVisit01: { id: "hakimaMorningVisit01", title: "朝の来訪", label: "朝の来訪", heroineId: "hakima", src: "images/still/still_hakima_morning_visit_01.jpeg", focusX: 0.5, focusY: 0.4, stillCrop: { objectPosition: "50% 35%", objectFit: "cover" } },
  hakimaFestivalNight01: { id: "hakimaFestivalNight01", title: "祭りの夜", label: "祭りの夜", heroineId: "hakima", src: "images/still/still_hakima_festival_night_01.jpeg", focusX: 0.5, focusY: 0.5 },
  hakimaMarketArgument01: { id: "hakimaMarketArgument01", title: "市場の小競り合い", label: "市場の小競り合い", heroineId: "hakima", src: "images/still/still_hakima_market_argument_01.jpeg", focusX: 0.5, focusY: 0.5, stillCrop: { mode: "heroine_pan", objectFit: "cover", startPosition: "50% 45%", endPosition: "68% 38%", durationMs: 1200 } },
  hakimaRainShelter01: { id: "hakimaRainShelter01", title: "雨宿り", label: "雨宿り", heroineId: "hakima", src: "images/still/still_hakima_rain_shelter_01.jpeg", focusX: 0.5, focusY: 0.5 },
  miraAfterSchool01: { id: "miraAfterSchool01", title: "放課後", label: "放課後", heroineId: "mira", src: "images/still/still_mira_after_school_01.jpeg", focusX: 0.5, focusY: 0.45, stillCrop: { objectPosition: "50% 40%", objectFit: "cover" } },
  miraAssignmentConsult01: { id: "miraAssignmentConsult01", title: "課題相談", label: "課題相談", heroineId: "mira", src: "images/still/still_mira_assignment_consult_01.jpeg", focusX: 0.5, focusY: 0.5 },
  miraStarryRooftop01: { id: "miraStarryRooftop01", title: "星見の屋上", label: "星見の屋上", heroineId: "mira", src: "images/still/still_mira_starry_rooftop_01.jpeg", focusX: 0.5, focusY: 0.5 },
  miraVisitSick01: { id: "miraVisitSick01", title: "見舞い", label: "見舞い", heroineId: "mira", src: "images/still/still_mira_visit_sick_01.jpeg", focusX: 0.5, focusY: 0.5 },
  dariyaAfterHours01: { id: "dariyaAfterHours01", title: "夜更けの訪問", label: "夜更けの訪問", heroineId: "dariya", src: "images/still/still_dariya_after_hours_01.jpeg", focusX: 0.5, focusY: 0.4 },
  dariyaLimitNight01: { id: "dariyaLimitNight01", title: "限界の夜", label: "限界の夜", heroineId: "dariya", src: "images/still/still_dariya_limit_night_01.jpeg", focusX: 0.5, focusY: 0.5 },
  dariyaPalaceCollaboration01: { id: "dariyaPalaceCollaboration01", title: "王宮との協力", label: "王宮との協力", heroineId: "dariya", src: "images/still/still_dariya_palace_collaboration_01.jpeg", focusX: 0.5, focusY: 0.5 },
  dariyaRainCorridor01: { id: "dariyaRainCorridor01", title: "雨の回廊", label: "雨の回廊", heroineId: "dariya", src: "images/still/still_dariya_rain_corridor_01.jpeg", focusX: 0.5, focusY: 0.5 }
};
const VisualTestScreen = ({
  visualTestMode,
  setVisualTestMode,
  bgTestIndex,
  setBgTestIndex,
  stillTestIndex,
  setStillTestIndex,
  handleBackToTitle,
  getFullPath,
  getFileName,
  renderThemeStyles
}) => {
  const bgList = Object.values(BACKGROUND_IMAGES);
  const stillList = Object.values(STILL_IMAGES);
  const bg = bgList[bgTestIndex % bgList.length];
  const still = stillList[stillTestIndex % stillList.length];
  const containerStyle2 = {
    width: "100%",
    height: "100%",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    position: "relative",
    boxSizing: "border-box"
  };
  const utilityBackButtonStyle = {
    padding: "8px 16px",
    background: "#333",
    color: THEME.sand,
    border: `1px solid ${THEME.brass}`,
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9em",
    fontWeight: "bold",
    margin: "10px 0",
    alignSelf: "flex-start"
  };
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "visual-test-screen", style: { ...containerStyle2, padding: "0 0 20px 0" } }, renderThemeStyles && renderThemeStyles(), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", padding: "10px 16px", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", gap: "12px", zIndex: 100 } }, /* @__PURE__ */ React.createElement("button", { "data-testid": "visual-test-back", onClick: handleBackToTitle, style: { ...utilityBackButtonStyle, margin: 0, fontSize: "0.8em", padding: "6px 12px" } }, "TITLE"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, color: THEME.sand, fontWeight: "bold", fontSize: "0.9em" } }, "映像確認 Asset Test"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "4px" } }, /* @__PURE__ */ React.createElement("button", { "data-testid": "visual-test-tab-bg", onClick: () => setVisualTestMode("background"), style: { ...utilityBackButtonStyle, margin: 0, background: visualTestMode === "background" ? THEME.brass : "#333", color: visualTestMode === "background" ? THEME.textDark : "#aaa", fontSize: "0.75em", padding: "4px 8px" } }, "BG"), /* @__PURE__ */ React.createElement("button", { "data-testid": "visual-test-tab-still", onClick: () => setVisualTestMode("still"), style: { ...utilityBackButtonStyle, margin: 0, background: visualTestMode === "still" ? THEME.brass : "#333", color: visualTestMode === "still" ? THEME.textDark : "#aaa", fontSize: "0.75em", padding: "4px 8px" } }, "STILL"))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, width: "100%", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px" } }, visualTestMode === "background" ? /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: "800px" } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "15px", textAlign: "left", minHeight: "46px" }, className: "selectable-text" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "1.1em", fontWeight: "bold", color: THEME.brass, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, bg.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.75em", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }, title: bg.src }, "ID: ", bg.id, " | Path: ", getFileName(bg.src))), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: "330px", maxHeight: "440px", aspectRatio: "3/4", background: "#000", borderRadius: "8px", overflow: "hidden", border: `1px solid ${THEME.brass}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" } }, /* @__PURE__ */ React.createElement(
    "img",
    {
      key: bg.id,
      src: getFullPath(bg.src),
      alt: bg.label,
      style: { width: "100%", height: "100%", objectFit: "contain" },
      draggable: false,
      onError: (e) => {
        e.target.style.display = "none";
        e.target.parentNode.innerHTML = '<span style="color:#f44">Background Load Failed</span>';
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: "800px", height: "140px", overflowX: "auto", overflowY: "hidden", padding: "8px 0", scrollbarWidth: "thin" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px", width: "max-content" } }, bgList.map((item, idx) => /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "visual-test-thumbnail",
      key: item.id,
      onClick: () => setBgTestIndex(idx),
      style: {
        width: "84px",
        height: "112px",
        borderRadius: "8px",
        overflow: "hidden",
        border: `2px solid ${idx === bgTestIndex % bgList.length ? THEME.brass : "#333"}`,
        cursor: "pointer",
        boxShadow: idx === bgTestIndex % bgList.length ? `0 0 0 2px ${THEME.brass}44, 0 0 18px ${THEME.brass}55` : "none"
      }
    },
    /* @__PURE__ */ React.createElement("img", { src: getFullPath(item.src), alt: item.label, style: { width: "100%", height: "100%", objectFit: "cover" }, draggable: false })
  ))))) : /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: "800px" } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "15px", textAlign: "left", minHeight: "46px" }, className: "selectable-text" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "1.1em", fontWeight: "bold", color: THEME.brass, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, still.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.75em", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }, title: `${still.id} | ${still.src} | focus ${still.focusX}, ${still.focusY}` }, "ID: ", still.id, " | Path: ", getFileName(still.src), " | Focus: ", still.focusX, ", ", still.focusY)), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: "330px", maxHeight: "440px", aspectRatio: "3/4", background: "#000", borderRadius: "8px", overflow: "hidden", border: `1px solid ${THEME.brass}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" } }, /* @__PURE__ */ React.createElement(
    "img",
    {
      key: still.id,
      src: getFullPath(still.src),
      alt: still.label,
      style: { width: "100%", height: "100%", objectFit: "contain" },
      draggable: false,
      onError: (e) => {
        e.target.style.display = "none";
        e.target.parentNode.innerHTML = '<span style="color:#f44">Still Load Failed</span>';
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: "800px", height: "140px", overflowX: "auto", overflowY: "hidden", padding: "8px 0", scrollbarWidth: "thin" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px", width: "max-content" } }, stillList.map((item, idx) => /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "visual-test-thumbnail",
      key: item.id,
      onClick: () => setStillTestIndex(idx),
      style: {
        width: "84px",
        height: "112px",
        borderRadius: "8px",
        overflow: "hidden",
        border: `2px solid ${idx === stillTestIndex % stillList.length ? THEME.brass : "#333"}`,
        cursor: "pointer",
        boxShadow: idx === stillTestIndex % stillList.length ? `0 0 0 2px ${THEME.brass}44, 0 0 18px ${THEME.brass}55` : "none"
      }
    },
    /* @__PURE__ */ React.createElement("img", { src: getFullPath(item.src), alt: item.label, style: { width: "100%", height: "100%", objectFit: "cover" }, draggable: false })
  )))))));
};
const MemoriesScreen = ({
  screen,
  routeMode,
  seenEventIds,
  heroines,
  affectionEvents,
  onBackToTitle,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  onRecallEvent,
  renderThemeStyles,
  renderUtilityHeader,
  unlockAll = false
}) => {
  const allEvents = Object.values(affectionEvents).flat();
  const seenEvents = unlockAll ? allEvents : allEvents.filter((e) => seenEventIds.includes(e.id));
  const memoriesContainerStyle = {
    width: "100%",
    height: "100%",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    position: "relative",
    boxSizing: "border-box"
  };
  const memoriesTitleStyle = {
    color: "#e2d1b1",
    fontSize: "1.4em",
    margin: "0 0 12px 0",
    textAlign: "center",
    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
    fontWeight: "bold"
  };
  const memoriesCardStyle = {
    width: "calc(100% - 16px)",
    maxWidth: "800px",
    padding: "12px",
    border: `1px solid ${THEME.brass}`,
    borderRadius: "8px",
    background: THEME.parchment,
    color: THEME.textDark,
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    position: "relative",
    boxSizing: "border-box",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    margin: "0 8px 8px",
    overflow: "hidden"
  };
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "memories-screen", style: memoriesContainerStyle }, renderThemeStyles && renderThemeStyles(), /* @__PURE__ */ React.createElement(
    GameHud,
    {
      screen,
      routeMode,
      onOpenLog,
      onOpenOptions,
      onOpenHelp
    }
  ), renderUtilityHeader && renderUtilityHeader("Memories", onBackToTitle, null, "memories"), /* @__PURE__ */ React.createElement("h1", { style: { ...memoriesTitleStyle, display: "none" } }, "思い出の記録"), unlockAll && /* @__PURE__ */ React.createElement("div", { style: {
    background: THEME.starGold,
    color: "#000",
    padding: "4px 10px",
    fontSize: "0.7em",
    fontWeight: "bold",
    borderRadius: "4px",
    marginBottom: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  } }, "DEBUG: UNLOCK ALL MODE ACTIVE"), /* @__PURE__ */ React.createElement("div", { style: memoriesCardStyle }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "2px" } }, seenEvents.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "60px 20px", color: "#666", fontStyle: "italic", textAlign: "center" } }, /* @__PURE__ */ React.createElement("p", null, "まだ見返したい記憶はありません。"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "0.9em", marginTop: "10px" } }, "営業を進めると、ここに記憶が積み上がっていきます。")) : /* @__PURE__ */ React.createElement("div", { style: { textAlign: "left" } }, heroines.map((heroine) => {
    const heroineSeenEvents = seenEvents.filter((e) => e.heroineId === heroine.id);
    if (heroineSeenEvents.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: heroine.id, style: { marginBottom: "30px" } }, /* @__PURE__ */ React.createElement("div", { style: {
      color: heroine.themeColor,
      fontWeight: "bold",
      borderBottom: `2px solid ${heroine.themeColor}`,
      paddingBottom: "5px",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "1.1em"
    } }, /* @__PURE__ */ React.createElement("div", { style: { width: "8px", height: "8px", borderRadius: "50%", background: heroine.themeColor } }), heroine.name, "との思い出"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" } }, heroineSeenEvents.map((event) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: event.id,
        className: "memory-item",
        onClick: () => onRecallEvent && onRecallEvent(event),
        style: {
          background: "rgba(0,0,0,0.03)",
          padding: "12px 15px",
          borderRadius: "0 4px 4px 0",
          border: "1px solid rgba(0,0,0,0.05)",
          borderLeft: `4px solid ${heroine.themeColor}`,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "bold" } }, event.title),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.8em", color: THEME.brassDark } }, "詳細を見る")
    ))));
  })))));
};
const SHOP = {
  name: "星瓶堂",
  localName: "ダール・アル＝カワーキブ"
};
const PROTAGONIST = {
  id: "nader",
  name: "ナーディル・アル＝カーミル",
  shortName: "ナーディル",
  age: 20,
  role: "若き錬金術師 / 星瓶堂店主",
  background: "錬金大学を飛び級で卒業。実家の星瓶堂を継いだばかり。",
  personality: "穏やかで人当たりがよいが、根は真面目。",
  goal: "自分の力で工房を一人前にすること",
  themeColor: "#c5a059",
  visualConfig: {
    facePosition: "center 20%",
    standingScale: 1
  }
};
const StartScreen = ({
  screen,
  routeMode,
  setRouteMode,
  hasSave,
  onContinue,
  onNewGame,
  onOpenMemories,
  onOpenOptions,
  onOpenSoundTest,
  onOpenVisualTest,
  onClearSaveData,
  onOpenLog,
  onOpenHelp,
  renderThemeStyles,
  debugModeEnabled,
  onToggleDebug
}) => {
  const [logoTaps, setLogoTaps] = React.useState(0);
  const logoTapTimer = React.useRef(null);
  const handleLogoTap = () => {
    setLogoTaps((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        onToggleDebug();
        audioEngine.playSfx("uiConfirmChime");
        return 0;
      }
      return next;
    });
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => setLogoTaps(0), 1e3);
  };
  const containerStyle2 = {
    width: "100%",
    height: "100%",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    position: "relative",
    boxSizing: "border-box",
    backgroundImage: `linear-gradient(rgba(26, 42, 58, 0.4), rgba(26, 42, 58, 0.4)), url(${"https://kawauikei.github.io/made-in-maghribal/"}images/ui/title.png)`.replace(/([^:])\/\//g, "$1/"),
    backgroundSize: "cover",
    backgroundPosition: "center"
  };
  const titleStyle2 = {
    fontFamily: "'Playfair Display', serif",
    color: THEME.starGold,
    textShadow: `0 2px 10px ${THEME.nightBlue}`,
    letterSpacing: "0.05em"
  };
  const cardStyle2 = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "24px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    border: `1px solid ${THEME.brass}`,
    boxSizing: "border-box"
  };
  const buttonStyle2 = {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1em",
    fontWeight: "bold",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    margin: "10px 0",
    fontFamily: "inherit"
  };
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "start-screen", style: containerStyle2 }, renderThemeStyles && renderThemeStyles(), /* @__PURE__ */ React.createElement(
    GameHud,
    {
      screen,
      routeMode,
      onOpenLog,
      onOpenOptions,
      onOpenHelp
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: "20px", position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement(
    "h1",
    {
      onClick: handleLogoTap,
      style: { ...titleStyle2, fontSize: "2.2em", margin: "0 0 5px 0", cursor: "pointer", userSelect: "none" }
    },
    SHOP.name,
    debugModeEnabled && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "10px", color: THEME.starGold, verticalAlign: "middle", marginLeft: "5px" } }, "[DEBUG]")
  ), /* @__PURE__ */ React.createElement("div", { style: { color: THEME.sand, fontSize: "0.9em", letterSpacing: "0.1em", opacity: 0.8 } }, "— ", SHOP.localName, " —")), /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle2, background: "transparent", border: "none", boxShadow: "none", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", padding: "0" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: "260px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "stretch" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.76em", color: THEME.sand, opacity: 0.85, textAlign: "center" } }, "縁のかたち"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", width: "100%" } }, Object.entries(ROUTE_MODE_META).map(([mode, meta]) => {
    const isSelected = routeMode === mode;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: mode,
        "data-testid": `route-mode-${mode}`,
        "aria-pressed": isSelected,
        onClick: () => {
          audioEngine.playSfx("uiTapBottle");
          setRouteMode(mode);
        },
        style: {
          ...buttonStyle2,
          flex: 1,
          margin: 0,
          padding: "10px 8px",
          fontSize: "0.74em",
          lineHeight: 1.2,
          background: isSelected ? THEME.starGold : "#2c3e50",
          color: isSelected ? THEME.textDark : THEME.sand,
          border: `1px solid ${isSelected ? THEME.starGold : THEME.brassDark}`,
          boxShadow: isSelected ? "0 0 0 2px rgba(255, 204, 0, 0.2)" : "none"
        }
      },
      meta.label
    );
  })), /* @__PURE__ */ React.createElement("div", { "data-testid": "route-mode-description", style: { fontSize: "0.7em", color: THEME.parchment, opacity: 0.7, textAlign: "center", marginTop: "2px", fontStyle: "italic" } }, getRouteModeMeta(routeMode).description), /* @__PURE__ */ React.createElement("div", { "data-testid": "route-mode-current", style: { display: "flex", justifyContent: "center" } }, renderRouteModeBadge(routeMode)), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "start-new",
      onClick: onNewGame,
      style: { ...buttonStyle2, background: THEME.nightBlue, color: THEME.sand, width: "100%", maxWidth: "260px", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }
    },
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.2em" } }, "☆"),
    " 星瓶堂を開く"
  )), hasSave && /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "start-continue",
      onClick: onContinue,
      style: { ...buttonStyle2, background: THEME.starGold, width: "100%", maxWidth: "260px", margin: 0 }
    },
    "つづきから"
  ), /* @__PURE__ */ React.createElement("button", { "data-testid": "memories-open", onClick: onOpenMemories, style: { ...buttonStyle2, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: "100%", maxWidth: "260px", margin: 0 } }, "思い出の記録"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", width: "100%", maxWidth: "260px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "start-options",
      onClick: onOpenOptions,
      style: { ...buttonStyle2, background: THEME.brass, color: THEME.textDark, fontSize: "0.85em", flex: 1, margin: 0 }
    },
    "設定"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "sound-test-open",
      onClick: onOpenSoundTest,
      style: { ...buttonStyle2, background: "#333", color: "#fff", fontSize: "0.85em", flex: 1, margin: 0 }
    },
    "音設定"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "visual-test-open",
      onClick: onOpenVisualTest,
      style: { ...buttonStyle2, background: "#333", color: "#fff", fontSize: "0.85em", flex: 1, margin: 0 }
    },
    "映像確認"
  )), hasSave && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClearSaveData,
      style: {
        background: "none",
        border: "none",
        color: "#844",
        textDecoration: "underline",
        cursor: "pointer",
        fontSize: "0.75em",
        marginTop: "10px",
        opacity: 0.6
      }
    },
    "記録を全て削除する"
  )));
};
const HEROINES = [
  {
    id: "hakima",
    fullName: "ハキマアル＝ルハーン",
    name: "ハキマ",
    role: "品質鑑定見習い / 知己",
    age: 19,
    themeColor: "#ffcc00",
    themeTrackId: "HAKIMA-01",
    visualConfig: {
      facePosition: "center 20%",
      standingScale: 1
    },
    description: "アル＝ルハーン香材商会で素材を見分ける仕事に携わる少女。香りや色、手触りの違いを見抜く観察眼があり、星瓶堂でも頼れる協力者になる。",
    routeDescription: "かつてナーディルと共に学んだ、香材商会の若き主。今は離れた場所にいるが、ある品を探して星瓶堂の扉を叩くことになる。",
    personality: "ツンデレで負けず嫌い。怒っているようで実は相手を心配している世話焼きな性格。",
    relationship: "通常ルートでは、同業・商会関係の顔見知り程度。星瓶堂を支える流れの中で、協力者として距離を縮めていく。",
    routeRelationship: "過去から続く縁。かつて交わした約束を胸に、再び協力者として歩み寄る関係。",
    stats: {
      precision: 80,
      knowledge: 70,
      social: 90
    },
    routeTheme: "現在から育つ縁の象徴としての顔見知り関係",
    musicMood: "軽やかで少し照れくさい旋律",
    greeting: "来たわよ、ナーディル。今日も星瓶堂らしい目利き、見せてもらうから。",
    assets: { standing: {}, face: {} }
  },
  {
    id: "mira",
    fullName: "ミラサフワーン",
    name: "ミラ",
    role: "錬金大学の後輩 / 協力者",
    age: 16,
    themeColor: "#3d5afe",
    themeTrackId: "MIRA-01",
    visualConfig: {
      facePosition: "center 15%",
      standingScale: 0.95
    },
    description: "錬金大学で学ぶ少女。知識の吸収が早く、星瓶堂では新しい発想を持ち込んでくれる。",
    personality: "礼儀正しく賢い。子供扱いされるのを嫌い、一人前として見られたいと思っている。",
    relationship: "課題の相談や素材の購入、試作品の確認などを通じて距離を縮める協力者。",
    stats: {
      precision: 95,
      knowledge: 85,
      social: 60
    },
    routeTheme: "知識と好奇心がつなぐ協力関係",
    musicMood: "知性的で透明感のある旋律",
    greeting: "こんにちは、先輩。今日は課題の材料について、少し相談させてください。",
    assets: { standing: {}, face: {} }
  },
  {
    id: "dariya",
    fullName: "ダリヤザフラーン",
    name: "ダリヤ",
    role: "王宮錬金局のエリート / 協力者",
    age: 23,
    themeColor: "#f44336",
    themeTrackId: "DARIYA-01",
    visualConfig: {
      facePosition: "center 25%",
      standingScale: 1.05
    },
    description: "王宮錬金局の要職にある女性。強く見える一方で、内面には疲れも抱えている。",
    personality: "クールで皮肉屋だが、内面は重圧に疲れている。心を許した相手には弱さを見せることもある。",
    relationship: "公務の合間に星瓶堂へ顔を出す協力者。落ち着いた大人の距離感を持つ。",
    greeting: "邪魔するよ、ナーディル。王宮の検証品について、少し見立てを借りたい。",
    stats: {
      precision: 90,
      knowledge: 95,
      social: 75
    },
    routeTheme: "立場の強さと本音の揺れが交わる関係",
    musicMood: "静かな緊張感を帯びた旋律",
    assets: { standing: {}, face: {} }
  }
];
function getHeroineAsset(heroineId, type, expression = "normal") {
  const subDir = type === "face" ? "face_proc" : "standing_proc";
  return `characters/${heroineId}/${subDir}/${expression}.png`;
}
const AFFECTION_EVENTS = {
  hakima: [
    {
      id: "hakima_0",
      heroineId: "hakima",
      threshold: 0,
      kind: "flashback_intro",
      // route intro / flashback
      title: "牙と天秤の出会い",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "HAKIMA-01"
      },
      summary: "開店前、ハキマとの出会いを思い出す。市場での香材を巡る小競り合いが、すべての始まりだった。",
      pages: [
        {
          speaker: "ナーディル",
          expression: "normal",
          text: "今日はハキマが来る日か。……あいつと初めて会ったのも、こんな風に風が強い日だったな。",
          backgroundId: "shopExteriorDay"
        },
        {
          speaker: "ハキマ",
          expression: "anger",
          text: "「ちょっと、そこのあんた！ その樹脂、乾かし方が甘いわ。そんなの売るつもり？」\n市場の隅で、見知らぬキツネ族の少女にいきなり怒鳴られたんだ。",
          backgroundId: "marketCentral"
        },
        {
          speaker: "ナーディル",
          expression: "surprise",
          text: "「え……？ ああ、確かに少し湿っているな。助かるよ」\n俺が素直に礼を言うと、彼女は拍子抜けしたような顔をしていた。",
          backgroundId: "marketCentral"
        },
        {
          speaker: "ハキマ",
          expression: "normal",
          text: "「……ふん、素直なだけが取り柄ね。星瓶堂の跡取りなら、もっと鼻を鍛えなさいよ」\nそれが、俺と彼女の「ライバル」としての始まりだった。",
          backgroundId: "marketCentral"
        },
        {
          speaker: "ナーディル",
          expression: "joy",
          text: "今じゃ、欠かせない協力者の一人だ。……よし、開店の準備をしよう。",
          backgroundId: "shopExteriorDay"
        }
      ]
    },
    {
      id: "hakima_5",
      heroineId: "hakima",
      threshold: 5,
      title: "もう一度、隣に",
      stillImageId: "hakimaMorningVisit01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01",
        heroineExpressions: ["anger", "normal", "sorrow", "joy"],
        naderExpressions: ["normal", "sorrow"]
      },
      summary: "昔のライバル関係を思い出しながら、ハキマはナーディルを試しつつも、その成長を認める。",
      pages: [
        { speaker: "ハキマ", expression: "anger", text: "ハキマは薬草の束を抱え、星瓶堂の扉を勢いよく開けた。\n「今日は、あんたの目利きを見せてもらうから」" },
        { speaker: "", expression: "normal", text: "卓上に並んだ香草は、どれも似た色をしている。\nだが香りの奥に、乾いた土と甘い樹脂の違いがあった。" },
        { speaker: "ハキマ", expression: "sorrow", text: "ナーディルが客の用途を尋ねると、ハキマの耳がぴくりと動いた。\n「……ふうん。品だけじゃなく、使う人まで見るんだ」" },
        { speaker: "ハキマ", expression: "joy", text: "彼女は悔しそうに目をそらし、それでも小さく笑った。\n「まあ、今日のところは合格。少しだけ、頼りにしてあげる」" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "normal", text: "ハキマは薬草の束を置くなり、懐かしそうに鼻を鳴らした。\n「こういう勝負、昔はよくやったよね」" },
          { speaker: "ハキマ", expression: "sorrow", text: "ナーディルが品を選ぶ手つきは、あの頃よりずっと落ち着いていた。\nそれが少し誇らしくて、少しだけ悔しい。" },
          { speaker: "ハキマ", expression: "sorrow", text: "「先に行くなら、置いていかないでよ」\nハキマは小さくつぶやき、すぐに耳まで赤くした。" },
          { speaker: "ハキマ", expression: "joy", text: "「今のは忘れて。……でも、隣で見立てるくらいは、許してあげる」\nその声は、怒ったふりをするには優しすぎた。" }
        ]
      }
    },
    {
      id: "hakima_10",
      heroineId: "hakima",
      threshold: 10,
      title: "狐の耳は嘘をつかない",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01",
        heroineExpressions: ["anger", "surprise", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "素直になれないハキマだが、ナーディルと同じ目線で品を選べたことに、深い喜びを感じている。",
      pages: [
        { speaker: "ハキマ", expression: "anger", text: "市場の香料瓶を前に、ハキマは腕を組んでうなった。\n「この配合、悪くないけど……客には少し強すぎるわね」" },
        { speaker: "ハキマ", expression: "surprise", text: "ナーディルが薄める案を出すと、彼女は驚いた顔をした。\n「同じこと、考えてた。……先に言わないでよ」" },
        { speaker: "ハキマ", expression: "sorrow", text: "「でも、そういうところは嫌いじゃない」\n言った直後、ハキマの耳が跳ね、尻尾がふわりと揺れた。" },
        { speaker: "ハキマ", expression: "joy", text: "彼女は慌てて背を向ける。\n「見てない！ あんたは何も見てない！ ……でも、また一緒に見立てるから」" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "surprise", text: "市場の棚を前に、ふたりは同時に同じ香料瓶を指差した。\nハキマは目を丸くし、やがて呆れたように笑う。" },
          { speaker: "ハキマ", expression: "normal", text: "「……昔は、あんたの方がいつも外してたのに」\n少しだけ寂しそうに、でも誇らしげに彼女は言う。" },
          { speaker: "ハキマ", expression: "joy", text: "「やっと追いついてきたってことね。なら、これからは対等だ」\n狐の耳が、嬉しさを隠しきれずにぴんと立っていた。" },
          { speaker: "ハキマ", expression: "joy", text: "「言っとくけど、まだまだ負けないからね」\nその顔は、市場のどの灯りよりも眩しかった。" }
        ]
      }
    },
    {
      id: "hakima_20",
      heroineId: "hakima",
      threshold: 20,
      title: "重なる目利き",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "HAKIMA-01"
      },
      summary: "ルハーン商会からの大口相談を巡り、ハキマはナーディルの目利きを認め、素直になれないながらも信頼を口にする。",
      pages: [
        { "speaker": "ハキマ", "expression": "normal", "text": "ルハーン商会から、大口の香材相談が来たの。星瓶堂の目利きも借りたいって。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "君の商会から正式に？ それは責任重大だな。" },
        { "speaker": "ハキマ", "expression": "anger", "text": "勘違いしないで。あんたが少しは信用できるって、私が報告しただけよ。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "それなら、なおさら嬉しいよ。ハキマが見てくれた星瓶堂の信用だ。" },
        { "speaker": "ハキマ", "expression": "surprise", "text": "……そういう言い方、ずるい。怒る準備をしてたのに、調子が狂うじゃない。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "normal", text: "ルハーン商会から、大口の香材相談が来たの。……昔のあんたなら、聞いただけで逃げてたでしょうね。" },
          { speaker: "ナーディル", expression: "fun", text: "否定しきれないな。昔は、君に香材の束を渡されるだけで身構えてた。" },
          { speaker: "ハキマ", expression: "anger", text: "それでも最後まで付き合ったじゃない。悔しいけど、あんたの目利きは昔から当てにしてたのよ。" },
          { speaker: "ナーディル", expression: "joy", text: "なら今回は、昔より胸を張って隣に立てるように頑張るよ。" },
          { speaker: "ハキマ", expression: "surprise", text: "……そういう言い方、ずるい。こっちは何年も前から、その隣を空けてたみたいじゃない。" }
        ]
      }
    },
    {
      id: "hakima_climax",
      heroineId: "hakima",
      threshold: 30,
      kind: "route_climax",
      title: "隣に並ぶ覚悟",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01"
      },
      summary: "成長するナーディルに焦りを感じるハキマに対し、ナーディルは共に歩む決意を伝え、二人は対等なパートナーとしての絆を深める。",
      pages: [
        { "speaker": "ハキマ", "expression": "sorrow", "text": "あんたが星瓶堂の店主らしくなるほど、少しだけ遠く見える時があるの。" },
        { "speaker": "ナーディル", "expression": "sorrow", "text": "遠くへ行きたいわけじゃない。俺は、この店で誰かと向き合える店主になりたいんだ。" },
        { "speaker": "ハキマ", "expression": "anger", "text": "だったら、隣を空けておきなさいよ。勝手に一人で格好つけないで。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "分かった。難しい香材も、厄介な客も、君と一緒に見立てたい。" },
        { "speaker": "ハキマ", "expression": "joy", "text": "……最初からそう言えばいいのよ。まったく、手のかかる若店主なんだから。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "sorrow", text: "子どもの頃、どっちが先に自分の店を持つかって勝負したの、覚えてる？" },
          { speaker: "ナーディル", expression: "normal", text: "覚えてる。君は、負けた方が勝った方の棚を一緒に並べるって言ってた。" },
          { speaker: "ハキマ", expression: "anger", text: "違うわよ。あれは負けた時の約束じゃない。……隣にいるための口実だったの。" },
          { speaker: "ナーディル", expression: "surprise", text: "ハキマ……。俺は、君が隣にいるのを当たり前みたいに思いすぎていたのかもしれない。" },
          { speaker: "ハキマ", expression: "joy", text: "今さら気づいたなら、遅れた分だけちゃんと空けておきなさい。星瓶堂の隣、私が立つんだから。" }
        ]
      }
    }
  ],
  mira: [
    {
      id: "mira_0",
      heroineId: "mira",
      threshold: 0,
      kind: "flashback_intro",
      // route intro / flashback
      title: "天才とノートの余白",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "MIRA-01"
      },
      summary: "開店前、ミラとの出会いを思い出す。大学の廊下で、彼女が俺のノートの余白に興味を持ったことがきっかけだった。",
      pages: [
        {
          speaker: "ナーディル",
          expression: "normal",
          text: "ミラか。……あの子、最初はずいぶんと俺のノートを熱心に覗き込んでいたっけ。",
          backgroundId: "shopExteriorDay"
        },
        {
          speaker: "ミラ",
          expression: "normal",
          text: "「先輩、その計算式の横にある走り書き……父の、ナーディル・シニアの理論の応用ですか？」\n大学の廊下で、学年一の天才と名高いミラに呼び止められた時は心臓が止まるかと思った。",
          backgroundId: "spotFountain"
        },
        {
          speaker: "ナーディル",
          expression: "surprise",
          text: "「え、ああ……。父が昔言っていたことを、自分なりにまとめてみただけだよ」\n俺がそう言うと、彼女の瞳は見たこともないほど輝いたんだ。",
          backgroundId: "spotFountain"
        },
        {
          speaker: "ミラ",
          expression: "joy",
          text: "「素晴らしいです。教科書にはない、実践的な知恵が詰まっています。もっと詳しく教えていただけませんか？」\nそれが、彼女との「先輩・後輩」の関係の始まりだった。",
          backgroundId: "spotFountain"
        },
        {
          speaker: "ナーディル",
          expression: "joy",
          text: "今では商会の相談役として、一番の助言者になってくれている。……よし、今日も頑張ろう。",
          backgroundId: "shopExteriorDay"
        }
      ]
    },
    {
      id: "mira_5",
      heroineId: "mira",
      threshold: 5,
      title: "普通の女の子として",
      stillImageId: "miraAfterSchool01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01",
        heroineExpressions: ["normal", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise"]
      },
      summary: "天才として常に正解を求められるミラが、星瓶堂でだけは「迷うこと」を許され、一人の少女に戻る。",
      pages: [
        { speaker: "ミラ", expression: "normal", text: "放課後、ミラは課題用の素材帳を抱えて星瓶堂を訪れた。\n「先輩、今日は正解を選びに来たわけではないんです」" },
        { speaker: "ミラ", expression: "sorrow", text: "彼女は瓶を二つ並べ、困ったように眉を寄せる。\n「どちらも正しい。だから、どちらを選ぶべきか迷っています」" },
        { speaker: "", expression: "surprise", text: "ナーディルが「迷っていい」と言うと、ミラは目を丸くした。\n天才なら即答するべきだと、ずっと思っていたから。" },
        { speaker: "ミラ", expression: "joy", text: "「先輩は、少しずるいです」\n彼女は小さく笑う。\n「そんな言い方をされたら、私でいたくなります」" }
      ],
      routePages: {
        long_history: [
          { speaker: "ミラ", expression: "normal", text: "ミラは古い課題帳を開き、懐かしそうに指でなぞった。\n「この式、先輩に何度も直してもらいましたね」" },
          { speaker: "ミラ", expression: "sorrow", text: "「みんなは答えだけを褒めました。でも先輩は、迷った跡を見てくれた」\n彼女の声は、少しだけ震えていた。" },
          { speaker: "ミラ", expression: "surprise", text: "ナーディルが笑うと、ミラは胸の前で帳面を抱きしめる。\n「だから私は、またここに来たんです」" },
          { speaker: "ミラ", expression: "joy", text: "「天才ではなく、ただの私として。……先輩の隣で、もう一度考えたくて」\nその笑顔は、少し照れくさそうだった。" }
        ]
      }
    },
    {
      id: "mira_10",
      heroineId: "mira",
      threshold: 10,
      title: "商人の目利き",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01",
        heroineExpressions: ["normal", "fun", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "商会としての効率と、店としての優しさ。ミラは星瓶堂で、数字では測れない答えを見つける。",
      pages: [
        { speaker: "ミラ", expression: "normal", text: "ミラは星瓶堂の帳面を開き、真剣な顔で数字を並べた。\n「この配合なら、もっと多くの人に届けられます」" },
        { speaker: "", expression: "sorrow", text: "けれどナーディルは、最後に客の手紙を読み返した。\n効率だけでは測れない願いが、そこには残っていた。" },
        { speaker: "ミラ", expression: "fun", text: "ミラは少し悔しそうに、そして嬉しそうに笑った。\n「商人の目だけでは、見落とすものがありますね」" },
        { speaker: "ミラ", expression: "joy", text: "「先輩の隣でなら、正解を出す前の私でいられます」\nその言葉は、星明かりよりも静かに輝いていた。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ミラ", expression: "normal", text: "星空の下、ミラは帳面を閉じた。\n「昔から、先輩は私の答えより、考えている顔を見ていました」" },
          { speaker: "ミラ", expression: "fun", text: "「それが少し悔しくて、でも、とても嬉しかったんです」\n彼女は夜風に揺れる布を押さえ、小さく笑う。" },
          { speaker: "ミラ", expression: "joy", text: "「私は天才としてではなく、私の夢として、星瓶堂の未来を考えたい」\nその瞳は、もう迷っていなかった。" },
          { speaker: "ミラ", expression: "joy", text: "「先輩。これからも、私が答えを急ぎそうになったら止めてください」\nミラは照れながら、そっと隣に並んだ。" }
        ]
      }
    },
    {
      id: "mira_20",
      heroineId: "mira",
      threshold: 20,
      title: "暮らしの錬金術",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "MIRA-01"
      },
      summary: "ミラは大学の発表題材に星瓶堂を選び、ナーディルの「使う人の顔が見える品」という姿勢に自身の理想を重ねる。",
      pages: [
        { "speaker": "ミラ", "expression": "normal", "text": "先輩、星瓶堂の商品を学外発表の題材にしてもいいでしょうか。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "うちの商品を？ もっと派手な研究の方が、評価されるんじゃないか。" },
        { "speaker": "ミラ", "expression": "sorrow", "text": "派手さだけなら、そうかもしれません。でも私は、暮らしに届く錬金術を発表したいんです。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "それなら、星瓶堂はぴったりだ。使う人の顔が見える品ばかりだから。" },
        { "speaker": "ミラ", "expression": "joy", "text": "はい. 先輩がそう見ているから、私もこの店で学びたいと思えたんです。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ミラ", expression: "normal", text: "先輩、覚えていますか。昔、星瓶堂の棚を題材にして、二人で小さな研究帳を作ったこと。" },
          { speaker: "ナーディル", expression: "fun", text: "覚えてるよ。君は瓶の配置まで数式にしようとして、俺は途中で目を回した。" },
          { speaker: "ミラ", expression: "joy", text: "でも先輩は、最後に言ってくれました。使う人が迷わない棚なら、それも立派な錬金術だって。" },
          { speaker: "ナーディル", expression: "normal", text: "そんなことを言ったのか。今聞くと、ずいぶん星瓶堂らしい答えだな。" },
          { speaker: "ミラ", expression: "sorrow", text: "私にとっては、研究の原点です。天才の発表ではなく、誰かの暮らしに届く錬金術を選びたいんです。" }
        ]
      }
    },
    {
      id: "mira_climax",
      heroineId: "mira",
      threshold: 30,
      kind: "route_climax",
      title: "正解の前の私",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01"
      },
      summary: "天才ゆえの失敗への恐怖を吐露するミラに対し、ナーディルはその過程すべてを肯定し、彼女が「ただの自分」でいられる場所であることを示す。",
      pages: [
        { "speaker": "ミラ", "expression": "sorrow", "text": "天才だと言われるほど、間違えるのが怖くなります。期待を裏切るのが怖いんです。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "ミラが迷って、試して、失敗して、それでも考えるところを俺は見てきた。" },
        { "speaker": "ミラ", "expression": "surprise", "text": "答えだけではなく、そこまで見てくれるんですね。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "もちろん。俺が信じているのは、天才の看板じゃなくて、目の前のミラだから。" },
        { "speaker": "ミラ", "expression": "joy", "text": "……先輩の前では、正解の前の私でいてもいいんですね。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ミラ", expression: "sorrow", text: "昔、一度だけ実験に失敗して、もう飛び級なんて無理だと思った日がありました。" },
          { speaker: "ナーディル", expression: "normal", text: "覚えてる。君は泣きそうな顔で、失敗した計算紙を全部抱えてきた。" },
          { speaker: "ミラ", expression: "cry", text: "先輩は、答えを直すより先に、紙を捨てなかったことを褒めてくれました。" },
          { speaker: "ナーディル", expression: "joy", text: "迷って、書き直して、それでも考える君を知っていたからだよ。天才だからじゃない。" },
          { speaker: "ミラ", expression: "joy", text: "……昔から、先輩の前では正解の前の私でいられました。今も、その場所に帰ってきたいんです。" }
        ]
      }
    }
  ],
  dariya: [
    {
      id: "dariya_0",
      heroineId: "dariya",
      threshold: 0,
      kind: "flashback_intro",
      // route intro / flashback
      title: "王宮の鑑定依頼",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "DARIYA-01"
      },
      summary: "開店前、ダリヤさんとの出会いを思い出す。王宮錬金局からの正式な鑑定依頼が、彼女との始まりだった。",
      pages: [
        {
          speaker: "ナーディル",
          expression: "normal",
          text: "ダリヤさんは……最初は本当に『公務』として、この店に来たんだよな。",
          backgroundId: "shopExteriorDay"
        },
        {
          speaker: "ダリヤ",
          expression: "normal",
          text: "「王宮錬金局のダリヤ・アル＝アズラクです。星瓶堂の技術、王室の基準に照らして確認させていただきます」\n検証室で会った時の彼女は、氷のように冷たく、完璧な公務員だった。",
          backgroundId: "palaceLab"
        },
        {
          speaker: "ナーディル",
          expression: "sorrow",
          text: "「厳しいですね。でも、俺の作る品に嘘はありません」\n俺が差し出した試作瓶を、彼女は無言で、しかし誰よりも真剣な眼差しで解析し始めた。",
          backgroundId: "palaceLab"
        },
        {
          speaker: "ダリヤ",
          expression: "joy",
          text: "「……不合格。理論が古すぎるわ。でも、使い手の体温まで計算されている。嫌いな設計じゃない」\n最後に微かに見せたその笑みが、今の「友人」としての関係の種だったんだと思う。",
          backgroundId: "palaceLab"
        },
        {
          speaker: "ナーディル",
          expression: "joy",
          text: "今では良き関係者として、王宮との橋渡しまでしてくれている。……さあ、背筋を伸ばして始めよう。",
          backgroundId: "shopExteriorDay"
        }
      ]
    },
    {
      id: "dariya_5",
      heroineId: "dariya",
      threshold: 5,
      title: "安らぎの工房",
      stillImageId: "dariyaAfterHours01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-01",
        heroineExpressions: ["normal", "sorrow", "joy"],
        naderExpressions: ["normal", "sorrow"]
      },
      summary: "王宮での重圧を抱えるダリヤが、星瓶堂でだけは鎧を下ろし、一人の人として息をつく。",
      pages: [
        { speaker: "ダリヤ", expression: "normal", text: "閉店後の星瓶堂に、ダリヤは細い瓶を抱えて現れた。\n「公務の確認だ。……半分は、口実かもしれないが」" },
        { speaker: "", expression: "sorrow", text: "王宮印の封蝋は冷たく、瓶の中身よりも重く見えた。\nナーディルは黙って椅子を引き、温かい茶を置く。" },
        { speaker: "ダリヤ", expression: "sorrow", text: "ダリヤは少しだけ目を伏せた。\n「君の店は困るな。立ち上がる理由を、忘れてしまいそうになる」" },
        { speaker: "", expression: "joy", text: "その笑みは疲れていたが、初めて肩の力が抜けていた。\n星瓶堂の夜は、どんな霊薬より静かに彼女を休ませた。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "normal", text: "ダリヤは扉を閉めるなり、昔のように小さく息を吐いた。\n「君は相変わらず、追い出すのが下手だな」" },
          { speaker: "", expression: "sorrow", text: "学生の頃も、王宮に入った後も。\n彼女は本当に疲れた夜だけ、この店の灯を思い出し訪れていた。" },
          { speaker: "ダリヤ", expression: "sorrow", text: "「私は、強い先輩でいられない日がある」\nダリヤは苦笑し、視線を卓上の茶へ落とした。" },
          { speaker: "ダリヤ", expression: "joy", text: "「それでも君は、昔から同じ顔で茶を出す」\nその声は、責めるにはあまりにも優しかった。" }
        ]
      }
    },
    {
      id: "dariya_10",
      heroineId: "dariya",
      threshold: 10,
      title: "共鳴する真理",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-01",
        heroineExpressions: ["normal", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "完璧でなければならないという呪縛から解き放たれ、ダリヤはナーディルの前でだけ弱さを共有する。",
      pages: [
        { speaker: "", expression: "normal", text: "王宮錬金局の検証室は、音まで整いすぎていた。\nダリヤは手順書を閉じ、静かに眉を寄せる。" },
        { speaker: "ダリヤ", expression: "sorrow", text: "「完璧な配合だ。……だが、君の作ったものより冷たい」\n彼女は、星瓶堂から持ち帰った香りをそっと嗅いだ。" },
        { speaker: "ダリヤ", expression: "joy", text: "「君の理論は、いつも少しだけ隙がある。だから人が入る余地があるんだ」\nそれは、王立錬金術師の評価ではなく、一人の友人としての言葉だった。" },
        { speaker: "ダリヤ", expression: "joy", text: "「……また明日、君の店に行こう。少しだけ、あの隙間が恋しい」\n彼女の横顔は、昼間よりずっと穏やかだった。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "sorrow", text: "夜の検証室で、ダリヤはついに筆を置いた。\n「昔なら、もう少し上手に隠せたはずなのだが」" },
          { speaker: "", expression: "normal", text: "ナーディルは答えを急かず、ただ隣に立った。\nその沈黙が、昔から彼女には何よりありがたかった。" },
          { speaker: "ダリヤ", expression: "sorrow", text: "「私は、特別でなくなるのが怖かった」\nダリヤの声は震えたが、逃げることはなかった。" },
          { speaker: "ダリヤ", expression: "joy", text: "「だが君は、特別でない私にも茶を出すのだろう」\n彼女は泣きそうに笑い、ようやく前を向いた。" }
        ]
      }
    },
    {
      id: "dariya_20",
      heroineId: "dariya",
      threshold: 20,
      title: "当たり前の重み",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "DARIYA-01"
      },
      summary: "王宮の案件をナーディルに相談するダリヤ。王宮が忘れがちな「当たり前」を大切にするナーディルの視点を高く評価する。",
      pages: [
        { "speaker": "ダリヤ", "expression": "normal", "text": "王宮の検証案件を、星瓶堂にも相談したい。君の目は、研究所と少し違う。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "王宮の案件を俺に？ 光栄ですけど、少し緊張しますね。" },
        { "speaker": "ダリヤ", "expression": "fun", "text": "緊張くらいでちょうどいい。王宮には、緊張しすぎて息を忘れる者も多いからね。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "俺は、使う人が息をしやすい品かどうかを見たいです。" },
        { "speaker": "ダリヤ", "expression": "joy", "text": "だから君に頼みたい。私が忘れかける当たり前を、君はまだ覚えている。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "normal", text: "学生の頃、君と組んだ検証はいつも少し予定を外れた。手順書通りには進まなかったな。" },
          { speaker: "ナーディル", expression: "fun", text: "ダリヤさんが怖い顔をして、最後には少し笑ってくれるまでが一組でしたね。" },
          { speaker: "ダリヤ", expression: "fun", text: "生意気な後輩だったよ。だが、君の発想に救われたことも一度や二度ではない。" },
          { speaker: "ナーディル", expression: "normal", text: "今も同じです。俺は、使う人が息をしやすい品かどうかを見たい。" },
          { speaker: "ダリヤ", expression: "joy", text: "だからこそ頼みたい。立場が変わっても、君だけはその当たり前を忘れないでいてくれ。" }
        ]
      }
    },
    {
      id: "dariya_climax",
      heroineId: "dariya",
      threshold: 30,
      kind: "route_climax",
      title: "座らせてくれる場所",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-01"
      },
      summary: "完璧であることを自らに強いるダリヤに対し、ナーディルは弱さも受け入れる安らぎの場を供し、二人の関係は公務を超えたものへと昇華する。",
      pages: [
        { "speaker": "ダリヤ", "expression": "sorrow", "text": "王宮では、優秀でいることに慣れすぎた。できない私を, 私自身が許せない。" },
        { "speaker": "ナーディル", "expression": "sorrow", "text": "できない日があっても、ダリヤさんが積み重ねてきたものは消えません。" },
        { "speaker": "ダリヤ", "expression": "cry", "text": "君は簡単に言うな。……いや、簡単に聞こえるほど自然に言うから困る。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "ここでは、王宮錬金術師である前に、ダリヤさんとして座ってくれればいい。" },
        { "speaker": "ダリヤ", "expression": "joy", "text": "……なら、少しだけ座らせてもらおう。立ち上がる時は、君の茶を一杯もらってからだ。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "sorrow", text: "昔、一度だけ君に言ったな。特別でなくなった私は、何者でいればいいのだろうと。" },
          { speaker: "ナーディル", expression: "normal", text: "覚えています. 俺はその時、何も立派な答えを返せなかった。茶を出すくらいしかできなくて。" },
          { speaker: "ダリヤ", expression: "cry", text: "それで十分だった。君は私を慰めず、責めず、ただ座らせてくれた。" },
          { speaker: "ナーディル", expression: "sorrow", text: "今も同じです。完璧でいられない日も、ここではダリヤさんとして座ってくれればいい。" },
          { speaker: "ダリヤ", expression: "joy", text: "……なら、あの時と同じ茶をもらおう。立ち上がるのは、それを飲んでからにする。" }
        ]
      }
    }
  ]
};
function getEventsByHeroine(heroineId) {
  return AFFECTION_EVENTS[heroineId] || [];
}
const DAILY_TALKS = [
  {
    id: "common_father_camera_biz",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "父さんの錬金カメラ事業は順調みたいだ。世界中から珍しい景色が届くよ。" },
      { speaker: "ナーディル", expression: "joy", text: "でも俺は、この場所で誰かの日常を支える星瓶堂の仕事が好きだ。" }
    ]
  },
  {
    id: "common_shop_dust",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "営業前に棚を少し掃除した。古い天秤に積もった埃を払うと、昔の記憶も一緒に蘇るようだ。" },
      { speaker: "ナーディル", expression: "joy", text: "俺もいつか、この道具に恥ずかしくない店主になりたいな。" }
    ]
  },
  {
    id: "common_shop_name_origin",
    category: "personal",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "星瓶堂って名前、父さんが若い頃につけたんだ。星を閉じ込めた瓶みたいな店にしたいって。" },
      { speaker: "ナーディル", expression: "joy", text: "少し大げさだけど、子どもの頃の俺には本当にそう見えてたよ。" }
    ]
  },
  {
    id: "common_blue_ceramics",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "この青い陶器は、王都の職人が焼いたものだよ。薬瓶にも茶器にも使える。" },
      { speaker: "ナーディル", expression: "joy", text: "砂の色が多い街だからかな。棚に青があるだけで、少し涼しく見えるんだ。" }
    ]
  },
  {
    id: "common_old_scale",
    category: "personal",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "この天秤、父さんが店を継ぐ前から使っているらしい。" },
      { speaker: "ナーディル", expression: "sorrow", text: "針の揺れを見るたびに、店って人より長く覚えているんだなと思うよ。" }
    ]
  },
  {
    id: "common_trade_district",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "星瓶堂の周りは交易街区だから、朝からいろんな匂いが混ざる。" },
      { speaker: "ナーディル", expression: "fun", text: "香料、焼き菓子、革袋、たまに怪しい薬草。鼻だけで道案内できそうだ。" }
    ]
  },
  {
    id: "common_camera_letter",
    category: "personal",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "父さんからまた写真が届いた。今度は海港都市ミナートの朝焼けだって。" },
      { speaker: "ナーディル", expression: "joy", text: "遠い景色を瓶の中みたいに残せるんだから、錬金カメラって不思議だよな。" }
    ]
  },
  {
    id: "common_shop_old_bottle",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "棚の奥から、古い保存瓶が出てきた。祖父の代から使っている型らしい。" },
      { speaker: "ナーディル", expression: "joy", text: "派手な品じゃないけど、こういう瓶が暮らしを支えてきたんだと思うと悪くない。" }
    ]
  },
  {
    id: "common_market_weather",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "交易街区は、風向きで匂いが変わる。今日は香料市と焼き菓子の屋台が近いな。" },
      { speaker: "ナーディル", expression: "fun", text: "腹が減る香りの隣で薬草を売るのは、なかなか難しい商いだよ。" }
    ]
  },
  {
    id: "common_camera_shadow",
    category: "personal",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "sorrow", text: "父さんの錬金カメラを目当てに来る客は、今でも少なくない。" },
      { speaker: "ナーディル", expression: "joy", text: "でも今日は、星瓶堂の若店主を頼って来たと言われた。……少し、胸を張っていいかな。" }
    ]
  },
  {
    id: "common_shop_after_rain",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "雨上がりの店先は、石畳と薬草の匂いが少しだけ濃くなる。" },
      { speaker: "ナーディル", expression: "joy", text: "こういう日は、香り袋よりも温かい茶の調合がよく出るんだ。" }
    ]
  },
  {
    id: "hakima_morning_check",
    category: "work",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "最近の仕入れはどう？ 変なものを掴まされてないでしょうね。あんたは人が良すぎるから。" },
      { speaker: "ナーディル", expression: "normal", text: "ありがとう、ハキマ。君がそうやって釘を刺してくれるから、俺も気を引き締められるよ。" }
    ]
  },
  {
    id: "hakima_spice_fake",
    category: "work",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "最近、安物の樹脂に香りを足した偽物が出回ってるの。見た目だけなら悪くないけど。" },
      { speaker: "ハキマ", expression: "anger", text: "だから鼻と手触りで見るの。あんたも、値札だけで判断しないことね。" }
    ]
  },
  {
    id: "hakima_little_brother",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "fun", text: "弟がね、星瓶堂の光る瓶を欲しがってるの。まったく、子どもって派手なものが好きよね。" },
      { speaker: "ハキマ", expression: "normal", text: "……まあ、安全な小瓶なら一つくらい選んであげてもいいけど。" }
    ]
  },
  {
    id: "hakima_scent_memory",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "香りって不思議よね。少し嗅いだだけで、昔の市場や家の台所まで思い出す。" },
      { speaker: "ハキマ", expression: "sorrow", text: "だから雑に扱う人を見ると、腹が立つの。香材には、暮らしが染みてるんだから。" }
    ]
  },
  {
    id: "hakima_quality_argument",
    category: "work",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "anger", text: "この香材、見た目は上等だけど乾かし方が雑ね。贈答品には向かないわ。" },
      { speaker: "ナーディル", expression: "joy", text: "助かるよ。君の鼻があると、棚の品まで背筋が伸びる気がする。" },
      { speaker: "ハキマ", expression: "surprise", text: "なっ……変な褒め方しないで。鑑定士として当然のことを言っただけよ。" }
    ]
  },
  {
    id: "hakima_sibling_gift",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "fun", text: "弟が、星瓶堂の小さな発光瓶を気に入ってるの。危なくない品、選べる？" },
      { speaker: "ナーディル", expression: "normal", text: "子ども用なら、光量を落として瓶も厚めにしよう。転がしても割れにくい方がいい。" },
      { speaker: "ハキマ", expression: "joy", text: "……そういうところは細かいのね。まあ、少しだけ見直したわ。" }
    ]
  },
  {
    id: "hakima_next_to_you",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "今日は難しい依頼が来そうな匂いがする。……何よ、勘じゃなくて経験よ。" },
      { speaker: "ナーディル", expression: "fun", text: "なら、隣で見ていてくれると心強いな。" },
      { speaker: "ハキマ", expression: "joy", text: "仕方ないわね。あんた一人に任せると、少しだけ心配だから。" }
    ]
  },
  {
    id: "hakima_long_old_market",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "昔、二人で市場の香材を当てる勝負をしたの、覚えてる？ あんた、妙に強かったのよね。" },
      { speaker: "ナーディル", expression: "fun", text: "負けた時だけ、君は今よりずっと静かだった気がする。" },
      { speaker: "ハキマ", expression: "anger", text: "余計なことまで覚えてなくていいの。……でも、隣で競うのは嫌いじゃなかったわ。" }
    ]
  },
  {
    id: "hakima_long_do_not_go_ahead",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "sorrow", text: "あんたは昔から、気づくと少し先にいるのよね。目利きも、調合も、店主の顔も。" },
      { speaker: "ナーディル", expression: "sorrow", text: "置いていったつもりはなかった。でも、そう見えていたならごめん。" },
      { speaker: "ハキマ", expression: "joy", text: "謝るより、隣を空けておきなさいよ。今度は私が、そこに立つんだから。" }
    ]
  },
  {
    id: "mira_university_news",
    category: "work",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "先輩、聞いてください。大学で新しい抽出法が発見されたんです。まだ実験段階ですが……。" },
      { speaker: "ナーディル", expression: "joy", text: "それは興味深いね。いつか星瓶堂の品作りにも活かせるかもしれない。" }
    ]
  },
  {
    id: "mira_failed_formula",
    category: "work",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "昨日の課題、計算は合っていたのに、実験では沈殿が出ました。" },
      { speaker: "ミラ", expression: "sorrow", text: "理論上は正しい、だけでは足りないんですね。……少し悔しいです。" }
    ]
  },
  {
    id: "mira_price_quality",
    category: "work",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "高品質な素材を使えば、良い品は作れます。でも、それだけでは商売になりません。" },
      { speaker: "ミラ", expression: "joy", text: "必要な人に届く価格にする。そこまで考えて、初めて商品なんです。" }
    ]
  },
  {
    id: "mira_ordinary_choice",
    category: "personal",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "fun", text: "実は私、難しい器具より、色のきれいな小瓶を選ぶ方が迷うんです。" },
      { speaker: "ミラ", expression: "surprise", text: "……意外ですか？ こういう迷い方くらい、私にもあります。" }
    ]
  },
  {
    id: "mira_material_doubt",
    category: "work",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "先輩、この二つの素材、どちらも理論上は正解なんです。だから困っています。" },
      { speaker: "ナーディル", expression: "normal", text: "なら、今日は正解じゃなくて、誰に届けたい品かを考えてみよう。" },
      { speaker: "ミラ", expression: "surprise", text: "……そういう考え方、先輩らしいです。少し、悔しいくらいに。" }
    ]
  },
  {
    id: "mira_trade_sample",
    category: "work",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "商会から試作品を預かってきました。性能は良いのですが、少し高価すぎます。" },
      { speaker: "ナーディル", expression: "normal", text: "良い品でも、必要な人に届かなければ意味が薄いからね。" },
      { speaker: "ミラ", expression: "joy", text: "はい。先輩なら、そう言ってくださると思っていました。" }
    ]
  },
  {
    id: "mira_not_only_genius",
    category: "personal",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "fun", text: "今日は課題でも商会の用事でもありません。……先輩と少し話したかっただけです。" },
      { speaker: "ナーディル", expression: "surprise", text: "それなら、茶を淹れようか。相談じゃなくても、君の席はあるよ。" },
      { speaker: "ミラ", expression: "joy", text: "ありがとうございます。そう言われると、天才でいるより嬉しいです。" }
    ]
  },
  {
    id: "mira_long_old_formula",
    category: "personal",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "昔、私の計算式に先輩が赤を入れてくれたこと、まだ覚えています。" },
      { speaker: "ナーディル", expression: "fun", text: "褒めるところより、直すところを探してくれって言われたからね。" },
      { speaker: "ミラ", expression: "joy", text: "はい。先輩だけは、私を天才ではなく後輩として見てくれました。" }
    ]
  },
  {
    id: "mira_long_same_seat",
    category: "personal",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "sorrow", text: "昔は、先輩の隣の席だけが少し静かでした。誰も私を急かさない席でした。" },
      { speaker: "ナーディル", expression: "normal", text: "今も急がなくていい。答えが出るまで、ここで一緒に考えよう。" },
      { speaker: "ミラ", expression: "joy", text: "……はい。やっぱり私は、この席が一番落ち着きます。" }
    ]
  },
  {
    id: "dariya_palace_tea",
    category: "work",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の茶葉はどれも最高級だが……この店の、少しスパイスが混ざったような香りは悪くない。" },
      { speaker: "ナーディル", expression: "normal", text: "そう言ってもらえると嬉しいです。ここでは、少しでも息をつけるようにしておきます。" }
    ]
  },
  {
    id: "dariya_palace_protocol",
    category: "work",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の検証書類は、瓶の中身より重いことがある。" },
      { speaker: "ダリヤ", expression: "fun", text: "中身を一滴調べるために、紙を十枚書く。優雅な仕事だろう？" }
    ]
  },
  {
    id: "dariya_resting_place",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "ここは、王宮ほど静かではないのに妙に落ち着くな。瓶の音も、人の声もある。" },
      { speaker: "ダリヤ", expression: "fun", text: "完璧に整っていないからだろうか。少なくとも、息苦しさは少ない。" }
    ]
  },
  {
    id: "dariya_oni_aesthetic",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "鬼族の里では、私は少し細すぎると言われる。王都では逆のことを言われるがね。" },
      { speaker: "ダリヤ", expression: "fun", text: "美しさの基準など、場所が変わればすぐ変わる。実に頼りない真理だ。" }
    ]
  },
  {
    id: "dariya_verification_sample",
    category: "work",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮から検証用の小瓶を預かってきた。正式な依頼ではない、少し厄介な確認だ。" },
      { speaker: "ナーディル", expression: "normal", text: "厄介な確認を持ち込まれるくらいには、信用されたと思っておきます。" },
      { speaker: "ダリヤ", expression: "fun", text: "前向きだな。そういう若さは、王宮の空気に少し分けてやりたいよ。" }
    ]
  },
  {
    id: "dariya_imperfect_shelf",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "この棚は、瓶の高さが微妙に揃っていないな。王宮なら直される。" },
      { speaker: "ナーディル", expression: "fun", text: "すみません。気を抜くと、よく使う瓶だけ前に出てくるんです。" },
      { speaker: "ダリヤ", expression: "joy", text: "謝ることはない。使われている棚の方が、飾られた棚より私は好きだ。" }
    ]
  },
  {
    id: "dariya_dress_choice",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "fun", text: "今日の装い、どうかしら？ 交易商の会合だから、少し「武装」してきたの。" },
      { speaker: "ナーディル", expression: "surprise", text: "……武装、ですか。確かに、いつにもまして隙がないように見えます。" },
      { speaker: "ダリヤ", expression: "joy", text: "なら上々だ。隙を見せる相手くらい、自分で選びたいのでね。" }
    ]
  },
  {
    id: "dariya_tea_leaf",
    category: "work",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "ナーディル、新しい茶葉を見つけた。香りの層が面白い。後で試してみるか。" },
      { speaker: "ナーディル", expression: "joy", text: "それは楽しみです。ダリヤさんの選ぶ茶葉は、いつも香りの理由まで面白いですから。" },
      { speaker: "ダリヤ", expression: "joy", text: "いい答えだ。では、君の感想も検証材料に加えさせてもらおう。" }
    ]
  },
  {
    id: "dariya_not_perfect",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "sorrow", text: "今日は少し、王宮錬金術師らしくない顔をしているかもしれない。" },
      { speaker: "ナーディル", expression: "sorrow", text: "ここでは、肩書きより先にダリヤさんが座ってくれれば十分です。" },
      { speaker: "ダリヤ", expression: "joy", text: "……君は時々、こちらが困るほど自然に逃げ道を作るな。" }
    ]
  },
  {
    id: "dariya_long_old_chair",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "fun", text: "この椅子、昔より座り心地がよくなっていないか。ますます立ち上がれなくなる。" },
      { speaker: "ナーディル", expression: "fun", text: "昔から長居していたのは、椅子のせいだけじゃないでしょう。" },
      { speaker: "ダリヤ", expression: "sorrow", text: "……そうだな。君の店は昔から、私が少し黙っていられる場所だった。" }
    ]
  },
  {
    id: "dariya_long_seen_weakness",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "cry", text: "君は昔から、私が平気な顔をしている時ほど、何も聞かずに茶を出す。" },
      { speaker: "ナーディル", expression: "normal", text: "聞かれたくない日もあるでしょう。でも、一人で戻らなくていい日はあっていい。" },
      { speaker: "ダリヤ", expression: "joy", text: "……本当に、困った後輩だ。おかげで私は、また少し立て直せてしまう。" }
    ]
  },
  {
    id: "common_market_snack",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "市場で焼き菓子を買ってきた。ここのデーツパイは、香草茶と相性がいいんだ。" },
      { speaker: "ナーディル", expression: "fun", text: "営業の合間に少しつまめば、目利きにも甘さが戻る……気がする。" }
    ]
  },
  {
    id: "common_fountain_rest",
    category: "personal",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "広場の噴水に、白い鳩が集まっていたよ。" },
      { speaker: "ナーディル", expression: "joy", text: "水音を聞いていると、砂漠の熱さも一瞬だけ忘れられる気がするな。" }
    ]
  },
  {
    id: "common_morning_mist",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "今朝は珍しく霧が出ていた。マグリバルでは珍しい光景だ。" },
      { speaker: "ナーディル", expression: "surprise", text: "瓶のガラスが曇って、まるで別の店に迷い込んだみたいだったよ。" }
    ]
  },
  {
    id: "common_mother_postcard",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "母さんから絵葉書が届いた。父さんの写真より、旅先の菓子の話の方が長い。" },
      { speaker: "ナーディル", expression: "fun", text: "あの二人らしいよ。世界を見に行っても、結局は茶と甘い物の話になる。" }
    ]
  },
  {
    id: "common_sister_camera_shop",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "姉さんのカメラ会社は、また支店を増やすらしい。手紙の文字まで忙しそうだった。" },
      { speaker: "ナーディル", expression: "joy", text: "すごいと思う。でも俺は、この棚の前で客と話す時間も悪くないと思ってる。" }
    ]
  },
  {
    id: "common_customer_gift",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "今日は贈答用の相談が来るらしい。香り袋か、青い小瓶か、相手の暮らしで変わるな。" },
      { speaker: "ナーディル", expression: "joy", text: "品を選ぶのは、物を当てることじゃない。誰かの時間に、きちんと届く形を探すことなんだ。" }
    ]
  },
  {
    id: "hakima_forest_resin",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "ラウダの森から樹脂が届いたの。香りは良いけど、湿気を吸うとすぐ機嫌を損ねるわ。" },
      { speaker: "ハキマ", expression: "fun", text: "誰かさんみたい？ ……違うわよ。私はもっと扱いやすいでしょ。" }
    ]
  },
  {
    id: "hakima_customer_habit",
    category: "work",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "香材を選ぶ時は、客の手元を見るの。袋の持ち方で、普段使いか贈り物か分かるから。" },
      { speaker: "ナーディル", expression: "joy", text: "君の目利きは、香りだけじゃないんだな。俺も見習わないと。" },
      { speaker: "ハキマ", expression: "surprise", text: "素直に褒めないで。……調子が狂うでしょ。" }
    ]
  },
  {
    id: "hakima_long_family_table",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "昔、うちの食卓であんたが香辛料を間違えたの、まだ母さんが笑い話にしてるわ。" },
      { speaker: "ナーディル", expression: "surprise", text: "あれ、まだ覚えられてるのか……。俺としては忘れてほしい記憶なんだけど。" },
      { speaker: "ハキマ", expression: "joy", text: "無理ね。ああいう失敗まで含めて、昔からの付き合いなんだから。" }
    ]
  },
  {
    id: "mira_preservation_bottle",
    category: "work",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "先輩、この保存瓶の封止、少しだけ改良できそうです。輸送中の香り抜けを抑えられます。" },
      { speaker: "ナーディル", expression: "joy", text: "それは助かるな。遠くの街まで、星瓶堂の香りをそのまま届けられる。" }
    ]
  },
  {
    id: "mira_small_failure",
    category: "work",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "sorrow", text: "昨日、香草茶の配合を間違えました。理論上は綺麗だったのに、味が……とても個性的で。" },
      { speaker: "ナーディル", expression: "fun", text: "個性的で済むなら、まだ商品名でごまかせるかもしれない。" },
      { speaker: "ミラ", expression: "joy", text: "ふふ。先輩、失敗の扱い方が少し優しいです。" }
    ]
  },
  {
    id: "mira_long_after_class",
    category: "personal",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "放課後、先輩の机に課題を持っていく時間が、私は少し好きでした。" },
      { speaker: "ナーディル", expression: "fun", text: "少し？ ずいぶん難しい課題を持ってきていた気がするけど。" },
      { speaker: "ミラ", expression: "joy", text: "先輩なら、難しい顔をしながら最後まで付き合ってくれると知っていましたから。" }
    ]
  },
  {
    id: "dariya_palace_window",
    category: "work",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の窓は美しいよ。磨かれすぎて、外の光まで少し緊張して見える。" },
      { speaker: "ダリヤ", expression: "fun", text: "ここは少し埃っぽいが、そのぶん光がやわらかい。悪くない違いだ。" }
    ]
  },
  {
    id: "dariya_royal_safety",
    category: "work",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の調合品は、効能より先に安全証明を求められる。美しいが、息の詰まる仕事だ。" },
      { speaker: "ナーディル", expression: "normal", text: "暮らしに届く品ほど、安心して使えることが大事ですからね。" },
      { speaker: "ダリヤ", expression: "joy", text: "そうだな。君は、王宮が時々忘れる当たり前を覚えている。" }
    ]
  },
  {
    id: "dariya_long_first_weakness",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "sorrow", text: "昔、君に一度だけ失敗した実験を見られたな。あれは、今でも少し悔しい。" },
      { speaker: "ナーディル", expression: "normal", text: "俺は、失敗よりも、その後で何度も検証し直していた姿を覚えています。" },
      { speaker: "ダリヤ", expression: "joy", text: "……そういう覚え方をするから、君の前では格好をつけにくいんだ。" }
    ]
  },
  {
    id: "common_result_reflection",
    category: "personal",
    scope: "common",
    heroineId: null,
    timing: "after_result",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "今回の接客を振り返ると、まだ見立てが甘かったところもある。だが、迷った手順も次の糧になる。" },
      { speaker: "ナーディル", expression: "joy", text: "父さんも、最初は瓶を割ってばかりだったと言っていた。俺も少しずつ、星瓶堂の店主になっていこう。" }
    ]
  },
  {
    id: "common_result_customer_smile",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "after_result",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "fun", text: "品を受け取った客が、店先でふっと笑ってくれた。あの顔を見ると、疲れまで軽くなる。" },
      { speaker: "ナーディル", expression: "joy", text: "星瓶堂の小瓶が、誰かの暮らしを少し明るくできたなら嬉しい。そういう営業を重ねたいな。" }
    ]
  },
  {
    id: "common_day_end_cleanup",
    category: "work",
    scope: "common",
    heroineId: null,
    timing: "day_end",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "棚を整えていると、父さんが作った星写しの器具が目に入った。今夜も、王都の空は澄んでいるだろうか。" },
      { speaker: "ナーディル", expression: "sorrow", text: "両親は旅先で、どんな星を見ているのだろう。遠い景色を思うたび、この店の灯も少し大事に見える。" }
    ]
  },
  {
    id: "common_day_end_closing",
    category: "personal",
    scope: "common",
    heroineId: null,
    timing: "day_end",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "店の戸を閉める。砂の街に夜の静けさが降りて、真鍮の看板だけがほのかに光っている。" },
      { speaker: "ナーディル", expression: "joy", text: "また次の営業でも、星瓶堂の灯が誰かの道しるべになりますように。" }
    ]
  },
  {
    id: "hakima_result_advice",
    category: "work",
    scope: "heroine",
    heroineId: "hakima",
    timing: "after_result",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "今回の品選び、悪くなかったわ。でも、香りの奥にある乾きまでは読み切れてなかったわね。" },
      { speaker: "ハキマ", expression: "joy", text: "ま、少しずつよ。あんたの目利きは、前より確実に良くなってるから。" }
    ]
  },
  {
    id: "hakima_day_end_departure",
    category: "personal",
    scope: "heroine",
    heroineId: "hakima",
    timing: "day_end",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "それじゃ、私は商会に戻るわ。預かってる香材の帳面も見なきゃいけないし。" },
      { speaker: "ハキマ", expression: "fun", text: "……でも、また近いうちに顔を出すわ。その時は、もっと面白い品を見せなさいよ。" }
    ]
  },
  {
    id: "mira_result_encouragement",
    category: "work",
    scope: "heroine",
    heroineId: "mira",
    timing: "after_result",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "joy", text: "先輩、今回の接客はとても勉強になりました。理論だけでは、客の迷いまでは拾えませんね。" },
      { speaker: "ミラ", expression: "fun", text: "星瓶堂で見る品選びは、大学の課題よりずっと生きています。次の相談も、楽しみにしています。" }
    ]
  },
  {
    id: "mira_day_end_homework",
    category: "personal",
    scope: "heroine",
    heroineId: "mira",
    timing: "day_end",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "今日の観察記録をまとめてから帰ります。先輩の店先での判断、全部メモしておきたいので。" },
      { speaker: "ミラ", expression: "joy", text: "……ふふ。先生に提出する課題より、ずっと面白いです。星瓶堂には、答えの前の迷いがありますから。" }
    ]
  },
  {
    id: "dariya_result_evaluation",
    category: "work",
    scope: "heroine",
    heroineId: "dariya",
    timing: "after_result",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の検証品と比べても、君の見立てには筋が通っている。用途を見失わないのは、簡単ではない。" },
      { speaker: "ダリヤ", expression: "fun", text: "……少し褒めすぎたかな。だが、悪くない。星瓶堂らしい柔らかさがある。" }
    ]
  },
  {
    id: "dariya_day_end_tea",
    category: "personal",
    scope: "heroine",
    heroineId: "dariya",
    timing: "day_end",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "そろそろ王宮へ戻らないと。夜の回廊は静かだが、書類だけは眠ってくれない。" },
      { speaker: "ダリヤ", expression: "joy", text: "……だが、君の茶の香りはまだ袖に残っている。悪くない。少しだけ、戻る足取りが軽くなる。" }
    ]
  }
];
function checkNewEventUnlock(heroineId, currentAffection, seenEventIds) {
  const events = getEventsByHeroine(heroineId);
  const eligibleEvents = events.filter(
    (event) => event.kind !== "flashback_intro" && event.kind !== "route_climax" && currentAffection >= event.threshold && !seenEventIds.includes(event.id)
  );
  if (eligibleEvents.length === 0) return null;
  return eligibleEvents.sort((a, b) => a.threshold - b.threshold)[0];
}
function getEventPages(event, routeMode) {
  var _a;
  if (!event) return [{ speaker: "", expression: "normal", text: "" }];
  let rawPages = [];
  if (routeMode === "long_history" && ((_a = event.routePages) == null ? void 0 : _a.long_history)) {
    rawPages = event.routePages.long_history;
  } else if (event.pages && Array.isArray(event.pages) && event.pages.length > 0) {
    rawPages = event.pages;
  } else {
    rawPages = [event.text || ""];
  }
  return rawPages.map((page) => {
    if (typeof page === "string") {
      return {
        speaker: "",
        expression: "normal",
        text: page
      };
    }
    return {
      speaker: page.speaker !== void 0 ? page.speaker : "",
      expression: page.expression || "normal",
      text: page.text || ""
    };
  });
}
function getRouteText(baseText, routeTexts, routeMode) {
  if (routeTexts && routeTexts[routeMode]) {
    return routeTexts[routeMode];
  }
  return baseText;
}
function getIntroTalks(heroineId, currentAffection, seenTalkIds, routeMode) {
  const getEligible = (category) => {
    return DAILY_TALKS.filter((talk) => {
      if (talk.timing !== "intro") return false;
      if (talk.category !== category) return false;
      if (talk.scope === "heroine" && talk.heroineId !== heroineId) return false;
      if (talk.routeMode !== "both" && talk.routeMode !== routeMode) return false;
      if (talk.minAffection > currentAffection) return false;
      if (seenTalkIds.includes(talk.id)) return false;
      return true;
    }).sort((a, b) => (b.priority || 1) - (a.priority || 1));
  };
  const workTalks = getEligible("work");
  const personalTalks = getEligible("personal");
  const selected = [];
  if (workTalks.length > 0) selected.push(workTalks[0]);
  if (personalTalks.length > 0) selected.push(personalTalks[0]);
  return selected;
}
function getNextDailyTalk(heroineId, timing, currentAffection, seenTalkIds, routeMode) {
  const eligible = DAILY_TALKS.filter((talk) => {
    if (talk.timing !== timing) return false;
    if (talk.scope === "heroine" && talk.heroineId !== heroineId) return false;
    if (talk.routeMode !== "both" && talk.routeMode !== routeMode) return false;
    if (talk.minAffection > currentAffection) return false;
    if (seenTalkIds.includes(talk.id)) return false;
    return true;
  });
  return eligible.length > 0 ? eligible[0] : null;
}
function resolveHeroineSelectionEvent({ heroineId, seenEventIds }) {
  const introEventId = `${heroineId}_0`;
  const events = getEventsByHeroine(heroineId);
  const introEvent = events.find((e) => e.id === introEventId);
  if (introEvent && !seenEventIds.includes(introEventId)) {
    return introEvent;
  }
  return null;
}
function resolveEventCloseActions({ event, isRecallMode }) {
  if (!event) {
    return {
      shouldMarkSeen: false,
      nextScreen: isRecallMode ? "MEMORIES" : "DAY_END",
      shouldClearBackgroundOverride: true,
      shouldPlayDayEndSfx: false
    };
  }
  if (isRecallMode) {
    return {
      shouldMarkSeen: false,
      nextScreen: "MEMORIES",
      shouldClearBackgroundOverride: true,
      shouldPlayDayEndSfx: false
    };
  }
  if (event.kind === "flashback_intro") {
    return {
      shouldMarkSeen: true,
      nextScreen: "INTRO",
      shouldClearBackgroundOverride: true,
      shouldPlayDayEndSfx: false
    };
  }
  return {
    shouldMarkSeen: true,
    nextScreen: "DAY_END",
    shouldClearBackgroundOverride: true,
    shouldPlayDayEndSfx: true
  };
}
const HeroineSelectScreen = ({
  previewHeroineId,
  onPreviewHeroineChange,
  onSelectHeroine,
  affection,
  routeMode,
  screen,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  renderThemeStyles,
  HeroineDisplay: HeroineDisplay2,
  getFullPath,
  audioEngine: audioEngine2
}) => {
  const selectedHeroine = HEROINES.find((h) => h.id === previewHeroineId) || HEROINES[0];
  const containerStyle2 = {
    width: "100%",
    height: "100%",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    position: "relative",
    boxSizing: "border-box"
  };
  const titleStyle2 = {
    fontFamily: "'Playfair Display', serif",
    color: THEME.starGold,
    textShadow: `0 2px 10px ${THEME.nightBlue}`,
    letterSpacing: "0.05em"
  };
  const cardStyle2 = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "24px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    border: `1px solid ${THEME.brass}`,
    boxSizing: "border-box"
  };
  const buttonStyle2 = {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1em",
    fontWeight: "bold",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    margin: "10px 0",
    fontFamily: "inherit"
  };
  const narrativeBoxStyle2 = {
    background: "white",
    borderRadius: "8px",
    padding: "15px",
    border: `1px solid ${THEME.brass}`,
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    color: THEME.textDark
  };
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "heroine-select-screen", style: containerStyle2 }, renderThemeStyles && renderThemeStyles(), /* @__PURE__ */ React.createElement(
    GameHud,
    {
      screen,
      routeMode,
      onOpenLog,
      onOpenOptions,
      onOpenHelp
    }
  ), /* @__PURE__ */ React.createElement("h1", { style: { ...titleStyle2, marginBottom: "20px" } }, "誰との縁を深める？"), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
    width: "100%",
    maxWidth: "350px"
  } }, HEROINES.map((h) => {
    var _a;
    const isSelected = previewHeroineId === h.id;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        "data-testid": `heroine-tab-${h.id}`,
        key: h.id,
        className: "heroine-card",
        onClick: () => {
          if (audioEngine2) audioEngine2.playSfx("uiHeroineTab");
          if (onPreviewHeroineChange) onPreviewHeroineChange(h.id);
        },
        style: {
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          border: `3px solid ${isSelected ? h.themeColor : "rgba(226,209,177,0.65)"}`,
          background: "#111",
          padding: 0,
          cursor: "pointer",
          transition: "all 0.2s",
          transform: isSelected ? "scale(1.12)" : "scale(1.0)",
          boxShadow: isSelected ? `0 0 0 5px ${h.themeColor}33, -10px 0 18px ${h.themeColor}66` : "0 2px 8px rgba(0,0,0,0.35)",
          overflow: "hidden",
          zIndex: isSelected ? 2 : 1,
          boxSizing: "border-box",
          position: "relative"
        }
      },
      /* @__PURE__ */ React.createElement(
        "img",
        {
          src: getFullPath ? getFullPath(getHeroineAsset(h.id, "face", "normal")) : "",
          alt: h.name,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: ((_a = h.visualConfig) == null ? void 0 : _a.facePosition) || "center 20%",
            display: "block",
            borderRadius: "50%",
            clipPath: "circle(50% at 50% 50%)"
          },
          draggable: false
        }
      ),
      isSelected && /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        top: "7px",
        left: "-3px",
        width: "18px",
        height: "50px",
        borderLeft: `3px solid ${THEME.starGold}`,
        borderRadius: "50%",
        filter: `drop-shadow(0 0 5px ${h.themeColor})`,
        pointerEvents: "none"
      } })
    );
  })), /* @__PURE__ */ React.createElement("div", { style: {
    ...cardStyle2,
    maxWidth: "350px",
    height: "420px",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    background: THEME.parchment,
    border: `2px solid ${selectedHeroine.themeColor}`,
    position: "relative"
  } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: selectedHeroine.themeColor } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "15px", alignItems: "center", marginBottom: "15px" } }, HeroineDisplay2 && /* @__PURE__ */ React.createElement(HeroineDisplay2, { heroine: selectedHeroine, type: "face", size: "medium", expression: "normal" }), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "left", flex: 1 } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, fontSize: "1.3em", color: THEME.textDark } }, selectedHeroine.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85em", color: selectedHeroine.themeColor, fontWeight: "bold" } }, selectedHeroine.role), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85em", color: "#666", marginTop: "4px" } }, "親密度: ", /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "bold", color: THEME.textDark } }, affection ? affection[selectedHeroine.id] : 0)))), /* @__PURE__ */ React.createElement("div", { style: {
    ...narrativeBoxStyle2,
    flex: 1,
    padding: "12px",
    fontSize: "0.9em",
    marginBottom: "15px",
    overflowY: "auto",
    background: "rgba(255,255,255,0.4)",
    border: "1px solid rgba(0,0,0,0.05)",
    color: "#333",
    textAlign: "left"
  } }, getRouteText(selectedHeroine.description, { long_history: selectedHeroine.routeDescription }, routeMode)), /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-testid": "heroine-start",
      onClick: () => onSelectHeroine && onSelectHeroine(selectedHeroine.id),
      style: {
        ...buttonStyle2,
        width: "100%",
        margin: 0,
        background: selectedHeroine.themeColor,
        color: "#fff",
        border: `2px solid ${selectedHeroine.themeColor}`,
        boxShadow: "0 4px 0 rgba(0,0,0,0.2)"
      }
    },
    selectedHeroine.name,
    "を頼む"
  )), /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: "20px",
    display: "flex",
    gap: "20px",
    opacity: 0.8
  } }));
};
const VNBox = forwardRef(({ text, pages, speaker, hint, themeColor, onComplete, onPageChange, onPageComplete, speed = 30, skip = false, hideSkip = false, hideNext = false, getFaceIcon }, ref) => {
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : [text || ""];
  const [pageIndex, setPageIndex] = useState(0);
  useEffect(() => {
    onPageChange == null ? void 0 : onPageChange(pageIndex);
  }, [pageIndex]);
  const currentPage = pageList[pageIndex];
  const currentText = typeof currentPage === "object" ? (currentPage == null ? void 0 : currentPage.text) || "" : currentPage || "";
  const currentSpeaker = typeof currentPage === "object" && (currentPage == null ? void 0 : currentPage.speaker) !== void 0 ? currentPage.speaker : speaker;
  const currentSpeakerId = typeof currentPage === "object" ? currentPage.speakerId : null;
  const currentExpression = typeof currentPage === "object" ? currentPage.expression || "normal" : "normal";
  const currentHint = typeof currentPage === "object" ? currentPage.hint || hint : hint;
  const [displayText, setDisplayText] = useState(skip ? currentText : "");
  const [isComplete, setIsComplete] = useState(skip);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverSkip, setHoverSkip] = useState(false);
  const [isSkippingBlock, setIsSkippingBlock] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const loggedPagesRef = useRef(/* @__PURE__ */ new Set());
  const markPageComplete = (index = pageIndex, text2 = currentText) => {
    if (!text2) return;
    const key = `${index}:${text2}`;
    if (loggedPagesRef.current.has(key)) return;
    loggedPagesRef.current.add(key);
    onPageComplete == null ? void 0 : onPageComplete({
      speaker: currentSpeaker,
      speakerId: currentSpeakerId,
      expression: currentExpression,
      text: text2,
      pageIndex: index
    });
  };
  useEffect(() => {
    if (skip || isSkippingBlock) {
      setDisplayText(currentText);
      setIsComplete(true);
      markPageComplete();
      if (isSkippingBlock) setIsSkippingBlock(false);
      return;
    }
    setDisplayText("");
    setIsComplete(false);
    setCurrentIndex(0);
  }, [currentText, skip, isSkippingBlock]);
  useEffect(() => {
    if (isComplete || skip || isSkippingBlock) return;
    if (currentIndex < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + currentText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      markPageComplete();
    }
  }, [currentIndex, currentText, isComplete, speed, skip, isSkippingBlock]);
  const handleClick = (e) => {
    if (isFadingOut) return;
    const isLastPage = pageIndex >= pageList.length - 1;
    const isTyping = !isComplete;
    if (isTyping || !isLastPage) {
      if (e && e.stopPropagation) e.stopPropagation();
    }
    if (isTyping) {
      setDisplayText(currentText);
      setIsComplete(true);
      markPageComplete();
    } else if (!isLastPage) {
      setPageIndex((prev) => prev + 1);
      setDisplayText("");
      setIsComplete(false);
      setCurrentIndex(0);
      audioEngine.playSfx("uiTapBottle");
    } else if (onComplete) {
      onComplete();
    }
  };
  const handleSkipBlock = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isFadingOut) return;
    pageList.slice(pageIndex).forEach((page, offset) => {
      const idx = pageIndex + offset;
      const text2 = typeof page === "object" ? (page == null ? void 0 : page.text) || "" : page || "";
      const speakerLabel = typeof page === "object" && (page == null ? void 0 : page.speaker) !== void 0 ? page.speaker : speaker;
      const speakerId = typeof page === "object" ? page == null ? void 0 : page.speakerId : null;
      const expr = typeof page === "object" ? (page == null ? void 0 : page.expression) || "normal" : "normal";
      const key = `${idx}:${text2}`;
      if (!text2 || loggedPagesRef.current.has(key)) return;
      loggedPagesRef.current.add(key);
      onPageComplete == null ? void 0 : onPageComplete({
        speaker: speakerLabel || "",
        speakerId: speakerId || null,
        expression: expr,
        text: text2,
        pageIndex: idx
      });
    });
    setIsFadingOut(true);
    audioEngine.playSfx("uiTapBottle");
    setTimeout(() => {
      onComplete == null ? void 0 : onComplete();
    }, 300);
  };
  useImperativeHandle(ref, () => ({
    advance: () => handleClick(),
    skip: () => handleSkipBlock()
  }));
  const facePath = currentSpeakerId && getFaceIcon ? getFaceIcon(currentSpeakerId, "face", currentExpression) : null;
  const [displayFace, setDisplayFace] = useState(facePath);
  const [prevFace, setPrevFace] = useState(null);
  const [isFaceLoaded, setIsFaceLoaded] = useState(false);
  useEffect(() => {
    if (facePath !== displayFace) {
      setPrevFace(displayFace);
      setDisplayFace(facePath);
      setIsFaceLoaded(false);
      const timer = setTimeout(() => setPrevFace(null), 200);
      return () => clearTimeout(timer);
    }
  }, [facePath]);
  const headerButtonStyle = {
    padding: "6px 20px",
    borderRadius: "999px",
    background: "rgba(12, 25, 38, 0.95)",
    border: `1px solid ${themeColor || THEME.brass}77`,
    color: themeColor || THEME.brass,
    fontSize: "0.85em",
    fontWeight: "900",
    letterSpacing: "0.1em",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "uppercase",
    userSelect: "none"
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "vn-box",
      className: "vn-box",
      onClick: handleClick,
      style: {
        width: "100%",
        boxSizing: "border-box",
        height: "166px",
        background: "rgba(18, 28, 42, 0.98)",
        padding: currentSpeaker ? "42px 24px 28px 24px" : "24px 24px 28px 24px",
        // Increased top padding to avoid overlap
        borderRadius: "12px 12px 0 0",
        cursor: "pointer",
        color: THEME.parchment,
        textAlign: "left",
        position: "relative",
        bottom: "12px",
        boxShadow: "0 -4px 15px rgba(0,0,0,0.3)",
        fontFamily: "'Outfit', 'Inter', sans-serif",
        userSelect: "none",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        lineHeight: "1.7",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        transition: "all 0.3s ease",
        border: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "none"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "-45px",
      // Fixed header position
      left: 0,
      width: "100%",
      height: "60px",
      // Matches Face Icon height
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      boxSizing: "border-box",
      pointerEvents: "none",
      zIndex: 20
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      pointerEvents: "none"
    } }, currentSpeaker && displayFace && /* @__PURE__ */ React.createElement("div", { style: {
      width: "60px",
      height: "60px",
      borderRadius: "12px",
      overflow: "hidden",
      border: `2px solid ${themeColor || THEME.brass}`,
      background: "rgba(12, 25, 38, 0.95)",
      flexShrink: 0,
      boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
      position: "relative",
      pointerEvents: "auto"
    } }, prevFace && /* @__PURE__ */ React.createElement(
      "img",
      {
        src: prevFace,
        alt: "prev face",
        style: {
          width: "110%",
          height: "110%",
          objectFit: "cover",
          objectPosition: "center 20%",
          position: "absolute",
          top: "-5%",
          left: "-5%",
          zIndex: 1,
          animation: "vn-fade-out 0.2s forwards"
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "img",
      {
        key: displayFace,
        src: displayFace,
        alt: currentSpeaker,
        onLoad: () => setIsFaceLoaded(true),
        style: {
          width: "110%",
          height: "110%",
          objectFit: "cover",
          objectPosition: "center 20%",
          WebkitUserDrag: "none",
          userSelect: "none",
          position: "absolute",
          top: "-5%",
          left: "-5%",
          zIndex: 2,
          opacity: isFaceLoaded ? 1 : 0,
          animation: isFaceLoaded ? "vn-fade-in 0.2s ease" : "none"
        },
        draggable: false,
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      inset: 0,
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "14px",
      pointerEvents: "none",
      zIndex: 3
    } })), currentSpeaker && /* @__PURE__ */ React.createElement(
      "div",
      {
        key: currentSpeaker,
        style: {
          ...headerButtonStyle,
          pointerEvents: "auto",
          animation: "vn-fade-in 0.2s ease"
        }
      },
      currentSpeaker
    )), !hideSkip && /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: handleSkipBlock,
        onMouseEnter: () => setHoverSkip(true),
        onMouseLeave: () => setHoverSkip(false),
        style: {
          ...headerButtonStyle,
          background: hoverSkip ? themeColor || THEME.brass : "rgba(12, 25, 38, 0.95)",
          color: hoverSkip ? "#0c1926" : themeColor || THEME.brass,
          border: `1px solid ${hoverSkip ? themeColor || THEME.brass : (themeColor || THEME.brass) + "77"}`,
          cursor: "pointer",
          pointerEvents: "auto"
        }
      },
      "SKIP"
    )),
    isFadingOut && /* @__PURE__ */ React.createElement("div", { style: {
      position: "fixed",
      inset: 0,
      background: "black",
      zIndex: 9999,
      animation: "vn-fade-in 0.3s forwards",
      pointerEvents: "all"
    } }),
    /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: currentSpeaker ? "1.05em" : "1.1em",
      lineHeight: "1.6",
      minHeight: "3.6em",
      // Adjusted for extra padding
      flex: 1,
      opacity: currentSpeaker ? 1 : 0.95,
      fontStyle: currentSpeaker ? "normal" : "italic"
    } }, displayText, !isComplete && /* @__PURE__ */ React.createElement("span", { style: { animation: "vn-blink 1s infinite", marginLeft: "4px", borderLeft: `2px solid ${THEME.brass}` } }, " ")),
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      bottom: "14px",
      left: "24px",
      fontSize: "0.72em",
      color: THEME.oasisTeal,
      opacity: 0.8,
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "rgba(0,0,0,0.3)",
      padding: currentHint ? "3px 12px" : "0",
      borderRadius: "999px",
      visibility: currentHint ? "visible" : "hidden",
      whiteSpace: "nowrap",
      zIndex: 5,
      border: `1px solid ${THEME.oasisTeal}33`,
      backdropFilter: "blur(2px)",
      pointerEvents: "none"
    } }, currentHint && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.1em" } }, "💡"), currentHint)),
    isComplete && !hideNext && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      bottom: "14px",
      right: "24px",
      fontSize: "0.8em",
      color: themeColor || THEME.brass,
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      animation: "vn-bounce 1s infinite",
      background: "rgba(0,0,0,0.5)",
      padding: "4px 16px",
      borderRadius: "999px",
      border: `1px solid ${themeColor || THEME.brass}66`,
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      zIndex: 5,
      backdropFilter: "blur(2px)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.9em" } }, pageIndex < pageList.length - 1 ? "NEXT" : "FINISH"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.2em" } }, "▼")),
    /* @__PURE__ */ React.createElement("style", null, `
        @keyframes vn-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes vn-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes vn-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `)
  );
});
const prologuePages = [
  { text: "砂漠の街マグリバル。路地の一角に、小さな鍛金術店「星瓶堂」がある。" },
  { text: "若店主ナーディルは、客の依頼に合う品を選びながら、今日も星瓶堂の営業を始める。" },
  { text: "砂漠の風は時に厳しいが、星々はいつも職人の手元を優しく照らしている。ここでは古くから鍛金術が物語を紡いできた。" },
  { text: "これからの10回の営業。商いを重ねる中で、協力者たちとの縁も少しずつ育っていく。" },
  { text: "あなたの手から生み出される品々が、誰かの未来を少しだけ輝かせることを願って。" },
  { speakerId: "nader", speaker: "ナーディル", text: "さあ、今日も星瓶堂を開けよう。いい縁に出会えるといいな。" }
];
const PrologueScreen = ({
  screen,
  routeMode,
  textSpeedMeta,
  isInstantTextSpeed,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  onVnAreaClick,
  onPageComplete,
  onAdvanceToHeroineSelect,
  renderThemeStyles,
  renderBackground,
  HeroineDisplay: HeroineDisplay2,
  audioEngine: audioEngine2,
  vnRef,
  getFaceIcon,
  containerStyle: containerStyle2,
  titleStyle: titleStyle2,
  cardStyle: cardStyle2,
  buttonStyle: buttonStyle2
}) => {
  const handleAreaClick = (e) => {
    onVnAreaClick(e);
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "prologue-screen",
      style: { ...containerStyle2, position: "relative", overflow: "hidden" },
      onClick: handleAreaClick
    },
    renderThemeStyles(),
    renderBackground("PROLOGUE"),
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      bottom: "15%",
      right: "0%",
      zIndex: 2,
      pointerEvents: "none",
      opacity: 1,
      height: "66%",
      display: "flex",
      alignItems: "flex-end",
      filter: "drop-shadow(0 0 15px rgba(0,0,0,0.3))"
    } }, /* @__PURE__ */ React.createElement(
      HeroineDisplay2,
      {
        heroine: PROTAGONIST,
        type: "standing",
        size: "large",
        expression: "normal",
        noBorder: true,
        style: { height: "100%", width: "auto", boxShadow: "none" }
      }
    )),
    /* @__PURE__ */ React.createElement("div", { style: { zIndex: 5, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(
      GameHud,
      {
        screen,
        routeMode,
        onOpenLog,
        onOpenOptions,
        onOpenHelp
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { flex: "0 0 auto", padding: "10px 0 5px 0", textAlign: "center" } }, /* @__PURE__ */ React.createElement("h1", { style: { ...titleStyle2, margin: 0, fontSize: "1.6em", textShadow: "0 2px 4px rgba(0,0,0,0.5)" } }, "星瓶堂の始まり")), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 auto" } })),
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 6,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      boxSizing: "border-box",
      position: "relative"
    } }, /* @__PURE__ */ React.createElement(
      VNBox,
      {
        ref: vnRef,
        pages: prologuePages,
        themeColor: THEME.brass,
        speed: textSpeedMeta.delay,
        skip: shouldSkipTypewriter(isInstantTextSpeed),
        getFaceIcon,
        onPageComplete,
        onComplete: onAdvanceToHeroineSelect
      }
    )))
  );
};
const IntroScreen = ({
  activeHeroine,
  activeDailyTalk,
  activeGreeting,
  day = 1,
  screen,
  routeMode,
  textSpeedMeta,
  isInstantTextSpeed,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  onVnAreaClick,
  onPageComplete,
  onBeginService,
  renderThemeStyles,
  renderBackground,
  HeroineDisplay: HeroineDisplay2,
  audioEngine: audioEngine2,
  vnRef,
  getFaceIcon,
  containerStyle: containerStyle2,
  titleStyle: titleStyle2,
  cardStyle: cardStyle2,
  buttonStyle: buttonStyle2,
  narrativeBoxStyle: narrativeBoxStyle2
}) => {
  const [heroineOpacity, setHeroineOpacity] = React.useState(0);
  const [heroineExpression, setHeroineExpression] = React.useState("normal");
  const [nadirOpacity, setNadirOpacity] = React.useState(0);
  const visibleRef = React.useRef(false);
  const TRANSITION_CONFIG = {
    arrival: { delay: 0, sfx: "quizWrongSandTap", volumeScale: 0.5 },
    departure: { delay: 500, sfx: "quizWrongSandTap", volumeScale: 0.5 }
  };
  const triggerTransition = (type, action) => {
    const config = TRANSITION_CONFIG[type];
    if (!config) {
      action();
      return;
    }
    setTimeout(() => {
      action();
      if (config.sfx && config.volumeScale !== void 0) {
        audioEngine2.playSfx(config.sfx, config.volumeScale);
      } else if (config.sfx) {
        audioEngine2.playSfx(config.sfx);
      }
    }, config.delay);
  };
  const buildPages = () => {
    const pages = [];
    const hId = activeHeroine.id;
    const greet = activeGreeting || { monologue: "...", heroineReactions: { [hId]: { arrival: "...", response: "..." } } };
    const reactions = greet.heroineReactions[hId] || { arrival: "こんにちは", response: "いらっしゃい" };
    pages.push({
      speakerId: "nader",
      speaker: "ナーディル",
      text: typeof greet.monologue === "function" ? greet.monologue(activeHeroine) : greet.monologue
    });
    pages.push({
      speakerId: hId,
      speaker: activeHeroine.name,
      text: typeof reactions.arrival === "function" ? reactions.arrival(activeHeroine) : reactions.arrival
    });
    pages.push({
      speakerId: "nader",
      speaker: "ナーディル",
      text: typeof reactions.response === "function" ? reactions.response(activeHeroine) : reactions.response
    });
    if (activeDailyTalk && activeDailyTalk.pages) {
      activeDailyTalk.pages.forEach((page) => {
        let inferredId = page.speakerId;
        if (!inferredId) {
          if (page.speaker === "ナーディル") inferredId = "nader";
          else if (page.speaker === activeHeroine.name) inferredId = hId;
        }
        pages.push({ ...page, speakerId: inferredId });
      });
    }
    pages.push({
      speakerId: hId,
      speaker: activeHeroine.name,
      text: "「それじゃ、また営業が終わった頃に。今日の商い、期待しているわね」"
    });
    pages.push({
      speakerId: "nader",
      speaker: "ナーディル",
      text: "ああ、ありがとう。……よし、星瓶堂を開けよう。"
    });
    return pages;
  };
  const combinedPages = buildPages();
  React.useEffect(() => {
    var _a;
    if (((_a = combinedPages[0]) == null ? void 0 : _a.speakerId) === "nader") {
      setNadirOpacity(1);
    }
  }, []);
  const handlePageChange = (index) => {
    const page = combinedPages[index];
    const isHeroinePage = (page == null ? void 0 : page.speakerId) === activeHeroine.id;
    const isNadirPage = (page == null ? void 0 : page.speakerId) === "nader";
    if (isNadirPage) {
      if (!visibleRef.current) {
        setNadirOpacity(1);
        setHeroineOpacity(0);
      }
    } else if (isHeroinePage) {
      setNadirOpacity(0);
    }
    if (isHeroinePage && (page == null ? void 0 : page.expression)) {
      setHeroineExpression(page.expression);
    }
    if (isHeroinePage && !visibleRef.current) {
      triggerTransition("arrival", () => {
        setHeroineOpacity(1);
        visibleRef.current = true;
      });
    }
  };
  const handleInternalPageComplete = (data) => {
    onPageComplete(data);
    const isFarewellPage = data.pageIndex === combinedPages.length - 2;
    if (isFarewellPage && visibleRef.current) {
      triggerTransition("departure", () => {
        setHeroineOpacity(0);
        visibleRef.current = false;
      });
    }
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "intro-screen",
      style: { ...containerStyle2, position: "relative", overflow: "hidden" },
      onClick: onVnAreaClick
    },
    renderThemeStyles(),
    renderBackground(screen),
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      bottom: "8%",
      left: 0,
      width: "100%",
      zIndex: 2,
      pointerEvents: "none",
      height: "77%",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      filter: "drop-shadow(0 0 15px rgba(0,0,0,0.3))"
    } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement(
      HeroineDisplay2,
      {
        heroine: PROTAGONIST,
        type: "standing",
        size: "large",
        expression: "normal",
        noBorder: true,
        style: {
          height: "100%",
          width: "auto",
          boxShadow: "none",
          position: "absolute",
          opacity: nadirOpacity,
          transition: "opacity 0.3s ease-in-out"
        }
      }
    ), /* @__PURE__ */ React.createElement(
      HeroineDisplay2,
      {
        heroine: activeHeroine,
        type: "standing",
        size: "large",
        expression: heroineExpression,
        noBorder: true,
        style: {
          height: "100%",
          width: "auto",
          boxShadow: "none",
          position: "absolute",
          opacity: heroineOpacity,
          transition: "opacity 0.3s ease-in-out"
        }
      }
    ))),
    /* @__PURE__ */ React.createElement("div", { style: { zIndex: 5, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(
      GameHud,
      {
        screen,
        routeMode,
        onOpenLog,
        onOpenOptions,
        onOpenHelp
      }
    ), /* @__PURE__ */ React.createElement("h1", { style: {
      ...titleStyle2,
      position: "absolute",
      top: "8px",
      left: "12px",
      margin: 0,
      fontSize: "1.2em",
      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
      textAlign: "left",
      maxWidth: "70%",
      zIndex: 10
    } }, activeHeroine.name, "との語らい"), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 auto" } })),
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 6,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      boxSizing: "border-box",
      position: "relative"
    } }, /* @__PURE__ */ React.createElement(
      VNBox,
      {
        ref: vnRef,
        pages: combinedPages,
        hint: "客の好みに合わせて素材を選ぼう",
        themeColor: THEME.brass,
        speed: textSpeedMeta.delay,
        skip: shouldSkipTypewriter(isInstantTextSpeed),
        getFaceIcon,
        onPageChange: handlePageChange,
        onPageComplete: handleInternalPageComplete,
        onComplete: () => onBeginService((activeDailyTalk == null ? void 0 : activeDailyTalk.id) || null)
      }
    )))
  );
};
const RESULT_COMMENTS = {
  hakima: {
    perfect: [
      "大成功ね。星瓶堂の目利き、なかなかやるじゃない。",
      "ふん、悪くないわ。手つきも安定してきたじゃない。"
    ],
    good: [
      "悪くないわね。客の話も、ちゃんと聞けていたわ。",
      "まずまずよ。品を選ぶ感覚が、少しずつ戻ってきたわね。"
    ],
    ok: [
      "もう少しね。焦らず相手の話を聞くところからよ。",
      "惜しいわ。客の意図をつかめば、もっと楽になるわ。"
    ],
    bad: [
      "品を見る前に、客の顔を見なさい。",
      "今回はダメだったわ。でも、次で取り戻せばいい。"
    ]
  },
  mira: {
    perfect: [
      "見事です、先輩。判断の再現性も高くなっています。",
      "素晴らしいです。素材と依頼の対応が完璧でした。"
    ],
    good: [
      "良い結果です。素材と依頼の対応が整理できていますね。",
      "順調です、先輩。判断の根拠が少しずつ見えてきました。"
    ],
    ok: [
      "あと少しです。判断材料を一つずつ確認しましょう。",
      "大丈夫です、先輩。条件を分解すれば道は見えます。"
    ],
    bad: [
      "焦らなくて大丈夫です。まず依頼条件を分解しましょう。",
      "まだ早いだけです。素材の特徴から整理していきましょう。"
    ]
  },
  dariya: {
    perfect: [
      "見事だ。今日の君の判断には、迷いが少なかった。",
      "悪くない。精度も速度も、申し分ない。"
    ],
    good: [
      "悪くない。客の意図を拾う手つきが安定している。",
      "まずまずだ。判断の根拠が少しずつ固まってきたな。"
    ],
    ok: [
      "もう一歩だな。判断の根拠を静かに積み上げるといい。",
      "焦るな。条件を一つずつ確かめれば、道は開ける。"
    ],
    bad: [
      "焦りが見えたな。まずは条件を一つずつ確かめよう。",
      "今回は厳しかったな。だが、検証は次に活かせる。"
    ]
  }
};
function getResultComment(heroineId, correctCount, totalQuestions = 5) {
  const comments = RESULT_COMMENTS[heroineId];
  if (!comments) return "";
  const ratio = correctCount / totalQuestions;
  let tier;
  if (ratio >= 1) tier = "perfect";
  else if (ratio >= 0.6) tier = "good";
  else if (ratio >= 0.4) tier = "ok";
  else tier = "bad";
  const pool = comments[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}
const ResultScreen = ({
  session,
  getRankInfo: getRankInfo2,
  getWorkshopResult: getWorkshopResult2,
  containerStyle: containerStyle2,
  handleVnAreaClick,
  renderThemeStyles,
  renderBackground,
  screen,
  routeMode,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  titleStyle: titleStyle2,
  cardStyle: cardStyle2,
  vnRef,
  textSpeedMeta,
  shouldSkipTypewriter: shouldSkipTypewriter2,
  isInstantTextSpeed,
  appendVnBacklog,
  handleEndDay,
  activeHeroine,
  HeroineDisplay: HeroineDisplay2,
  getResultExpression: getResultExpression2,
  lastAffectionGain,
  buttonStyle: buttonStyle2,
  handleNextDay
}) => {
  if (!session) return null;
  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  getRankInfo2(correctCount);
  const mgmt = getWorkshopResult2(correctCount);
  const totalQuestions = session.questions.length;
  const comment = getResultComment(activeHeroine.id, correctCount, totalQuestions);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "result-screen",
      style: { ...containerStyle2, position: "relative" }
    },
    renderThemeStyles && renderThemeStyles(),
    renderBackground && renderBackground(screen),
    /* @__PURE__ */ React.createElement("div", { style: { zIndex: 10, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "0 8px" } }, /* @__PURE__ */ React.createElement(
      GameHud,
      {
        screen,
        routeMode,
        onOpenLog,
        onOpenOptions,
        onOpenHelp
      }
    ), /* @__PURE__ */ React.createElement("h1", { style: {
      ...titleStyle2,
      margin: "4px 0 0 4px",
      color: THEME.parchment,
      fontSize: "1.15em",
      textAlign: "left",
      zIndex: 10
    } }, "今回の営業記録"), /* @__PURE__ */ React.createElement("div", { style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      minWidth: 0
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "2px"
    } }, HeroineDisplay2 && /* @__PURE__ */ React.createElement(
      HeroineDisplay2,
      {
        heroine: activeHeroine,
        type: "standing",
        size: "large",
        expression: getResultExpression2(correctCount),
        noBorder: true,
        style: { filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: "20px",
      marginLeft: "-28px",
      background: "rgba(244, 233, 213, 0.92)",
      border: `1.5px solid ${THEME.brass}`,
      borderRadius: "12px",
      padding: "10px 14px",
      position: "relative",
      maxWidth: "180px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: "-8px",
      top: "16px",
      width: "0",
      height: "0",
      borderTop: "8px solid transparent",
      borderBottom: "8px solid transparent",
      borderRight: `8px solid ${THEME.brass}`
    } }), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: "-5px",
      top: "17px",
      width: "0",
      height: "0",
      borderTop: "7px solid transparent",
      borderBottom: "7px solid transparent",
      borderRight: "7px solid rgba(244, 233, 213, 0.92)"
    } }), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: "0.78em",
      color: THEME.textDark,
      lineHeight: "1.5",
      fontStyle: "italic"
    } }, comment))), /* @__PURE__ */ React.createElement("div", { style: {
      ...cardStyle2,
      borderRadius: "10px",
      border: `2px solid ${THEME.brass}`,
      background: "rgba(244, 233, 213, 0.98)",
      padding: "12px 16px",
      marginTop: "-36px",
      width: "94%",
      maxWidth: "340px",
      textAlign: "center"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "1.4em", fontWeight: "900", color: THEME.brassDark, lineHeight: 1.2 } }, session.score, " 点"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.75em", color: "#666", marginBottom: "6px" } }, "依頼 ", session.questions.length, " 件中 ", correctCount, " 件達成"), /* @__PURE__ */ React.createElement("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "4px",
      background: "rgba(0,0,0,0.04)",
      padding: "6px 4px",
      borderRadius: "6px",
      marginBottom: "6px"
    } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.65em", color: "#888" } }, "評判"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.95em", fontWeight: "bold", color: mgmt.reputation >= 0 ? THEME.oasisTeal : "#844" } }, mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.65em", color: "#888" } }, "売上"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.95em", fontWeight: "bold", color: THEME.brassDark } }, mgmt.sales, "G")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.65em", color: "#888" } }, "満足度"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.95em", fontWeight: "bold", color: mgmt.satisfaction >= 0 ? THEME.oasisTeal : "#844" } }, mgmt.satisfaction >= 0 ? `+${mgmt.satisfaction}` : mgmt.satisfaction))), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: "0.85em",
      fontWeight: "bold",
      color: activeHeroine.themeColor,
      padding: "3px 10px",
      background: `${activeHeroine.themeColor}15`,
      borderRadius: "999px",
      display: "inline-block"
    } }, activeHeroine.name, "との縁 +", lastAffectionGain)), /* @__PURE__ */ React.createElement(
      "button",
      {
        "data-testid": "day-end-next",
        onClick: handleEndDay,
        className: "vn-button-reveal",
        style: {
          ...buttonStyle2,
          width: "80%",
          maxWidth: "240px"
        }
      },
      "次の営業へ"
    )))
  );
};
function CustomerSilhouette({ customer }) {
  if (!customer) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "customer-silhouette", style: {
    borderColor: customer.color || "rgba(218, 180, 96, 0.45)"
  } });
}
const DEFAULT_LANE_DURATION_MS = 2400;
const DEFAULT_BEAT_PULSE_MS = 800;
function RhythmMock({ heroineId, themeColor, laneDurationMs = DEFAULT_LANE_DURATION_MS, beatPulseMs = DEFAULT_BEAT_PULSE_MS }) {
  const naderFace = `./characters/nader/face_proc/normal.png`;
  const heroineFace = `./characters/${heroineId}/face_proc/normal.png`;
  return /* @__PURE__ */ React.createElement("div", { style: {
    width: "100%",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    margin: "15px 0",
    pointerEvents: "none",
    userSelect: "none",
    position: "relative"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    width: "70%",
    height: "100%",
    background: `radial-gradient(ellipse at center, ${THEME.brass}11 0%, transparent 70%)`,
    zIndex: 0
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    overflow: "hidden",
    border: `2px solid ${THEME.brass}`,
    background: "rgba(35, 25, 18, 0.9)",
    opacity: 0.8,
    boxShadow: "0 0 12px rgba(0,0,0,0.6)",
    flexShrink: 0,
    zIndex: 2,
    transition: "transform 0.3s"
  } }, /* @__PURE__ */ React.createElement("img", { src: naderFace, alt: "N", style: { width: "100%", height: "100%", objectFit: "cover" } })), /* @__PURE__ */ React.createElement("div", { style: {
    flex: 1,
    maxWidth: "420px",
    height: "4px",
    background: `rgba(255,255,255,0.05)`,
    borderRadius: "2px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    width: "100%",
    height: "1px",
    background: `linear-gradient(to right, transparent, ${THEME.brass} 20%, ${THEME.brass} 80%, transparent)`,
    top: "50%",
    transform: "translateY(-50%)"
  } }), [20, 35, 65, 80].map((pos) => /* @__PURE__ */ React.createElement("div", { key: pos, style: {
    position: "absolute",
    left: `${pos}%`,
    width: "6px",
    height: "6px",
    transform: "rotate(45deg)",
    background: THEME.brass,
    boxShadow: `0 0 4px ${THEME.brass}88`,
    opacity: 0.4
  } })), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 0,
    top: "-12px",
    bottom: "-12px",
    width: "2px",
    background: `linear-gradient(to bottom, transparent, ${THEME.starGold}, transparent)`,
    boxShadow: `0 0 8px ${THEME.starGold}`,
    opacity: 0.8,
    zIndex: 2,
    animation: `beat-scanline ${laneDurationMs}ms linear infinite`
  } }), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "beat-pulse",
      style: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        border: `2px solid ${THEME.starGold}`,
        background: "rgba(255,255,255,0.2)",
        boxShadow: `0 0 15px ${THEME.starGold}aa`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      background: `radial-gradient(circle, ${THEME.starGold}66 0%, transparent 70%)`,
      zIndex: -1
    } })
  )), /* @__PURE__ */ React.createElement("div", { style: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    overflow: "hidden",
    border: `2px solid ${themeColor || THEME.brass}`,
    background: "rgba(35, 25, 18, 0.9)",
    boxShadow: `0 0 12px ${themeColor || THEME.brass}88`,
    flexShrink: 0,
    zIndex: 2,
    transition: "transform 0.3s"
  } }, /* @__PURE__ */ React.createElement("img", { src: heroineFace, alt: "H", style: { width: "100%", height: "100%", objectFit: "cover" } })), /* @__PURE__ */ React.createElement("style", null, `
        @keyframes beat-scanline {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes beat-pulse {
          0% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 15px ${THEME.starGold}aa; }
          50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 25px ${THEME.starGold}; }
          100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 15px ${THEME.starGold}aa; }
        }
        .beat-pulse { animation: beat-pulse ${beatPulseMs}ms ease-in-out infinite; }
      `));
}
function QuizHeader({ screen, routeMode, onOpenLog, onOpenOptions, onOpenHelp, headerStyle: headerStyle2, session }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    GameHud,
    {
      screen,
      routeMode,
      onOpenLog,
      onOpenOptions,
      onOpenHelp
    }
  ), /* @__PURE__ */ React.createElement("header", { style: {
    ...headerStyle2,
    background: THEME.nightBlue,
    color: THEME.sand,
    borderBottom: `2px solid ${THEME.brass}`,
    padding: "12px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    gap: "20px",
    zIndex: 10
  } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.9em" } }, "依頼件数 ", session.currentIndex + 1, " / ", session.questions.length), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "bold", color: THEME.brass } }, "報酬見込: ", session.score, " G")));
}
const COLORS = [
  { id: "AS", name: "青色", label: "星明かり (Astral)" },
  { id: "EL", name: "青緑色", label: "元素 (Elemental)" },
  { id: "LI", name: "生気", label: "生命 (Life)" },
  { id: "SA", name: "金色", label: "砂・聖 (Sacred/Sand)" },
  { id: "ME", name: "紫色", label: "精神・鉄 (Mental/Metal)" }
];
const COLOR_BY_ID = COLORS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});
const GENRES = [
  { id: "ARM", name: "武具" },
  { id: "FOD", name: "食糧" },
  { id: "MED", name: "薬品" },
  { id: "ADN", name: "アクセサリー" },
  { id: "CLT", name: "衣服" },
  { id: "DAY", name: "日用" },
  { id: "WRK", name: "道具" },
  { id: "TRV", name: "旅具" },
  { id: "RIT", name: "儀式" },
  { id: "TRD", name: "貿易" }
];
const GENRE_BY_ID = GENRES.reduce((acc, g) => {
  acc[g.id] = g;
  return acc;
}, {});
const ITEM_NAME_MAP = {
  ARM: ["短剣", "直剣", "小槍", "丸盾", "魔導杖"],
  FOD: ["旅パン", "干し果物", "香辛料瓶", "茶杯", "水筒"],
  MED: ["薬瓶", "霊薬瓶", "軟膏壺", "粉薬瓶", "丸薬箱"],
  ADN: ["指輪", "耳飾り", "首飾り", "腕輪", "留め具"],
  CLT: ["外套", "スカーフ", "旅靴", "革帯", "頭巾"],
  DAY: ["油灯", "方位磁針", "手帳", "寝袋", "小鍵"],
  WRK: ["乳鉢", "トング", "るつぼ", "計量匙", "フラスコ"],
  TRV: ["地図筒", "携帯水筒", "縄束", "旅袋", "小ランタン"],
  RIT: ["香炉", "護符飾り", "儀礼小刀", "小鈴", "香木箱"],
  TRD: ["硬貨袋", "商人秤", "封蝋印", "帳簿", "小宝箱"]
};
const ITEM_TYPES = [];
GENRES.forEach((genre) => {
  const names = ITEM_NAME_MAP[genre.id] || [];
  names.forEach((name, i) => {
    const index = (i + 1).toString().padStart(2, "0");
    ITEM_TYPES.push({
      id: `${genre.id}_${index}`,
      name,
      genre: genre.id
    });
  });
});
const ITEM_TYPE_BY_ID = ITEM_TYPES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});
function ConditionBadges({ criteria }) {
  var _a;
  const badges = [];
  if (criteria.colorId) {
    const color = COLOR_BY_ID[criteria.colorId];
    const label = ((_a = color == null ? void 0 : color.label) == null ? void 0 : _a.split(" (")[0]) || (color == null ? void 0 : color.name);
    badges.push({ text: `✧${label}`, color: THEME.starGold, bg: "rgba(218, 180, 96, 0.15)" });
  }
  if (criteria.genre) {
    const genre = GENRE_BY_ID[criteria.genre];
    badges.push({ text: `[${(genre == null ? void 0 : genre.name) || criteria.genre}]`, color: "#666", bg: "#f5f5f5" });
  }
  if (criteria.itemTypeId) {
    const type = ITEM_TYPE_BY_ID[criteria.itemTypeId];
    badges.push({ text: `[${(type == null ? void 0 : type.name) || criteria.itemTypeId}]`, color: "#666", bg: "#f5f5f5" });
  }
  return badges.map((b, i) => /* @__PURE__ */ React.createElement("span", { key: i, style: {
    fontSize: "0.75em",
    padding: "2px 8px",
    borderRadius: "4px",
    background: b.bg,
    color: b.color,
    border: `1px solid ${b.color}33`,
    fontWeight: "bold",
    letterSpacing: "0.05em"
  } }, b.text));
}
function QuizRequestCard({ currentQuestion, customerStyle: customerStyle2, bubbleStyle: bubbleStyle2 }) {
  var _a;
  return /* @__PURE__ */ React.createElement("div", { className: "quiz-question-bubble", style: { ...customerStyle2, marginBottom: "10px", justifyContent: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: {
    ...bubbleStyle2,
    width: "90%",
    height: "110px",
    background: "#fff",
    color: "#333",
    border: `2px solid ${((_a = currentQuestion.request.customer) == null ? void 0 : _a.color) || THEME.brassDark}`,
    borderRadius: "15px 15px 15px 0",
    padding: "12px 16px",
    fontSize: "0.95em",
    lineHeight: "1.4",
    boxShadow: "4px 4px 0 rgba(0,0,0,0.1)",
    transition: "all 0.3s",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    textAlign: "left",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement(CustomerSilhouette, { customer: currentQuestion.request.customer }), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "100%",
    justifyContent: "space-between"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500, flex: 1, display: "flex", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", null, currentQuestion.request.text)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", paddingBottom: "2px" } }, /* @__PURE__ */ React.createElement(ConditionBadges, { criteria: currentQuestion.request.criteria })))));
}
function QuizChoiceCard({ item, index, quizFeedback, onSelectChoice, itemCardStyle: itemCardStyle2, imageStyle: imageStyle2, itemNameStyle: itemNameStyle2, requestType }) {
  const isSelected = (quizFeedback == null ? void 0 : quizFeedback.itemId) === item.id;
  const feedbackClass = isSelected ? quizFeedback.isCorrect ? "feedback-correct" : "feedback-wrong" : "";
  const staggerClass = `quiz-option-${index}`;
  let displayChoiceName = item.name;
  if (requestType === "genre") {
    const category = item.id.split("_")[1];
    if (category === "DAY") displayChoiceName = `一般雑貨の${displayChoiceName}`;
    if (category === "TRD") displayChoiceName = `貿易品の${displayChoiceName}`;
    if (category === "RIT") displayChoiceName = `厳かな${displayChoiceName}`;
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-testid": "quiz-choice",
      key: item.id,
      onClick: () => onSelectChoice(item.id),
      className: `item-card ${staggerClass} ${feedbackClass}`,
      style: {
        ...itemCardStyle2,
        pointerEvents: quizFeedback ? "none" : "auto"
      }
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        src: `${"https://kawauikei.github.io/made-in-maghribal/"}${item.image}`.replace(/([^:])\/\//g, "$1/"),
        alt: item.name,
        style: { ...imageStyle2, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" },
        draggable: false,
        onError: (e) => {
          e.target.onerror = null;
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='10'%3EImage Not Found%3C/text%3E%3C/svg%3E";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { style: itemNameStyle2 }, displayChoiceName)
  );
}
function QuizChoiceList({ choices, quizFeedback, onSelectChoice, itemCardStyle: itemCardStyle2, imageStyle: imageStyle2, itemNameStyle: itemNameStyle2, requestType }) {
  return /* @__PURE__ */ React.createElement("div", { className: "choice-container", style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    width: "100%",
    marginTop: "20px",
    paddingBottom: "20px"
  } }, choices.map((item, index) => /* @__PURE__ */ React.createElement(
    QuizChoiceCard,
    {
      key: item.id,
      item,
      index,
      quizFeedback,
      onSelectChoice,
      itemCardStyle: itemCardStyle2,
      imageStyle: imageStyle2,
      itemNameStyle: itemNameStyle2,
      requestType
    }
  )));
}
function QuizScreen({
  quizState,
  quizActions,
  quizHelpers,
  quizStyles
}) {
  const {
    session,
    activeHeroineId,
    activeHeroine,
    quizFeedback,
    routeMode,
    screen
  } = quizState;
  const {
    onOpenLog,
    onOpenOptions,
    onOpenHelp,
    onSelectChoice
  } = quizActions;
  const {
    renderThemeStyles,
    getFullPath
  } = quizHelpers;
  const {
    containerStyle: containerStyle2,
    headerStyle: headerStyle2,
    cardStyle: cardStyle2,
    customerStyle: customerStyle2,
    bubbleStyle: bubbleStyle2,
    itemCardStyle: itemCardStyle2,
    imageStyle: imageStyle2,
    itemNameStyle: itemNameStyle2
  } = quizStyles;
  if (!session) return null;
  const currentQuestion = session.questions[session.currentIndex];
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "quiz-screen", style: containerStyle2 }, renderThemeStyles(), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${getFullPath(BACKGROUND_IMAGES.shopInteriorService.src)})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 1,
    opacity: 0.8
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.2)",
    zIndex: 2
  } }), /* @__PURE__ */ React.createElement(
    QuizHeader,
    {
      screen,
      routeMode,
      onOpenLog,
      onOpenOptions,
      onOpenHelp,
      headerStyle: headerStyle2,
      session
    }
  ), /* @__PURE__ */ React.createElement("div", { style: {
    ...cardStyle2,
    maxWidth: "800px",
    marginTop: "5px",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    boxShadow: "none",
    backdropFilter: "none",
    padding: "0 20px 20px 20px",
    zIndex: 5
  } }, /* @__PURE__ */ React.createElement(
    QuizRequestCard,
    {
      currentQuestion,
      customerStyle: customerStyle2,
      bubbleStyle: bubbleStyle2
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "quiz-rhythm-lane", style: {
    width: "calc(100% + 40px)",
    margin: "15px -20px",
    background: "rgba(26, 42, 58, 0.6)",
    borderTop: `1px solid ${THEME.brass}44`,
    borderBottom: `1px solid ${THEME.brass}44`,
    padding: "5px 0"
  } }, /* @__PURE__ */ React.createElement(RhythmMock, { heroineId: activeHeroineId, themeColor: activeHeroine == null ? void 0 : activeHeroine.themeColor })), /* @__PURE__ */ React.createElement(
    QuizChoiceList,
    {
      choices: currentQuestion.choices,
      quizFeedback,
      onSelectChoice,
      itemCardStyle: itemCardStyle2,
      imageStyle: imageStyle2,
      itemNameStyle: itemNameStyle2,
      requestType: currentQuestion.request.type
    }
  )));
}
const REQUEST_TEMPLATES = [
  {
    id: "color",
    templates: [
      "夜の砂漠を照らす、{color}の導きが要る。",
      "祝祭を彩る、{color}の品を頼むよ。",
      "朝日に映える、{color}の光が欲しい。",
      "工房の棚に映える、{color}のものが要る。"
    ]
  },
  {
    id: "genre",
    templates: [
      "旅支度の{genre}を一つ見立ててくれ。",
      "市場では得られない、上質な{genre}が要る。",
      "大学の研究に、確かな{genre}を頼む。",
      "砂嵐の中でも保存の利く{genre}が要る。"
    ]
  },
  {
    id: "itemType",
    templates: [
      "手馴染みのいい{type}を一つ見立ててくれ。",
      "星瓶堂の{type}は質が良いと聞いてね。",
      "儀礼に使う{type}の予備が欲しくてね。",
      "この店で一番の{type}を見せてほしい。"
    ]
  },
  {
    id: "colorAndItemType",
    templates: [
      "王宮へ届ける、{color}の{type}が要る。",
      "旅の守りに、{color}の{type}を頼む。",
      "星図に合う、{color}の{type}を探している。",
      "何か{color}の{type}はないかな？"
    ]
  }
];
REQUEST_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});
const DEFAULT_BASE_SCORE = 100;
function calculateScore({ isCorrect, baseScore = DEFAULT_BASE_SCORE } = {}) {
  if (isCorrect) {
    return baseScore;
  }
  return 0;
}
function getRankInfo(correctCount) {
  if (correctCount >= 5) {
    return { title: "星瓶堂の若店主", message: "客の求める品を見極める目が、もうしっかり育っています。星瓶堂の接客は、これからもっと磨けます。" };
  } else if (correctCount >= 4) {
    return { title: "若き錬金店主", message: "なかなか鋭いです。あと一歩で、さらに星瓶堂らしい判断ができそうです。" };
  } else if (correctCount >= 3) {
    return { title: "かけだし店主", message: "まずまずです。品選びの勘は、少しずつ形になっています。" };
  } else if (correctCount >= 2) {
    return { title: "星瓶堂の一歩目", message: "手応えはあります。星瓶堂の仕事に、だんだん慣れてきました。" };
  } else {
    return { title: "見習い錬金店主", message: "ここからです。星瓶堂の仕事は、ひとつずつ覚えていけば大丈夫です。" };
  }
}
const items = [
  {
    id: "IT_ARM_ME_01",
    category: "ARM",
    principle: "ME",
    index: "01",
    image: "items/IT_ARM_ME_01.png",
    variants: {
      normal: {
        description: "実用的な硬度を持たせた鉄製の短剣。日常の雑務や護身用として十分に機能する。",
        effect: "攻撃力がわずかに上昇する"
      },
      success: {
        description: "入念な変成術により粘り強さを増した短剣。刃こぼれしにくく、鋭い切れ味が長く持続する。",
        effect: "攻撃力と耐久力が上昇する"
      },
      great_success: {
        description: "丹念な研磨により白銀の輝きを放つ短剣。金属の術理が細部まで行き渡り、厚い皮鎧も容易に貫く。",
        effect: "攻撃力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ARM_EL_01",
    category: "ARM",
    principle: "EL",
    index: "01",
    image: "items/IT_ARM_EL_01.png",
    variants: {
      normal: {
        description: "微かな薬液を染み込ませた短剣。傷口を清涼感で包み込み、出血を抑える実務的な作り。",
        effect: "攻撃時に微量の体力を回復する"
      },
      success: {
        description: "滴るような光沢を持つ短剣。浸透性の高い霊薬が刃身を覆い、触れるだけで対象の毒を浄化する。",
        effect: "攻撃時の体力回復量が増加する"
      },
      great_success: {
        description: "神秘的な泡を纏う霊薬の短剣。深い癒やしの術理が宿り、振るうたびに持ち主の活力を呼び覚ます。",
        effect: "攻撃時に体力を中程度回復する"
      }
    }
  },
  {
    id: "IT_ARM_SA_01",
    category: "ARM",
    principle: "SA",
    index: "01",
    image: "items/IT_ARM_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理で表面を硬化させた短剣。砂漠の過酷な環境下でも錆びることなく機能する。",
        effect: "砂漠地帯での命中率が少し上昇する"
      },
      success: {
        description: "細かな砂丘の紋様が刻まれた短剣。摩耗に強く、研ぎ直さずとも鋭い刺突を維持できる。",
        effect: "標的の物理防御力を少し減少させる"
      },
      great_success: {
        description: "風紋が美しく浮き出た砂の短剣。表面の乾きが摩擦を減らし、回避困難なほど鋭く標的へ食い込む。",
        effect: "標的の防御力を中程度減少させる"
      }
    }
  },
  {
    id: "IT_ARM_AS_01",
    category: "ARM",
    principle: "AS",
    index: "01",
    image: "items/IT_ARM_AS_01.png",
    variants: {
      normal: {
        description: "星明かりの導きを得た短剣。暗がりでも刃先がぼやけず、夜間の護身用として扱いやすい。",
        effect: "暗所での命中率が上昇する"
      },
      success: {
        description: "夜空を映したような蒼い刃先の短剣。術理が直感を鋭く研ぎ澄ませ、敵の隙を的確に捉える。",
        effect: "クリティカル率が上昇する"
      },
      great_success: {
        description: "星霊の輝きを封じ込めた短剣。迷いを断ち切る一閃は、乱戦の中でも正確に急所へと吸い込まれる。",
        effect: "クリティカル率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ARM_LI_01",
    category: "ARM",
    principle: "LI",
    index: "01",
    image: "items/IT_ARM_LI_01.png",
    variants: {
      normal: {
        description: "微かな脈動を感じる生命の短剣。持ち手の疲労を和らげ、長時間の探索をサポートする。",
        effect: "移動によるスタミナ消費を僅かに抑える"
      },
      success: {
        description: "葉脈のような美しい筋が走る短剣。使い込むほどに手に馴染み、まるで身体の一部のように扱える。",
        effect: "攻撃速度が上昇し、疲労を軽減する"
      },
      great_success: {
        description: "暖かな温もりを放つ生命の短剣。再生の術理が循環しており、手にするだけで全身に活力が満ちる。",
        effect: "スタミナ回復速度が上昇する"
      }
    }
  },
  {
    id: "IT_ARM_ME_02",
    category: "ARM",
    principle: "ME",
    index: "02",
    image: "items/IT_ARM_ME_02.png",
    variants: {
      normal: {
        description: "基本に忠実な変成術を施した鋼の直剣。騎士や衛兵が標準的に装備する信頼性の高い武器。",
        effect: "物理ダメージが上昇する"
      },
      success: {
        description: "硬質化と軽量化を両立させた見事な直剣。金属の輝きが美しく、打ち合いでも刃が歪まない。",
        effect: "物理ダメージが上昇し、武器の摩耗を抑える"
      },
      great_success: {
        description: "高度な変成と研磨を経て完成した名剣。鋼の限界に近い硬度を誇り、あらゆる装甲を力強く両断する。",
        effect: "物理ダメージが大きく上昇する"
      }
    }
  },
  {
    id: "IT_ARM_EL_02",
    category: "ARM",
    principle: "EL",
    index: "02",
    image: "items/IT_ARM_EL_02.png",
    variants: {
      normal: {
        description: "清涼感のある薬液で鍛えられた直剣。斬撃と共に爽やかな芳香が漂い、戦場の熱気を鎮める。",
        effect: "水属性の追加ダメージを与える"
      },
      success: {
        description: "刃から常に霧状の霊薬が漏れ出す直剣。傷口から薬液が浸透し、敵の動きを僅かに鈍らせる。",
        effect: "水属性ダメージが増加し、敵の速度を低下させる"
      },
      great_success: {
        description: "清らかな滴を纏う美しい直剣。高い浸透力が敵の表面を透過し、内側から術理による衝撃を与える。",
        effect: "強力な水属性ダメージを敵に与える"
      }
    }
  },
  {
    id: "IT_ARM_SA_02",
    category: "ARM",
    principle: "SA",
    index: "02",
    image: "items/IT_ARM_SA_02.png",
    variants: {
      normal: {
        description: "砂漠の風紋を模した加工が施された直剣。砂塵の中でも視認性が高く、安定した戦果を期待できる。",
        effect: "命中率が一定値上昇する"
      },
      success: {
        description: "風紋が刻まれた刃が空気抵抗を制御する直剣。砂嵐の中でも普段と変わらぬ鋭い斬撃を繰り出せる。",
        effect: "悪天候時の命中低下を軽減し、攻撃力を高める"
      },
      great_success: {
        description: "摩耗耐性を極限まで高めた砂の直剣。激しい戦闘を重ねても刃が欠けず、常に最良の切れ味を保つ。",
        effect: "命中率が上昇し、攻撃力が大きく高まる"
      }
    }
  },
  {
    id: "IT_ARM_AS_02",
    category: "ARM",
    principle: "AS",
    index: "02",
    image: "items/IT_ARM_AS_02.png",
    variants: {
      normal: {
        description: "方位を示す術理が組み込まれた直剣。広大な砂漠での行軍において、道標のような安心感を与える。",
        effect: "マップの視界範囲が少し広がる"
      },
      success: {
        description: "星々の配置を刃に刻んだ知恵の直剣。進むべき道を示すように、敵の隙へ自然と刃が吸い込まれる。",
        effect: "回避されにくくなり、命中時に追加ダメージを与える"
      },
      great_success: {
        description: "星霊の瞬きを宿した蒼白の直剣。術者の直感を物理的な一撃へと変換し、予備動作なしの鋭い攻撃を可能にする。",
        effect: "攻撃速度と命中率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ARM_LI_02",
    category: "ARM",
    principle: "LI",
    index: "02",
    image: "items/IT_ARM_LI_02.png",
    variants: {
      normal: {
        description: "生きている木のようなしなやかさを持つ直剣。衝撃を吸収し、使用者の手首への負担を減らす。",
        effect: "受け流し成功時の被ダメージを軽減する"
      },
      success: {
        description: "淡く発光する葉脈状の紋様が浮かぶ直剣。持ち主の鼓動と同期し、戦うほどに集中力が高まる。",
        effect: "戦闘中のＨＰ継続回復を付与する"
      },
      great_success: {
        description: "心臓の鼓動を刻むかのように脈打つ直剣。絶え間ない再生の術理により、持ち主の傷を塞ぎながら戦える。",
        effect: "ＨＰ継続回復量が増加し、耐久性能が向上する"
      }
    }
  },
  {
    id: "IT_ARM_ME_03",
    category: "ARM",
    principle: "ME",
    index: "03",
    image: "items/IT_ARM_ME_03.png",
    variants: {
      normal: {
        description: "先端を硬質化した実戦用の小槍。リーチを活かした戦いで、安定した防御と攻撃を可能にする。",
        effect: "敵との距離がある場合に攻撃力が上がる"
      },
      success: {
        description: "穂先に金銀の輝きを施した美しい小槍。金属の変成により、刺突時の衝撃を一点に集中させる。",
        effect: "刺突ダメージが増加し、敵の体勢を崩しやすくなる"
      },
      great_success: {
        description: "変成と研磨の粋を集めた業物の小槍。太陽を反射する刃は、見る者を威圧し、堅牢な装甲すら穿つ。",
        effect: "刺突ダメージが大きく上昇する"
      }
    }
  },
  {
    id: "IT_ARM_EL_03",
    category: "ARM",
    principle: "EL",
    index: "03",
    image: "items/IT_ARM_EL_03.png",
    variants: {
      normal: {
        description: "薬液が穂先に滴る小槍。掠めただけでも術理が浸透し、標的の状態を不安定にさせる。",
        effect: "状態異常中の敵に対してダメージが上昇する"
      },
      success: {
        description: "常に清涼な空気を纏う霊薬の小槍。穂先から溢れる泡が敵の感覚を狂わせ、有利に立ち回れる。",
        effect: "攻撃時に確率で敵の命中率を低下させる"
      },
      great_success: {
        description: "聖なる霊液で満たされた透明感のある小槍。一突きごとに清浄な波動が広がり、不浄な気配を散らす。",
        effect: "追加の魔法ダメージを与え、敵を弱体化させる"
      }
    }
  },
  {
    id: "IT_ARM_SA_03",
    category: "ARM",
    principle: "SA",
    index: "03",
    image: "items/IT_ARM_SA_03.png",
    variants: {
      normal: {
        description: "砂の摩擦を利用して威力を高めた小槍。表面のザラつきが滑り止めとなり、確実な一突を放てる。",
        effect: "武器の持ち替え速度が上昇する"
      },
      success: {
        description: "流砂の動きを取り入れた柔軟な柄を持つ小槍。変幻自在な刺突は、予測困難な軌道で敵を貫く。",
        effect: "敵の回避率を一部無視して攻撃する"
      },
      great_success: {
        description: "砂丘の重みを宿した重厚な小槍。突き出した瞬間、周囲の砂を巻き込み、回避不能な質量攻撃を浴びせる。",
        effect: "命中率が上昇し、追加の物理ダメージを与える"
      }
    }
  },
  {
    id: "IT_ARM_AS_03",
    category: "ARM",
    principle: "AS",
    index: "03",
    image: "items/IT_ARM_AS_03.png",
    variants: {
      normal: {
        description: "夜の旅路を照らす方位の術理を持つ小槍。暗い洞窟などの探索で、即席の灯りとして重宝する。",
        effect: "周囲を明るく照らし、夜間の攻撃力が微増する"
      },
      success: {
        description: "星霊の直感を穂先に宿した導きの小槍。闇夜でも標的を違わず、遠距離からの精密な刺突を助ける。",
        effect: "投擲時の飛距離とダメージが増加する"
      },
      great_success: {
        description: "天の星図に従い軌道を補正する小槍。放たれた一撃は、まるで最初から決まっていたかのように敵を捕らえる。",
        effect: "攻撃が非常に命中しやすくなり、追加ダメージを与える"
      }
    }
  },
  {
    id: "IT_ARM_LI_03",
    category: "ARM",
    principle: "LI",
    index: "03",
    image: "items/IT_ARM_LI_03.png",
    variants: {
      normal: {
        description: "植物の蔓のようにしなる丈夫な小槍。生命の温もりがあり、長時間の保持でも疲れを感じにくい。",
        effect: "最大スタミナが少し上昇する"
      },
      success: {
        description: "再生能力を持つ特殊な木材を用いた小槍。折れても時間をかければ自己修復し、戦場での信頼性は高い。",
        effect: "戦闘終了時に装備の耐久度が微回復する"
      },
      great_success: {
        description: "脈打つ生命力が全体に満ちた小槍。持ち主の細胞を活性化させ、傷ついた肉体を癒やしながら戦場を駆ける。",
        effect: "ＨＰとスタミナの最大値を上昇させる"
      }
    }
  },
  {
    id: "IT_ARM_ME_04",
    category: "ARM",
    principle: "ME",
    index: "04",
    image: "items/IT_ARM_ME_04.png",
    variants: {
      normal: {
        description: "金属板を補強した丸盾。標準的な防御性能を持ち、飛来する矢や小剣を確実に弾き返す。",
        effect: "物理防御力が上昇する"
      },
      success: {
        description: "特殊な研磨で鏡面仕上げされた丸盾。光を反射して敵の目を眩ませつつ、堅牢な防御を提供する。",
        effect: "物理防御力が上昇し、確率で近接攻撃を反射する"
      },
      great_success: {
        description: "金属変成の粋を尽くした堅牢な丸盾。物理的な衝撃だけでなく、魔法の余波さえも跳ね返す強度を誇る。",
        effect: "物理・魔法両方の防御力が上昇する"
      }
    }
  },
  {
    id: "IT_ARM_EL_04",
    category: "ARM",
    principle: "EL",
    index: "04",
    image: "items/IT_ARM_EL_04.png",
    variants: {
      normal: {
        description: "薬液を染み込ませた革を張った丸盾。衝撃を吸収する際に、周囲に微かな癒やしの香りを放つ。",
        effect: "防御成功時に自身の状態異常蓄積を減らす"
      },
      success: {
        description: "浸透性の霊薬が表面を覆う丸盾。受けた衝撃を液体状に分散させ、重い一撃も軽やかに受け流す。",
        effect: "ガード時のスタミナ消費を軽減する"
      },
      great_success: {
        description: "清涼な泡が常に湧き出す霊薬の丸盾。盾に触れた攻撃を瞬時に減衰させ、持ち主の負担を最小限に抑える。",
        effect: "ガード成功時に体力が僅かに回復する"
      }
    }
  },
  {
    id: "IT_ARM_SA_04",
    category: "ARM",
    principle: "SA",
    index: "04",
    image: "items/IT_ARM_SA_04.png",
    variants: {
      normal: {
        description: "圧縮した砂で作られた軽量な丸盾。乾燥した表面は滑りがよく、鋭い斬撃を横へ逃がしやすい。",
        effect: "盾での受け流しが発生しやすくなる"
      },
      success: {
        description: "砂の層を幾重にも重ねた強固な丸盾。摩耗に強く、敵の武器を削り取って僅かながら消耗させる。",
        effect: "ガード時に敵の武器耐久値を僅かに削る"
      },
      great_success: {
        description: "砂丘の層が衝撃を飲み込む重厚な丸盾。飛来する攻撃を砂の術理で受け止め、威力を大幅に減衰させる。",
        effect: "遠距離攻撃によるダメージを大きく軽減する"
      }
    }
  },
  {
    id: "IT_ARM_AS_04",
    category: "ARM",
    principle: "AS",
    index: "04",
    image: "items/IT_ARM_AS_04.png",
    variants: {
      normal: {
        description: "星霊の紋章が描かれた丸盾。夜間の守りを固めるために作られ、闇の中で微かな光を放っている。",
        effect: "夜間の防御力が上昇する"
      },
      success: {
        description: "星明かりを集めて硬度に変える丸盾。持ち主の直感を助け、敵の攻撃方向を無意識に察知できる。",
        effect: "自身の背後への不意打ちダメージを軽減する"
      },
      great_success: {
        description: "夜空の配置に従い魔力を逃がす丸盾。天の運行のような安定感で、あらゆる角度からの攻撃を受け止める。",
        effect: "回避率が上昇し、全方位からの防御力が上がる"
      }
    }
  },
  {
    id: "IT_ARM_LI_04",
    category: "ARM",
    principle: "LI",
    index: "04",
    image: "items/IT_ARM_LI_04.png",
    variants: {
      normal: {
        description: "厚い樹皮を錬成して作られた丸盾。生命の温もりが伝わり、精神的な不安を和らげる効果がある。",
        effect: "一部の状態異常への耐性が少し上昇する"
      },
      success: {
        description: "葉脈が脈動するように光る生命の丸盾。受けた衝撃を吸収し、持ち主の疲労を癒やす糧とする。",
        effect: "ガード成功時にスタミナが微回復する"
      },
      great_success: {
        description: "大地の脈動を宿した生命の丸盾。持ち主の負傷に反応して治癒の波動を放ち、戦場での生存率を高める。",
        effect: "ガード成功時にＨＰとスタミナが微回復する"
      }
    }
  },
  {
    id: "IT_ARM_ME_05",
    category: "ARM",
    principle: "ME",
    index: "05",
    image: "items/IT_ARM_ME_05.png",
    variants: {
      normal: {
        description: "金属の帯で補強された木製の魔導杖。打撃武器としても頑丈で、魔法の触媒としても安定している。",
        effect: "魔法攻撃力と物理攻撃力が少し上昇する"
      },
      success: {
        description: "金属の変成により魔力伝導率を高めた魔導杖。硬質な輝きが魔力を収束させ、術の威力を底上げする。",
        effect: "魔法の詠唱速度が上昇する"
      },
      great_success: {
        description: "丹念に研磨された金属部品を配した魔導杖。魔力の流れを金属が整理し、より高純度な術の展開を可能にする。",
        effect: "消費ＭＰが減少し、魔法威力が上昇する"
      }
    }
  },
  {
    id: "IT_ARM_EL_05",
    category: "ARM",
    principle: "EL",
    index: "05",
    image: "items/IT_ARM_EL_05.png",
    variants: {
      normal: {
        description: "霊薬を吸わせたしなやかな魔導杖。先端から漂う清涼感が、術者の集中力を一定に保つのを助ける。",
        effect: "ＭＰの自然回復速度が少し上昇する"
      },
      success: {
        description: "透明な薬液が循環する美しい魔導杖。術理の浸透が早く、複雑な魔法も短時間で安定して展開できる。",
        effect: "ＭＰの自然回復速度が上昇し、知力が向上する"
      },
      great_success: {
        description: "清浄な滴を常に湛えた霊薬の魔導杖。術理の泡が精神の不純物を取り除き、高位の魔法も安定して行える。",
        effect: "ＭＰ回復速度が上昇し、魔法の威力が強化される"
      }
    }
  },
  {
    id: "IT_ARM_SA_05",
    category: "ARM",
    principle: "SA",
    index: "05",
    image: "items/IT_ARM_SA_05.png",
    variants: {
      normal: {
        description: "砂漠の古木を砂の術理で保存した魔導杖。乾燥に強く、湿気による魔力の暴発を防ぐ安定性を持つ。",
        effect: "魔法の命中率が上昇する"
      },
      success: {
        description: "砂の摩耗に耐え抜いた硬質の魔導杖。風紋が刻まれた表面は魔力を蓄えやすく、一撃に重みを出す。",
        effect: "土属性魔法の威力が上昇する"
      },
      great_success: {
        description: "悠久の砂丘に眠る記憶を宿した魔導杖。乾いた風を操り、術者の放つ土属性の魔法を広範囲へと拡散させる。",
        effect: "土属性魔法の範囲と威力が上昇する"
      }
    }
  },
  {
    id: "IT_ARM_AS_05",
    category: "ARM",
    principle: "AS",
    index: "05",
    image: "items/IT_ARM_AS_05.png",
    variants: {
      normal: {
        description: "星霊の瞬きを宿した簡素な魔導杖。暗い場所でも微かな光で周囲を照らし、術者の迷いを払う。",
        effect: "夜間の魔法威力が上昇する"
      },
      success: {
        description: "天空の図形を模った星の魔導杖。星々の配置から魔力の流れを読み解き、魔法の威力を効率よく引き出す。",
        effect: "魔法のクリティカル率が上昇する"
      },
      great_success: {
        description: "星霊の導きを色濃く反映した魔導杖。術者の直感を魔力へと変換し、敵の隙を突く致命的な術を放つ。",
        effect: "魔法のクリティカル率と威力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ARM_LI_05",
    category: "ARM",
    principle: "LI",
    index: "05",
    image: "items/IT_ARM_LI_05.png",
    variants: {
      normal: {
        description: "常に若葉を芽吹かせる生命力に満ちた魔導杖。手にするだけで疲労が和らぎ、穏やかな心をもたらす。",
        effect: "最大ＨＰが少し上昇する"
      },
      success: {
        description: "脈動する葉脈が魔力を運ぶ生命の魔導杖。術者の心身と共鳴し、回復魔法の効果を効率よく高める。",
        effect: "回復魔法の回復量が上昇する"
      },
      great_success: {
        description: "豊かな再生の術理を宿した生命の魔導杖。周囲に活力を振りまき、術者だけでなく仲間の疲労をも癒やす。",
        effect: "ＨＰの最大値と回復魔法の効果が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ADN_ME_01",
    category: "ADN",
    principle: "ME",
    index: "01",
    image: "items/IT_ADN_ME_01.png",
    variants: {
      normal: {
        description: "金属の術理で強度を高めた鉄の指輪。変形に強く、日常的な作業中でも安心して身につけられる。",
        effect: "物理防御力がわずかに上昇する"
      },
      success: {
        description: "表面を美しく研磨した白銀の指輪。術理の反射が邪な魔力を僅かに退け、持ち主の身を守る。",
        effect: "物理と魔法の防御力が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な指輪。高度な構造強化により、装着者の肉体に強靭な保護膜を形成する。",
        effect: "物理防御力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ADN_EL_01",
    category: "ADN",
    principle: "EL",
    index: "01",
    image: "items/IT_ADN_EL_01.png",
    variants: {
      normal: {
        description: "微かな薬液が染み込んだ青緑の指輪。肌に触れる冷たさが、長旅の疲れを僅かに癒やしてくれる。",
        effect: "状態異常への耐性が少し上昇する"
      },
      success: {
        description: "常に清涼な滴が結ぶ霊薬の指輪。浸透する術理が血行を整え、精神的な動揺を鎮める効果がある。",
        effect: "毒と麻痺への耐性が上昇する"
      },
      great_success: {
        description: "内部で霊薬の泡が動く不思議な指輪。術理の浸透が心身を浄化し、あらゆる不調を未然に防ぎ止める。",
        effect: "全ての状態異常への耐性が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_SA_01",
    category: "ADN",
    principle: "SA",
    index: "01",
    image: "items/IT_ADN_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂粒を樹脂で固めた指輪。琥珀のような質感があり、砂漠の過酷な熱から肌を守る。",
        effect: "火属性ダメージをわずかに軽減する"
      },
      success: {
        description: "風紋が刻まれた硬質の砂指輪。摩耗に強く、砂嵐の中を歩いても輝きが失われることはない。",
        effect: "土属性ダメージを軽減し、命中率を補正する"
      },
      great_success: {
        description: "悠久の砂丘の術理を宿した指輪。装着者の周囲に薄い砂の膜を作り、飛来する砂塵や魔力を受け流す。",
        effect: "土属性耐性が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ADN_AS_01",
    category: "ADN",
    principle: "AS",
    index: "01",
    image: "items/IT_ADN_AS_01.png",
    variants: {
      normal: {
        description: "星明かりを模した装飾が施された指輪。夜間の視認性を高め、暗い場所での作業効率を上げる。",
        effect: "夜間の命中率が少し上昇する"
      },
      success: {
        description: "方位を示す術理が宿る星霊の指輪。目的地を予感させる直感を授け、無駄な動きを減らしてくれる。",
        effect: "回避率が上昇する"
      },
      great_success: {
        description: "青い光を放つ星霊の指輪。未来の予兆を僅かに感じ取り、敵の鋭い一撃を未然に回避する助けとなる。",
        effect: "回避率と直感力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ADN_LI_01",
    category: "ADN",
    principle: "LI",
    index: "01",
    image: "items/IT_ADN_LI_01.png",
    variants: {
      normal: {
        description: "しなやかな蔦を錬成した生命の指輪。脈動するような温もりがあり、着用者の活力を引き出す。",
        effect: "最大スタミナがわずかに上昇する"
      },
      success: {
        description: "葉脈の紋様が浮き出る生命の指輪。装着者の鼓動と同期し、傷ついた細胞の成長を緩やかに促す。",
        effect: "ＨＰの自然回復量が上昇する"
      },
      great_success: {
        description: "瑞々しい緑の光を放つ生命の指輪。溢れる活力を指先から全身へ循環させ、衰えぬスタミナを授ける。",
        effect: "最大スタミナとＨＰ回復量が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_ME_02",
    category: "ADN",
    principle: "ME",
    index: "02",
    image: "items/IT_ADN_ME_02.png",
    variants: {
      normal: {
        description: "金属の術理で耐久性を高めた耳飾り。激しい動きでも壊れにくく、旅人の装身具として適している。",
        effect: "魔法防御力がわずかに上昇する"
      },
      success: {
        description: "研磨された金属が光を反射する耳飾り。邪悪な気配を反射で退け、術者の精神を強固に保つ。",
        effect: "沈黙状態への耐性が上昇する"
      },
      great_success: {
        description: "緻密な金細工が施された耳飾り。構造強化の術理により、装着者の魔力感度を物理的に安定させる。",
        effect: "魔法防御力と知力が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_EL_02",
    category: "ADN",
    principle: "EL",
    index: "02",
    image: "items/IT_ADN_EL_02.png",
    variants: {
      normal: {
        description: "滴の形をした霊薬の耳飾り。微かな清涼感を耳元に与え、暑い砂漠でも集中力を維持できる。",
        effect: "ＭＰの自然回復速度がわずかに上昇する"
      },
      success: {
        description: "透明感のある青緑の液を封じた耳飾り。霊薬の浸透術理により、疲弊した精神を常に調整し続ける。",
        effect: "ＭＰの自然回復速度が上昇する"
      },
      great_success: {
        description: "常に微細な泡が湧き出す霊薬の耳飾り。癒やしの術理が絶えず脳をリフレッシュし、高度な思考を支える。",
        effect: "最大ＭＰと回復速度が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_SA_02",
    category: "ADN",
    principle: "SA",
    index: "02",
    image: "items/IT_ADN_SA_02.png",
    variants: {
      normal: {
        description: "砂粒を集めて固めた小ぶりな耳飾り。乾燥の術理により湿気を払い、清潔な状態を長く保てる。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "砂丘の曲線を表現した美しい耳飾り。保存の術理が持ち主の気力を維持し、長旅の消耗を抑える。",
        effect: "空腹度の減少速度が少し低下する"
      },
      great_success: {
        description: "風紋が刻まれた琥珀色の耳飾り。過酷な砂漠の旅路を生き抜くための術理が、着用者の生存本能を刺激する。",
        effect: "土属性耐性とスタミナ消費軽減を付与する"
      }
    }
  },
  {
    id: "IT_ADN_AS_02",
    category: "ADN",
    principle: "AS",
    index: "02",
    image: "items/IT_ADN_AS_02.png",
    variants: {
      normal: {
        description: "小さな青い石を配した星霊の耳飾り。夜道で微かな光を放ち、足元の不安を僅かに解消する。",
        effect: "夜間の視界範囲が少し広がる"
      },
      success: {
        description: "方位の術理を帯びた星霊の耳飾り。耳元で微かに共鳴し、隠れた気配や罠を直感で察知しやすくする。",
        effect: "罠の回避率が上昇する"
      },
      great_success: {
        description: "星明かりを凝縮した神秘的な耳飾り。星々の運行から予兆を読み取り、危機を察知する感覚を研ぎ澄ます。",
        effect: "不意打ちを受ける確率を軽減する"
      }
    }
  },
  {
    id: "IT_ADN_LI_02",
    category: "ADN",
    principle: "LI",
    index: "02",
    image: "items/IT_ADN_LI_02.png",
    variants: {
      normal: {
        description: "脈動するような細工が施された耳飾り。生命の術理が着用者の活力を呼び覚まし、眠気を払う。",
        effect: "スタミナ回復速度がわずかに上昇する"
      },
      success: {
        description: "赤や緑の細い筋が走る生命の耳飾り。葉脈を通じて魔力が循環し、術者の回復魔法の効果を高める。",
        effect: "回復魔法の効果が上昇する"
      },
      great_success: {
        description: "豊かな成長の術理を宿した耳飾り。着用者の生命力と深く馴染み、傷ついた肉体を内側から鼓舞する。",
        effect: "スタミナ回復速度と最大ＨＰが上昇する"
      }
    }
  },
  {
    id: "IT_ADN_ME_03",
    category: "ADN",
    principle: "ME",
    index: "03",
    image: "items/IT_ADN_ME_03.png",
    variants: {
      normal: {
        description: "構造強化を施した金属の首飾り。物理的な衝撃から喉元を守り、旅の安全を最低限確保する。",
        effect: "物理防御力が少し上昇する"
      },
      success: {
        description: "金銀の縁取りが輝く洗練された首飾り。研磨された表面が魔法の波動を僅かに散らし、守りを固める。",
        effect: "魔法耐性が上昇する"
      },
      great_success: {
        description: "重厚な装飾と高い耐久性を兼ね備えた首飾り。装着者の体幹を金属の術理で支え、激しい打撃に耐えさせる。",
        effect: "物理防御力と最大重量が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_EL_03",
    category: "ADN",
    principle: "EL",
    index: "03",
    image: "items/IT_ADN_EL_03.png",
    variants: {
      normal: {
        description: "霊薬を封じた小瓶が下がる首飾り。微かな青緑の輝きが、着用者の心を穏やかに保つ助けとなる。",
        effect: "精神的な状態異常への耐性が上昇する"
      },
      success: {
        description: "浸透力の高い霊薬を織り込んだ首飾り。肌から直接癒やしの術理が伝わり、疲労の蓄積を緩和する。",
        effect: "疲労状態になりにくくなる"
      },
      great_success: {
        description: "清涼感に満ちた雫が連なる首飾り。調整された霊薬の術理が、着用者の魔力回路を常に最適な状態に保つ。",
        effect: "魔法攻撃力と精神耐性が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_SA_03",
    category: "ADN",
    principle: "SA",
    index: "03",
    image: "items/IT_ADN_SA_03.png",
    variants: {
      normal: {
        description: "乾燥した砂粒を紐で繋いだ首飾り。保存の術理により、持ち歩く食料や水が悪くなるのを僅かに防ぐ。",
        effect: "所持品の劣化速度を少し遅らせる"
      },
      success: {
        description: "砂丘の風紋を精巧に彫り込んだ首飾り。琥珀の術理が長旅の足取りを軽くし、摩耗しがちな集中力を守る。",
        effect: "移動速度が少し上昇する"
      },
      great_success: {
        description: "悠久の旅路を支える砂の首飾り。過酷な環境下での摩耗を術理で肩代わりし、肉体の消耗を劇的に抑える。",
        effect: "全属性耐性と移動速度が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_AS_03",
    category: "ADN",
    principle: "AS",
    index: "03",
    image: "items/IT_ADN_AS_03.png",
    variants: {
      normal: {
        description: "星霊の直感を高める青い石の首飾り。夜空の下で瞑想すれば、進むべき方向が微かに見えてくる。",
        effect: "命中率が上昇する"
      },
      success: {
        description: "方位と方位を繋ぐ星明かりの首飾り。予兆を感じ取る感覚が冴え、戦闘時の的確な判断を助ける。",
        effect: "回避率と命中率が上昇する"
      },
      great_success: {
        description: "星々の運行が刻まれた神秘的な首飾り。常に方位を指し示す術理が、迷いの中にいる者の直感を導く。",
        effect: "クリティカル率と命中率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ADN_LI_03",
    category: "ADN",
    principle: "LI",
    index: "03",
    image: "items/IT_ADN_LI_03.png",
    variants: {
      normal: {
        description: "葉脈を模した細工が施された生命の首飾り。着用者の脈動と共鳴し、全身に柔らかな活力を送る。",
        effect: "最大ＨＰが上昇する"
      },
      success: {
        description: "瑞々しい緑を帯びた生命の首飾り。回復の術理が血液の流れを助け、自然治癒力を段階的に引き上げる。",
        effect: "ＨＰの自然回復速度が上昇する"
      },
      great_success: {
        description: "脈動する赤と緑の結晶を配した首飾り。生命の奔流が肉体を常に成長させ、衰えぬ活力を全身に行き渡らせる。",
        effect: "最大ＨＰとＨＰ回復速度が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_ME_04",
    category: "ADN",
    principle: "ME",
    index: "04",
    image: "items/IT_ADN_ME_04.png",
    variants: {
      normal: {
        description: "金属の術理で強度を上げた腕輪。物理的な防御手段としても機能し、咄嗟の攻撃を弾きやすい。",
        effect: "防御力がわずかに上昇する"
      },
      success: {
        description: "美しい研磨が施された白銀の腕輪。構造強化により、装着者の腕の力を効率よく武器へと伝える。",
        effect: "攻撃力が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された重厚な腕輪。耐久性の高い術理が装着者の腕力を支え、重い武器の扱いを楽にする。",
        effect: "攻撃力と最大重量が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_EL_04",
    category: "ADN",
    principle: "EL",
    index: "04",
    image: "items/IT_ADN_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を染み込ませた青緑の腕輪。浸透する清涼感が、腕の疲労を僅かに和らげてくれる。",
        effect: "攻撃の命中精度が少し上昇する"
      },
      success: {
        description: "霊薬の滴を閉じ込めた美しい腕輪。調整の術理が腕の筋肉を最適化し、素早い連続攻撃を可能にする。",
        effect: "攻撃速度が少し上昇する"
      },
      great_success: {
        description: "常に微細な泡を放つ霊薬の腕輪。癒やしの術理が筋肉の乳酸を分解し続け、休む間もない連撃を支える。",
        effect: "攻撃速度とスタミナ効率が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_SA_04",
    category: "ADN",
    principle: "SA",
    index: "04",
    image: "items/IT_ADN_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂粒を編み込んだ腕輪。琥珀の術理が腕の蒸れを防ぎ、常に快適な状態を維持する。",
        effect: "土属性耐性が少し上昇する"
      },
      success: {
        description: "風紋が刻まれた硬質の砂腕輪。摩耗に強い術理が防具との擦れを抑え、長時間の装備でも痛まない。",
        effect: "防具の耐久減少速度を少し遅らせる"
      },
      great_success: {
        description: "悠久の砂丘から切り出した術理の腕輪。保存の術理が着用者の筋力を維持し、極限状態でも力を発揮させる。",
        effect: "全能力の低下を防ぎ、防御力を上げる"
      }
    }
  },
  {
    id: "IT_ADN_AS_04",
    category: "ADN",
    principle: "AS",
    index: "04",
    image: "items/IT_ADN_AS_04.png",
    variants: {
      normal: {
        description: "星霊の光を宿した青い腕輪。夜間でも腕の動きを正確に把握でき、暗闇でのミスを減らす。",
        effect: "夜間の攻撃力が少し上昇する"
      },
      success: {
        description: "方位を指し示す方位磁針付きの腕輪。星明かりの術理が直感を助け、敵のガードを掻い潜る一撃を導く。",
        effect: "ガード不能攻撃の発生率が微増する"
      },
      great_success: {
        description: "夜空の星々を映し出す神秘的な腕輪。予兆を感じる術理が腕の動きを加速させ、回避困難な刺突を実現する。",
        effect: "命中率と攻撃速度が大きく上昇する"
      }
    }
  },
  {
    id: "IT_ADN_LI_04",
    category: "ADN",
    principle: "LI",
    index: "04",
    image: "items/IT_ADN_LI_04.png",
    variants: {
      normal: {
        description: "脈動する蔦を錬成した生命の腕輪。温もりの術理が手の冷えを防ぎ、常に最高のコンディションを保つ。",
        effect: "最大スタミナが上昇する"
      },
      success: {
        description: "葉脈のような血管が浮かぶ生命の腕輪。装着者の活力と馴染み、消費したスタミナを素早く補填する。",
        effect: "スタミナ回復速度が上昇する"
      },
      great_success: {
        description: "赤と緑の光が循環する生命の腕輪。成長の術理が装着者の腕を強化し、鋼のような一撃を可能にする。",
        effect: "スタミナ回復速度と攻撃力が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_ME_05",
    category: "ADN",
    principle: "ME",
    index: "05",
    image: "items/IT_ADN_ME_05.png",
    variants: {
      normal: {
        description: "金属の術理で補強された留め具。マントやカバンをしっかりと固定し、激しい運動でも外れない。",
        effect: "装備品の耐久性がわずかに上昇する"
      },
      success: {
        description: "精巧に研磨された金属の留め具。構造強化により、身につけている衣服の防御性能を僅かに引き上げる。",
        effect: "物理防御力が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが美しい豪華な留め具。金属の術理が全身の装備品を一つに束ね、強固な一体感を生み出す。",
        effect: "全身の物理防御力が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_EL_05",
    category: "ADN",
    principle: "EL",
    index: "05",
    image: "items/IT_ADN_EL_05.png",
    variants: {
      normal: {
        description: "霊薬の滴をあしらった留め具。肌に触れる微かな清涼感が、精神的な負担を僅かに軽減する。",
        effect: "ＭＰの最大値がわずかに上昇する"
      },
      success: {
        description: "青緑の霊液を封じ込めた留め具。調整の術理が全身の魔力回路を整え、魔法の効果を僅かに高める。",
        effect: "魔法攻撃力が上昇する"
      },
      great_success: {
        description: "神秘的な泡を放つ霊薬の留め具。癒やしの術理が常に持ち主の意識を鮮明に保ち、高度な術式を支える。",
        effect: "ＭＰ最大値と魔法攻撃力が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_SA_05",
    category: "ADN",
    principle: "SA",
    index: "05",
    image: "items/IT_ADN_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂を固めた素朴な留め具。保存の術理が衣類の劣化を防ぎ、砂漠の過酷な気候から守ってくれる。",
        effect: "衣服の耐久減少速度を少し遅らせる"
      },
      success: {
        description: "風紋が刻まれた琥珀の留め具。砂漠の術理が着用者の周囲を僅かに乾燥させ、動きを軽快にする。",
        effect: "移動速度がわずかに上昇する"
      },
      great_success: {
        description: "悠久の砂丘の術理が宿る留め具。摩耗を拒む性質が、全身の装備品を砂塵や熱による風化から守り抜く。",
        effect: "全装備の耐久減少速度を大きく遅らせる"
      }
    }
  },
  {
    id: "IT_ADN_AS_05",
    category: "ADN",
    principle: "AS",
    index: "05",
    image: "items/IT_ADN_AS_05.png",
    variants: {
      normal: {
        description: "星明かりを映す青い留め具。夜間の視認性を高め、仲間との位置確認を容易にする。",
        effect: "夜間の回避率が少し上昇する"
      },
      success: {
        description: "方位の術理を帯びた星霊の留め具。直感を僅かに高め、探索中の幸運な発見を増やす助けとなる。",
        effect: "アイテム発見率がわずかに上昇する"
      },
      great_success: {
        description: "予兆を読み取る青い光の留め具。星霊の導きが持ち主の不運を払い、最善の選択へと感覚を仕向ける。",
        effect: "アイテム発見率とクリティカル率が上昇する"
      }
    }
  },
  {
    id: "IT_ADN_LI_05",
    category: "ADN",
    principle: "LI",
    index: "05",
    image: "items/IT_ADN_LI_05.png",
    variants: {
      normal: {
        description: "脈動する生命の欠片を用いた留め具。肌に馴染む温もりが、着用者の疲労を僅かに吸い取ってくれる。",
        effect: "スタミナ消費がわずかに減少する"
      },
      success: {
        description: "葉脈が走る赤や緑の留め具。生命の術理が装着者の活力と融合し、自然治癒力を僅かに底上げする。",
        effect: "ＨＰの自然回復量が上昇する"
      },
      great_success: {
        description: "豊かな活力に満ちた生命の留め具。着用者の鼓動に合わせて光を放ち、肉体の限界を術理で引き上げる。",
        effect: "ＨＰとスタミナの最大値が上昇する"
      }
    }
  },
  {
    id: "IT_MED_ME_01",
    category: "MED",
    principle: "ME",
    index: "01",
    image: "items/IT_MED_ME_01.png",
    variants: {
      normal: {
        description: "金属粉を混ぜた補強用の薬瓶。移動中の衝撃に強く、中の薬液を物理的な振動から守る。",
        effect: "投擲時のダメージがわずかに上昇する"
      },
      success: {
        description: "内部を研磨し、構造を強化した薬瓶。中の成分が変質しにくく、薬の効き目が一定時間維持される。",
        effect: "薬の効果持続時間が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された頑丈な薬瓶。金属の術理が成分の純度を保ち、投擲時には確実に飛散する。",
        effect: "薬の効果持続時間と威力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_MED_EL_01",
    category: "MED",
    principle: "EL",
    index: "01",
    image: "items/IT_MED_EL_01.png",
    variants: {
      normal: {
        description: "霊薬を主成分とした標準的な薬瓶。青緑の液体が浸透しやすく、軽微な負傷を素早く癒やす。",
        effect: "ＨＰを少量回復する"
      },
      success: {
        description: "調整された霊薬を詰めた薬瓶。清涼感のある泡が傷口の痛みを引き、心身の乱れを即座に整える。",
        effect: "ＨＰを中程度回復する"
      },
      great_success: {
        description: "極めて純度の高い霊薬を詰めた薬瓶。癒やしの術理が全身の隅々まで浸透し、活力を瞬時に蘇らせる。",
        effect: "ＨＰを大きく回復する"
      }
    }
  },
  {
    id: "IT_MED_SA_01",
    category: "MED",
    principle: "SA",
    index: "01",
    image: "items/IT_MED_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂を錬成して作った薬瓶。保存性が高く、砂漠の高温下でも薬液が蒸発しにくい。",
        effect: "長期間の保存でも効果が劣化しない"
      },
      success: {
        description: "琥珀のような質感を持つ砂の薬瓶。風紋の術理が中の成分を安定させ、服用後の副作用を抑える。",
        effect: "回復時にデバフを解除する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の薬瓶。成分が時を超えて固定されており、服用すると肉体の鮮度を維持する。",
        effect: "ＨＰを回復し、一定時間能力低下を防ぐ"
      }
    }
  },
  {
    id: "IT_MED_AS_01",
    category: "MED",
    principle: "AS",
    index: "01",
    image: "items/IT_MED_AS_01.png",
    variants: {
      normal: {
        description: "星明かりの成分を混ぜた薬瓶。服用すると夜間の視界が僅かに晴れ、足元の不安が解消される。",
        effect: "一定時間、暗視効果を得る"
      },
      success: {
        description: "方位の術理を帯びた青い薬瓶。直感を研ぎ澄ます効果があり、短時間ながら攻撃の精度を高める。",
        effect: "一定時間、命中率が大きく上昇する"
      },
      great_success: {
        description: "予兆を読み取る星霊の薬瓶。星明かりの術理が服用者の感覚を未来へと繋ぎ、回避能力を飛躍させる。",
        effect: "一定時間、回避率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_MED_LI_01",
    category: "MED",
    principle: "LI",
    index: "01",
    image: "items/IT_MED_LI_01.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い薬瓶。葉脈のように魔力が広がり、肉体の基本的な活力を引き出す。",
        effect: "最大スタミナを一時的に上昇させる"
      },
      success: {
        description: "活力に溢れる生命の薬瓶。赤や緑の光が混ざり合い、消費したエネルギーを急速に充填する。",
        effect: "スタミナを大きく回復する"
      },
      great_success: {
        description: "成長の術理を極限まで高めた薬瓶。生命の奔流が全身を駆け巡り、あらゆる疲労を根こそぎ解消する。",
        effect: "スタミナとＨＰを大きく回復する"
      }
    }
  },
  {
    id: "IT_MED_ME_02",
    category: "MED",
    principle: "ME",
    index: "02",
    image: "items/IT_MED_ME_02.png",
    variants: {
      normal: {
        description: "金属片を微細化した成分を含む霊薬瓶。肌の表面を硬質化させ、物理的な打撃への耐性を高める。",
        effect: "一定時間、物理防御力が上昇する"
      },
      success: {
        description: "高度に研磨された成分を含む霊薬瓶。金属の術理が皮膚の柔軟性を保ちつつ、鋼のような強度を与える。",
        effect: "物理防御力が大きく上昇する"
      },
      great_success: {
        description: "金銀の術理を溶かし込んだ高貴な霊薬瓶。全身の構造を一時的に強化し、重い攻撃さえも弾き飛ばす。",
        effect: "物理防御力上昇とノックバック耐性を付与する"
      }
    }
  },
  {
    id: "IT_MED_EL_02",
    category: "MED",
    principle: "EL",
    index: "02",
    image: "items/IT_MED_EL_02.png",
    variants: {
      normal: {
        description: "青緑の輝きを放つ標準的な霊薬瓶。調整された霊液が精神を沈め、魔力の循環を僅かに助ける。",
        effect: "ＭＰを少量回復する"
      },
      success: {
        description: "泡が絶えず湧き出す調整済みの霊薬瓶。清涼感と共に霊液が浸透し、枯渇した魔力を効率よく補う。",
        effect: "ＭＰを中程度回復する"
      },
      great_success: {
        description: "癒やしの術理を極限まで濃縮した霊薬瓶。一滴ごとに深い安らぎを授け、精神を魔法の最適状態に置く。",
        effect: "ＭＰを大きく回復する"
      }
    }
  },
  {
    id: "IT_MED_SA_02",
    category: "MED",
    principle: "SA",
    index: "02",
    image: "items/IT_MED_SA_02.png",
    variants: {
      normal: {
        description: "乾燥した砂漠の植物から抽出した霊薬瓶。喉の乾きを抑え、過酷な環境下での活動を支える。",
        effect: "一定時間、喉の渇きを無効化する"
      },
      success: {
        description: "摩耗を抑える砂の術理を帯びた霊薬瓶。肉体の消耗を保存の力で防ぎ、長時間の全力疾走を可能にする。",
        effect: "スタミナ消費速度を一定時間低下させる"
      },
      great_success: {
        description: "悠久の砂丘から得た琥珀の霊薬瓶。風紋の術理が肉体の老化反応を一時的に止め、絶頂期の力を維持する。",
        effect: "一定時間、スタミナ消費がゼロになる"
      }
    }
  },
  {
    id: "IT_MED_AS_02",
    category: "MED",
    principle: "AS",
    index: "02",
    image: "items/IT_MED_AS_02.png",
    variants: {
      normal: {
        description: "星霊の直感を刺激する成分入りの霊薬瓶。夜間の戦闘で迷いを減らし、冷静な判断を可能にする。",
        effect: "夜間の魔法威力が上昇する"
      },
      success: {
        description: "方位の術理が宿る青い光の霊薬瓶。周囲の魔力を予感する力が冴え、敵の魔法を回避しやすくなる。",
        effect: "一定時間、魔法回避率が上昇する"
      },
      great_success: {
        description: "星明かりを濃縮した神秘的な霊薬瓶。未来の予兆を脳裏に映し出し、術者の思考速度を極限まで高める。",
        effect: "魔法攻撃力上昇と詠唱時間短縮を付与する"
      }
    }
  },
  {
    id: "IT_MED_LI_02",
    category: "MED",
    principle: "LI",
    index: "02",
    image: "items/IT_MED_LI_02.png",
    variants: {
      normal: {
        description: "生命の脈動を伝える赤色の霊薬瓶。体内の魔力葉脈を活性化させ、一時的に魔法の威力を底上げする。",
        effect: "一定時間、魔法攻撃力が上昇する"
      },
      success: {
        description: "豊かな活力を宿した赤と緑の霊薬瓶。再生の術理が細胞を鼓舞し、傷ついた肉体を徐々に修復する。",
        effect: "一定時間、ＨＰが継続的に回復する"
      },
      great_success: {
        description: "成長の奔流を封じ込めた生命の霊薬瓶。体内の活力を劇的に増幅させ、爆発的な生命の輝きを授ける。",
        effect: "最大ＨＰ上昇とＨＰ継続回復を付与する"
      }
    }
  },
  {
    id: "IT_MED_ME_03",
    category: "MED",
    principle: "ME",
    index: "03",
    image: "items/IT_MED_ME_03.png",
    variants: {
      normal: {
        description: "金属の術理で保存性を高めた軟膏壺。傷口に塗ると薄い膜を張り、雑菌や砂塵の侵入を防いでくれる。",
        effect: "傷の悪化を防止し、物理防御を微増させる"
      },
      success: {
        description: "細かく研磨された金属粉入りの軟膏壺。構造強化の術理が皮膚の再生を助け、裂傷を素早く塞ぐ。",
        effect: "裂傷状態を回復し、防御力を高める"
      },
      great_success: {
        description: "金銀の術理が宿る高貴な軟膏壺。塗った箇所を即座に鋼のように硬化させ、あらゆる痛みを遮断する。",
        effect: "出血・裂傷を回復し、物理ダメージを大幅軽減する"
      }
    }
  },
  {
    id: "IT_MED_EL_03",
    category: "MED",
    principle: "EL",
    index: "03",
    image: "items/IT_MED_EL_03.png",
    variants: {
      normal: {
        description: "霊薬をベースにした青緑の軟膏壺。清涼感のある香りが広がり、炎症や腫れを優しく鎮めてくれる。",
        effect: "火傷状態を回復する"
      },
      success: {
        description: "浸透力の高い霊薬を配合した軟膏壺。泡の術理が皮膚の奥まで癒やしを届け、火傷の痕を残さず癒やす。",
        effect: "火傷と毒状態を回復する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の軟膏壺。調整された霊液が壊死した組織さえも浄化し、元の美しい肌へ戻す。",
        effect: "全ての状態異常を回復し、ＨＰを少量回復する"
      }
    }
  },
  {
    id: "IT_MED_SA_03",
    category: "MED",
    principle: "SA",
    index: "03",
    image: "items/IT_MED_SA_03.png",
    variants: {
      normal: {
        description: "乾燥した薬草を砂の術理で固めた軟膏壺。水分を吸い取る力が強く、化膿した傷口の乾燥に役立つ。",
        effect: "麻痺状態の蓄積をわずかに減少させる"
      },
      success: {
        description: "保存性が極めて高い琥珀色の軟膏壺。風紋の術理が傷口を保護し、過酷な砂嵐の中でも治癒を促す。",
        effect: "麻痺状態を回復し、土属性耐性を上げる"
      },
      great_success: {
        description: "悠久の砂丘の知恵が詰まった軟膏壺。摩耗した皮膚を保存の術理で固定し、肉体の損傷を無かったことにする。",
        effect: "麻痺・石化を回復し、防御力を大きく上げる"
      }
    }
  },
  {
    id: "IT_MED_AS_03",
    category: "MED",
    principle: "AS",
    index: "03",
    image: "items/IT_MED_AS_03.png",
    variants: {
      normal: {
        description: "星明かりの粉を混ぜた青い軟膏壺。夜間に塗ると患部が微かに光り、回復の予兆を着用者に伝える。",
        effect: "夜間のＨＰ自然回復速度が上昇する"
      },
      success: {
        description: "方位の術理を帯びた星霊の軟膏壺。直感を高める成分が神経を整え、しびれた四肢の感覚を呼び戻す。",
        effect: "麻痺と混乱を回復し、命中率を上げる"
      },
      great_success: {
        description: "予兆を読み取る青い光の軟膏壺。星霊の導きが肉体の不調を予見するように取り除き、最良の状態へ導く。",
        effect: "混乱・恐怖・麻痺を回復し、回避率を上げる"
      }
    }
  },
  {
    id: "IT_MED_LI_03",
    category: "MED",
    principle: "LI",
    index: "03",
    image: "items/IT_MED_LI_03.png",
    variants: {
      normal: {
        description: "脈動する植物の髄を用いた生命の軟膏壺。葉脈を通じて活力を送り込み、打撲や捻挫の治りを早める。",
        effect: "打撃属性ダメージへの耐性を上げる"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の軟膏壺。再生の術理が肉体の成長を促し、折れた骨さえも接合しやすくする。",
        effect: "骨折状態を回復し、最大ＨＰを増やす"
      },
      great_success: {
        description: "豊かな成長の術理を宿した生命の軟膏壺。肌に塗った瞬間から肉体が脈動し、驚異的な速度で完治させる。",
        effect: "全ての負傷状態を回復し、ＨＰ回復速度を上げる"
      }
    }
  },
  {
    id: "IT_MED_ME_04",
    category: "MED",
    principle: "ME",
    index: "04",
    image: "items/IT_MED_ME_04.png",
    variants: {
      normal: {
        description: "金属の術理で粒度を均一にした粉薬瓶。構造強化により体内への吸収が速く、即座に効果を発揮する。",
        effect: "魔法の詠唱速度が一時的にわずかに上昇する"
      },
      success: {
        description: "研磨された成分が魔力を反射する粉薬瓶。金属の術理が精神の防壁を固め、外部からの干渉を防ぐ。",
        effect: "一定時間、沈黙状態への耐性を得る"
      },
      great_success: {
        description: "金銀の輝きを粉末にした豪華な粉薬瓶。全身の魔力回路を金属の術理でコーティングし、魔法耐性を高める。",
        effect: "魔法防御力と詠唱速度が大きく上昇する"
      }
    }
  },
  {
    id: "IT_MED_EL_04",
    category: "MED",
    principle: "EL",
    index: "04",
    image: "items/IT_MED_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を乾燥させて粉末にした薬瓶。青緑の粉が唾液と共に浸透し、荒れた喉や精神を優しく癒やす。",
        effect: "沈黙状態を解除する"
      },
      success: {
        description: "泡の術理を封じ込めた清涼な粉薬瓶。調整された霊液粉末が瞬時に溶け、魔力の滞りを速やかに解消する。",
        effect: "沈黙と睡眠を解除し、ＭＰを微回復する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の粉薬瓶。一吹きで精神が透明な雫のように澄み渡り、最高の集中力を授ける。",
        effect: "沈黙を解除し、一定時間消費ＭＰを軽減する"
      }
    }
  },
  {
    id: "IT_MED_SA_04",
    category: "MED",
    principle: "SA",
    index: "04",
    image: "items/IT_MED_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂漠の根から作った粉薬瓶。琥珀の術理が胃腸を保護し、旅先での食あたりを未然に防ぐ。",
        effect: "病気状態の蓄積をわずかに減少させる"
      },
      success: {
        description: "保存の術理が極めて強い琥珀色の粉薬瓶。風紋の力が体内の水分バランスを固定し、脱水症状を緩和する。",
        effect: "病気状態を回復し、土属性耐性を上げる"
      },
      great_success: {
        description: "悠久の砂丘の力を凝縮した粉薬瓶。摩耗した内臓を保存の術理で健やかに保ち、毒素を砂のように排出する。",
        effect: "毒・病気を回復し、全ステータス低下を解除する"
      }
    }
  },
  {
    id: "IT_MED_AS_04",
    category: "MED",
    principle: "AS",
    index: "04",
    image: "items/IT_MED_AS_04.png",
    variants: {
      normal: {
        description: "星霊の粉を主成分とした青い粉薬瓶。服用すると夜空の予兆を感じやすくなり、直感が僅かに冴える。",
        effect: "一定時間、運の良さが少し上昇する"
      },
      success: {
        description: "方位の術理が宿る星明かりの粉薬瓶。暗闇の中でも目的の方向を直感できるようになり、迷いを消す。",
        effect: "一定時間、クリティカル率が上昇する"
      },
      great_success: {
        description: "予兆を読み取る青い光の粉薬瓶。星霊の導きが運命の糸を僅かに手繰り寄せ、幸運な出来事を引き起こす。",
        effect: "クリティカル率とアイテムドロップ率が上昇する"
      }
    }
  },
  {
    id: "IT_MED_LI_04",
    category: "MED",
    principle: "LI",
    index: "04",
    image: "items/IT_MED_LI_04.png",
    variants: {
      normal: {
        description: "脈動する生命の葉を粉末にした薬瓶。葉脈のように全身へ活力が広がり、眠気を心地よく払い去る。",
        effect: "睡眠状態を解除する"
      },
      success: {
        description: "活力に満ちた赤や緑の粉薬瓶。成長の術理が筋繊維を鼓舞し、一時的に身体能力の限界を押し上げる。",
        effect: "一定時間、攻撃力と速度が上昇する"
      },
      great_success: {
        description: "再生の奔流を封じた生命の粉薬瓶。体内の脈動が極限まで高まり、損傷を補いながら戦い続ける力を授ける。",
        effect: "ＨＰ継続回復と全能力上昇を付与する"
      }
    }
  },
  {
    id: "IT_MED_ME_05",
    category: "MED",
    principle: "ME",
    index: "05",
    image: "items/IT_MED_ME_05.png",
    variants: {
      normal: {
        description: "金属の術理で成分を圧縮した丸薬箱。構造が強固なため変質しにくく、長期の遠征にも耐えうる。",
        effect: "最大所持重量が一時的にわずかに上昇する"
      },
      success: {
        description: "研磨された金属粉を芯にした丸薬箱。硬度を持たせた成分が骨格を補強し、重い荷物での負担を減らす。",
        effect: "一定時間、最大所持重量が上昇する"
      },
      great_success: {
        description: "金銀の術理でコーティングされた丸薬箱。全身の耐久性を金属の術理で底上げし、過酷な労働を支える。",
        effect: "最大所持重量と物理防御力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_MED_EL_05",
    category: "MED",
    principle: "EL",
    index: "05",
    image: "items/IT_MED_EL_05.png",
    variants: {
      normal: {
        description: "霊薬を丸めた青緑の丸薬箱。浸透性の高い癒やしの術理が、蓄積した慢性的な疲労を少しずつ解消する。",
        effect: "疲労度の蓄積をリセットする"
      },
      success: {
        description: "泡の術理が成分を弾けさせる丸薬箱。清涼感と共に霊液が血液に混じり、全身の調整を即座に行う。",
        effect: "疲労度をリセットし、ＭＰを微回復する"
      },
      great_success: {
        description: "癒やしの術理を凝縮した高貴な丸薬箱。調整された霊薬が心身の綻びを完璧に修復し、無垢な状態へ戻す。",
        effect: "疲労度と状態異常を完全に解除する"
      }
    }
  },
  {
    id: "IT_MED_SA_05",
    category: "MED",
    principle: "SA",
    index: "05",
    image: "items/IT_MED_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂を媒介にした丸薬箱。保存性が極めて高く、味も匂いも琥珀のように固定されている。",
        effect: "服用すると一定時間、空腹を感じなくなる"
      },
      success: {
        description: "摩耗を抑える砂の術理を帯びた丸薬箱。風紋の力が精神の摩耗を防ぎ、単調な旅路でも集中力を保つ。",
        effect: "一定時間、精神耐性が大きく上昇する"
      },
      great_success: {
        description: "悠久の砂丘の術理が宿る丸薬箱。保存の力が老化や劣化の概念を一時的に封じ、肉体を全盛期に留める。",
        effect: "一定時間、全てのステータスが低下しなくなる"
      }
    }
  },
  {
    id: "IT_MED_AS_05",
    category: "MED",
    principle: "AS",
    index: "05",
    image: "items/IT_MED_AS_05.png",
    variants: {
      normal: {
        description: "星明かりを練り込んだ青い丸薬箱。服用すると方位の感覚が冴え、夜空の下での行動が楽になる。",
        effect: "夜間の移動速度が少し上昇する"
      },
      success: {
        description: "方位の術理を宿した星霊の丸薬箱。直感が鋭くなり、探索中に隠された通路や財宝を予感しやすくなる。",
        effect: "一定時間、隠し要素の発見率が上昇する"
      },
      great_success: {
        description: "予兆を読み取る青い光の丸薬箱。星霊の導きが着用者を危機から遠ざけ、幸運の連続へと運命を誘う。",
        effect: "回避率、クリティカル率、運が上昇する"
      }
    }
  },
  {
    id: "IT_MED_LI_05",
    category: "MED",
    principle: "LI",
    index: "05",
    image: "items/IT_MED_LI_05.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い丸薬箱。葉脈を通じて全身に活力が供給され、僅かな眠りで全快できる。",
        effect: "次に休息した際のＨＰ回復量が増加する"
      },
      success: {
        description: "活力漲る赤や緑の丸薬箱。再生の術理が睡眠中に肉体を再構築し、あらゆる傷や疲れを洗い流す。",
        effect: "次に休息した際、全ての負傷が完治する"
      },
      great_success: {
        description: "成長と繁栄の術理を宿した丸薬箱。生命の奔流が体内で渦巻き、休息せずとも肉体を常に更新し続ける。",
        effect: "一定時間、ＨＰとスタミナが超高速で回復する"
      }
    }
  },
  {
    id: "IT_FOD_ME_01",
    category: "FOD",
    principle: "ME",
    index: "01",
    image: "items/IT_FOD_ME_01.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した保存パン。非常に硬いが腹持ちがよく、長旅の貴重な糧となる。",
        effect: "空腹度を中程度回復し、防御力が微増する"
      },
      success: {
        description: "金属の術理で表面を薄く硬質化した旅パン。乾燥を防ぎつつ、噛みしめるほどに力が湧く不思議な食感。",
        effect: "空腹度を回復し、一定時間物理防御力が上昇する"
      },
      great_success: {
        description: "金銀の術理を練り込んだ贅沢な旅パン。研磨された成分が魔力を反射し、食べるだけで体に活力が宿る。",
        effect: "空腹度を大きく回復し、防御性能を強化する"
      }
    }
  },
  {
    id: "IT_FOD_EL_01",
    category: "FOD",
    principle: "EL",
    index: "01",
    image: "items/IT_FOD_EL_01.png",
    variants: {
      normal: {
        description: "霊薬を混ぜて焼いた青緑の旅パン。浸透した清涼感が喉を潤し、乾いた砂漠でも食べやすい。",
        effect: "空腹度と喉の渇きを少量回復する"
      },
      success: {
        description: "泡の術理でふっくら仕上げた霊薬パン。調整された霊液が胃腸を癒やし、旅の緊張を優しく解きほぐす。",
        effect: "空腹度を回復し、精神的な疲労を和らげる"
      },
      great_success: {
        description: "癒やしの術理が詰まった究極の旅パン。一齧りごとに霊薬の雫が口に広がり、全身の魔力を調整する。",
        effect: "空腹度、ＨＰ、ＭＰを同時に回復する"
      }
    }
  },
  {
    id: "IT_FOD_SA_01",
    category: "FOD",
    principle: "SA",
    index: "01",
    image: "items/IT_FOD_SA_01.png",
    variants: {
      normal: {
        description: "砂の術理で極限まで乾燥させた保存パン。腐敗を完全に防ぎ、数ヶ月の旅でも味が変わることはない。",
        effect: "空腹度を回復し、病気耐性が少し上昇する"
      },
      success: {
        description: "琥珀のような色艶を持つ砂の旅パン。風紋の術理が栄養を保存し、少量でも一日分の活力を提供する。",
        effect: "空腹度を大きく回復し、スタミナ消費を抑える"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の旅パン。摩耗を拒む性質が肉体に活力を固定し、過酷な砂漠歩きを支え抜く。",
        effect: "空腹度を全快させ、一定時間空腹にならなくなる"
      }
    }
  },
  {
    id: "IT_FOD_AS_01",
    category: "FOD",
    principle: "AS",
    index: "01",
    image: "items/IT_FOD_AS_01.png",
    variants: {
      normal: {
        description: "星霊の粉を隠し味にした旅パン。夜空の下で食べると方位の感覚が戻り、夜間の迷いを防いでくれる。",
        effect: "空腹度を回復し、夜間の命中率を上げる"
      },
      success: {
        description: "方位の術理を帯びた星明かりのパン。直感を鋭くする成分が含まれており、探索中の集中力を高める。",
        effect: "空腹度を回復し、回避率を一時的に上げる"
      },
      great_success: {
        description: "予兆を感じる青い光の旅パン。星霊の導きが脳に浸透し、危険を予見する鋭い感覚を食事と共に授ける。",
        effect: "空腹度を回復し、クリティカル率を大きく上げる"
      }
    }
  },
  {
    id: "IT_FOD_LI_01",
    category: "FOD",
    principle: "LI",
    index: "01",
    image: "items/IT_FOD_LI_01.png",
    variants: {
      normal: {
        description: "生命の脈動を宿した赤い旅パン。葉脈のように栄養が全身へ行き渡り、肉体の活力を素早く蘇らせる。",
        effect: "空腹度とスタミナを回復する"
      },
      success: {
        description: "活力に満ちた赤や緑の生命パン。再生の術理が筋繊維を修復し、重い荷物を背負う足取りを軽くする。",
        effect: "空腹度を回復し、最大重量を一時的に増やす"
      },
      great_success: {
        description: "成長の奔流を封じた生命の旅パン。生命の術理が全身で脈動し、食べるだけで傷ついた細胞を再構築する。",
        effect: "空腹度を回復し、ＨＰ自然回復速度を上げる"
      }
    }
  },
  {
    id: "IT_FOD_ME_02",
    category: "FOD",
    principle: "ME",
    index: "02",
    image: "items/IT_FOD_ME_02.png",
    variants: {
      normal: {
        description: "金属の術理で糖分を凝縮した干し果物。構造が硬く締まっており、一粒でも長時間エネルギーが続く。",
        effect: "スタミナを少量回復し、防御を微増させる"
      },
      success: {
        description: "研磨するように磨かれた美しい干し果物。金属の術理が精神の表面を硬質化し、不意の恐怖に動じなくさせる。",
        effect: "スタミナを回復し、精神耐性を一時的に上げる"
      },
      great_success: {
        description: "金銀の術理でコーティングされた干し果物。甘みが金属の力で増幅されており、食べるだけで活力が爆発する。",
        effect: "スタミナを全快し、全能力を一時的に上げる"
      }
    }
  },
  {
    id: "IT_FOD_EL_02",
    category: "FOD",
    principle: "EL",
    index: "02",
    image: "items/IT_FOD_EL_02.png",
    variants: {
      normal: {
        description: "霊薬に漬け込まれた青緑の干し果物。浸透した癒やしの成分が、渇いた体細胞を優しく潤してくれる。",
        effect: "喉の渇きを少量回復し、ＨＰを微回復する"
      },
      success: {
        description: "泡の術理を纏った爽やかな干し果物。調整された霊液が精神的な疲れを吸い取り、晴れやかな気分にする。",
        effect: "喉の渇きを回復し、ＭＰを中程度回復する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の干し果物。一粒食べるだけで全身が雫に包まれたように潤い、活力が満ちる。",
        effect: "ＨＰとＭＰを大きく回復し、渇きを癒やす"
      }
    }
  },
  {
    id: "IT_FOD_SA_02",
    category: "FOD",
    principle: "SA",
    index: "02",
    image: "items/IT_FOD_SA_02.png",
    variants: {
      normal: {
        description: "砂の術理で水分を抜いた保存用の干し果物。琥珀のような甘みがあり、極めて腐敗しにくいのが特徴。",
        effect: "空腹度を少量回復し、病気耐性を上げる"
      },
      success: {
        description: "風紋が表面に浮き出た砂の干し果物。保存の術理が栄養を極限まで濃縮し、過酷な旅の持久力を支える。",
        effect: "空腹度を回復し、スタミナ消費を軽減する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の干し果物。摩耗した精神を甘みで修復し、数日分の気力を一粒に凝縮している。",
        effect: "空腹度とスタミナを大きく回復し、耐性を上げる"
      }
    }
  },
  {
    id: "IT_FOD_AS_02",
    category: "FOD",
    principle: "AS",
    index: "02",
    image: "items/IT_FOD_AS_02.png",
    variants: {
      normal: {
        description: "星霊の光を浴びせて乾燥させた干し果物。方位の感覚を僅かに高め、夜の砂漠での進路決定を助ける。",
        effect: "夜間の移動速度をわずかに上げる"
      },
      success: {
        description: "星明かりを吸い込んだ青い干し果物。直感を鋭くする術理が含まれ、隠された罠を見抜く手助けをする。",
        effect: "罠発見率が一時的に上昇する"
      },
      great_success: {
        description: "予兆を読み取る神秘的な干し果物。星霊の導きが運命に僅かな追い風を送り、不運な事故を食事で防ぐ。",
        effect: "運の良さと回避率を一時的に上昇させる"
      }
    }
  },
  {
    id: "IT_FOD_LI_02",
    category: "FOD",
    principle: "LI",
    index: "02",
    image: "items/IT_FOD_LI_02.png",
    variants: {
      normal: {
        description: "生命の脈動を感じる赤い干し果物。葉脈を通じて活力が伝わり、衰えた肉体に再び力を灯してくれる。",
        effect: "最大ＨＰが一時的にわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の干し果物。再生の術理が筋肉の乳酸を分解し、旅の足の重みを取り除く。",
        effect: "スタミナ回復速度が一時的に上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな干し果物。生命の奔流が全身を駆け巡り、一粒で数日分の睡眠に匹敵する活力を得る。",
        effect: "ＨＰとスタミナを全快し、最大値を上げる"
      }
    }
  },
  {
    id: "IT_FOD_ME_03",
    category: "FOD",
    principle: "ME",
    index: "03",
    image: "items/IT_FOD_ME_03.png",
    variants: {
      normal: {
        description: "金属の術理で風味を固定した香辛料瓶。構造が安定しており、どのような食材も長持ちさせる力がある。",
        effect: "料理の品質をわずかに上昇させる"
      },
      success: {
        description: "研磨された香りの成分を含む香辛料瓶。金属の術理が味を鋭く引き立て、食べる者の防御本能を刺激する。",
        effect: "作成する料理に防御力上昇効果を付与する"
      },
      great_success: {
        description: "金銀の術理が香りと共に舞う香辛料瓶。料理に一振りするだけで、肉体を物理的に強化する薬効が生まれる。",
        effect: "料理に大幅な防御力と攻撃力上昇を付与する"
      }
    }
  },
  {
    id: "IT_FOD_EL_03",
    category: "FOD",
    principle: "EL",
    index: "03",
    image: "items/IT_FOD_EL_03.png",
    variants: {
      normal: {
        description: "霊薬の成分を乾燥させた青緑の香辛料。浸透性が高く、食材の毒素や癖を優しく中和してくれる。",
        effect: "料理のマイナス効果を打ち消す"
      },
      success: {
        description: "泡の術理が香りを広げる霊薬香辛料。調整された霊液が精神を昂揚させ、魔法への適性を高める効果がある。",
        effect: "作成する料理に魔法攻撃力上昇を付与する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の香辛料。雫のような輝きが食材を浄化し、心身を完璧に整える美食へと変える。",
        effect: "料理に全状態異常耐性とＭＰ回復を付与する"
      }
    }
  },
  {
    id: "IT_FOD_SA_03",
    category: "FOD",
    principle: "SA",
    index: "03",
    image: "items/IT_FOD_SA_03.png",
    variants: {
      normal: {
        description: "砂の術理で香りを保存した香辛料瓶。琥珀のように深いコクがあり、砂漠の料理には欠かせない一品。",
        effect: "料理によるスタミナ回復量を増やす"
      },
      success: {
        description: "風紋のような香りの層を持つ砂の香辛料。保存の術理が食材の鮮度を料理後も維持し、効果時間を延ばす。",
        effect: "料理の効果持続時間を上昇させる"
      },
      great_success: {
        description: "悠久の砂丘の知恵が詰まった香辛料。摩耗した胃腸を活性化し、どんな過酷な状況下でも美味しく食事できる。",
        effect: "料理の効果時間を大きく延ばし、全耐性を付与する"
      }
    }
  },
  {
    id: "IT_FOD_AS_03",
    category: "FOD",
    principle: "AS",
    index: "03",
    image: "items/IT_FOD_AS_03.png",
    variants: {
      normal: {
        description: "星明かりをイメージした青い香辛料。方位の感覚を研ぎ澄まし、夜の食事を特別な儀式へと変える。",
        effect: "夜間に食べる料理の効果を上昇させる"
      },
      success: {
        description: "星霊の直感を高める術理の香辛料。予兆を感じ取る力が料理に宿り、食べた者の五感を鋭敏にする。",
        effect: "料理に命中率と回避率の上昇効果を付与する"
      },
      great_success: {
        description: "夜空の導きを封じた神秘の香辛料。星霊の導きが調理に幸運を招き、食材の限界を超えた成果を引き出す。",
        effect: "料理作成時に高確率で大成功が発生する"
      }
    }
  },
  {
    id: "IT_FOD_LI_03",
    category: "FOD",
    principle: "LI",
    index: "03",
    image: "items/IT_FOD_LI_03.png",
    variants: {
      normal: {
        description: "生命の脈動を宿した赤い香辛料。葉脈のように活力を巡らせ、食事の栄養吸収率を僅かに高める。",
        effect: "料理によるＨＰ回復量を上昇させる"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の香辛料。再生の術理が細胞を鼓舞し、食べるだけで傷が癒える料理が作れる。",
        effect: "作成する料理にＨＰ継続回復効果を付与する"
      },
      great_success: {
        description: "成長の術理が宿る生命の香辛料。生命の奔流が料理に宿り、一口ごとに肉体が更新されるような活力を授ける。",
        effect: "料理に最大ＨＰ上昇と強力な回復効果を付与する"
      }
    }
  },
  {
    id: "IT_FOD_ME_04",
    category: "FOD",
    principle: "ME",
    index: "04",
    image: "items/IT_FOD_ME_04.png",
    variants: {
      normal: {
        description: "金属の術理で縁取られた頑丈な茶杯。熱を逃がしにくく、過酷な砂漠でも飲み物の温度を保つ。",
        effect: "飲み物アイテムの効果をわずかに上昇させる"
      },
      success: {
        description: "研磨された内面が魔力を反射する茶杯。構造強化により、注がれた液体の術理を活性化させる力がある。",
        effect: "飲み物アイテムの効果持続時間を上昇させる"
      },
      great_success: {
        description: "金銀の術理が施された高貴な茶杯。金属の力が液体の不純物を除き、本来の力を最大限に引き出す。",
        effect: "飲み物の効果を大きく上げ、デバフを解除する"
      }
    }
  },
  {
    id: "IT_FOD_EL_04",
    category: "FOD",
    principle: "EL",
    index: "04",
    image: "items/IT_FOD_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を焼き固めた青緑の茶杯。浸透する癒やしの術理が、注いだ水に微かな清涼感を与えてくれる。",
        effect: "水を飲むだけでＨＰがわずかに回復する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の茶杯。調整された霊液が液体の成分と混ざり合い、精神を鎮める薬湯へと変える。",
        effect: "飲み物によるＭＰ回復量を上昇させる"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の茶杯。雫のような光沢が魔力を呼び込み、一口ごとに深い安らぎを授ける。",
        effect: "飲み物によるＭＰ回復量と精神耐性を上昇させる"
      }
    }
  },
  {
    id: "IT_FOD_SA_04",
    category: "FOD",
    principle: "SA",
    index: "04",
    image: "items/IT_FOD_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂から錬成された茶杯。琥珀のような質感があり、砂塵の中でも中身が汚れにくい。",
        effect: "土属性魔法の威力を一時的にわずかに上げる"
      },
      success: {
        description: "風紋が刻まれた砂の茶杯。保存の術理が注がれた液体の鮮度を保ち、長時間の休息を豊かにする。",
        effect: "休息時のスタミナ回復量を上昇させる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の茶杯。摩耗を拒む性質が液体の薬効を固定し、飲む者に変わらぬ活力を授ける。",
        effect: "飲み物の効果時間を大幅に上昇させる"
      }
    }
  },
  {
    id: "IT_FOD_AS_04",
    category: "FOD",
    principle: "AS",
    index: "04",
    image: "items/IT_FOD_AS_04.png",
    variants: {
      normal: {
        description: "星明かりを映す青い茶杯。方位の感覚を整える術理があり、夜の静寂の中で心を落ち着かせる。",
        effect: "夜間のＭＰ回復速度をわずかに上げる"
      },
      success: {
        description: "星霊の直感を呼び起こす茶杯。予兆を感じ取る力が飲み物に宿り、明日の旅路への予感を授ける。",
        effect: "次に発生するイベントの幸運度を上げる"
      },
      great_success: {
        description: "夜空の星々を映し出す神秘の茶杯。星霊の導きが飲み物に幸運を注ぎ込み、五感を鋭く研ぎ澄ます。",
        effect: "飲み物によるクリティカル率上昇を付与する"
      }
    }
  },
  {
    id: "IT_FOD_LI_04",
    category: "FOD",
    principle: "LI",
    index: "04",
    image: "items/IT_FOD_LI_04.png",
    variants: {
      normal: {
        description: "生命の脈動を宿した赤い茶杯。葉脈を通じて活力が伝わり、冷めた飲み物にも生命の火を灯す。",
        effect: "飲み物によるスタミナ回復量を上昇させる"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の茶杯。再生の術理が液体の生命力を引き出し、肉体の綻びを癒やす力に変える。",
        effect: "飲み物にＨＰ継続回復効果を付与する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな茶杯。生命の奔流が注がれた液体を満たし、飲むたびに全身が若返るような活力を得る。",
        effect: "飲み物による全能力上昇効果を付与する"
      }
    }
  },
  {
    id: "IT_FOD_ME_05",
    category: "FOD",
    principle: "ME",
    index: "05",
    image: "items/IT_FOD_ME_05.png",
    variants: {
      normal: {
        description: "金属の術理で補強された頑丈な水筒。衝撃に強く、中の水が漏れる心配がない旅の必需品。",
        effect: "水の最大所持量をわずかに増やす"
      },
      success: {
        description: "研磨された内部が水を浄化する水筒。構造強化により、長旅でも中の水が濁らず清浄に保たれる。",
        effect: "水を飲む際の回復効果が上昇する"
      },
      great_success: {
        description: "金銀の術理で装飾された豪華な水筒。金属の力が水に活力を与え、飲むたびに肉体の守りを固めてくれる。",
        effect: "水で喉を潤すと物理防御力が一時的に上昇する"
      }
    }
  },
  {
    id: "IT_FOD_EL_05",
    category: "FOD",
    principle: "EL",
    index: "05",
    image: "items/IT_FOD_EL_05.png",
    variants: {
      normal: {
        description: "霊薬の成分を練り込んだ青緑の水筒。浸透する清涼感が、中の水に絶え間ない癒やしの力を付与する。",
        effect: "水を飲むたびにＨＰが少量回復する"
      },
      success: {
        description: "泡の術理が水を活性化させる霊薬水筒。調整された霊液が精神を潤し、砂漠の熱による苛立ちを鎮める。",
        effect: "水を飲むたびにＭＰが少量回復する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の水筒。雫のような輝きが水を聖なる液へと変え、全身の魔力バランスを整える。",
        effect: "水でＨＰとＭＰが中程度回復する"
      }
    }
  },
  {
    id: "IT_FOD_SA_05",
    category: "FOD",
    principle: "SA",
    index: "05",
    image: "items/IT_FOD_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂を錬成した保存力の高い水筒。琥珀の術理が外気の影響を遮断し、水を常に冷たく保つ。",
        effect: "火属性ダメージ耐性がわずかに上昇する"
      },
      success: {
        description: "風紋の術理が水を保存する砂の水筒。摩耗しがちな体内の水分を固定し、少ない水で長く活動できる。",
        effect: "喉が渇くまでの時間を上昇させる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の水筒。摩耗を拒む性質が水に活力を封じ込め、過酷な砂漠横断を支える一助となる。",
        effect: "喉の渇きを完全に無効化する時間を付与する"
      }
    }
  },
  {
    id: "IT_FOD_AS_05",
    category: "FOD",
    principle: "AS",
    index: "05",
    image: "items/IT_FOD_AS_05.png",
    variants: {
      normal: {
        description: "星明かりの術理を帯びた青い水筒。方位の感覚を失わないよう導いてくれる、夜の旅人の守り神。",
        effect: "夜間の命中率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の水筒。直感を高める力が水に溶け込み、一口飲むごとに周囲の気配に鋭くなる。",
        effect: "回避率が一時的にわずかに上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の水筒。星霊の導きが水を通じて着用者の運命を僅かに上向かせ、幸運を呼ぶ。",
        effect: "運の良さと命中率を一時的に上昇させる"
      }
    }
  },
  {
    id: "IT_FOD_LI_05",
    category: "FOD",
    principle: "LI",
    index: "05",
    image: "items/IT_FOD_LI_05.png",
    variants: {
      normal: {
        description: "生命の脈動を感じる赤い水筒。葉脈のように活力が水に伝わり、飲むたびに全身が温かく満たされる。",
        effect: "最大スタミナがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の水筒。再生の術理が水の生命力を高め、疲労した筋肉を優しく解きほぐす。",
        effect: "スタミナ回復速度が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな水筒。生命の奔流が水に宿り、一口で肉体の損傷を修復し、活力を最大まで引き出す。",
        effect: "ＨＰとスタミナを回復し、最大値を上げる"
      }
    }
  },
  {
    id: "IT_CLT_ME_01",
    category: "CLT",
    principle: "ME",
    index: "01",
    image: "items/IT_CLT_ME_01.png",
    variants: {
      normal: {
        description: "金属繊維を織り交ぜて補強した外套。砂嵐の摩耗に強く、旅人を物理的な衝撃から守ってくれる。",
        effect: "物理防御力がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る外套。構造強化により、薄手ながらも鋼のような耐久性と柔軟性を両立する。",
        effect: "物理防御力と耐久性が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な外套。金属の術理が全身を覆う保護膜となり、あらゆる攻撃を弾き返す。",
        effect: "物理防御力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_EL_01",
    category: "CLT",
    principle: "EL",
    index: "01",
    image: "items/IT_CLT_EL_01.png",
    variants: {
      normal: {
        description: "霊薬を染み込ませた青緑の外套。浸透する清涼感が砂漠の熱を払い、着用者の集中力を一定に保つ。",
        effect: "火属性耐性がわずかに上昇する"
      },
      success: {
        description: "泡の術理で通気性を高めた霊薬の外套。調整された霊液が常に肌を癒やし、長旅のストレスを緩和する。",
        effect: "火耐性が上昇し、ＭＰが微増する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の外套。雫のような輝きが魔力を調整し、過酷な環境下でも心身を健やかに保つ。",
        effect: "全属性耐性と魔法防御力が上昇する"
      }
    }
  },
  {
    id: "IT_CLT_SA_01",
    category: "CLT",
    principle: "SA",
    index: "01",
    image: "items/IT_CLT_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂の成分を定着させた外套。琥珀の術理が汚れを寄せ付けず、常に乾いた清潔な状態を保つ。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋の紋様が刻まれた砂の外套。保存の術理が着用者の体力を温存し、不必要なエネルギーの摩耗を防ぐ。",
        effect: "スタミナ消費速度が少し低下する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の外套。摩耗を拒む性質が外套自体を不朽にし、着用者の肉体を砂漠の風から守り抜く。",
        effect: "土属性耐性とスタミナ効率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_AS_01",
    category: "CLT",
    principle: "AS",
    index: "01",
    image: "items/IT_CLT_AS_01.png",
    variants: {
      normal: {
        description: "星明かりの術理を帯びた青い外套。方位の感覚を失わせないよう導き、夜間の行動を安全にする。",
        effect: "夜間の回避率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の外套。直感を高める力が備わり、暗闇の中でも敵の気配を敏感に察知できる。",
        effect: "夜間の命中率と回避率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘的な外套。星霊の導きが持ち主の周囲に静寂を作り、敵の目から姿を隠してくれる。",
        effect: "回避率が大きく上昇し、不意打ちを防ぐ"
      }
    }
  },
  {
    id: "IT_CLT_LI_01",
    category: "CLT",
    principle: "LI",
    index: "01",
    image: "items/IT_CLT_LI_01.png",
    variants: {
      normal: {
        description: "生命の脈動を織り込んだ赤い外套。葉脈のように活力を全身に伝え、冷えた身体を優しく温めてくれる。",
        effect: "最大ＨＰがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の外套。再生の術理が着用者の傷を癒やし、自然治癒力を僅かに底上げする。",
        effect: "ＨＰの自然回復量が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな外套。生命の奔流が常に着用者を包み込み、衰えることのない活力を全身に供給する。",
        effect: "最大ＨＰとＨＰ回復速度が上昇する"
      }
    }
  },
  {
    id: "IT_CLT_ME_02",
    category: "CLT",
    principle: "ME",
    index: "02",
    image: "items/IT_CLT_ME_02.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化したスカーフ。首元を砂塵から守るだけでなく、物理的な打撃を僅かに和らげる。",
        effect: "防御力がわずかに上昇する"
      },
      success: {
        description: "研磨された金属糸を用いたスカーフ。金属の輝きが魔力を反射し、装着者の精神を邪悪な術から守る。",
        effect: "魔法防御力が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華なスカーフ。高度な構造強化により、着用者の意志を物理的な壁として固定する。",
        effect: "物理・魔法防御力が上昇する"
      }
    }
  },
  {
    id: "IT_CLT_EL_02",
    category: "CLT",
    principle: "EL",
    index: "02",
    image: "items/IT_CLT_EL_02.png",
    variants: {
      normal: {
        description: "霊薬を染み込ませた青緑のスカーフ。浸透する清涼感が呼吸を楽にし、砂漠の乾いた空気から喉を守る。",
        effect: "毒耐性がわずかに上昇する"
      },
      success: {
        description: "泡の術理が香りを放つ霊薬スカーフ。調整された霊液が常に頭部をリフレッシュし、高度な集中力を保たせる。",
        effect: "魔法攻撃力が少し上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘のスカーフ。雫のような輝きが全身の魔力回路を整え、魔法の精度を飛躍させる。",
        effect: "知力と魔法攻撃力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_SA_02",
    category: "CLT",
    principle: "SA",
    index: "02",
    image: "items/IT_CLT_SA_02.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿したスカーフ。琥珀の輝きが直射日光を遮り、体力の消耗を僅かに抑えてくれる。",
        effect: "火属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋の紋様が刻まれた砂のスカーフ。保存の術理が持ち主の気力を維持し、過酷な長旅でも折れない心を作る。",
        effect: "精神耐性とスタミナ回復が上昇する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂のスカーフ。摩耗を拒む性質が、着用者の喉と精神を砂漠の乾燥から完璧に保護する。",
        effect: "全属性耐性が上昇し、疲労を軽減する"
      }
    }
  },
  {
    id: "IT_CLT_AS_02",
    category: "CLT",
    principle: "AS",
    index: "02",
    image: "items/IT_CLT_AS_02.png",
    variants: {
      normal: {
        description: "星明かりを模した青いスカーフ。方位の感覚を僅かに鋭くし、視界の悪い場所での行動を助ける。",
        effect: "命中率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊のスカーフ。直感が高まる力が備わり、敵の攻撃を予感して紙一重で回避しやすくなる。",
        effect: "回避率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘のスカーフ。星霊の導きが着用者の五感を研ぎ澄まし、暗闇の中でも必勝の機を逃さない。",
        effect: "クリティカル率と命中率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_LI_02",
    category: "CLT",
    principle: "LI",
    index: "02",
    image: "items/IT_CLT_LI_02.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤いスカーフ。葉脈のように活力を首元から全身へ送り、心地よい温もりを維持する。",
        effect: "スタミナ消費がわずかに減少する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命のスカーフ。再生の術理が呼吸を整え、激しい戦闘の後でも素早く活力を取り戻す。",
        effect: "スタミナ回復速度が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かなスカーフ。生命の奔流が常に肉体を活性化させ、疲労を知らない強靭な心肺能力を授ける。",
        effect: "最大スタミナと回復速度が上昇する"
      }
    }
  },
  {
    id: "IT_CLT_ME_03",
    category: "CLT",
    principle: "ME",
    index: "03",
    image: "items/IT_CLT_ME_03.png",
    variants: {
      normal: {
        description: "金属の板で補強された頑丈な旅靴。過酷な岩場でも底が減りにくく、足元を物理的な衝撃から守る。",
        effect: "移動速度がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る旅靴。構造強化により、一歩一歩の踏み込みが強まり、険しい道でも疲れにくい。",
        effect: "移動速度と防御力が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な旅靴。金属の力が足運びを物理的にサポートし、鋼の如き推進力を生み出す。",
        effect: "移動速度が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_EL_03",
    category: "CLT",
    principle: "EL",
    index: "03",
    image: "items/IT_CLT_EL_03.png",
    variants: {
      normal: {
        description: "霊薬を浸透させた青緑の旅靴。清涼感のある癒やしの術理が足のむくみを抑え、軽快な歩行を助ける。",
        effect: "スタミナ消費がわずかに減少する"
      },
      success: {
        description: "泡の術理で衝撃を吸収する霊薬の旅靴。調整された霊液が常に足をケアし、長距離の行軍でも痛みが出にくい。",
        effect: "スタミナ消費が減少し、ＨＰが微増する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の旅靴。雫のような光が足を包み込み、大地を踏むたびに肉体を調整し活性化させる。",
        effect: "スタミナ消費軽減とＨＰ継続回復を付与する"
      }
    }
  },
  {
    id: "IT_CLT_SA_03",
    category: "CLT",
    principle: "SA",
    index: "03",
    image: "items/IT_CLT_SA_03.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した旅靴。琥珀の術理が砂に沈み込むのを防ぎ、砂漠での歩行を僅かに楽にする。",
        effect: "砂地での移動速度が上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の旅靴。保存の術理が足腰の摩耗を防ぎ、数日間にわたる連続歩行を可能にする持久力を授ける。",
        effect: "移動速度と土属性耐性が上昇する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の旅靴。摩耗を拒む性質が足の疲労を完全に遮断し、果てしない砂の海を渡り切る力を与える。",
        effect: "移動速度が大きく上がり、全耐性が上昇する"
      }
    }
  },
  {
    id: "IT_CLT_AS_03",
    category: "CLT",
    principle: "AS",
    index: "03",
    image: "items/IT_CLT_AS_03.png",
    variants: {
      normal: {
        description: "星明かりの術理を帯びた青い旅靴。方位の感覚を足裏から伝え、夜道でも迷わずに目的地へ導いてくれる。",
        effect: "夜間の移動速度が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の旅靴。直感が高まる力が歩みを導き、無意識のうちに最も安全なルートを選ばせる。",
        effect: "回避率と移動速度が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の旅靴。星霊の導きが足音を消し、運命の糸を辿るように軽やかに敵の包囲を抜ける。",
        effect: "回避率とクリティカル率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_LI_03",
    category: "CLT",
    principle: "LI",
    index: "03",
    image: "items/IT_CLT_LI_03.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い旅靴。葉脈を通じて活力が足先まで行き渡り、冷えや疲れから旅人を守る。",
        effect: "最大スタミナがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の旅靴。再生の術理が足の細胞を常に更新し、走るほどにエネルギーが湧き出す。",
        effect: "スタミナ回復速度が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな旅靴。生命の奔流が爆発的な脚力を生み出し、荒れ地を疾駆する野生の活力を授ける。",
        effect: "最大スタミナと移動速度が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_ME_04",
    category: "CLT",
    principle: "ME",
    index: "04",
    image: "items/IT_CLT_ME_04.png",
    variants: {
      normal: {
        description: "金属の鋲で補強された頑丈な革帯。多くの道具を吊るしても型崩れせず、腰回りの構造を強化する。",
        effect: "最大重量がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る革帯。耐久性が高く、激しい戦闘においても装備品を確実に保持し続ける。",
        effect: "最大重量と物理防御力が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが美しい豪華な革帯。金属の術理が装着者の体幹を支え、本来以上の重荷を背負う力を与える。",
        effect: "最大重量が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_EL_04",
    category: "CLT",
    principle: "EL",
    index: "04",
    image: "items/IT_CLT_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の革帯。浸透する清涼感が腰の負担を和らげ、長時間の立ち仕事を僅かに楽にする。",
        effect: "スタミナの回復速度がわずかに上昇する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の革帯。調整された霊液が体内の循環を助け、重い装備による疲労を素早く解消する。",
        effect: "スタミナ回復速度と回避率が少し上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の革帯。雫のような光が常に腰回りをケアし、過酷な労働による肉体の綻びを癒やす。",
        effect: "スタミナ回復速度と防御力が上昇する"
      }
    }
  },
  {
    id: "IT_CLT_SA_04",
    category: "CLT",
    principle: "SA",
    index: "04",
    image: "items/IT_CLT_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した革帯。琥珀の術理が湿気による革の劣化を防ぎ、常に最高の状態を保つ。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の革帯。保存の術理が持ち主の持久力を高め、腰痛や倦怠感による摩耗から身を守る。",
        effect: "スタミナ消費が減少し、全能力低下を防ぐ"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の革帯。摩耗を拒む性質が着用者の気力を固定し、極限の疲労下でも動きを鈍らせない。",
        effect: "全耐性とスタミナ効率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_AS_04",
    category: "CLT",
    principle: "AS",
    index: "04",
    image: "items/IT_CLT_AS_04.png",
    variants: {
      normal: {
        description: "星明かりを映す青い革帯。方位の感覚を僅かに高め、広大な砂漠でも自分の位置を予感しやすくなる。",
        effect: "命中率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の革帯。直感が高まる力が腰元から伝わり、死角からの攻撃を察知する助けとなる。",
        effect: "不意打ちダメージを軽減し、回避率を上げる"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の革帯。星霊の導きが攻撃のタイミングを直感させ、無駄のない鋭い反撃を導く。",
        effect: "回避率とクリティカル率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_LI_04",
    category: "CLT",
    principle: "LI",
    index: "04",
    image: "items/IT_CLT_LI_04.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い革帯。葉脈のように活力が腰から全身へ広がり、身体のキレを僅かに良くする。",
        effect: "最大スタミナがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の革帯。再生の術理が腹部を優しく保護し、内臓の疲れから来る活量低下を防ぐ。",
        effect: "スタミナ回復速度とＨＰが少し上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな革帯。生命の奔流が体内の魔力を活性化させ、着用者を常に万全の状態に保つ。",
        effect: "スタミナ最大値と全ステータスが上昇する"
      }
    }
  },
  {
    id: "IT_CLT_ME_05",
    category: "CLT",
    principle: "ME",
    index: "05",
    image: "items/IT_CLT_ME_05.png",
    variants: {
      normal: {
        description: "金属繊維を裏地に用いた頑丈な頭巾。砂塵から顔を守りつつ、頭部を物理的な衝撃から保護する。",
        effect: "防御力がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る頭巾。構造強化により、装着者の集中力を乱す外部の雑音や衝撃を遮断する。",
        effect: "沈黙状態への耐性が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な頭巾。金属の術理が思考を物理的に強固にし、精神的な干渉を完全に跳ね返す。",
        effect: "魔法防御力と知力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_EL_05",
    category: "CLT",
    principle: "EL",
    index: "05",
    image: "items/IT_CLT_EL_05.png",
    variants: {
      normal: {
        description: "霊薬を染み込ませた青緑の頭巾。浸透する清涼感が頭部を冷やし、熱中症や意識の混濁を防いでくれる。",
        effect: "火属性耐性が上昇する"
      },
      success: {
        description: "泡の術理で通気性を確保した霊薬頭巾。調整された霊液が常に脳をケアし、魔力の消費を最小限に抑える。",
        effect: "消費ＭＰがわずかに減少する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の頭巾。雫のような輝きが精神を浄化し、常に澄み渡るような思考と活力を授ける。",
        effect: "消費ＭＰ軽減と魔法攻撃力が上昇する"
      }
    }
  },
  {
    id: "IT_CLT_SA_05",
    category: "CLT",
    principle: "SA",
    index: "05",
    image: "items/IT_CLT_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した頭巾。琥珀の術理が砂漠の強烈な光を遮り、視界と体力を守ってくれる。",
        effect: "命中率がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の頭巾。保存の術理が集中力の摩耗を防ぎ、単調な砂漠歩きでも意識を鮮明に保たせる。",
        effect: "精神耐性が上昇し、スタミナ消費が微減する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の頭巾。摩耗を拒む性質が着用者の五感を砂漠の風から守り、常に鋭敏な感覚を維持する。",
        effect: "土属性耐性と命中率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_AS_05",
    category: "CLT",
    principle: "AS",
    index: "05",
    image: "items/IT_CLT_AS_05.png",
    variants: {
      normal: {
        description: "星明かりを映す青い頭巾。方位の感覚を僅かに鋭くし、視界の悪い夜間でも目的地を予感させる。",
        effect: "夜間の命中率が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の頭巾。直感が高まる力が思考に干渉し、敵の動きを二手先まで予見しやすくする。",
        effect: "回避率が大きく上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の頭巾。星霊の導きが着用者の脳裏に勝利への道筋を描き出し、迷いなき行動を導く。",
        effect: "命中率とクリティカル率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_CLT_LI_05",
    category: "CLT",
    principle: "LI",
    index: "05",
    image: "items/IT_CLT_LI_05.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い頭巾。葉脈を通じて活力が脳へ供給され、疲労による判断ミスを減らしてくれる。",
        effect: "ＭＰ最大値がわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の頭巾。再生の術理が肉体の回復を司り、僅かな休息でも頭がすっきりと冴え渡る。",
        effect: "ＨＰとＭＰの自然回復速度が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな頭巾。生命の奔流が着用者の精神を常に若々しく保ち、無限の知好奇心と活力を授ける。",
        effect: "知力と全回復速度が大きく上昇する"
      }
    }
  },
  {
    id: "IT_DAY_ME_01",
    category: "DAY",
    principle: "ME",
    index: "01",
    image: "items/IT_DAY_ME_01.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した頑丈な油灯。衝撃に強く、中の油が漏れる心配をせずに持ち運べる。",
        effect: "周囲の視認性がわずかに上昇する"
      },
      success: {
        description: "研磨された反射板を持つ金属の油灯。効率よく光を集めて遠くまで照らし出し、暗闇の不安を物理的に払う。",
        effect: "視界範囲が上昇し、命中率が微増する"
      },
      great_success: {
        description: "金銀の縁取りが美しい豪華な油灯。金属の術理が炎を安定させ、暗闇に潜む邪悪な気配を強い光で退ける。",
        effect: "視界範囲が大きく広がり、命中率を上げる"
      }
    }
  },
  {
    id: "IT_DAY_EL_01",
    category: "DAY",
    principle: "EL",
    index: "01",
    image: "items/IT_DAY_EL_01.png",
    variants: {
      normal: {
        description: "霊薬を燃料に混ぜた青緑の油灯。浸透する清涼な香りが広がり、狭い洞窟などでの息苦しさを和らげる。",
        effect: "一定範囲内の毒耐性をわずかに上げる"
      },
      success: {
        description: "泡の術理で光がゆらめく霊薬の油灯。調整された霊液が燃えることで、周囲の仲間の精神を穏やかに整える。",
        effect: "範囲内の仲間のＭＰ回復速度を上昇させる"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の油灯。雫のような光が広がり、火の粉が触れるだけで肉体の傷を優しく癒やす。",
        effect: "範囲内の仲間のＨＰとＭＰを継続回復する"
      }
    }
  },
  {
    id: "IT_DAY_SA_01",
    category: "DAY",
    principle: "SA",
    index: "01",
    image: "items/IT_DAY_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂を燃料の吸着材に使った油灯。琥珀の術理が油の酸化を防ぎ、常に均一な明るさを保つ。",
        effect: "火属性ダメージをわずかに軽減する"
      },
      success: {
        description: "風紋が刻まれた砂の油灯。保存の術理が燃料の摩耗を抑え、通常の数倍の時間にわたって周囲を照らし続ける。",
        effect: "油灯の効果持続時間が大きく上昇する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の油灯。摩耗を拒む性質が灯火を固定し、激しい風や砂嵐の中でも決して消えることはない。",
        effect: "悪天候でも視界を保ち、全耐性を上昇させる"
      }
    }
  },
  {
    id: "IT_DAY_AS_01",
    category: "DAY",
    principle: "AS",
    index: "01",
    image: "items/IT_DAY_AS_01.png",
    variants: {
      normal: {
        description: "星明かりの術理を帯びた青い油灯。方位の感覚を灯火と共に広げ、夜間でも進むべき道を僅かに示す。",
        effect: "夜間の回避率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の油灯。直感が高まる蒼い光を放ち、暗闇に隠された通路や罠を予感させる力がある。",
        effect: "罠発見率が上昇し、命中率を上げる"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の油灯。星霊の導きが光に宿り、運命の道を照らし出すことで不運な事故を未然に防ぐ。",
        effect: "アイテム発見率と回避率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_DAY_LI_01",
    category: "DAY",
    principle: "LI",
    index: "01",
    image: "items/IT_DAY_LI_01.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い油灯。葉脈のように温かい光が広がり、着用者の活力を僅かに呼び起こす。",
        effect: "スタミナの減少をわずかに抑える"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の油灯。再生の術理が光と共に拡散し、周囲にいる者の自然治癒力を段階的に高める。",
        effect: "範囲内の仲間のＨＰ回復量を上昇させる"
      },
      great_success: {
        description: "成長の術理が宿る豊かな油灯。生命の奔流が光となって溢れ出し、枯れかけた肉体に再び戦う力を満たしていく。",
        effect: "範囲内の全ステータスと回復速度を上げる"
      }
    }
  },
  {
    id: "IT_DAY_ME_02",
    category: "DAY",
    principle: "ME",
    index: "02",
    image: "items/IT_DAY_ME_02.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した方位磁針。砂嵐や振動の中でも針が乱れにくく、正確な北を指し続ける。",
        effect: "マップの霧がわずかに晴れやすくなる"
      },
      success: {
        description: "研磨された部品で精度を高めた金属磁針。金属の反射が直感を助け、目的地への最短距離を物理的に予感させる。",
        effect: "移動による迷いが発生しにくくなる"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な方位磁針。耐久性の高い術理が針を固定し、いかなる迷宮でも出口への方位を示す。",
        effect: "マップの視界範囲を大きく広げる"
      }
    }
  },
  {
    id: "IT_DAY_EL_02",
    category: "DAY",
    principle: "EL",
    index: "02",
    image: "items/IT_DAY_EL_02.png",
    variants: {
      normal: {
        description: "霊薬を針に塗布した青緑の方位磁針。浸透する癒やしの術理が、持ち主の精神的な迷いを僅かに静めてくれる。",
        effect: "精神耐性がわずかに上昇する"
      },
      success: {
        description: "泡の術理で針が浮く霊薬の方位磁針。調整された霊液が魔力の流れを感知し、魔力の高い場所を指し示す性質がある。",
        effect: "魔法資源の発見率が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の方位磁針。雫のような光を針が放ち、持ち主の魔力回路を目的地へと最適に調整する。",
        effect: "知力とアイテム発見率が上昇する"
      }
    }
  },
  {
    id: "IT_DAY_SA_02",
    category: "DAY",
    principle: "SA",
    index: "02",
    image: "items/IT_DAY_SA_02.png",
    variants: {
      normal: {
        description: "乾燥した砂を土台に用いた方位磁針。琥珀の術理が湿気による狂いを防ぎ、砂漠での信頼性を高めている。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の方位磁針。保存の術理が持ち主の体力を温存する方角を指し、長旅の摩耗を最小限に抑える。",
        effect: "スタミナ消費がわずかに減少する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の方位磁針。摩耗を拒む性質が針の動きを不朽のものとし、永遠の砂丘でも迷いを断ち切る。",
        effect: "全耐性を上げ、スタミナ効率を最大化する"
      }
    }
  },
  {
    id: "IT_DAY_AS_02",
    category: "DAY",
    principle: "AS",
    index: "02",
    image: "items/IT_DAY_AS_02.png",
    variants: {
      normal: {
        description: "星明かりの術理を帯びた青い方位磁針。方位の感覚がダイレクトに伝わり、夜空が見えない場所でも北を予感させる。",
        effect: "夜間の命中率が上昇する"
      },
      success: {
        description: "方位の術理そのものが宿る星霊の磁針。直感が高まる力が備わり、敵の気配がある方角を針が微かに震えて教える。",
        effect: "不意打ちを受ける確率を軽減する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の方位磁針。星霊の導きが未来の進路を指し示し、持ち主を最も幸運な結末へと誘う。",
        effect: "幸運度と回避率を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_DAY_LI_02",
    category: "DAY",
    principle: "LI",
    index: "02",
    image: "items/IT_DAY_LI_02.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い方位磁針。葉脈のように活力が針に伝わり、持ち主の生存本能と同期して北を指す。",
        effect: "最大ＨＰがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の磁針。再生の術理が着用者の脈動と共鳴し、疲労が少ないルートを感覚的に選ばせる。",
        effect: "スタミナ回復速度が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな方位磁針。生命の奔流が針を躍動させ、持ち主の命が最も輝く場所へと強く導いていく。",
        effect: "最大ＨＰと全ステータスが上昇する"
      }
    }
  },
  {
    id: "IT_DAY_ME_03",
    category: "DAY",
    principle: "ME",
    index: "03",
    image: "items/IT_DAY_ME_03.png",
    variants: {
      normal: {
        description: "金属の板を装丁に使った頑丈な手帳。構造強化の術理により、過酷な環境でも記録が散逸するのを防ぐ。",
        effect: "獲得経験値がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る手帳。金属の輝きが知識を整理し、過去の経験を物理的な強さへと変換する助けとなる。",
        effect: "物理攻撃力と経験値が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な手帳。耐久性の高い術理が記された知識を守り、持ち主の技能を強固に固定する。",
        effect: "習得済みの技能効果を上昇させる"
      }
    }
  },
  {
    id: "IT_DAY_EL_03",
    category: "DAY",
    principle: "EL",
    index: "03",
    image: "items/IT_DAY_EL_03.png",
    variants: {
      normal: {
        description: "霊薬を配合したインクを用いる青緑の手帳。浸透する癒やしの術理が、書くことで精神を穏やかに整えてくれる。",
        effect: "ＭＰ最大値がわずかに上昇する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の手帳。調整された霊液が記録された情報を活性化させ、魔法の知識を効率よく引き出す。",
        effect: "魔法攻撃力が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の手帳。雫のような光が文字に宿り、読むたびに精神を調整し魔力を深い安らぎで満たす。",
        effect: "魔法攻撃力とＭＰ回復速度が上昇する"
      }
    }
  },
  {
    id: "IT_DAY_SA_03",
    category: "DAY",
    principle: "SA",
    index: "03",
    image: "items/IT_DAY_SA_03.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した手帳。琥珀の術理が紙の劣化を防ぎ、砂漠の乾いた風の中でも記録を不朽に保つ。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の手帳。保存の術理が持ち主の体力を温存する術を思い出させ、日々の摩耗を最小限に抑える。",
        effect: "スタミナの消費速度が低下する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の手帳。摩耗を拒む性質が記された言葉に力を与え、過酷な旅路でも心身を健やかに保つ。",
        effect: "全耐性を上げ、ステータス低下を防ぐ"
      }
    }
  },
  {
    id: "IT_DAY_AS_03",
    category: "DAY",
    principle: "AS",
    index: "03",
    image: "items/IT_DAY_AS_03.png",
    variants: {
      normal: {
        description: "星明かりを映す青い手帳。方位の感覚を整理するための術理があり、夜間の探索記録をより正確なものにする。",
        effect: "夜間の命中率が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の手帳。直感が高まる力が文字に宿り、敵の弱点や隙を予感して書き留める能力を与える。",
        effect: "クリティカル率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の手帳。星霊の導きが未来の出来事を断片的に予感させ、持ち主に最善の選択を促す。",
        effect: "運の良さと回避率を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_DAY_LI_03",
    category: "DAY",
    principle: "LI",
    index: "03",
    image: "items/IT_DAY_LI_03.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い手帳。葉脈のように活力が記録と共に全身へ巡り、読み返すたびに元気が出る。",
        effect: "ＨＰ最大値がわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の手帳。再生の術理が持ち主の成長を記録し、肉体の綻びを癒やすための直感を授ける。",
        effect: "ＨＰの自然回復量が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな手帳。生命の奔流が記された文字から溢れ出し、持ち主の肉体を常に進化させ続ける。",
        effect: "全ステータスが恒常的に底上げされる"
      }
    }
  },
  {
    id: "IT_DAY_ME_04",
    category: "DAY",
    principle: "ME",
    index: "04",
    image: "items/IT_DAY_ME_04.png",
    variants: {
      normal: {
        description: "金属繊維を織り込んだ頑丈な寝袋。構造強化により冷気を物理的に遮断し、安全な休息場所を提供する。",
        effect: "休息時のＨＰ回復量がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る寝袋。金属の輝きが睡眠中の精神を守り、悪夢や負の干渉を反射して退ける。",
        effect: "休息時に全能力上昇バフを付与する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な寝袋。耐久性の高い術理が装着者を守り、短時間の睡眠でも鋼の如き活力を与える。",
        effect: "休息時のＨＰ・ＭＰ回復量を大きく上げる"
      }
    }
  },
  {
    id: "IT_DAY_EL_04",
    category: "DAY",
    principle: "EL",
    index: "04",
    image: "items/IT_DAY_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を染み込ませた青緑の寝袋。浸透する清涼感が心地よい眠りを誘い、砂漠の熱による疲労を癒やしてくれる。",
        effect: "休息時のＭＰ回復量がわずかに上昇する"
      },
      success: {
        description: "泡の術理で通気性を調整した霊薬寝袋。調整された霊液が睡眠中の肉体をケアし、全身の魔力バランスを整える。",
        effect: "休息時に魔法攻撃力バフを付与する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の寝袋。雫のような輝きが精神を浄化し、目覚めた時には心身が完璧に調整されている。",
        effect: "休息時に全ての状態異常を解除する"
      }
    }
  },
  {
    id: "IT_DAY_SA_04",
    category: "DAY",
    principle: "SA",
    index: "04",
    image: "items/IT_DAY_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した寝袋。琥珀の術理が砂塵を弾き、砂漠のど真ん中でも清潔で乾いた眠りを約束する。",
        effect: "休息時のスタミナ回復量が上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の寝袋。保存の術理が睡眠中の体力を極限まで効率化し、目覚めた瞬間に長時間の活動を可能にする。",
        effect: "休息後、スタミナ消費が一定時間低下する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の寝袋。摩耗を拒む性質が休息中の肉体を固定し、昨日の疲れを文字通り無かったことにする。",
        effect: "休息後、長時間全ステータスが上昇する"
      }
    }
  },
  {
    id: "IT_DAY_AS_04",
    category: "DAY",
    principle: "AS",
    index: "04",
    image: "items/IT_DAY_AS_04.png",
    variants: {
      normal: {
        description: "星明かりの術理を帯びた青い寝袋。方位の感覚を眠りの中でも保たせ、目覚めた瞬間の方向喪失を防いでくれる。",
        effect: "夜間の休息効果が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の寝袋。直感が高まる力が夢の中に宿り、翌日の旅路における危険を予感させる。",
        effect: "休息後、一定時間不意打ちを防ぐ"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘的な寝袋。星霊の導きが幸運の星を夢に呼び寄せ、目覚めた持ち主を運命の追い風に乗せる。",
        effect: "休息後、運の良さとクリティカル率を上げる"
      }
    }
  },
  {
    id: "IT_DAY_LI_04",
    category: "DAY",
    principle: "LI",
    index: "04",
    image: "items/IT_DAY_LI_04.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い寝袋。葉脈のように温もりが全身に伝わり、冷え切った身体を内側から回復させる。",
        effect: "休息時の全回復速度がわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の寝袋。再生の術理が睡眠中に損傷箇所を集中的に修復し、肉体の成長を強く促す。",
        effect: "休息時に最大ＨＰ・ＭＰが一時的に上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな寝袋。生命の奔流が眠る者を包み込み、まるで一晩で生まれ変わったような活力を授ける。",
        effect: "休息後、ＨＰ・ＭＰ・スタミナの最大値を上げる"
      }
    }
  },
  {
    id: "IT_DAY_ME_05",
    category: "DAY",
    principle: "ME",
    index: "05",
    image: "items/IT_DAY_ME_05.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した小さな鍵。変形に強く、どのような硬い鍵穴にも負けずに解錠を試みられる。",
        effect: "解錠の成功率がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る小鍵。金属の輝きが鍵穴の内部構造を照らし出し、解錠の仕組みを物理的に予感させる。",
        effect: "解錠の成功率が上昇し、破損しにくくなる"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な小鍵。耐久性の高い術理が鍵を絶対的に固定し、あらゆる強固な守りを軽やかに突破する。",
        effect: "高難易度の解錠成功率を大きく上げる"
      }
    }
  },
  {
    id: "IT_DAY_EL_05",
    category: "DAY",
    principle: "EL",
    index: "05",
    image: "items/IT_DAY_EL_05.png",
    variants: {
      normal: {
        description: "霊薬を染み込ませた青緑の小鍵。浸透する清涼感が持ち主の手の震えを抑え、繊細な作業を僅かに助ける。",
        effect: "罠解除の成功率がわずかに上昇する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の小鍵。調整された霊液が鍵穴の摩擦を打ち消し、音を立てずに静かな解錠を可能にする。",
        effect: "ステルス中の解錠成功率が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の小鍵。雫のような光が仕掛けの綻びを優しく見つけ出し、まるで魔法のように罠を中和する。",
        effect: "罠解除と解錠の成功率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_DAY_SA_05",
    category: "DAY",
    principle: "SA",
    index: "05",
    image: "items/IT_DAY_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した小鍵。琥珀の術理が鍵穴の詰まりを防ぎ、砂にまみれた古い扉でもスムーズに開けられる。",
        effect: "砂漠の遺跡での解錠率が上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の小鍵。保存の術理が持ち主の集中力を維持し、失敗による摩耗から鍵そのものを守ってくれる。",
        effect: "解錠に失敗してもアイテムが消失しにくくなる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の小鍵。摩耗を拒む性質がいかなる旧時代の仕掛けも拒まず、時を超えて閉ざされた道を拓く。",
        effect: "解錠成功率を上げ、運の要素を排除する"
      }
    }
  },
  {
    id: "IT_DAY_AS_05",
    category: "DAY",
    principle: "AS",
    index: "05",
    image: "items/IT_DAY_AS_05.png",
    variants: {
      normal: {
        description: "星明かりの術理を帯びた青い小鍵。方位の感覚を僅かに鋭くし、隠された鍵穴の位置を直感で予感させる。",
        effect: "隠し扉の発見率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の小鍵。直感が高まる力が指先に伝わり、複雑なからくりを解くための予兆を教えてくれる。",
        effect: "解錠時の難易度を一段階低下させる"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の小鍵。星霊の導きが解錠の瞬間に幸運を呼び込み、持ち主を最も価値ある財宝へと誘う。",
        effect: "解錠時に追加の報酬が得られる確率を上げる"
      }
    }
  },
  {
    id: "IT_DAY_LI_05",
    category: "DAY",
    principle: "LI",
    index: "05",
    image: "items/IT_DAY_LI_05.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い小鍵。葉脈のように活力が指先へ供給され、極限の緊張下でも確実な作業を可能にする。",
        effect: "極限状態での解錠成功率が上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の小鍵。再生の術理が鍵穴に宿る僅かな執念を癒やし、扉の拒絶を優しく解きほぐす。",
        effect: "解錠と同時にＨＰが微回復する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな小鍵。生命の奔流が仕掛けを内側から躍動させ、開かないはずの扉を自ら開かせる活力を授ける。",
        effect: "全ての解錠成功率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_WRK_ME_01",
    category: "WRK",
    principle: "ME",
    index: "01",
    image: "items/IT_WRK_ME_01.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した乳鉢。硬い鉱石を物理的に粉砕しても壊れず、安定した下準備を支える。",
        effect: "素材加工時の成功率がわずかに上昇する"
      },
      success: {
        description: "内面を高度に研磨した金属の乳鉢。反射板の如き表面が魔力を均一に拡散し、成分の純度を物理的に高める。",
        effect: "作成されるアイテムの品質が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが美しい豪華な乳鉢。金属の術理が素材の構造を瞬時に組み替え、理想的な粉末へと変貌させる。",
        effect: "錬成時の大成功確率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_WRK_EL_01",
    category: "WRK",
    principle: "EL",
    index: "01",
    image: "items/IT_WRK_EL_01.png",
    variants: {
      normal: {
        description: "霊薬を練り込んだ青緑の乳鉢。浸透する清涼感が素材の熱を払い、揮発しやすい成分を僅かに守ってくれる。",
        effect: "揮発性素材の消失率を低下させる"
      },
      success: {
        description: "泡の術理を帯びた霊薬の乳鉢。調整された霊液が素材の個性を引き出し、相性の悪い成分同士を優しく仲介する。",
        effect: "錬成時の素材相性を改善し、品質を上げる"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の乳鉢。雫のような光が素材の綻びを癒やし、最高純度の薬液を抽出するための舞台となる。",
        effect: "作成アイテムの効果を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_WRK_SA_01",
    category: "WRK",
    principle: "SA",
    index: "01",
    image: "items/IT_WRK_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂を錬成した保存力の高い乳鉢。琥珀の術理が素材の水分を奪い、劣化を抑えたまま加工ができる。",
        effect: "錬成時の素材劣化をわずかに防ぐ"
      },
      success: {
        description: "風紋が刻まれた砂の乳鉢。保存の術理が加工中の成分を琥珀の中に閉じ込めるように固定し、効果を濃縮させる。",
        effect: "出来上がるアイテムの使用回数が稀に増える"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の乳鉢。摩耗を拒む性質が加工のストレスを素材から取り除き、不朽の効果を授ける。",
        effect: "錬成時の品質を最大化し、劣化を完全に防ぐ"
      }
    }
  },
  {
    id: "IT_WRK_AS_01",
    category: "WRK",
    principle: "AS",
    index: "01",
    image: "items/IT_WRK_AS_01.png",
    variants: {
      normal: {
        description: "星明かりを映す青い乳鉢。方位の感覚を僅かに高め、調合のタイミングを直感で掴みやすくしてくれる。",
        effect: "錬成の制限時間をわずかに延長する"
      },
      success: {
        description: "方位の術理が宿る星霊の乳鉢。直感が高まる力が備わり、素材を投入する最善の予兆を光の揺らぎで教える。",
        effect: "錬成成功率と品質が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の乳鉢。星霊の導きが調合に幸運を招き、想定を超える驚異的な薬効を引き出す。",
        effect: "錬成時に稀に上位のアイテムを作成する"
      }
    }
  },
  {
    id: "IT_WRK_LI_01",
    category: "WRK",
    principle: "LI",
    index: "01",
    image: "items/IT_WRK_LI_01.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い乳鉢。葉脈のように活力が素材に伝わり、死んだ組織さえも僅かに活性化させる。",
        effect: "古い素材を使用した際の品質低下を抑える"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の乳鉢。再生の術理が素材のポテンシャルを成長させ、瑞々しい薬効を宿らせる。",
        effect: "植物系素材の錬成効果を上昇させる"
      },
      great_success: {
        description: "成長の術理が宿る豊かな乳鉢。生命の奔流が素材同士を脈打つように結合させ、一つの生きた傑作へと変貌させる。",
        effect: "全錬成アイテムの品質と効果を底上げする"
      }
    }
  },
  {
    id: "IT_WRK_ME_02",
    category: "WRK",
    principle: "ME",
    index: "02",
    image: "items/IT_WRK_ME_02.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した頑丈なトング。熱い素材を物理的な歪みなしに掴み、正確な作業を支える。",
        effect: "危険な錬成作業の成功率をわずかに上げる"
      },
      success: {
        description: "研磨された先端が魔力を反射するトング。金属の術理が素材の反発を物理的にねじ伏せ、強引に配置を固定する。",
        effect: "失敗時の素材消失確率を低下させる"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華なトング。構造強化の術理が持ち手の震えを完全に殺し、針の穴を通す調合を導く。",
        effect: "難易度の高い錬成を確実に成功へと導く"
      }
    }
  },
  {
    id: "IT_WRK_EL_02",
    category: "WRK",
    principle: "EL",
    index: "02",
    image: "items/IT_WRK_EL_02.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の金属トング。浸透する清涼感が熱を逃がし、熱に弱い素材を傷つけずに扱える。",
        effect: "熱による素材劣化をわずかに軽減する"
      },
      success: {
        description: "泡の術理を帯びた霊薬のトング。調整された霊液が素材の表面を優しくケアし、掴んだ際のダメージを無効化する。",
        effect: "素材の品質を維持したまま錬成できる"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘のトング。雫のような光が素材の不安定さを中和し、荒れ狂う魔力さえも穏やかに導く。",
        effect: "錬成失敗時の爆発やデバフ発生を防ぐ"
      }
    }
  },
  {
    id: "IT_WRK_SA_02",
    category: "WRK",
    principle: "SA",
    index: "02",
    image: "items/IT_WRK_SA_02.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿したトング。琥珀の術理が滑りを防ぎ、砂のように崩れやすい素材も確実に保持する。",
        effect: "粉末・砂系素材の錬成成功率を上げる"
      },
      success: {
        description: "風紋が刻まれた砂のトング。保存の術理が掴んでいる間の素材の摩耗を防ぎ、一瞬の鮮度も逃さず調合できる。",
        effect: "錬成後のアイテム品質を固定して上昇させる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂のトング。摩耗を拒む性質が素材の運命を一時的に止め、加工による劣化を一切許さない。",
        effect: "最高品質のアイテムを安定して錬成させる"
      }
    }
  },
  {
    id: "IT_WRK_AS_02",
    category: "WRK",
    principle: "AS",
    index: "02",
    image: "items/IT_WRK_AS_02.png",
    variants: {
      normal: {
        description: "星明かりを映す青いトング。方位の感覚を仅かに研ぎ澄まし、魔力の重心を直感で掴む助けとなる。",
        effect: "魔力素材の錬成成功率をわずかに上げる"
      },
      success: {
        description: "方位の術理が宿る星霊のトング。直感が高まる力が指先に伝わり、素材を置くべき最善の位置を予感させる。",
        effect: "錬成大成功の発生範囲を拡大する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘のトング。星霊の導きが素材の未来の状態を僅かに見せ、失敗を未然に回避させる。",
        effect: "不運による錬成失敗を完全に回避する"
      }
    }
  },
  {
    id: "IT_WRK_LI_02",
    category: "WRK",
    principle: "LI",
    index: "02",
    image: "items/IT_WRK_LI_02.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤いトング。葉脈のように活力がトングを通じて素材に伝わり、鮮度を僅かに補填する。",
        effect: "生物系素材の錬成成功率を上げる"
      },
      success: {
        description: "赤や緑の活力に満ちた生命のトング。再生の術理が素材同士の拒絶反応を和らげ、自然な結合を強く促す。",
        effect: "異種素材同士の錬成成功率を上げる"
      },
      great_success: {
        description: "成長の術理が宿る豊かなトング。生命の奔流が掴んだ素材に新たな脈動を与え、本来以上の薬効を引き出す。",
        effect: "生物系素材から作成するアイテムの効果を上げる"
      }
    }
  },
  {
    id: "IT_WRK_ME_03",
    category: "WRK",
    principle: "ME",
    index: "03",
    image: "items/IT_WRK_ME_03.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した小さな、るつぼ。物理的な圧力と高熱に耐え、素材の融合を安定して支える。",
        effect: "加熱錬成の成功率をわずかに上昇させる"
      },
      success: {
        description: "内面を高度に研磨した金属の、るつぼ。反射された熱が魔力を均一に溶かし、純度の高い液体金属を生む。",
        effect: "金属系素材の錬成品質が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な、るつぼ。金属の術理が素材を分子レベルで固定し、不朽の耐久性を授ける。",
        effect: "錬成された武具の最大耐久値を上昇させる"
      }
    }
  },
  {
    id: "IT_WRK_EL_03",
    category: "WRK",
    principle: "EL",
    index: "03",
    image: "items/IT_WRK_EL_03.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の、るつぼ。浸透する清涼感が過度な反応を抑え、安定した霊液の調合を助ける。",
        effect: "液体素材の錬成成功率が上昇する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の、るつぼ。調整された霊液が素材の毒素を浮き上がらせ、清浄な成分のみを抽出する。",
        effect: "薬品アイテムのマイナス効果を除去する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の、るつぼ。雫のような光が素材の魂を癒やし、魔力的に最も安定した雫を生成する。",
        effect: "作成される薬の効果と持続時間を大きく上げる"
      }
    }
  },
  {
    id: "IT_WRK_SA_03",
    category: "WRK",
    principle: "SA",
    index: "03",
    image: "items/IT_WRK_SA_03.png",
    variants: {
      normal: {
        description: "乾燥した砂を錬成した保存力の高い、るつぼ。琥珀の術理が不純物の混入を防ぎ、砂漠の工房でも高品質を保つ。",
        effect: "環境による錬成失敗率を低下させる"
      },
      success: {
        description: "風紋が刻まれた砂の、るつぼ。保存の術理が熱による成分の摩耗を防ぎ、素材の鮮度を煮詰めながら守る。",
        effect: "錬成にかかる時間を短縮し、品質を上げる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の、るつぼ。摩耗を拒む性質が溶解した素材を永遠の黄金比で固定し、傑作を産み出す。",
        effect: "錬成成功率と品質を飛躍的に向上させる"
      }
    }
  },
  {
    id: "IT_WRK_AS_03",
    category: "WRK",
    principle: "AS",
    index: "03",
    image: "items/IT_WRK_AS_03.png",
    variants: {
      normal: {
        description: "星明かりを映す青い、るつぼ。方位の感覚を僅かに鋭くし、素材が溶ける最適なタイミングを直感させる。",
        effect: "錬成時のタイミング補正を緩やかにする"
      },
      success: {
        description: "方位の術理が宿る星霊の、るつぼ。直感が高まる力が備わり、魔力の渦が最も静まる瞬間に調合を導く。",
        effect: "錬成大成功時のボーナスを強化する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の、るつぼ。星霊の導きが調合中の偶然を必然の幸運に変え、奇跡的な成果を出す。",
        effect: "低確率で作成アイテムのランクが一段階上がる"
      }
    }
  },
  {
    id: "IT_WRK_LI_03",
    category: "WRK",
    principle: "LI",
    index: "03",
    image: "items/IT_WRK_LI_03.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い、るつぼ。葉脈のように活力が熱と共に巡り、素材の生命エネルギーを保護する。",
        effect: "生物系素材の錬成時間を短縮する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の、るつぼ。再生の術理が素材の綻びを加熱中に修復し、最高位の活力を宿らせる。",
        effect: "作成アイテムにＨＰ継続回復効果を追加する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな、るつぼ。生命の奔流が中身を脈打つように成長させ、器を超えた薬効を産み落とす。",
        effect: "全回復系アイテムの効果量を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_WRK_ME_04",
    category: "WRK",
    principle: "ME",
    index: "04",
    image: "items/IT_WRK_ME_04.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した計量匙。物理的な変形が一切なく、常に一定の分量を正確に測り取れる。",
        effect: "調合時の分量ミスによる失敗をわずかに防ぐ"
      },
      success: {
        description: "研磨された表面が魔力を反射する計量匙。構造強化により、素材の微量な魔力抵抗を物理的に感知できる。",
        effect: "錬成時の品質補正値が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な計量匙。金属の術理が素材の重さを完璧に固定し、究極の配合比率を実現する。",
        effect: "錬成の成功率を底上げし、品質を最大化する"
      }
    }
  },
  {
    id: "IT_WRK_EL_04",
    category: "WRK",
    principle: "EL",
    index: "04",
    image: "items/IT_WRK_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の計量匙。浸透する清涼感が素材の反応を僅かに整え、繊細な調合をサポートする。",
        effect: "魔法系アイテムの錬成成功率を上げる"
      },
      success: {
        description: "泡の術理を帯びた霊薬の計量匙。調整された霊液が匙の上で素材をリフレッシュし、最良の状態で投入できる。",
        effect: "素材一つ一つの品質を一段階上げて扱う"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の計量匙。雫のような光が匙に触れた素材を浄化し、純粋な魔力のみを釜へ運ぶ。",
        effect: "作成される魔法アイテムの威力を大きく上げる"
      }
    }
  },
  {
    id: "IT_WRK_SA_04",
    category: "WRK",
    principle: "SA",
    index: "04",
    image: "items/IT_WRK_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した計量匙。琥珀の術理が素材の吸着を防ぎ、一粒の無駄もなく正確に投入できる。",
        effect: "素材の端数消費をわずかに抑える"
      },
      success: {
        description: "風紋が刻まれた砂の計量匙。保存の術理が匙の上の時間を僅かに遅らせ、素材の最も輝く瞬間を固定する。",
        effect: "錬成時の品質ボーナスを維持しやすくする"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の計量匙。摩耗を拒む性質が配合の誤差を保存の術理で埋め合わせ、完璧な調和を生む。",
        effect: "消費素材を稀に消費せずに錬成を行う"
      }
    }
  },
  {
    id: "IT_WRK_AS_04",
    category: "WRK",
    principle: "AS",
    index: "04",
    image: "items/IT_WRK_AS_04.png",
    variants: {
      normal: {
        description: "星明かりを映す青い計量匙。方位の感覚を僅かに鋭くし、素材の魔力がどちらに偏っているかを予感させる。",
        effect: "魔力平衡の調整をわずかに助ける"
      },
      success: {
        description: "方位の術理が宿る星霊の計量匙。直感が高まる力が備わり、次の工程で必要な分量を光の予兆で教えてくれる。",
        effect: "調合ミニゲームの難易度を低下させる"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の計量匙。星霊の導きが配合の瞬間に幸運の追い風を送り、素材以上の価値を引き出す。",
        effect: "作成アイテムの個数が稀に増加する"
      }
    }
  },
  {
    id: "IT_WRK_LI_04",
    category: "WRK",
    principle: "LI",
    index: "04",
    image: "items/IT_WRK_LI_04.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い計量匙。葉脈のように活力が素材に伝わり、死んだ粉末にも一時の生を宿らせる。",
        effect: "古い粉末素材の品質低下を無効化する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の計量匙。再生の術理が匙の上で素材を成長させ、豊かな薬効へと導く。",
        effect: "植物・生物素材の錬成結果を強化する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな計量匙。生命の奔流が匙を通じて釜へと注がれ、錬成物に強靭な生命力を吹き込む。",
        effect: "回復アイテムの全効果を大きく底上げする"
      }
    }
  },
  {
    id: "IT_WRK_ME_05",
    category: "WRK",
    principle: "ME",
    index: "05",
    image: "items/IT_WRK_ME_05.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化したフラスコ。物理的な衝撃に強く、不安定な薬液を安全に保管・抽出できる。",
        effect: "薬品錬成の安定性がわずかに上昇する"
      },
      success: {
        description: "内面を高度に研磨した金属のフラスコ。反射された魔力が成分を内側から硬質化させ、保存性を高める。",
        effect: "薬品アイテムの最大所持数を増やす"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華なフラスコ。構造強化の術理が薬液を物理的に保護し、いかなる振動でも変質させない。",
        effect: "作成される薬の品質を最高値で固定する"
      }
    }
  },
  {
    id: "IT_WRK_EL_05",
    category: "WRK",
    principle: "EL",
    index: "05",
    image: "items/IT_WRK_EL_05.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑のフラスコ。浸透する清涼感が容器内に満ち、中の薬液を常に最適な温度に保つ。",
        effect: "熱による薬液の劣化を完全に防ぐ"
      },
      success: {
        description: "泡の術理を帯びた霊薬のフラスコ。調整された霊液が薬液の不純物を泡として排出させ、純度を極限まで高める。",
        effect: "作成される薬品の回復量を大幅に上昇させる"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘のフラスコ。雫のような光が容器内に循環し、薬液を常に新鮮で強力な状態に保ち続ける。",
        effect: "全ての薬品アイテムの効果と品質を底上げする"
      }
    }
  },
  {
    id: "IT_WRK_SA_05",
    category: "WRK",
    principle: "SA",
    index: "05",
    image: "items/IT_WRK_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿したフラスコ。琥珀の術理が外部の湿気を遮断し、デリケートな薬液を乾燥から守る。",
        effect: "乾燥に弱い薬品の錬成成功率を上げる"
      },
      success: {
        description: "風紋が刻まれた砂のフラスコ。保存の術理が中の時間を僅かに止め、数百年経っても変わらぬ薬効を維持させる。",
        effect: "薬品アイテムの効果時間を大きく上昇させる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂のフラスコ。摩耗を拒む性質が薬液の魂を琥珀のように固定し、永遠の鮮度を授ける。",
        effect: "薬品の効果時間を最大化し、耐性を付与する"
      }
    }
  },
  {
    id: "IT_WRK_AS_05",
    category: "WRK",
    principle: "AS",
    index: "05",
    image: "items/IT_WRK_AS_05.png",
    variants: {
      normal: {
        description: "星明かりを映す青いフラスコ。方位の感覚を僅かに鋭くし、薬液が最も安定する方位を直感させる。",
        effect: "錬成中の魔力安定度をわずかに上昇させる"
      },
      success: {
        description: "方位の術理が宿る星霊のフラスコ。直感が高まる力が備わり、薬液が完成に近づく予兆を美しい光で教える。",
        effect: "錬成時の大成功確率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘のフラスコ。星霊の導きがフラスコ内の魔力を宇宙の運行と同期させ、奇跡の滴を生む。",
        effect: "稀に超高難易度のレア薬品を自動生成する"
      }
    }
  },
  {
    id: "IT_WRK_LI_05",
    category: "WRK",
    principle: "LI",
    index: "05",
    image: "items/IT_WRK_LI_05.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤いフラスコ。葉脈のように活力が薬液に伝わり、容器自体が生命を育む繭となる。",
        effect: "生物系薬液の錬成成功率を上げる"
      },
      success: {
        description: "赤や緑の活力に満ちた生命のフラスコ。再生の術理が中の成分を活性化させ、飲む者の活力を即座に呼び覚ます。",
        effect: "ＨＰ・ＭＰ・スタミナの同時回復効果を追加する"
      },
      great_success: {
        description: "成長の術理が宿る豊かなフラスコ。生命の奔流が薬液を脈打たせ、一つの生命体のように着用者の傷を追う。",
        effect: "自動的にＨＰを回復する強力な薬を錬成する"
      }
    }
  },
  {
    id: "IT_TRV_ME_01",
    category: "TRV",
    principle: "ME",
    index: "01",
    image: "items/IT_TRV_ME_01.png",
    variants: {
      normal: {
        description: "金属の板で補強された頑丈な地図筒。物理的な衝撃や砂嵐から中の羊皮紙を確実に守ってくれる。",
        effect: "マップの視界低下をわずかに防ぐ"
      },
      success: {
        description: "研磨された金属の術理が宿る地図筒。構造強化により中の空間が最適化され、多くの記録を物理的に保護する。",
        effect: "最大マップ所持数と耐久性が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な地図筒。金属の術理が記録を物理的に強固にし、いかなる魔力干渉からも情報を守り抜く。",
        effect: "全マップの探索情報を常に保護する"
      }
    }
  },
  {
    id: "IT_TRV_EL_01",
    category: "TRV",
    principle: "EL",
    index: "01",
    image: "items/IT_TRV_EL_01.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の地図筒。浸透する清涼感が羊皮紙の乾燥を防ぎ、記録が古くなるのを僅かに抑える。",
        effect: "羊皮紙アイテムの劣化速度を低下させる"
      },
      success: {
        description: "泡の術理を帯びた霊薬の地図筒。調整された霊液が中の情報を活性化させ、読み返す際の理解力を僅かに助ける。",
        effect: "獲得経験値がわずかに上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の地図筒。雫のような光が中の記録を常に調整し、持ち主の知識を鮮明な状態に保つ。",
        effect: "全知識レベルの経験値取得量を上昇させる"
      }
    }
  },
  {
    id: "IT_TRV_SA_01",
    category: "TRV",
    principle: "SA",
    index: "01",
    image: "items/IT_TRV_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した地図筒。琥珀の術理が湿気を完全に払い、数千年前の地図さえも当時のまま保存する。",
        effect: "古い地図の解読成功率が上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の地図筒。保存の術理が中の地図と持ち主の記憶を同期させ、一度見た道を摩耗させない。",
        effect: "一度通った場所の霧が再びかからなくなる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の地図筒。摩耗を拒む性質が地図上の進路を保存の術理で固定し、迷いなき行軍を支え抜く。",
        effect: "移動速度とマップ視界範囲が上昇する"
      }
    }
  },
  {
    id: "IT_TRV_AS_01",
    category: "TRV",
    principle: "AS",
    index: "01",
    image: "items/IT_TRV_AS_01.png",
    variants: {
      normal: {
        description: "星明かりを映す青い地図筒。方位の感覚を僅かに鋭くし、暗い夜道でも自分の位置を地図上で予感させる。",
        effect: "夜間のマップ視認性が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の地図筒。直感が高まる力が備わり、地図を広げた際に次の目的地への予兆を光で教える。",
        effect: "目的地へのナビゲーション精度が向上する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の地図筒。星霊の導きが地図上に最適なルートを浮かび上がらせ、不運な遭遇を未然に防ぐ。",
        effect: "敵とのエンカウント率を一時的に低下させる"
      }
    }
  },
  {
    id: "IT_TRV_LI_01",
    category: "TRV",
    principle: "LI",
    index: "01",
    image: "items/IT_TRV_LI_01.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い地図筒。葉脈のように活力が中の記録に伝わり、情報を読むたびに心身を僅かに元気にする。",
        effect: "地図を確認した際、スタミナが微回復する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の地図筒。再生の術理が持ち主の歩行距離に応じて成長し、より詳細な情報を描かせる。",
        effect: "歩行によるマップ踏破経験値が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな地図筒。生命の奔流が持ち主の生存本能と地図を繋ぎ、死地にいても生き残るための道を指し示す。",
        effect: "全生存能力とマップ探索効率を上げる"
      }
    }
  },
  {
    id: "IT_TRV_ME_02",
    category: "TRV",
    principle: "ME",
    index: "02",
    image: "items/IT_TRV_ME_02.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した携帯水筒。物理的な圧力に強く、馬に踏まれても中の水が漏れ出すことはない。",
        effect: "水の最大所持量が上昇する"
      },
      success: {
        description: "研磨された内部が水を物理的に浄化する水筒。構造強化により、砂漠の汚れた水でも一時的に飲用可能にする。",
        effect: "泥水からの水分補給時のデバフを軽減する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な水筒。金属の術理が水に物理的な活力を与え、飲む者の肉体を一時的に硬質化する。",
        effect: "水を飲むと物理防御力が一時的に上昇する"
      }
    }
  },
  {
    id: "IT_TRV_EL_02",
    category: "TRV",
    principle: "EL",
    index: "02",
    image: "items/IT_TRV_EL_02.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の携帯水筒。浸透する清涼感が中の水に癒やしの力を与え、喉の渇きを優しく癒やしてくれる。",
        effect: "水を飲むたびにＨＰが微回復する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の携帯水筒。調整された霊液が常に中の水をリフレッシュし、精神的な疲労を払い去る。",
        effect: "水を飲むたびにＭＰが微回復する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の携帯水筒。雫のような光が水を聖なる液に変え、全身の魔力と肉体を瞬時に調整する。",
        effect: "水を飲むとＨＰとＭＰが大きく回復する"
      }
    }
  },
  {
    id: "IT_TRV_SA_02",
    category: "TRV",
    principle: "SA",
    index: "02",
    image: "items/IT_TRV_SA_02.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した携帯水筒。琥珀の術理が中の温度を固定し、灼熱の砂漠でも水を冷たく保ってくれる。",
        effect: "火属性ダメージ耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の携帯水筒。保存の術理が水の鮮度を長期間維持し、一口で数時間分の潤いを肉体に保存する。",
        effect: "喉が渇くまでの時間が上昇する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の携帯水筒。摩耗を拒む性質が体内の水分を保存の術理で固定し、水なしでの生存を支える。",
        effect: "喉の渇きを一定時間完全に無効化する"
      }
    }
  },
  {
    id: "IT_TRV_AS_02",
    category: "TRV",
    principle: "AS",
    index: "02",
    image: "items/IT_TRV_AS_02.png",
    variants: {
      normal: {
        description: "星明かりを映す青い携帯水筒。方位の感覚を僅かに鋭くし、水を飲むたびに自分の立ち位置を再認識させる。",
        effect: "夜間の命中率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の携帯水筒。直感が高まる力が水に溶け込み、一口飲むごとに周囲の危機を予感させる。",
        effect: "回避率が一時的にわずかに上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の水筒。星霊の導きが水を通じて着用者の運命を僅かに上向かせ、幸運な旅路を約束する。",
        effect: "運の良さと全ステータスを一時的に上昇させる"
      }
    }
  },
  {
    id: "IT_TRV_LI_02",
    category: "TRV",
    principle: "LI",
    index: "02",
    image: "items/IT_TRV_LI_02.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い携帯水筒。葉脈のように活力が中の水に伝わり、飲むたびに全身が温かく満たされる。",
        effect: "最大スタミナがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の携帯水筒。再生の術理が水の生命力を高め、疲労した筋肉を内側から修復する。",
        effect: "スタミナ回復速度が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな携帯水筒。生命の奔流が水に宿り、一口で肉体の損傷を修復し、無限の活力を授ける。",
        effect: "ＨＰとスタミナを回復し、最大値を上げる"
      }
    }
  },
  {
    id: "IT_TRV_ME_03",
    category: "TRV",
    principle: "ME",
    index: "03",
    image: "items/IT_TRV_ME_03.png",
    variants: {
      normal: {
        description: "金属繊維を芯に入れた頑丈な縄束。構造強化により、自重を超える重荷を吊るしても決して千切れない。",
        effect: "登攀・下降時の成功率がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る縄束。物理的な摩耗に極めて強く、鋭利な岩場でも構造を維持し続ける。",
        effect: "縄アイテムの耐久減少率を低下させる"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な縄束。金属の術理が縄を物理的な鋼の如き硬さに固定し、即座に足場として機能する。",
        effect: "登攀難易度を大幅に下げ、落下を防ぐ"
      }
    }
  },
  {
    id: "IT_TRV_EL_03",
    category: "TRV",
    principle: "EL",
    index: "03",
    image: "items/IT_TRV_EL_03.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の縄束。浸透する清涼感が縄を扱う手の滑りを抑え、確実な作業をサポートする。",
        effect: "登攀時のスタミナ消費がわずかに減少する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の縄束。調整された霊液が縄に弾力性を与え、落下時の衝撃を優しく吸収して癒やす。",
        effect: "落下ダメージを大幅に軽減する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の縄束。雫のような光が縄に宿り、持ち主の意志に従って生きているかのように伸縮する。",
        effect: "登攀速度と回避率を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_TRV_SA_03",
    category: "TRV",
    principle: "SA",
    index: "03",
    image: "items/IT_TRV_SA_03.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した縄束。琥珀の術理が砂漠の熱による縄の硬化を防ぎ、常にしなやかな状態を保つ。",
        effect: "砂地での作業効率を上昇させる"
      },
      success: {
        description: "風紋が刻まれた砂の縄束。保存の術理が縄の摩耗を完全に拒絶し、数十年使っても当時の強度を維持し続ける。",
        effect: "縄アイテムが半永久的に使用可能になる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の縄束。摩耗を拒む性質が縄を時の中に固定し、いかなる重量も保存の力で支え切る。",
        effect: "最大重量を一時的に無視して行動できる"
      }
    }
  },
  {
    id: "IT_TRV_AS_03",
    category: "TRV",
    principle: "AS",
    index: "03",
    image: "items/IT_TRV_AS_03.png",
    variants: {
      normal: {
        description: "星明かりを映す青い縄束。方位の感覚を僅かに鋭くし、暗闇で縄を辿る際の方向感覚を失わせない。",
        effect: "暗所での移動速度が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の縄束。直感が高まる力が備わり、縄を投げるべき最適な場所を光の予兆で教える。",
        effect: "特殊な移動ポイントの発見率を上げる"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の縄束。星霊の導きが縄の軌道を幸運へと誘い、不可能な距離の崖さえも繋ぎ合わせる。",
        effect: "移動効率と運の良さを大きく上昇させる"
      }
    }
  },
  {
    id: "IT_TRV_LI_03",
    category: "TRV",
    principle: "LI",
    index: "03",
    image: "items/IT_TRV_LI_03.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い縄束。葉脈のように活力が縄を通じて伝わり、握るだけで着用者を僅かに元気づける。",
        effect: "最大ＨＰがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の縄束。再生の術理が縄自体を脈打たせ、持ち主の動きを力強く補助してくれる。",
        effect: "移動によるスタミナ回復量を上昇させる"
      },
      great_success: {
        description: "成長の術理が宿る豊かな縄束。生命の奔流が縄を植物の蔦のように躍動させ、崖を登るたびに肉体を強化する。",
        effect: "移動速度と全能力を大きく底上げする"
      }
    }
  },
  {
    id: "IT_TRV_ME_04",
    category: "TRV",
    principle: "ME",
    index: "04",
    image: "items/IT_TRV_ME_04.png",
    variants: {
      normal: {
        description: "金属の板で底を補強した頑丈な旅袋。構造強化により、鋭利な鉱石や武具を詰め込んでも破れる心配がない。",
        effect: "最大所持容量がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る旅袋。金属の輝きが中の荷物を物理的に整理し、見た目以上の量を収納できる。",
        effect: "最大所持重量が大きく上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な旅袋。金属の術理が重力を物理的に中和し、どれだけ詰めても羽のように軽い。",
        effect: "所持重量による移動ペナルティを無効化する"
      }
    }
  },
  {
    id: "IT_TRV_EL_04",
    category: "TRV",
    principle: "EL",
    index: "04",
    image: "items/IT_TRV_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の旅袋。浸透する清涼感が中の食料や薬液の劣化を抑え、鮮度を僅かに守ってくれる。",
        effect: "所持品の劣化速度を低下させる"
      },
      success: {
        description: "泡の術理を帯びた霊薬の旅袋。調整された霊液が常に中をリフレッシュし、薬液の効果を僅かに高めて保存する。",
        effect: "薬品アイテムの効果を上昇させる"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の旅袋。雫のような光が中の不純物を浄化し、全ての所持品を魔力的に最良の状態にする。",
        effect: "全アイテムの効果と品質を底上げする"
      }
    }
  },
  {
    id: "IT_TRV_SA_04",
    category: "TRV",
    principle: "SA",
    index: "04",
    image: "items/IT_TRV_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した旅袋。琥珀の術理が外気の熱を遮断し、デリケートな素材を乾燥から守り抜く。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の旅袋。保存の術理が中の時間を僅かに遅らせ、採取したての素材を当時のまま固定する。",
        effect: "素材アイテムが一切劣化しなくなる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の旅袋。摩耗を拒む性質が袋そのものの耐久性を不朽にし、中の価値を永遠に固定する。",
        effect: "全耐性を上げ、所持品の価値を保護する"
      }
    }
  },
  {
    id: "IT_TRV_AS_04",
    category: "TRV",
    principle: "AS",
    index: "04",
    image: "items/IT_TRV_AS_04.png",
    variants: {
      normal: {
        description: "星明かりを映す青い旅袋。方位の感覚を僅かに鋭くし、暗闇でも必要な道具を直感で取り出しやすくする。",
        effect: "アイテム使用時の速度が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の旅袋。直感が高まる力が備わり、次の難局で必要な道具を光の予兆で教えてくれる。",
        effect: "状況に応じたバフ効果が稀に発動する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の旅袋。星霊の導きが袋の中に幸運を溜め込み、開封した時に予期せぬ価値を生み出す。",
        effect: "獲得アイテムの品質が常に上昇する"
      }
    }
  },
  {
    id: "IT_TRV_LI_04",
    category: "TRV",
    principle: "LI",
    index: "04",
    image: "items/IT_TRV_LI_04.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い旅袋。葉脈のように活力が背中から全身へ伝わり、長旅の疲れを和らげてくれる。",
        effect: "スタミナ消費がわずかに減少する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の旅袋。再生の術理が持ち主の肉体と馴染み、重い荷物を背負うほど活力を生む。",
        effect: "スタミナ回復速度が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな旅袋。生命の奔流が持ち主の限界を常に更新し続け、袋と共に強靭な肉体を作り上げる。",
        effect: "最大ＨＰと最大重量を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_TRV_ME_05",
    category: "TRV",
    principle: "ME",
    index: "05",
    image: "items/IT_TRV_ME_05.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した小さなランタン。砂嵐の中でも物理的な損傷を防ぎ、確実な足元を照らし出す。",
        effect: "視界範囲がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る小ランタン。金属の輝きが光を増幅させ、暗闇に潜む敵を物理的な反射で暴く。",
        effect: "夜間の命中率が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華なランタン。金属の術理が光を物理的な壁として固定し、着用者を闇の魔力から守る。",
        effect: "視界を最大化し、魔法防御力を上げる"
      }
    }
  },
  {
    id: "IT_TRV_EL_05",
    category: "TRV",
    principle: "EL",
    index: "05",
    image: "items/IT_TRV_EL_05.png",
    variants: {
      normal: {
        description: "霊薬を燃料に混ぜた青緑の小ランタン。浸透する清涼感が周囲の空気を浄化し、長時間の地下探索を助ける。",
        effect: "毒状態の蓄積をわずかに減少させる"
      },
      success: {
        description: "泡の術理を帯びた霊薬の小ランタン。調整された霊液が燃えることで癒やしの香りを放ち、精神を穏やかに整える。",
        effect: "ＭＰの自然回復速度が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の小ランタン。雫のような光が全身の傷を優しく撫で、常に肉体を最適な状態に調整する。",
        effect: "ＨＰとＭＰを継続的に回復させる"
      }
    }
  },
  {
    id: "IT_TRV_SA_05",
    category: "TRV",
    principle: "SA",
    index: "05",
    image: "items/IT_TRV_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した小ランタン。琥珀の術理が油の質を保ち、どんな過酷な環境下でも一定の光度を維持する。",
        effect: "油の消費速度をわずかに低下させる"
      },
      success: {
        description: "風紋が刻まれた砂の小ランタン。保存の術理が光の粒子を空間に固定し、広範囲を長時間鮮明に照らし続ける。",
        effect: "光の持続時間が大きく上昇する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の小ランタン。摩耗を拒む性質が灯火を不朽のものとし、決して消えることのない道標となる。",
        effect: "全耐性を上げ、暗所でのペナルティを無効化する"
      }
    }
  },
  {
    id: "IT_TRV_AS_05",
    category: "TRV",
    principle: "AS",
    index: "05",
    image: "items/IT_TRV_AS_05.png",
    variants: {
      normal: {
        description: "星明かりを映す青い小ランタン。方位の感覚を光と共に広げ、夜の旅人が自分の位置を失わないよう導く。",
        effect: "夜間の移動速度が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の小ランタン。直感が高まる力が光に宿り、隠された扉や罠を予感させる蒼い輝きを放つ。",
        effect: "罠発見率とアイテム発見率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の小ランタン。星霊の導きが着用者の運命を光で照らし、不運を払い幸運を呼び込む。",
        effect: "運の良さと回避率を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_TRV_LI_05",
    category: "TRV",
    principle: "LI",
    index: "05",
    image: "items/IT_TRV_LI_05.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い小ランタン。葉脈のように活力が光と共に全身を巡り、歩くたびに活力が湧き出る。",
        effect: "最大スタミナがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の小ランタン。再生の術理が光に宿り、周囲にいる仲間の自然治癒力を段階的に引き上げる。",
        effect: "範囲内の仲間のＨＰ回復量を上昇させる"
      },
      great_success: {
        description: "成長の術理が宿る豊かな小ランタン。生命の奔流が光となって溢れ出し、肉体を内側から躍動させ、戦う力を満たす。",
        effect: "全回復速度と攻撃力を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_TRD_ME_01",
    category: "TRD",
    principle: "ME",
    index: "01",
    image: "items/IT_TRD_ME_01.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した硬貨袋。物理的な摩耗に強く、大量の金貨を詰め込んでも底が抜けない。",
        effect: "所持金の上限をわずかに引き上げる"
      },
      success: {
        description: "研磨された金属の術理が宿る硬貨袋。金属の輝きが富を引き寄せ、取引時の交渉を物理的に有利に進める助けとなる。",
        effect: "アイテム売却価格が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な硬貨袋。金属の術理が中の財産を物理的に保護し、盗難や紛失を完全に防ぎ止める。",
        effect: "死亡時の所持金減少を無効化する"
      }
    }
  },
  {
    id: "IT_TRD_EL_01",
    category: "TRD",
    principle: "EL",
    index: "01",
    image: "items/IT_TRD_EL_01.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の硬貨袋。浸透する清涼感が持ち主の強欲を適度に鎮め、冷静な商談をサポートする。",
        effect: "アイテム購入価格がわずかに低下する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の硬貨袋。調整された霊液が金銭の循環を活性化させ、思わぬ臨時収入を予感させる。",
        effect: "敵からの獲得金額が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の硬貨袋。雫のような光が持ち主の商才を常に調整し、最も利益の出る選択へと導く。",
        effect: "売買価格が大幅に改善し、運が上昇する"
      }
    }
  },
  {
    id: "IT_TRD_SA_01",
    category: "TRD",
    principle: "SA",
    index: "01",
    image: "items/IT_TRD_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した硬貨袋。琥珀の術理が中の金貨を常に磨き上げ、いつでも新品同様の輝きを保たせる。",
        effect: "取引の成功率がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の硬貨袋。保存の術理が持ち主の資産を固定し、不必要な出費を保存の力で防いでくれる。",
        effect: "手数料や税金の支払い額が減少する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の硬貨袋。摩耗を拒む性質が財産を琥珀の中に守り抜き、末代まで富を失わせない力を授ける。",
        effect: "全アイテムの購入価格を大きく下げる"
      }
    }
  },
  {
    id: "IT_TRD_AS_01",
    category: "TRD",
    principle: "AS",
    index: "01",
    image: "items/IT_TRD_AS_01.png",
    variants: {
      normal: {
        description: "星明かりを映す青い硬貨袋。方位の感覚を僅かに鋭くし、利益の出る方角を直感で予感させる助けとなる。",
        effect: "掘り出し物の発見率が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の硬貨袋。直感が高まる力が備わり、取引相手の隠し事や嘘を予兆として光で教える。",
        effect: "特殊な商談の成功率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の硬貨袋。星霊の導きが持ち主を富の集まる場所へと誘い、莫大な財を成す運命を導く。",
        effect: "運の良さと獲得金額が大きく上昇する"
      }
    }
  },
  {
    id: "IT_TRD_LI_01",
    category: "TRD",
    principle: "LI",
    index: "01",
    image: "items/IT_TRD_LI_01.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い硬貨袋。葉脈のように活力が手元から全身へ伝わり、商いへの意欲を僅かに呼び起こす。",
        effect: "最大スタミナがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の硬貨袋。再生の術理が金貨を生きているかのように躍動させ、使った分だけ福を呼ぶ。",
        effect: "購入時に稀に代金が払い戻される"
      },
      great_success: {
        description: "成長の術理が宿る豊かな硬貨袋。生命の奔流が持ち主の商売を繁栄させ、袋自体が富を育む生きた土壌となる。",
        effect: "所持金に応じて全ステータスが上昇する"
      }
    }
  },
  {
    id: "IT_TRD_ME_02",
    category: "TRD",
    principle: "ME",
    index: "02",
    image: "items/IT_TRD_ME_02.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した商人秤。物理的な誤差が一切なく、どのような環境でも正確な重量を量り出せる。",
        effect: "素材売却時の査定がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る商人秤。金属の輝きが価値を物理的に可視化し、安物の偽りを即座に見抜く力がある。",
        effect: "アイテム鑑定の成功率が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な商人秤。金属の術理が物体の真価を物理的に固定し、不当な値下げを一切許さない。",
        effect: "売却価格を最大値で固定する"
      }
    }
  },
  {
    id: "IT_TRD_EL_02",
    category: "TRD",
    principle: "EL",
    index: "02",
    image: "items/IT_TRD_EL_02.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の商人秤。浸透する清涼感が商人の焦りを抑え、公平な取引を僅かにサポートする。",
        effect: "購入価格がわずかに低下する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の商人秤。調整された霊液が相手の心理を緩ませ、自分に有利な条件を引き出しやすくする。",
        effect: "賄賂や交渉の成功率が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の商人秤。雫のような光が価値の天秤を整え、最も調和のとれた利益を持ち主にもたらす。",
        effect: "売買時の価格補正が大幅に強化される"
      }
    }
  },
  {
    id: "IT_TRD_SA_02",
    category: "TRD",
    principle: "SA",
    index: "02",
    image: "items/IT_TRD_SA_02.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した商人秤。琥珀の術理が砂塵による誤差を防ぎ、砂漠のど真ん中でも正確な商売ができる。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の商人秤。保存の術理が素材の価値を当時のまま保存し、古びた品にも適正な価格を付ける。",
        effect: "古いアイテムの売却価格が上昇する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の商人秤。摩耗を拒む性質が商売上の信用を保存の術理で固定し、永続的な繁栄を約束する。",
        effect: "全商人の友好度が上昇しやすくなる"
      }
    }
  },
  {
    id: "IT_TRD_AS_02",
    category: "TRD",
    principle: "AS",
    index: "02",
    image: "items/IT_TRD_AS_02.png",
    variants: {
      normal: {
        description: "星明かりを映す青い商人秤。方位の感覚を僅かに鋭くし、どちらの商品がより利益を生むかを直感させる。",
        effect: "レアアイテムの発見率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の商人秤。直感が高まる力が備わり、相場の変動や予兆を光の明滅で教えてくれる。",
        effect: "市場の価格変動を事前に予知できる"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の商人秤。星霊の導きが価値のバランスを幸運へと傾け、莫大な差益を瞬時にもたらす。",
        effect: "運の良さと売買効率が大きく上昇する"
      }
    }
  },
  {
    id: "IT_TRD_LI_02",
    category: "TRD",
    principle: "LI",
    index: "02",
    image: "items/IT_TRD_LI_02.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い商人秤。葉脈のように活力が秤を通じて伝わり、商談中の疲労を僅かに軽減する。",
        effect: "最大ＭＰがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の商人秤。再生の術理が持ち主の商才を成長させ、経験不足による損失を補填する。",
        effect: "獲得経験値がわずかに上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな商人秤。生命の奔流が商売敵を圧倒する覇気を授け、持ち主を市場の頂点へと押し上げる。",
        effect: "全ての取引価格が自分に最も有利になる"
      }
    }
  },
  {
    id: "IT_TRD_ME_03",
    category: "TRD",
    principle: "ME",
    index: "03",
    image: "items/IT_TRD_ME_03.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した封蝋印。物理的な耐久性が高く、硬い革袋にも鮮明な印章を残せる。",
        effect: "依頼完了時の報酬がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る封蝋印。金属の輝きが持ち主の権威を物理的に示し、取引の信頼度を高めてくれる。",
        effect: "ギルドの友好度上昇量が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な封蝋印。金属の術理が契約を物理的に強固なものとし、破棄を許さぬ絶対の印となる。",
        effect: "依頼報酬と名声が大きく上昇する"
      }
    }
  },
  {
    id: "IT_TRD_EL_03",
    category: "TRD",
    principle: "EL",
    index: "03",
    image: "items/IT_TRD_EL_03.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の封蝋印。浸透する清涼感が契約者に安らぎを与え、円滑な合意を僅かに助ける。",
        effect: "交渉時の敵対心がわずかに減少する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の封蝋印。調整された霊液が不信感を泡のように消し去り、誠実な商人としての顔を作る。",
        effect: "悪評の減少速度が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の封蝋印。雫のような光が契約書の意図を調整し、双方にとって最良の未来を確定させる。",
        effect: "全ての取引における信頼度が最大になる"
      }
    }
  },
  {
    id: "IT_TRD_SA_03",
    category: "TRD",
    principle: "SA",
    index: "03",
    image: "items/IT_TRD_SA_03.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した封蝋印。琥珀の術理が印章を乾燥から守り、数百年経っても砕けぬ強さを授ける。",
        effect: "長期依頼の成功率が上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の封蝋印。保存の術理が契約の内容を時の中に保存し、約束の摩耗によるトラブルを防ぐ。",
        effect: "アイテムの劣化が一定時間停止する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の封蝋印。摩耗を拒む性質が商人の名声を琥珀の中に固定し、永遠の信頼を確立させる。",
        effect: "全勢力の友好度が低下しなくなる"
      }
    }
  },
  {
    id: "IT_TRD_AS_03",
    category: "TRD",
    principle: "AS",
    index: "03",
    image: "items/IT_TRD_AS_03.png",
    variants: {
      normal: {
        description: "星明かりを映す青い封蝋印。方位の感覚を僅かに鋭くし、信頼すべき相手を直感で予感させる助けとなる。",
        effect: "敵対的なＮＰＣを事前に察知できる"
      },
      success: {
        description: "方位の術理が宿る星霊の封蝋印。直感が高まる力が備わり、契約を結ぶべき最良のタイミングを光で教える。",
        effect: "大口の取引が発生する確率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の封蝋印。星霊の導きが持ち主の契約に幸運を宿らせ、莫大な富へと繋がる縁を引き寄せる。",
        effect: "運の良さと報酬金が大きく上昇する"
      }
    }
  },
  {
    id: "IT_TRD_LI_03",
    category: "TRD",
    principle: "LI",
    index: "03",
    image: "items/IT_TRD_LI_03.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い封蝋印。葉脈のように活力が契約を通じて伝わり、持ち主の覇気を僅かに高める。",
        effect: "物理攻撃力がわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の封蝋印。再生の術理が停滞した商売を活性化させ、新たな利益を次々と生み出す。",
        effect: "所持金に応じてＨＰ回復速度が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな封蝋印。生命の奔流が持ち主の存在感を増幅させ、言葉一つで市場を動かす活力を授ける。",
        effect: "全ステータスと獲得経験値を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_TRD_ME_04",
    category: "TRD",
    principle: "ME",
    index: "04",
    image: "items/IT_TRD_ME_04.png",
    variants: {
      normal: {
        description: "金属の板で補強された頑丈な帳簿。構造強化により、砂嵐や浸水から商いの記録を物理的に保護する。",
        effect: "セーブ時のボーナスがわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る帳簿。金属の輝きが数字の誤りを物理的に浮かび上がらせ、正確な資産管理を助ける。",
        effect: "獲得経験値と金額が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な帳簿。金属の術理が記録を不変の真実として固定し、持ち主の功績を強固にする。",
        effect: "習得スキルの効果が帳簿の記録に応じて上昇する"
      }
    }
  },
  {
    id: "IT_TRD_EL_04",
    category: "TRD",
    principle: "EL",
    index: "04",
    image: "items/IT_TRD_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の帳簿。浸透する清涼感が記帳中の精神疲労を和らげ、長時間の計算を僅かに楽にする。",
        effect: "最大ＭＰがわずかに上昇する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の帳簿。調整された霊液が情報の整理を助け、過去の失敗から学ぶ効率を僅かに高める。",
        effect: "獲得経験値が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の帳簿。雫のような光が持ち主の知識を常に調整し、常に最先端の商才を維持させる。",
        effect: "全ての知識レベルの上昇速度が大きく上がる"
      }
    }
  },
  {
    id: "IT_TRD_SA_04",
    category: "TRD",
    principle: "SA",
    index: "04",
    image: "items/IT_TRD_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した帳簿。琥珀の術理が紙の劣化を防ぎ、砂漠を何十年旅しても記録を鮮明に保つ。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の帳簿。保存の術理が持ち主の過去の努力を時の中に保存し、技の摩耗を最小限に抑える。",
        effect: "スキルの経験値減少を防ぎ、成長を早める"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の帳簿。摩耗を拒む性質が商人の歴史を保存の術理で固定し、不動の地位を授ける。",
        effect: "全ステータス低下を無効化し、防御を上げる"
      }
    }
  },
  {
    id: "IT_TRD_AS_04",
    category: "TRD",
    principle: "AS",
    index: "04",
    image: "items/IT_TRD_AS_04.png",
    variants: {
      normal: {
        description: "星明かりを映す青い帳簿。方位の感覚を僅かに鋭くし、次に狙うべき市場の方角を直感させる。",
        effect: "夜間のアイテム発見率が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の帳簿。直感が高まる力が備わり、帳簿を開くたびに好機が訪れる予兆を教える。",
        effect: "ランダムイベントでの幸運発生率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の帳簿。星霊の導きが持ち主の将来の利益を予見し、幸運な取引へと運命を綴り直す。",
        effect: "運の良さと全報酬が大きく上昇する"
      }
    }
  },
  {
    id: "IT_TRD_LI_04",
    category: "TRD",
    principle: "LI",
    index: "04",
    image: "items/IT_TRD_LI_04.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い帳簿。葉脈のように活力が記録から全身へ伝わり、読み返すたびに元気が出る。",
        effect: "ＨＰ最大値がわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の帳簿。再生の術理が持ち主の経験を肉体の成長へと変え、日々を健やかにする。",
        effect: "ＨＰの自然回復量が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな帳簿。生命の奔流が記された数字と共に持ち主の活力を増幅させ、不屈の商魂を授ける。",
        effect: "経験値取得量と最大ＨＰ・ＭＰを大きく上げる"
      }
    }
  },
  {
    id: "IT_TRD_ME_05",
    category: "TRD",
    principle: "ME",
    index: "05",
    image: "items/IT_TRD_ME_05.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した小さな宝箱。物理的な破壊を拒絶する堅牢さを持ち、貴重品を確実に守り抜く。",
        effect: "アイテムの消失・盗難をわずかに防ぐ"
      },
      success: {
        description: "研磨された金属の術理が宿る小宝箱。金属の輝きが中身を物理的に清浄に保ち、武具の劣化を僅かに防いでくれる。",
        effect: "中に預けた武具の耐久力が微回復する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な小宝箱。金属の術理が中の空間を物理的に固定し、外の世界からの干渉を完全に断つ。",
        effect: "中のアイテムの品質を最高状態で維持する"
      }
    }
  },
  {
    id: "IT_TRD_EL_05",
    category: "TRD",
    principle: "EL",
    index: "05",
    image: "items/IT_TRD_EL_05.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の小宝箱。浸透する清涼感が中の薬品の変質を抑え、効き目を僅かに長持ちさせる。",
        effect: "薬品アイテムの効果時間を延長する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の小宝箱。調整された霊液が中の不純物を浄化し、素材や薬液の純度を僅かに高める。",
        effect: "中に預けたアイテムの品質が徐々に上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の小宝箱。雫のような光が中のアイテムを常に調整し、魔力的に最も活性化された状態に保つ。",
        effect: "預けたアイテムの効果を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_TRD_SA_05",
    category: "TRD",
    principle: "SA",
    index: "05",
    image: "items/IT_TRD_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した小宝箱。琥珀の術理が砂塵や湿気を完全に遮断し、デリケートな素材を守り抜く。",
        effect: "素材の劣化を完全に停止させる"
      },
      success: {
        description: "風紋が刻まれた砂の小宝箱。保存の術理が中の時間を僅かに遅らせ、採取したての素材の輝きを不朽に保つ。",
        effect: "素材の品質を恒久的に固定する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の小宝箱。摩耗を拒む性質が中の宝物を時の中から保存の術理で隠し、永遠に価値を失わせない。",
        effect: "素材やアイテムの価値を最大で固定する"
      }
    }
  },
  {
    id: "IT_TRD_AS_05",
    category: "TRD",
    principle: "AS",
    index: "05",
    image: "items/IT_TRD_AS_05.png",
    variants: {
      normal: {
        description: "星明かりを映す青い小宝箱。方位の感覚を僅かに鋭くし、宝箱をどこへ置いたか直感で予感させてくれる。",
        effect: "マップ上に宝箱の位置が表示される"
      },
      success: {
        description: "方位の術理が宿る星霊の小宝箱。直感が高まる力が備わり、中を開けるたびに幸運な発見がある予兆を教える。",
        effect: "中から追加のアイテムが得られる確率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の小宝箱。星霊の導きが箱の中に幸運を呼び寄せ、預けた物をより価値ある品へと誘う。",
        effect: "運の良さと報酬の品質が大きく上昇する"
      }
    }
  },
  {
    id: "IT_TRD_LI_05",
    category: "TRD",
    principle: "LI",
    index: "05",
    image: "items/IT_TRD_LI_05.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い小宝箱。葉脈のように活力が中の種や生物素材に伝わり、僅かな成長を助ける。",
        effect: "生物系素材の成長速度が上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の小宝箱。再生の術理が中の生物的な素材を活性化させ、瑞々しい薬効を宿らせる。",
        effect: "植物系素材の錬成効果を上昇させる"
      },
      great_success: {
        description: "成長の術理が宿る豊かな小宝箱。生命の奔流が中の物に宿り、一つの生きた傑作へと昇華させる活力を授ける。",
        effect: "預けたアイテムにＨＰ継続回復効果を付与する"
      }
    }
  },
  {
    id: "IT_RIT_ME_01",
    category: "RIT",
    principle: "ME",
    index: "01",
    image: "items/IT_RIT_ME_01.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した香炉。物理的な熱変形を抑え、儀式中の香りを一定に保つ助けとなる。",
        effect: "魔法効果の持続時間がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る香炉。金属の輝きが煙を反射して増幅させ、儀式空間の魔力を物理的に高める。",
        effect: "範囲内の仲間の魔法攻撃力が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な香炉。金属の術理が儀式の法を物理的に固定し、外部からの魔力干渉を跳ね返す。",
        effect: "範囲内の仲間の全能力を上昇させる"
      }
    }
  },
  {
    id: "IT_RIT_EL_01",
    category: "RIT",
    principle: "EL",
    index: "01",
    image: "items/IT_RIT_EL_01.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の香炉。浸透する清涼な香りが広がり、儀式に参加する者の精神を穏やかに整える。",
        effect: "精神耐性が上昇し、ＭＰが微回復する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の香炉。調整された霊液が煙と共に広がり、周囲の穢れを泡のように消し去ってくれる。",
        effect: "範囲内の仲間のデバフを解除し続ける"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の香炉。雫のような光の煙が全身を包み、魂の綻びを儀式を通じて完璧に調整する。",
        effect: "範囲内の仲間のＨＰとＭＰを大きく回復する"
      }
    }
  },
  {
    id: "IT_RIT_SA_01",
    category: "RIT",
    principle: "SA",
    index: "01",
    image: "items/IT_RIT_SA_01.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した香炉。琥珀の術理が香りの成分を保存し、長時間の儀式でも効果を一定に保つ。",
        effect: "香炉の効果持続時間が上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の香炉。保存の術理が祈りの力を時の中に固定し、儀式後のバフが摩耗するのを遅らせる。",
        effect: "バフ効果の持続時間が大きく上昇する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の香炉。摩耗を拒む性質が儀式の成果を琥珀の中に保存し、持ち主に不変の加護を授ける。",
        effect: "全耐性とバフ時間を最大化する"
      }
    }
  },
  {
    id: "IT_RIT_AS_01",
    category: "RIT",
    principle: "AS",
    index: "01",
    image: "items/IT_RIT_AS_01.png",
    variants: {
      normal: {
        description: "星明かりを映す青い香炉。方位の感覚を僅かに鋭くし、天の星々と呼吸を合わせるための助けとなる。",
        effect: "夜間の魔法成功率が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の香炉。直感が高まる力が備わり、儀式中に進むべき未来の予兆を光の粒子で教える。",
        effect: "クリティカル率と回避率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の香炉。星霊の導きが煙を通じて運命を僅かに手繰り寄せ、幸運な出来事を確定させる。",
        effect: "運の良さと魔法威力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_RIT_LI_01",
    category: "RIT",
    principle: "LI",
    index: "01",
    image: "items/IT_RIT_LI_01.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い香炉。葉脈のように活力が煙と共に伝わり、肉体の生存本能を僅かに呼び起こす。",
        effect: "最大ＨＰがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の香炉。再生の術理が光の粒となって拡散し、傷ついた細胞を内側から活性化させる。",
        effect: "範囲内の仲間のＨＰ自然回復速度を上げる"
      },
      great_success: {
        description: "成長の術理が宿る豊かな香炉。生命の奔流が儀式の場に溢れ出し、参列者の肉体を一段階上のステージへと引き上げる。",
        effect: "範囲内の全ステータスと最大ＨＰを上げる"
      }
    }
  },
  {
    id: "IT_RIT_ME_02",
    category: "RIT",
    principle: "ME",
    index: "02",
    image: "items/IT_RIT_ME_02.png",
    variants: {
      normal: {
        description: "金属の板で補強された頑丈な護符飾り。物理的な損傷から祈りの文字を守り、常にその力を発揮させる。",
        effect: "物理防御力がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る護符飾り。金属の輝きが負の魔力を物理的に跳ね返し、持ち主の身を固く守る。",
        effect: "物理防御力と魔法防御力が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な護符飾り。構造強化の術理が肉体を物理的に強固にし、あらゆる打撃を最小化する。",
        effect: "物理防御力が大きく上昇する"
      }
    }
  },
  {
    id: "IT_RIT_EL_02",
    category: "RIT",
    principle: "EL",
    index: "02",
    image: "items/IT_RIT_EL_02.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の護符飾り。浸透する清涼感が心身の淀みを浄化し、魔力の循環を僅かに助けてくれる。",
        effect: "状態異常蓄積をわずかに減少させる"
      },
      success: {
        description: "泡の術理を帯びた霊薬の護符飾り。調整された霊液が不純物を泡として排出させ、精神を常に澄んだ状態に置く。",
        effect: "全ての状態異常への耐性が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の護符飾り。雫のような光が常に全身をケアし、魔力回路を最適に調整し続ける。",
        effect: "全状態異常耐性とＭＰ回復速度を上げる"
      }
    }
  },
  {
    id: "IT_RIT_SA_02",
    category: "RIT",
    principle: "SA",
    index: "02",
    image: "items/IT_RIT_SA_02.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した護符飾り。琥珀の術理が外気の砂塵や湿気を払い、清潔な状態で加護を与え続ける。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の護符飾り。保存の術理が持ち主の気力を保存し、精神的な摩耗から来る判断ミスを防ぐ。",
        effect: "精神耐性とスタミナ回復が上昇する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の護符飾り。摩耗を拒む性質が加護を時の中に固定し、不変の守りを持ち主に授ける。",
        effect: "全属性耐性と防御力を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_RIT_AS_02",
    category: "RIT",
    principle: "AS",
    index: "02",
    image: "items/IT_RIT_AS_02.png",
    variants: {
      normal: {
        description: "星明かりを映す青い護符飾り。方位の感覚を僅かに鋭くし、暗闇の中でも進むべき道を直感させる。",
        effect: "夜間の回避率がわずかに上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の護符飾り。直感が高まる力が備わり、敵の攻撃が来る方角を予兆として光で教える。",
        effect: "回避率と命中率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の護符飾り。星霊の導きが着用者を危機から遠ざけ、幸運の追い風を運命に注ぐ。",
        effect: "運の良さと回避率を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_RIT_LI_02",
    category: "RIT",
    principle: "LI",
    index: "02",
    image: "items/IT_RIT_LI_02.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い護符飾り。葉脈のように活力が着用者に伝わり、肉体の活力を僅かに呼び起こす。",
        effect: "最大スタミナがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の護符飾り。再生の術理が傷ついた箇所に集中的に作用し、治癒の力を引き上げる。",
        effect: "ＨＰの自然回復量が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな護符飾り。生命の奔流が常に肉体を更新させ、着用者に衰えぬ若々しさと活力を授ける。",
        effect: "最大ＨＰと全回復速度を上昇させる"
      }
    }
  },
  {
    id: "IT_RIT_ME_03",
    category: "RIT",
    principle: "ME",
    index: "03",
    image: "items/IT_RIT_ME_03.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した儀礼小刀。物理的な変形がなく、神聖な供物や素材を正確に切り分けられる。",
        effect: "素材採取時の獲得量がわずかに上昇する"
      },
      success: {
        description: "研磨された金属の術理が宿る儀礼小刀。金属の輝きが素材の魂を物理的に整え、抽出される魔力を増幅させる。",
        effect: "採取アイテムの品質が少し上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な儀礼小刀。高度な構造強化により、素材の真理を物理的に暴き、極上の雫を得る。",
        effect: "最高品質の素材採取率を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_RIT_EL_03",
    category: "RIT",
    principle: "EL",
    index: "03",
    image: "items/IT_RIT_EL_03.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の儀礼小刀。浸透する清涼感が素材の不純物を浄化し、純粋な成分を僅かに守ってくれる。",
        effect: "採取時の劣化速度をわずかに低下させる"
      },
      success: {
        description: "泡の術理を帯びた霊薬の儀礼小刀。調整された霊液が素材の反応を和らげ、繊細な部位を傷つけずに採取できる。",
        effect: "採取素材の鮮度を一段階上げて獲得する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の儀礼小刀。雫のような光が切られた素材を調整し、魔力的に最も豊かな状態で固定する。",
        effect: "全採取アイテムの品質と効果を底上げする"
      }
    }
  },
  {
    id: "IT_RIT_SA_03",
    category: "RIT",
    principle: "SA",
    index: "03",
    image: "items/IT_RIT_SA_03.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した儀礼小刀。琥珀の術理が刃の摩耗を防ぎ、砂に埋もれた古い遺跡の扉も解錠を助ける。",
        effect: "遺跡内の仕掛け解除成功率が上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の儀礼小刀。保存の術理が切り取った瞬間の素材を琥珀に閉じ込め、劣化を完全に防ぐ。",
        effect: "採取した素材が一定時間劣化しなくなる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の儀礼小刀。摩耗を拒む性質が素材の価値を保存の術理で隠し、永遠の輝きを授ける。",
        effect: "採取した素材の品質を最大で固定する"
      }
    }
  },
  {
    id: "IT_RIT_AS_03",
    category: "RIT",
    principle: "AS",
    index: "03",
    image: "items/IT_RIT_AS_03.png",
    variants: {
      normal: {
        description: "星明かりを映す青い儀礼小刀。方位の感覚を僅かに鋭くし、隠された素材の位置を直感で予感させる。",
        effect: "隠れた採取ポイントの発見率を上げる"
      },
      success: {
        description: "方位の術理が宿る星霊の儀礼小刀。直感が高まる力が備わり、素材を切り出すべき最善の箇所を光で教える。",
        effect: "採取時の大成功確率が上昇する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の儀礼小刀。星霊の導きが採取に幸運を招き、一本の小刀から驚異的な財を産み出す。",
        effect: "稀に超高価値のレア素材を追加獲得する"
      }
    }
  },
  {
    id: "IT_RIT_LI_03",
    category: "RIT",
    principle: "LI",
    index: "03",
    image: "items/IT_RIT_LI_03.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い儀礼小刀。葉脈のように活力が採取物に伝わり、枯れかけた植物にも一時の生を宿す。",
        effect: "枯れた植物からの採取が可能になる"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の儀礼小刀。再生の術理が採取した瞬間に成長を促し、より瑞々しい素材に変える。",
        effect: "植物・生物素材の獲得量を上昇させる"
      },
      great_success: {
        description: "成長の術理が宿る豊かな儀礼小刀。生命の奔流が切り口から素材へ流れ込み、生きた傑作を採取物として昇華させる。",
        effect: "採取素材にＨＰ継続回復効果を追加する"
      }
    }
  },
  {
    id: "IT_RIT_ME_04",
    category: "RIT",
    principle: "ME",
    index: "04",
    image: "items/IT_RIT_ME_04.png",
    variants: {
      normal: {
        description: "金属の術理で構造を強化した小さな鈴。物理的な衝撃でも音色が乱れず、邪悪な気配を僅かに退けてくれる。",
        effect: "不意打ちを受ける確率をわずかに軽減する"
      },
      success: {
        description: "研磨された金属の術理が宿る小鈴。金属の輝きと共鳴する音色が、周囲の物理的な魔力密度を高めて守りを固める。",
        effect: "範囲内の仲間の物理防御力が上昇する"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な小鈴。構造強化の術理が音を物理的な衝撃波に変え、敵の戦意を物理的に挫く。",
        effect: "範囲内の敵の攻撃力を低下させる"
      }
    }
  },
  {
    id: "IT_RIT_EL_04",
    category: "RIT",
    principle: "EL",
    index: "04",
    image: "items/IT_RIT_EL_04.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の小鈴。浸透する清涼な音が、着用者の精神的な雑音を僅かに静めて集中力を高める。",
        effect: "ＭＰ最大値がわずかに上昇する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の小鈴。調整された霊液が音と共に精神を浄化し、魔法の詠唱を僅かに助けてくれる。",
        effect: "詠唱時間をわずかに短縮する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の小鈴。雫のような澄んだ音が全身をケアし、精神の綻びを完璧に調整して魔力を満たす。",
        effect: "ＭＰ回復速度と魔法威力を大きく上げる"
      }
    }
  },
  {
    id: "IT_RIT_SA_04",
    category: "RIT",
    principle: "SA",
    index: "04",
    image: "items/IT_RIT_SA_04.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した小鈴。琥珀の術理が砂塵による音の掠れを防ぎ、常に明瞭な加護の音を響かせる。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の小鈴。保存の術理が音色の余韻を空間に固定し、加護の効果を通常より長く持続させる。",
        effect: "バフの効果持続時間を上昇させる"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の小鈴。摩耗を拒む性質が祈りの音を琥珀の中に保存し、永遠の安らぎを持ち主に授ける。",
        effect: "全属性耐性を上げ、バフ時間を大幅に延ばす"
      }
    }
  },
  {
    id: "IT_RIT_AS_04",
    category: "RIT",
    principle: "AS",
    index: "04",
    image: "items/IT_RIT_AS_04.png",
    variants: {
      normal: {
        description: "星明かりを映す青い小鈴。方位の感覚を音と共に広げ、夜の探索でも自分の立ち位置を直感で保たせる。",
        effect: "夜間の命中率が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の小鈴。直感が高まる力が音に宿り、危機が近づく予兆を音の震えで予感させてくれる。",
        effect: "不意打ちを無効化する確率を上げる"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の小鈴。星霊の導きが鳴るたびに幸運を呼び寄せ、着用者を最善の運命へと導いていく。",
        effect: "運の良さと回避率を大きく上昇させる"
      }
    }
  },
  {
    id: "IT_RIT_LI_04",
    category: "RIT",
    principle: "LI",
    index: "04",
    image: "items/IT_RIT_LI_04.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い小鈴。葉脈のように活力が音と共に全身へ巡り、肉体の活力を僅かに呼び起こす。",
        effect: "最大ＨＰがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の小鈴。再生の術理が音色に宿り、周囲にいる仲間の自然治癒力を段階的に引き上げる。",
        effect: "範囲内の仲間のＨＰ回復量を上昇させる"
      },
      great_success: {
        description: "成長の術理が宿る豊かな小鈴。生命の奔流が音となって溢れ出し、肉体を内側から躍動させ、戦う力を満たしていく。",
        effect: "ＨＰ・ＭＰ・スタミナの全回復速度を上げる"
      }
    }
  },
  {
    id: "IT_RIT_ME_05",
    category: "RIT",
    principle: "ME",
    index: "05",
    image: "items/IT_RIT_ME_05.png",
    variants: {
      normal: {
        description: "金属の板で装丁を補強した頑丈な香木箱。構造強化により、貴重な香木を物理的な破損から確実に守る。",
        effect: "儀式用アイテムの所持数をわずかに増やす"
      },
      success: {
        description: "研磨された金属の術理が宿る香木箱。金属の輝きが中の成分を物理的に保護し、香りの純度を一定に保たせる。",
        effect: "香炉用アイテムの効果を上昇させる"
      },
      great_success: {
        description: "金銀の縁取りが施された豪華な香木箱。構造強化の術理が中の空間を物理的に固定し、香りの品質を永遠に保つ。",
        effect: "全香炉アイテムの品質を最大で固定する"
      }
    }
  },
  {
    id: "IT_RIT_EL_05",
    category: "RIT",
    principle: "EL",
    index: "05",
    image: "items/IT_RIT_EL_05.png",
    variants: {
      normal: {
        description: "霊薬を配合した青緑の香木箱。浸透する清涼感が香木の香りを引き立て、儀式の効果を僅かに助けてくれる。",
        effect: "魔法攻撃力がわずかに上昇する"
      },
      success: {
        description: "泡の術理を帯びた霊薬の香木箱。調整された霊液が香木の乾燥をケアし、最も瑞々しい状態で煙を産み出す。",
        effect: "魔法効果の持続時間が上昇する"
      },
      great_success: {
        description: "癒やしの術理を極めた神秘の香木箱。雫のような光が中の不純物を浄化し、最高純度の魔力を含んだ香りを授ける。",
        effect: "魔法攻撃力とＭＰ回復速度を大きく上げる"
      }
    }
  },
  {
    id: "IT_RIT_SA_05",
    category: "RIT",
    principle: "SA",
    index: "05",
    image: "items/IT_RIT_SA_05.png",
    variants: {
      normal: {
        description: "乾燥した砂の術理を宿した香木箱。琥珀の術理が砂漠の湿気を完全に遮断し、香木の鮮度を僅かに守る。",
        effect: "土属性耐性がわずかに上昇する"
      },
      success: {
        description: "風紋が刻まれた砂の香木箱。保存の術理が中の香りを琥珀の中に固定し、数百年経っても色褪せぬ力を維持する。",
        effect: "香炉アイテムの劣化を完全に無効化する"
      },
      great_success: {
        description: "悠久の保存術理が宿る砂の香木箱。摩耗を拒む性質が儀式の意図を保存の術理で固定し、不朽の加護を持ち主に授ける。",
        effect: "全属性耐性を上げ、ステータス低下を防ぐ"
      }
    }
  },
  {
    id: "IT_RIT_AS_05",
    category: "RIT",
    principle: "AS",
    index: "05",
    image: "items/IT_RIT_AS_05.png",
    variants: {
      normal: {
        description: "星明かりを映す青い香木箱。方位の感覚を僅かに鋭くし、儀式に最適な方位を直感で予感させてくれる。",
        effect: "夜間の儀式成功率が上昇する"
      },
      success: {
        description: "方位の術理が宿る星霊の香木箱。直感が高まる力が備わり、香木を焚くべき最良の予兆を光の揺らぎで教える。",
        effect: "儀式によるバフ効果が稀に大成功する"
      },
      great_success: {
        description: "夜空の予兆を映し出す神秘の香木箱。星霊の導きが中の香木に幸運を宿らせ、未来を予見する特別な煙を放つ。",
        effect: "運の良さと全ステータスを大きく上昇させる"
      }
    }
  },
  {
    id: "IT_RIT_LI_05",
    category: "RIT",
    principle: "LI",
    index: "05",
    image: "items/IT_RIT_LI_05.png",
    variants: {
      normal: {
        description: "生命の脈動を封じた赤い香木箱。葉脈のように活力が中の香木に伝わり、自然の活力を僅かに維持してくれる。",
        effect: "最大ＨＰがわずかに上昇する"
      },
      success: {
        description: "赤や緑の活力に満ちた生命の香木箱。再生の術理が香木の生命エネルギーを成長させ、豊かな祈りの力を育む。",
        effect: "回復魔法の効果が上昇する"
      },
      great_success: {
        description: "成長の術理が宿る豊かな香木箱。生命の奔流が香木の煙を通じて着用者に宿り、肉体を常に最高潮の状態に保つ。",
        effect: "ＨＰ継続回復と全能力上昇を大きく付与する"
      }
    }
  }
];
const itemsData = {
  items
};
const MASTER_ITEMS = itemsData.items.map((item) => {
  const typeId = `${item.category}_${item.index}`;
  const type = ITEM_TYPE_BY_ID[typeId];
  const colorId = item.principle;
  const colorPrefixMap = {
    AS: "蒼星",
    EL: "霊液",
    LI: "命脈",
    SA: "煌砂",
    ME: "黒鉄"
  };
  const typeName = type ? type.name : "";
  const prefix = colorPrefixMap[colorId] || "";
  const displayName = `${prefix}${typeName}`;
  const EXCLUDE_FROM_RED_IDS = [
    "IT_WRK_LI_02",
    // 生命トング (Explicitly green)
    "IT_ARM_LI_03",
    // 生命の小槍 (植物の蔓)
    "IT_ARM_LI_05",
    // 生命の魔導杖 (若葉)
    "IT_ADN_LI_01",
    // 生命の指輪 (蔦)
    "IT_ADN_LI_04",
    // 生命の腕輪 (蔦)
    "IT_TRV_LI_03"
    // 生命の縄束 (蔦)
  ];
  const visuallyExcludesColor = colorId === "LI" && EXCLUDE_FROM_RED_IDS.includes(item.id);
  return {
    id: item.id,
    typeId,
    colorId,
    name: displayName,
    // Shortened name for quiz
    fullName: item.variants.normal.description.split("。")[0] || item.id,
    image: item.image,
    variants: item.variants,
    visuallyExcludesColor
    // M-QUIZ-PROMPT-TUNING-CONT
  };
});
const ITEMS_TO_USE = MASTER_ITEMS;
const CUSTOMER_TYPES = [
  { id: "old_man", icon: "👴", tone: "elder", color: "#ffcc66" },
  { id: "woman", icon: "👩", tone: "polite", color: "#ff99cc" },
  { id: "man", icon: "🧔", tone: "plain", color: "#d1d1d1" },
  { id: "girl", icon: "👧", tone: "casual", color: "#ffb3ba" }
];
function applyCustomerTone(text, tone) {
  let result = text;
  if (tone === "elder") {
    result = result.replace("見せてくれ。", "見せてくれんか。").replace("ある？", "あるかの？").replace("探している。", "探しておるんじゃ。");
  } else if (tone === "polite") {
    result = result.replace("見せてくれ。", "見せていただけますか？").replace("ある？", "ありますか？").replace("探している。", "探しているんです。");
  } else if (tone === "casual") {
    result = result.replace("見せてくれ。", "見せて！").replace("ある？", "あるかな？").replace("探している。", "探してるの。");
  }
  return result;
}
function isItemMatchingCriteria(item, criteria) {
  if (!criteria || Object.keys(criteria).length === 0) return false;
  const itemType = ITEM_TYPE_BY_ID[item.typeId];
  if (!itemType) return false;
  if (criteria.colorId) {
    if (item.colorId !== criteria.colorId) return false;
    if (item.visuallyExcludesColor) return false;
  }
  if (criteria.genre && itemType.genre !== criteria.genre) return false;
  if (criteria.itemTypeId && item.typeId !== criteria.itemTypeId) return false;
  return true;
}
function createQuizSession({ questionCount = 20 } = {}) {
  const questions = [];
  const typePlan = buildRequestTypePlan(questionCount);
  const usedCorrectItemIds = /* @__PURE__ */ new Set();
  for (let i = 0; i < questionCount; i++) {
    const forcedType = typePlan ? typePlan[i] : null;
    const question = generateRandomQuestion(`q_${(i + 1).toString().padStart(3, "0")}`, forcedType, usedCorrectItemIds);
    if (!question) {
      throw new Error(`Failed to generate enough unique questions. Generated: ${i}`);
    }
    questions.push(question);
    usedCorrectItemIds.add(question.correctItemId);
  }
  return {
    questions,
    currentIndex: 0,
    score: 0,
    answers: [],
    isFinished: questions.length === 0
  };
}
function generateRandomQuestion(id, forcedType = null, excludeItemIds = /* @__PURE__ */ new Set(), retryCount = 0) {
  const MAX_RETRIES = 10;
  const requestTemplate = forcedType ? REQUEST_TEMPLATES.find((t) => t.id === forcedType) : REQUEST_TEMPLATES[Math.floor(Math.random() * REQUEST_TEMPLATES.length)];
  const criteria = {};
  let text = "";
  const customer = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
  if (requestTemplate.id === "color") {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    criteria.colorId = color.id;
    let colorName = color.name;
    let target = "{color}";
    if (color.id === "ME") {
      const metalPhrases = ["ずっしりとした", "重厚感のある", "鉄の術理を帯びた"];
      colorName = metalPhrases[Math.floor(Math.random() * metalPhrases.length)];
      target = "{color}の";
    }
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)].replace(target, colorName);
  } else if (requestTemplate.id === "genre") {
    const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
    criteria.genre = genre.id;
    let genreName = genre.name;
    if (genre.id === "DAY") {
      const dayPhrases = ["日用品", "普段使いの品"];
      genreName = dayPhrases[Math.floor(Math.random() * dayPhrases.length)];
    }
    if (genre.id === "TRD") {
      const trdPhrases = ["渡来品", "遠方から入った品"];
      genreName = trdPhrases[Math.floor(Math.random() * trdPhrases.length)];
    }
    if (genre.id === "RIT") {
      const ritPhrases = ["儀式用の品", "儀礼の品"];
      genreName = ritPhrases[Math.floor(Math.random() * ritPhrases.length)];
    }
    if (genre.id === "ADN") {
      genreName = "アクセサリー";
    }
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)].replace("{genre}", genreName);
  } else if (requestTemplate.id === "itemType") {
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    criteria.itemTypeId = type.id;
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)].replace("{type}", type.name);
  } else if (requestTemplate.id === "colorAndItemType") {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    criteria.colorId = color.id;
    criteria.itemTypeId = type.id;
    let colorName = color.name;
    let target = "{color}";
    if (color.id === "ME") {
      colorName = "鋼鉄の";
      target = "{color}の";
    }
    text = requestTemplate.templates[Math.floor(Math.random() * requestTemplate.templates.length)].replace(target, colorName).replace("{type}", type.name);
  }
  text = applyCustomerTone(text, customer.tone);
  let correctItems = ITEMS_TO_USE.filter((item) => isItemMatchingCriteria(item, criteria));
  if (correctItems.length === 0 && retryCount < MAX_RETRIES) {
    return generateRandomQuestion(id, forcedType, excludeItemIds, retryCount + 1);
  }
  const nonDuplicateItems = correctItems.filter((item) => !excludeItemIds.has(item.id));
  if (nonDuplicateItems.length === 0 && correctItems.length > 0 && retryCount < MAX_RETRIES) {
    return generateRandomQuestion(id, forcedType, excludeItemIds, retryCount + 1);
  }
  if (nonDuplicateItems.length > 0) {
    correctItems = nonDuplicateItems;
  }
  const correctItem = correctItems[Math.floor(Math.random() * correctItems.length)];
  let incorrectItems = [];
  if (requestTemplate.id === "color") {
    if (correctItem.colorId === "LI") {
      incorrectItems = ITEMS_TO_USE.filter(
        (item) => item.typeId === correctItem.typeId && item.colorId !== "LI"
      );
    }
    if (incorrectItems.length === 0) {
      const genreId = ITEM_TYPE_BY_ID[correctItem.typeId].genre;
      incorrectItems = ITEMS_TO_USE.filter(
        (item) => !isItemMatchingCriteria(item, criteria) && ITEM_TYPE_BY_ID[item.typeId].genre === genreId
      );
    }
  } else if (requestTemplate.id === "genre") {
    const groups = {
      ARM: "gear",
      CLT: "gear",
      ADN: "gear",
      RIT: "gear",
      FOD: "cons",
      MED: "cons",
      WRK: "cons",
      DAY: "util",
      TRV: "util",
      TRD: "util"
    };
    const targetGroup = groups[criteria.genre];
    incorrectItems = ITEMS_TO_USE.filter((item) => {
      if (isItemMatchingCriteria(item, criteria)) return false;
      const itemGenre = ITEM_TYPE_BY_ID[item.typeId].genre;
      return groups[itemGenre] === targetGroup;
    });
  } else if (requestTemplate.id === "itemType") {
    const typeId = criteria.itemTypeId || "";
    const targetGenre = typeId.includes("_") ? typeId.split("_")[0] : typeId;
    incorrectItems = ITEMS_TO_USE.filter(
      (item) => !isItemMatchingCriteria(item, criteria) && item.typeId.startsWith(targetGenre)
    );
  } else if (requestTemplate.id === "colorAndItemType") {
    incorrectItems = ITEMS_TO_USE.filter(
      (item) => !isItemMatchingCriteria(item, criteria) && item.typeId === criteria.itemTypeId
    );
    if (incorrectItems.length === 0) {
      const typeId = criteria.itemTypeId || "";
      const targetGenre = typeId.includes("_") ? typeId.split("_")[0] : typeId;
      incorrectItems = ITEMS_TO_USE.filter(
        (item) => !isItemMatchingCriteria(item, criteria) && item.typeId.startsWith(targetGenre)
      );
    }
  }
  if (incorrectItems.length === 0) {
    incorrectItems = ITEMS_TO_USE.filter((item) => !isItemMatchingCriteria(item, criteria));
  }
  if (correctItems.length === 0 || incorrectItems.length === 0) {
    if (retryCount < MAX_RETRIES) {
      return generateRandomQuestion(id, null, excludeItemIds, retryCount + 1);
    }
    return null;
  }
  const incorrectItem = incorrectItems[Math.floor(Math.random() * incorrectItems.length)];
  const choices = Math.random() > 0.5 ? [correctItem, incorrectItem] : [incorrectItem, correctItem];
  return {
    id,
    request: {
      id: requestTemplate.id,
      type: requestTemplate.id,
      text,
      customer,
      criteria: { ...criteria }
    },
    criteria: { ...criteria },
    choices,
    correctItemId: correctItem.id
  };
}
function checkAnswer(question, selectedItemId) {
  const isCorrect = question.correctItemId === selectedItemId;
  const gainedScore = calculateScore({ isCorrect });
  return {
    questionId: question.id,
    selectedItemId,
    correctItemId: question.correctItemId,
    isCorrect,
    gainedScore
  };
}
function answerQuestion(session, selectedItemId) {
  if (session.isFinished) return session;
  const currentQuestion = session.questions[session.currentIndex];
  const result = checkAnswer(currentQuestion, selectedItemId);
  const nextIndex = session.currentIndex + 1;
  const isFinished = nextIndex >= session.questions.length;
  return {
    ...session,
    currentIndex: nextIndex,
    score: session.score + result.gainedScore,
    answers: [...session.answers, result],
    isFinished
  };
}
function buildRequestTypePlan(count) {
  if (count < 4) return null;
  const baseTypes = ["color", "genre", "itemType", "colorAndItemType"];
  const plan = [];
  for (let i = 0; i < count; i++) {
    plan.push(baseTypes[i % baseTypes.length]);
  }
  return shuffleArray(plan);
}
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const AFFECTION_LIMITS = {
  MIN: 0,
  MAX: 100
};
function createInitialAffection(heroineIds) {
  const state = {};
  heroineIds.forEach((id) => {
    state[id] = 0;
  });
  return state;
}
function clampAffection(value) {
  return Math.max(AFFECTION_LIMITS.MIN, Math.min(AFFECTION_LIMITS.MAX, value));
}
function addAffection(affectionState, heroineId, amount) {
  if (!(heroineId in affectionState)) {
    console.warn(`Attempted to add affection to unknown heroineId: ${heroineId}`);
    return affectionState;
  }
  return {
    ...affectionState,
    [heroineId]: clampAffection(affectionState[heroineId] + amount)
  };
}
function calculateQuizAffectionGain(correctCount, totalQuestions = 5) {
  return Math.max(0, correctCount);
}
function getWorkshopResult(correctCount) {
  if (correctCount >= 5) {
    return { reputation: 3, sales: 120, satisfaction: 3 };
  }
  if (correctCount === 4) {
    return { reputation: 2, sales: 100, satisfaction: 2 };
  }
  if (correctCount === 3) {
    return { reputation: 1, sales: 80, satisfaction: 1 };
  }
  if (correctCount === 2) {
    return { reputation: 0, sales: 50, satisfaction: 0 };
  }
  return { reputation: -1, sales: 20, satisfaction: -1 };
}
function createInitialWorkshopState() {
  return {
    day: 1,
    reputation: 0,
    sales: 0,
    satisfaction: 0
  };
}
function applyWorkshopResult(state, result) {
  return {
    day: state.day,
    // Day is usually incremented separately at the end of the day loop
    reputation: state.reputation + result.reputation,
    sales: state.sales + result.sales,
    satisfaction: state.satisfaction + result.satisfaction
  };
}
function resolveQuizCompletion({
  correctCount,
  totalCount,
  activeHeroineId,
  currentAffection,
  seenEventIds
}) {
  const rank = getRankInfo(correctCount);
  const affectionGain = calculateQuizAffectionGain(correctCount, totalCount);
  const workshopResult = getWorkshopResult(correctCount);
  const nextAffectionValue = currentAffection + affectionGain;
  const unlockedEvent = checkNewEventUnlock(activeHeroineId, nextAffectionValue, seenEventIds);
  return {
    correctCount,
    totalCount,
    rank,
    affectionGain,
    workshopResult,
    // { sales, reputation, satisfaction }
    unlockedEvent,
    // Event object or null
    isPerfect: correctCount === totalCount
  };
}
function createPerfectQuizPayload(totalCount, activeHeroineId, currentAffection, seenEventIds) {
  return resolveQuizCompletion({
    correctCount: totalCount,
    totalCount,
    activeHeroineId,
    currentAffection,
    seenEventIds
  });
}
function getResultExpression(correctCount) {
  if (correctCount >= 5) return "fun";
  if (correctCount >= 4) return "joy";
  if (correctCount >= 3) return "normal";
  if (correctCount >= 2) return "sorrow";
  return "cry";
}
const TRACKS = {
  // --- Main BGM ---
  "MAIN-01": {
    id: "MAIN-01",
    src: "audio/bgm/main/main01_title.mp3",
    loop: true,
    title: "Alchemy Shop in the Desert",
    category: "メインBGM"
  },
  "MAIN-02": {
    id: "MAIN-02",
    src: "audio/bgm/main/main02_shop.mp3",
    loop: true,
    title: "Spice Market Breeze",
    category: "メインBGM"
  },
  "MAIN-03": {
    id: "MAIN-03",
    src: "audio/bgm/main/main03_puzzle.mp3",
    loop: true,
    title: "Measure The Mortar",
    category: "メインBGM"
  },
  // --- Hakima ---
  "HAKIMA-01": {
    id: "HAKIMA-01",
    src: "audio/bgm/hakima/hakima01_theme.mp3",
    loop: true,
    title: "Two Cups of Cardamom",
    category: "ハキマ関連"
  },
  "HAKIMA-02": {
    id: "HAKIMA-02",
    src: "audio/bgm/hakima/hakima02_game_a.mp3",
    loop: true,
    title: "Copper and Cumin",
    category: "ハキマ関連"
  },
  "HAKIMA-03": {
    id: "HAKIMA-03",
    src: "audio/bgm/hakima/hakima03_game_b.mp3",
    loop: true,
    title: "Copper and Sand",
    category: "ハキマ関連"
  },
  "HAKIMA-04": {
    id: "HAKIMA-04",
    src: "audio/bgm/hakima/hakima04_game_c.mp3",
    loop: true,
    title: "Saffron and Silk",
    category: "ハキマ関連"
  },
  "HAKIMA-05": {
    id: "HAKIMA-05",
    src: "audio/bgm/hakima/hakima05_game_d.mp3",
    loop: true,
    title: "Golden Hour Market",
    category: "ハキマ関連"
  },
  "HAKIMA-06": {
    id: "HAKIMA-06",
    src: "audio/bgm/hakima/hakima06_ending.mp3",
    loop: true,
    title: "Morning Beside You",
    category: "ハキマ関連"
  },
  "HAKIMA-07": {
    id: "HAKIMA-07",
    src: "audio/bgm/hakima/hakima07_ending2.mp3",
    loop: true,
    title: "Sunset Promises",
    category: "ハキマ関連"
  },
  // --- Mira ---
  "MIRA-01": {
    id: "MIRA-01",
    src: "audio/bgm/mira/mira01_theme.mp3",
    loop: true,
    title: "The Glass Bottle Genius",
    category: "ミラ関連"
  },
  "MIRA-02": {
    id: "MIRA-02",
    src: "audio/bgm/mira/mira02_game_a.mp3",
    loop: true,
    title: "The Alchemist's Arithmetic",
    category: "ミラ関連"
  },
  "MIRA-03": {
    id: "MIRA-03",
    src: "audio/bgm/mira/mira03_game_b.mp3",
    loop: true,
    title: "Proof of the Prodigy",
    category: "ミラ関連"
  },
  "MIRA-04": {
    id: "MIRA-04",
    src: "audio/bgm/mira/mira04_game_c.mp3",
    loop: true,
    title: "Logic and Lace",
    category: "ミラ関連"
  },
  "MIRA-05": {
    id: "MIRA-05",
    src: "audio/bgm/mira/mira05_game_d.mp3",
    loop: true,
    title: "Starlight Solution",
    category: "ミラ関連"
  },
  "MIRA-06": {
    id: "MIRA-06",
    src: "audio/bgm/mira/mira06_ending.mp3",
    loop: true,
    title: "Finally Just Me",
    category: "ミラ関連"
  },
  "MIRA-07": {
    id: "MIRA-07",
    src: "audio/bgm/mira/mira07_ending2.mp3",
    loop: true,
    title: "The Tomorrow We Found",
    category: "ミラ関連"
  },
  // --- Dariya ---
  "DARIYA-01": {
    id: "DARIYA-01",
    src: "audio/bgm/dariya/dariya01_theme.mp3",
    loop: true,
    title: "Tea and Copper Stills",
    category: "ダリヤ関連"
  },
  "DARIYA-02": {
    id: "DARIYA-02",
    src: "audio/bgm/dariya/dariya02_game_a.mp3",
    loop: true,
    title: "The Alchemist's Ledger",
    category: "ダリヤ関連"
  },
  "DARIYA-03": {
    id: "DARIYA-03",
    src: "audio/bgm/dariya/dariya03_game_b.mp3",
    loop: true,
    title: "Clockwork Gambit",
    category: "ダリヤ関連"
  },
  "DARIYA-04": {
    id: "DARIYA-04",
    src: "audio/bgm/dariya/dariya04_game_c.mp3",
    loop: true,
    title: "Royal Reflection",
    category: "ダリヤ関連"
  },
  "DARIYA-05": {
    id: "DARIYA-05",
    src: "audio/bgm/dariya/dariya05_game_d.mp3",
    loop: true,
    title: "The Bureaucrat's Dream",
    category: "ダリヤ関連"
  },
  "DARIYA-06": {
    id: "DARIYA-06",
    src: "audio/bgm/dariya/dariya06_ending.mp3",
    loop: true,
    title: "Tea Under the Rising Sun",
    category: "ダリヤ関連"
  },
  "DARIYA-07": {
    id: "DARIYA-07",
    src: "audio/bgm/dariya/dariya07_ending2.mp3",
    loop: true,
    title: "Quiet Moonlight",
    category: "ダリヤ関連"
  },
  // --- Extra / Common Event BGM ---
  "extra_joy_1": {
    id: "extra_joy_1",
    src: "audio/bgm/extra/joy1.mp3",
    loop: true,
    title: "共通：喜び 1",
    category: "共通イベントBGM"
  },
  "extra_joy_2": {
    id: "extra_joy_2",
    src: "audio/bgm/extra/joy2.mp3",
    loop: true,
    title: "共通：喜び 2",
    category: "共通イベントBGM"
  },
  "extra_anger_1": {
    id: "extra_anger_1",
    src: "audio/bgm/extra/anger1.mp3",
    loop: true,
    title: "共通：怒り 1",
    category: "共通イベントBGM"
  },
  "extra_anger_2": {
    id: "extra_anger_2",
    src: "audio/bgm/extra/anger2.mp3",
    loop: true,
    title: "共通：怒り 2",
    category: "共通イベントBGM"
  },
  "extra_sorrow_1": {
    id: "extra_sorrow_1",
    src: "audio/bgm/extra/sorrow1.mp3",
    loop: true,
    title: "共通：悲しみ 1",
    category: "共通イベントBGM"
  },
  "extra_sorrow_2": {
    id: "extra_sorrow_2",
    src: "audio/bgm/extra/sorrow2.mp3",
    loop: true,
    title: "共通：悲しみ 2",
    category: "共通イベントBGM"
  },
  "extra_fun_1": {
    id: "extra_fun_1",
    src: "audio/bgm/extra/fun1.mp3",
    loop: true,
    title: "共通：楽しさ 1",
    category: "共通イベントBGM"
  },
  "extra_fun_2": {
    id: "extra_fun_2",
    src: "audio/bgm/extra/fun2.mp3",
    loop: true,
    title: "共通：楽しさ 2",
    category: "共通イベントBGM"
  },
  "extra_surprise_1": {
    id: "extra_surprise_1",
    src: "audio/bgm/extra/surprise1.mp3",
    loop: true,
    title: "共通：驚き 1",
    category: "共通イベントBGM"
  },
  "extra_surprise_2": {
    id: "extra_surprise_2",
    src: "audio/bgm/extra/surprise2.mp3",
    loop: true,
    title: "共通：驚き 2",
    category: "共通イベントBGM"
  }
};
function getTrackById(id) {
  return TRACKS[id] || null;
}
const SAVE_DATA_VERSION = "1.0";
const STORAGE_KEY = "made_in_maghribal_save";
const DEFAULT_AUDIO_VOLUME$1 = 0.8;
const clampVolume = (value, fallback = DEFAULT_AUDIO_VOLUME$1) => {
  if (typeof value !== "number" && typeof value !== "string") return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
};
function createDefaultSaveData() {
  return {
    version: SAVE_DATA_VERSION,
    screen: "START",
    activeHeroineId: "hakima",
    routeMode: "normal",
    workshopState: createInitialWorkshopState(),
    affection: createInitialAffection(HEROINES.map((h) => h.id)),
    seenEventIds: [],
    activeEvent: null,
    vnBacklog: [],
    seenTalkIds: [],
    textSpeed: "normal",
    instantUnreadText: false,
    bgmVolume: DEFAULT_AUDIO_VOLUME$1,
    seVolume: DEFAULT_AUDIO_VOLUME$1,
    isAudioEnabled: false,
    timestamp: Date.now()
  };
}
function normalizeSaveData(raw) {
  if (!raw || typeof raw !== "object") {
    return createDefaultSaveData();
  }
  const base = createDefaultSaveData();
  const normalized = { ...base, ...raw };
  normalized.version = SAVE_DATA_VERSION;
  if (normalized.screen === "QUIZ") {
    normalized.screen = "INTRO";
  }
  if (normalized.screen === "EVENT" && (!normalized.activeEvent || typeof normalized.activeEvent !== "object")) {
    normalized.screen = "INTRO";
  }
  const validHeroineIds = HEROINES.map((h) => h.id);
  if (!validHeroineIds.includes(normalized.activeHeroineId)) {
    normalized.activeHeroineId = base.activeHeroineId;
  }
  normalized.routeMode = normalized.routeMode === "long_history" ? "long_history" : "normal";
  const validatedAffection = {};
  validHeroineIds.forEach((id) => {
    const rawVal = raw.affection && raw.affection[id] || 0;
    validatedAffection[id] = clampAffection(Number(rawVal) || 0);
  });
  normalized.affection = validatedAffection;
  if (!normalized.workshopState || typeof normalized.workshopState !== "object") {
    normalized.workshopState = base.workshopState;
  } else {
    normalized.workshopState = {
      ...base.workshopState,
      ...normalized.workshopState
    };
  }
  normalized.isAudioEnabled = Boolean(normalized.isAudioEnabled);
  const validTextSpeeds = ["slow", "normal", "fast", "instant"];
  normalized.textSpeed = validTextSpeeds.includes(normalized.textSpeed) ? normalized.textSpeed : "normal";
  normalized.instantUnreadText = normalized.instantUnreadText === true;
  normalized.bgmVolume = clampVolume(normalized.bgmVolume);
  normalized.seVolume = clampVolume(normalized.seVolume);
  if (!Array.isArray(normalized.seenEventIds)) {
    normalized.seenEventIds = [];
  }
  if (!Array.isArray(normalized.seenTalkIds)) {
    normalized.seenTalkIds = [];
  } else {
    normalized.seenTalkIds = [...new Set(normalized.seenTalkIds.filter((id) => typeof id === "string"))];
  }
  if (normalized.activeEvent && typeof normalized.activeEvent !== "object") {
    normalized.activeEvent = null;
  }
  if (!Array.isArray(normalized.vnBacklog)) {
    normalized.vnBacklog = [];
  } else {
    normalized.vnBacklog = normalized.vnBacklog.filter((entry) => entry && typeof entry === "object" && typeof entry.text === "string").slice(-100).map((entry, index) => ({
      speaker: typeof entry.speaker === "string" ? entry.speaker : "",
      text: entry.text,
      screen: typeof entry.screen === "string" && entry.screen ? entry.screen : normalized.screen,
      heroineId: validHeroineIds.includes(entry.heroineId) ? entry.heroineId : normalized.activeHeroineId,
      routeMode: entry.routeMode === "long_history" ? "long_history" : "normal",
      sequence: Number.isFinite(entry.sequence) ? entry.sequence : index + 1
    }));
  }
  return normalized;
}
function isStorageAvailable$1() {
  try {
    return typeof localStorage !== "undefined";
  } catch (e) {
    return false;
  }
}
function saveGameData(data) {
  if (!isStorageAvailable$1()) return false;
  try {
    const serialized = JSON.stringify({
      ...data,
      timestamp: Date.now()
    });
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (e) {
    console.error("Failed to save game data:", e);
    return false;
  }
}
function loadSaveData() {
  if (!isStorageAvailable$1()) return null;
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    const parsed = JSON.parse(serialized);
    return normalizeSaveData(parsed);
  } catch (e) {
    console.error("Failed to load or parse save data:", e);
    return null;
  }
}
function clearSaveData() {
  if (!isStorageAvailable$1()) return;
  localStorage.removeItem(STORAGE_KEY);
}
function buildGameSavePayload({
  screen,
  activeHeroineId,
  routeMode,
  workshopState,
  affection,
  seenEventIds,
  seenTalkIds,
  activeEvent,
  vnBacklog,
  textSpeed,
  instantUnreadText,
  bgmVolume,
  seVolume,
  isAudioEnabled
}) {
  return {
    screen,
    activeHeroineId,
    routeMode,
    workshopState,
    affection,
    seenEventIds,
    seenTalkIds,
    activeEvent,
    vnBacklog,
    textSpeed,
    instantUnreadText,
    bgmVolume,
    seVolume,
    isAudioEnabled
  };
}
function buildSettingsSavePayload({
  routeMode,
  textSpeed,
  instantUnreadText,
  bgmVolume,
  seVolume,
  isAudioEnabled
}) {
  return {
    routeMode,
    textSpeed,
    instantUnreadText,
    bgmVolume,
    seVolume,
    isAudioEnabled
  };
}
function buildSettingsOnlySavePayload(existingSave, settings) {
  return {
    ...existingSave || {},
    ...buildSettingsSavePayload(settings)
  };
}
function resolveAutoSavePayload({
  policy,
  existingSave,
  fullSaveState,
  settingsState
}) {
  if (!policy || !policy.mode) {
    return null;
  }
  switch (policy.mode) {
    case "full":
      return buildGameSavePayload(fullSaveState);
    case "settings_only":
      return buildSettingsOnlySavePayload(existingSave, settingsState);
    case "none":
    default:
      return null;
  }
}
const AUTO_SAVE_MODE = {
  NONE: "none",
  FULL: "full",
  SETTINGS_ONLY: "settings_only"
};
function resolveAutoSavePolicy({
  screen,
  isDefaultSettings: isDefaultSettings2,
  hasExistingSave
}) {
  if (screen !== "START") {
    return {
      mode: AUTO_SAVE_MODE.FULL,
      shouldSave: true,
      shouldSetHasSave: true
    };
  }
  if (hasExistingSave || !isDefaultSettings2) {
    return {
      mode: AUTO_SAVE_MODE.SETTINGS_ONLY,
      shouldSave: true,
      shouldSetHasSave: true
    };
  }
  return {
    mode: AUTO_SAVE_MODE.NONE,
    shouldSave: false,
    shouldSetHasSave: false
  };
}
function isDefaultSettings({
  routeMode,
  textSpeed,
  instantUnreadText,
  bgmVolume,
  seVolume,
  isAudioEnabled,
  defaultAudioVolume = 0.8
}) {
  return routeMode === "normal" && textSpeed === "normal" && instantUnreadText === false && Math.abs(bgmVolume - defaultAudioVolume) < 0.01 && Math.abs(seVolume - defaultAudioVolume) < 0.01 && isAudioEnabled === false;
}
function useGameSaveStatus() {
  const [hasSave, setHasSaveState] = useState(() => {
    const data = loadSaveData();
    return !!(data && data.screen !== "START");
  });
  const refreshHasSave = useCallback(() => {
    const data = loadSaveData();
    const exists = !!(data && data.screen !== "START");
    setHasSaveState(exists);
    return exists;
  }, []);
  const clearSaveAndRefresh = useCallback(() => {
    clearSaveData();
    setHasSaveState(false);
  }, []);
  const setHasSave = useCallback((value) => {
    setHasSaveState(Boolean(value));
  }, []);
  return {
    hasSave,
    setHasSave,
    refreshHasSave,
    clearSaveAndRefresh
  };
}
const DEBUG_MODE_KEY = "made_in_maghribal_debug_mode";
const AUTO_SKIP_QUIZ_KEY = "made_in_maghribal_auto_skip_quiz";
const DEBUG_UNLOCK_ALL_KEY = "made_in_maghribal_debug_unlock_all";
function isStorageAvailable() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}
function loadBooleanFlag(key, defaultValue = false) {
  if (!isStorageAvailable()) return defaultValue;
  try {
    const val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    return val === "true";
  } catch {
    return defaultValue;
  }
}
function saveBooleanFlag(key, value) {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(key, String(Boolean(value)));
  } catch {
  }
}
function loadDebugModeEnabled() {
  return loadBooleanFlag(DEBUG_MODE_KEY, false);
}
function saveDebugModeEnabled(value) {
  saveBooleanFlag(DEBUG_MODE_KEY, value);
}
function loadAutoSkipQuizEnabled() {
  return loadBooleanFlag(AUTO_SKIP_QUIZ_KEY, false);
}
function saveAutoSkipQuizEnabled(value) {
  saveBooleanFlag(AUTO_SKIP_QUIZ_KEY, value);
}
function loadDebugUnlockAllEnabled() {
  return loadBooleanFlag(DEBUG_UNLOCK_ALL_KEY, true);
}
const GREETING_VARIATIONS = [
  {
    id: "greet_sunny",
    theme: "sunny_day",
    monologue: "（今日もいい天気だ。この日差しなら、ガラス瓶の輝きも一段と増すだろうな……）",
    heroineReactions: {
      hakima: {
        arrival: "「こんにちは。店先の瓶、今日はずいぶん綺麗に光っているわね」",
        response: "「いらっしゃい、ハキマ。ちょうど光に透かして、色の出方を見ていたところだよ」"
      },
      mira: {
        arrival: "「こんにちは、先輩。今日は光が強くて、素材の色がはっきりと見えますね」",
        response: "「ああ、ミラ。鑑定には絶好の条件だよ。今日はいい品が選べそうだ」"
      },
      dariya: {
        arrival: "「邪魔するよ、ナーディル。……ふむ、今日の店先は一段と眩しいな」",
        response: "「いらっしゃい、ダリヤさん。光が強い日は、石の地色がよく見えるんです」"
      }
    }
  },
  {
    id: "greet_hot",
    theme: "hot_day",
    monologue: "（……暑い。砂漠の朝は早いというが、今日は一段と厳しいな。冷えた水が恋しい……）",
    heroineReactions: {
      hakima: {
        arrival: "「あら、少し顔が赤いわね。砂の熱に負けていたら、目利きも鈍るわよ」",
        response: "「面目ない。水を足して、香草の冷茶でも用意しておきます」"
      },
      mira: {
        arrival: "「先輩、顔色が……。無理は禁物ですよ。水分補給を忘れないでくださいね」",
        response: "「ありがとう、ミラ。君も気をつけて。奥に冷やした水があるから、後で飲んでくれ」"
      },
      dariya: {
        arrival: "「ナーディル、少し熱に中られたか？ 王宮の冷房装置を貸してやりたいくらいだ」",
        response: "「はは……お気遣いありがとうございます。冷茶を飲んで、シャキッとしますよ」"
      }
    }
  },
  {
    id: "greet_calm",
    theme: "calm_day",
    monologue: "（今日は風が穏やかだな。街の喧騒もどこか遠くに感じる。……さて、営業の準備だ）",
    heroineReactions: {
      hakima: {
        arrival: "「いらっしゃい。今日は珍しく静かね。星瓶堂の棚まで、少し落ち着いて見えるわ」",
        response: "「ええ。こういう日は、香りも音もいつもよりよく分かる気がします」"
      },
      mira: {
        arrival: "「おはようございます、先輩。今日は街が静かで、集中して勉強できそうです」",
        response: "「ああ。こういう静かな日は、素材の微かな変化も見逃さずに済むよ」"
      },
      dariya: {
        arrival: "「邪魔するよ。今日は風がないな。王宮の騒がしさが嘘のようだ」",
        response: "「いらっしゃい。静かな朝は、鑑定の目も研ぎ澄まされる気がします」"
      }
    }
  },
  {
    id: "greet_cloudy",
    theme: "cloudy_day",
    monologue: "（曇りか……。だが、こういう日の方が影が消えて、宝石の地色がよく見えるんだよな）",
    heroineReactions: {
      hakima: {
        arrival: "「熱心に素材を眺めているわね。曇り空でも、何か見えるものがあるの？」",
        response: "「ええ。強い光がない日ほど、石や瓶の地色が素直に見えるんです」"
      },
      mira: {
        arrival: "「先輩、曇りの日は色のコントラストが抑えられて、内部の構造が観察しやすいですね」",
        response: "「その通り。ミラはよく勉強しているね。今日は深い鑑定ができそうだ」"
      },
      dariya: {
        arrival: "「ふむ、曇り空か。ナーディル、君ならこの光をどう活かす？」",
        response: "「地色を見るのに最適です。今日は普段見落としがちな微細な傷も見抜けますよ」"
      }
    }
  }
];
function getRandomGreeting(excludeIds = []) {
  const eligible = GREETING_VARIATIONS.filter((g) => !excludeIds.includes(g.id));
  const pool = eligible.length > 0 ? eligible : GREETING_VARIATIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
function prepareIntroSequence({ heroineId, currentAffection, seenTalkIds, routeMode }) {
  const greeting = getRandomGreeting();
  const talks = getIntroTalks(heroineId, currentAffection, seenTalkIds, routeMode);
  const mergedTalk = talks.length > 0 ? {
    id: `merged_${talks.map((t) => t.id).join("_")}`,
    pages: talks.flatMap((t) => t.pages)
  } : null;
  const newSeenTalkIds = talks.map((t) => t.id);
  return { greeting, mergedTalk, newSeenTalkIds };
}
function prepareResultTalkSequence({ heroineId, currentAffection, seenTalkIds, routeMode }) {
  const talk = getNextDailyTalk(heroineId, "after_result", currentAffection, seenTalkIds, routeMode);
  const newSeenTalkIds = talk ? [talk.id] : [];
  return { talk, newSeenTalkIds };
}
function prepareDayEndTalkSequence({ heroineId, currentAffection, seenTalkIds, routeMode }) {
  const talk = getNextDailyTalk(heroineId, "day_end", currentAffection, seenTalkIds, routeMode);
  const newSeenTalkIds = talk ? [talk.id] : [];
  return { talk, newSeenTalkIds };
}
const ENDINGS = {
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
const SFX = {
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
function SoundTest({ onClose, isAudioEnabled, onToggleAudio }) {
  const [currentPlayingId, setCurrentPlayingId] = useState(audioEngine.currentTrackId);
  const groups = [...new Set(SFX_CANDIDATES.map((c) => c.group))];
  const currentTrack = currentPlayingId ? Object.values(TRACKS).find((t) => t.id === currentPlayingId) : null;
  const handlePlayTrack = (track) => {
    audioEngine.playTrack(track);
    setCurrentPlayingId(track.id);
  };
  const handleStop = () => {
    audioEngine.stop();
    setCurrentPlayingId(null);
  };
  return /* @__PURE__ */ React.createElement("div", { "data-testid": "sound-test-modal", style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 2e3, display: "flex", flexDirection: "column", padding: "8px" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "600px", width: "100%", height: "100%", margin: "0 auto", background: "#1a1a1a", borderRadius: "12px", border: `1px solid ${THEME.brassDark}`, color: "#eee", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", background: "rgba(26, 42, 58, 0.98)", borderBottom: `1px solid ${THEME.brassDark}`, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, color: THEME.starGold, fontSize: "1.1rem", fontWeight: "bold" } }, "Sound Test"), /* @__PURE__ */ React.createElement("button", { "data-testid": "sound-test-close", onClick: onClose, style: { padding: "6px 12px", background: "#444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" } }, "閉じる")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.65rem", color: "#888", textTransform: "uppercase" } }, "Now Playing"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85rem", color: currentTrack ? THEME.starGold : "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "500" } }, currentTrack ? `${currentTrack.title} (${currentTrack.id})` : "None")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleStop,
      style: { padding: "8px 16px", background: currentPlayingId ? "#e53935" : "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold", transition: "background 0.2s" }
    },
    "STOP"
  ))), /* @__PURE__ */ React.createElement("div", { style: { overflowY: "auto", padding: "16px" } }, !isAudioEnabled && /* @__PURE__ */ React.createElement("div", { style: { background: "#422", padding: "12px", marginBottom: "20px", borderRadius: "8px", color: "#f88", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #622" } }, /* @__PURE__ */ React.createElement("span", null, "音声がOFFのため、再生されません。"), /* @__PURE__ */ React.createElement("button", { onClick: onToggleAudio, style: { padding: "6px 12px", background: THEME.starGold, color: THEME.textDark, border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" } }, "音をONにする")), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("h3", { style: { color: "#aaa", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.1em", fontWeight: "bold" } }, "BGM (Music)"), [...new Set(Object.values(TRACKS).map((t) => t.category || "その他"))].map((category) => /* @__PURE__ */ React.createElement("div", { key: category, style: { marginBottom: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#777", fontSize: "0.7rem", marginBottom: "8px", borderLeft: `2px solid ${THEME.brassDark}`, paddingLeft: "8px", fontWeight: "bold" } }, category), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" } }, Object.values(TRACKS).filter((t) => (t.category || "その他") === category).map((track) => {
    const isPlaying = currentPlayingId === track.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: track.id,
        onClick: () => handlePlayTrack(track),
        disabled: !isAudioEnabled,
        style: {
          background: isPlaying ? "rgba(255, 204, 0, 0.15)" : "#2a2a2a",
          padding: "10px 8px",
          borderRadius: "6px",
          border: `1px solid ${isPlaying ? THEME.starGold : "#3a3a3a"}`,
          textAlign: "left",
          cursor: isAudioEnabled ? "pointer" : "default",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          transition: "all 0.2s"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "bold", fontSize: "0.7rem", color: isPlaying ? THEME.starGold : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, track.title),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.6rem", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, track.id)
    );
  }))))), /* @__PURE__ */ React.createElement("h3", { style: { color: "#aaa", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.1em", fontWeight: "bold" } }, "SFX (Sound Effects)"), groups.map((group) => /* @__PURE__ */ React.createElement("div", { key: group, style: { marginBottom: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#777", fontSize: "0.7rem", marginBottom: "8px", borderLeft: `2px solid ${THEME.brassDark}`, paddingLeft: "8px", fontWeight: "bold" } }, group), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" } }, SFX_CANDIDATES.filter((c) => c.group === group).map((c) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: c.id,
      onClick: () => audioEngine.playSfxCandidate(c.id),
      disabled: !isAudioEnabled,
      style: {
        background: "#2a2a2a",
        padding: "8px 4px",
        borderRadius: "6px",
        border: "1px solid #3a3a3a",
        cursor: isAudioEnabled ? "pointer" : "default",
        textAlign: "center"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.65rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, c.id)
  ))))))));
}
function DebugPanel({
  routeMode,
  setRouteMode,
  affection,
  setAffection,
  seenEventIds,
  setSeenEventIds,
  onTriggerEvent,
  autoSkipQuiz,
  setAutoSkipQuiz,
  onClose
}) {
  const [expanded, setExpanded] = useState(false);
  if (!expanded) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: () => setExpanded(true),
        style: {
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.8)",
          color: THEME.starGold,
          padding: "4px 8px",
          borderRadius: "4px",
          border: `1px solid ${THEME.starGold}`,
          fontSize: "10px",
          cursor: "pointer",
          zIndex: 9999,
          fontFamily: "monospace"
        }
      },
      "DEBUG / ASSIST"
    );
  }
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.95)",
    color: "#fff",
    padding: "16px",
    zIndex: 9999,
    overflowY: "auto",
    fontFamily: "monospace",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    boxSizing: "border-box"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${THEME.brass}`,
    paddingBottom: "8px",
    flexShrink: 0
  } }, /* @__PURE__ */ React.createElement("h2", { style: { color: THEME.starGold, margin: 0, fontSize: "0.9em", letterSpacing: "0.05em" } }, "DEBUG / ASSIST"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setExpanded(false),
      style: {
        background: THEME.brass,
        color: THEME.textDark,
        border: "none",
        padding: "4px 8px",
        borderRadius: "3px",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: "bold",
        flexShrink: 0
      }
    },
    "MINIMIZE"
  )), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("div", { style: { color: THEME.brass, marginBottom: "5px" } }, "[ GLOBAL MODE ]"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setRouteMode("normal"),
      style: {
        flex: 1,
        padding: "8px",
        background: routeMode === "normal" ? THEME.brass : "#333",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }
    },
    "NORMAL"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setRouteMode("long_history"),
      style: {
        flex: 1,
        padding: "8px",
        background: routeMode === "long_history" ? THEME.starGold : "#333",
        color: "#000",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }
    },
    "LONG HISTORY"
  ))), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("div", { style: { color: THEME.brass, marginBottom: "5px" } }, "[ STORY ASSIST ]"), /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "4px" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: autoSkipQuiz,
      onChange: (e) => setAutoSkipQuiz(e.target.checked)
    }
  ), /* @__PURE__ */ React.createElement("span", null, "Auto Complete Quiz (Story Focus)"))), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("div", { style: { color: THEME.brass, marginBottom: "5px" } }, "[ HEROINE & EVENTS ]"), HEROINES.map((h) => /* @__PURE__ */ React.createElement("div", { key: h.id, style: { marginBottom: "15px", padding: "10px", border: "1px solid #444", borderRadius: "4px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "bold", marginBottom: "8px" } }, h.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" } }, /* @__PURE__ */ React.createElement("span", null, "Aff: ", affection[h.id]), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "0",
      max: "100",
      value: affection[h.id],
      onChange: (e) => setAffection((prev) => ({ ...prev, [h.id]: parseInt(e.target.value) })),
      style: { flex: 1 }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "5px" } }, ["_20", "_climax"].map((suffix) => {
    const eventId = `${h.id}${suffix}`;
    const ev = (AFFECTION_EVENTS[h.id] || []).find((e) => e.id === eventId);
    if (!ev) return null;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: eventId,
        onClick: () => onTriggerEvent(ev),
        style: {
          fontSize: "10px",
          padding: "4px 8px",
          background: "#444",
          color: "#fff",
          border: "none",
          borderRadius: "2px",
          cursor: "pointer"
        }
      },
      "Jump ",
      suffix
    );
  }))))), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("div", { style: { color: THEME.brass, marginBottom: "5px" } }, "[ FLAGS ]"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "10px", background: "#222", padding: "5px", maxHeight: "100px", overflowY: "auto", marginBottom: "5px" } }, "Seen: ", seenEventIds.join(", ") || "(none)"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSeenEventIds([]),
      style: { width: "100%", padding: "5px", background: "#622", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }
    },
    "RESET SEEN FLAGS"
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setExpanded(false),
      style: { marginTop: "auto", padding: "12px", background: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }
    },
    "BACK TO GAME"
  ));
}
const TEXT_SPEED_META = {
  slow: { label: "遅い", delay: 45 },
  normal: { label: "標準", delay: 30 },
  fast: { label: "速い", delay: 18 },
  instant: { label: "瞬時", delay: 0 }
};
const getTextSpeedMeta = (textSpeed) => TEXT_SPEED_META[textSpeed] || TEXT_SPEED_META.normal;
const DEFAULT_AUDIO_VOLUME = 0.8;
function App() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState("START");
  const [activeHeroineId, setActiveHeroineId] = useState("hakima");
  const [routeMode, setRouteMode] = useState("normal");
  const [previewHeroineId, setPreviewHeroineId] = useState("hakima");
  const [workshopState, setWorkshopState] = useState(createInitialWorkshopState());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isAudioGated, setIsAudioGated] = useState(true);
  const [showSoundTest, setShowSoundTest] = useState(false);
  const { hasSave, setHasSave, refreshHasSave, clearSaveAndRefresh } = useGameSaveStatus();
  const [bgTestIndex, setBgTestIndex] = useState(0);
  const [stillTestIndex, setStillTestIndex] = useState(0);
  const [visualTestMode, setVisualTestMode] = useState("background");
  const [vnBacklog, setVnBacklog] = useState([]);
  const [textSpeed, setTextSpeed] = useState("normal");
  const [instantUnreadText, setInstantUnreadText] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(DEFAULT_AUDIO_VOLUME);
  const [seVolume, setSeVolume] = useState(DEFAULT_AUDIO_VOLUME);
  const backlogScrollRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isUnlockAllDebug] = useState(() => loadDebugUnlockAllEnabled());
  const [debugModeEnabled, setDebugModeEnabled] = useState(() => loadDebugModeEnabled());
  const [autoSkipQuiz, setAutoSkipQuiz] = useState(() => loadAutoSkipQuizEnabled());
  useEffect(() => {
    saveDebugModeEnabled(debugModeEnabled);
  }, [debugModeEnabled]);
  useEffect(() => {
    saveAutoSkipQuizEnabled(autoSkipQuiz);
  }, [autoSkipQuiz]);
  useEffect(() => {
    if (screen === "QUIZ" && autoSkipQuiz && session && !debugAutoSkipAppliedRef.current) {
      debugAutoSkipAppliedRef.current = true;
      const timer = setTimeout(() => {
        const totalCount = session.questions.length;
        const result = createPerfectQuizPayload(
          totalCount,
          activeHeroineId,
          affection[activeHeroineId] || 0,
          seenEventIds
        );
        applyQuizResultState(result);
      }, 500);
      return () => clearTimeout(timer);
    }
    if (screen !== "QUIZ") {
      debugAutoSkipAppliedRef.current = false;
    }
  }, [screen, autoSkipQuiz, session]);
  const [affection, setAffection] = useState(
    () => createInitialAffection(HEROINES.map((h) => h.id))
  );
  const [lastAffectionGain, setLastAffectionGain] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [seenEventIds, setSeenEventIds] = useState([]);
  const [seenTalkIds, setSeenTalkIds] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeDailyTalk, setActiveDailyTalk] = useState(null);
  const [eventHeroineExpression, setEventHeroineExpression] = useState("normal");
  const [eventSpeakerId, setEventSpeakerId] = useState(null);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [eventBackgroundOverride, setEventBackgroundOverride] = useState(null);
  const [activeGreeting, setActiveGreeting] = useState(null);
  const [dailyTalkNextScreen, setDailyTalkNextScreen] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHeroineLoading, setIsHeroineLoading] = useState(false);
  const outerWrapperRef = useRef(null);
  const vnRef = useRef(null);
  const debugAutoSkipAppliedRef = useRef(false);
  const BASE_WIDTH = 390;
  const BASE_HEIGHT = 780;
  const MAX_LOGICAL_WIDTH = 560;
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 1.25;
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? ((_a = window.visualViewport) == null ? void 0 : _a.height) || window.innerHeight : 780
  });
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    var _a2, _b2;
    const handleResize = () => {
      const viewport = window.visualViewport;
      const doc = document.documentElement;
      const newWidth = Math.floor(Math.min((viewport == null ? void 0 : viewport.width) || window.innerWidth, (doc == null ? void 0 : doc.clientWidth) || window.innerWidth));
      const newHeight = Math.floor(Math.min((viewport == null ? void 0 : viewport.height) || window.innerHeight, (doc == null ? void 0 : doc.clientHeight) || window.innerHeight));
      setViewportSize((prev) => {
        if (Math.abs(prev.width - newWidth) <= 1 && Math.abs(prev.height - newHeight) <= 1) return prev;
        return { width: newWidth, height: newHeight };
      });
    };
    handleResize();
    const resizeEvents = ["resize", "orientationchange"];
    resizeEvents.forEach((e) => window.addEventListener(e, handleResize));
    (_a2 = window.visualViewport) == null ? void 0 : _a2.addEventListener("resize", handleResize);
    (_b2 = window.visualViewport) == null ? void 0 : _b2.addEventListener("scroll", handleResize);
    return () => {
      var _a3, _b3;
      resizeEvents.forEach((e) => window.removeEventListener(e, handleResize));
      (_a3 = window.visualViewport) == null ? void 0 : _a3.removeEventListener("resize", handleResize);
      (_b3 = window.visualViewport) == null ? void 0 : _b3.removeEventListener("scroll", handleResize);
    };
  }, []);
  useEffect(() => {
    var _a2;
    if (typeof ResizeObserver === "undefined") return;
    const target = ((_a2 = outerWrapperRef.current) == null ? void 0 : _a2.parentElement) || document.body;
    const isRoot = target === document.body || target === document.documentElement || target.id === "root";
    const observer = new ResizeObserver((entries) => {
      var _a3;
      const rect = (_a3 = entries[0]) == null ? void 0 : _a3.contentRect;
      if (!rect) return;
      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);
      setHostSize((prev) => {
        if (isRoot && Math.abs(prev.width - newWidth) <= 2 && Math.abs(prev.height - newHeight) <= 2) return prev;
        if (prev.width === newWidth && prev.height === newHeight) return prev;
        return { width: newWidth, height: newHeight };
      });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (showLog && backlogScrollRef.current) {
      backlogScrollRef.current.scrollTop = backlogScrollRef.current.scrollHeight;
    }
  }, [showLog, vnBacklog]);
  const measuredSize = {
    width: hostSize.width || viewportSize.width,
    height: hostSize.height || viewportSize.height
  };
  const rawScale = Math.min(
    measuredSize.width / BASE_WIDTH,
    measuredSize.height / BASE_HEIGHT
  );
  const scale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE);
  const logicalWidth = Math.min(
    MAX_LOGICAL_WIDTH,
    Math.max(BASE_WIDTH, Math.floor(measuredSize.width / scale))
  );
  const handleVnAreaClick = (e) => {
    if (shouldIgnoreVnAdvanceClick(e, { showOptions, showLog, showHelp, showSoundTest })) return;
    safeAdvanceVnBox(vnRef);
  };
  const outerWrapperStyle = {
    width: "100%",
    height: "100dvh",
    // Use viewport height for the host container
    backgroundColor: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // Center the scaled canvas
    overflow: "hidden",
    position: "relative"
  };
  const canvasContainerStyle = {
    width: `${logicalWidth * scale}px`,
    height: `${BASE_HEIGHT * scale}px`,
    position: "relative",
    flexShrink: 0
  };
  const canvasStyle = {
    width: `${logicalWidth}px`,
    height: `${BASE_HEIGHT}px`,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    background: "#1a2a3a",
    color: "#eee"
  };
  useEffect(() => {
    const data = loadSaveData();
    if (data) {
      setHasSave(data.screen !== "START");
      setRouteMode(data.routeMode || "normal");
      setTextSpeed(data.textSpeed || "normal");
      setInstantUnreadText(data.instantUnreadText === true);
      setBgmVolume(Number.isFinite(data.bgmVolume) ? data.bgmVolume : DEFAULT_AUDIO_VOLUME);
      setSeVolume(Number.isFinite(data.seVolume) ? data.seVolume : DEFAULT_AUDIO_VOLUME);
      setIsAudioEnabled(Boolean(data.isAudioEnabled));
      setSeenEventIds(data.seenEventIds || []);
      setSeenTalkIds(data.seenTalkIds || []);
    }
  }, []);
  useEffect(() => {
    if (screen !== "START") {
      setIsAudioGated(false);
    }
  }, [screen]);
  useEffect(() => {
    if (activeEvent) {
      setEventHeroineExpression(activeEvent.expression || "normal");
    }
  }, [activeEvent]);
  useEffect(() => {
    const policy = resolveAutoSavePolicy({
      screen,
      isDefaultSettings: isDefaultSettings({
        routeMode,
        textSpeed,
        instantUnreadText,
        bgmVolume,
        seVolume,
        isAudioEnabled,
        defaultAudioVolume: DEFAULT_AUDIO_VOLUME
      }),
      hasExistingSave: Boolean(loadSaveData())
    });
    const currentData = loadSaveData();
    const payload = resolveAutoSavePayload({
      policy,
      existingSave: currentData,
      fullSaveState: {
        screen: screen === "EVENT" ? "RESULT" : screen,
        // Fallback EVENT to RESULT for safety
        activeHeroineId,
        routeMode,
        workshopState,
        affection,
        textSpeed,
        instantUnreadText,
        bgmVolume,
        seVolume,
        isAudioEnabled,
        seenEventIds,
        seenTalkIds,
        activeEvent,
        vnBacklog
      },
      settingsState: {
        routeMode,
        textSpeed,
        instantUnreadText,
        bgmVolume,
        seVolume,
        isAudioEnabled
      }
    });
    if (payload !== null) {
      saveGameData(payload);
      setHasSave(true);
    } else {
      if (currentData && currentData.screen !== "START") {
        setHasSave(true);
      } else {
        setHasSave(false);
      }
    }
  }, [screen, activeHeroineId, routeMode, workshopState, affection, textSpeed, instantUnreadText, bgmVolume, seVolume, isAudioEnabled, seenEventIds, seenTalkIds, activeEvent, vnBacklog]);
  useEffect(() => {
    audioEngine.setBgmVolume(bgmVolume);
  }, [bgmVolume]);
  useEffect(() => {
    audioEngine.setSeVolume(seVolume);
  }, [seVolume]);
  useEffect(() => {
    audioEngine.setMuted(!isAudioEnabled);
  }, [isAudioEnabled]);
  useEffect(() => {
    let trackId = null;
    const day = workshopState.day || 1;
    const hPrefix = (activeHeroineId || "hakima").toUpperCase();
    if (screen === "START" || screen === "HEROINE_SELECT" || screen === "MEMORIES" || screen === "PROLOGUE") {
      trackId = "MAIN-01";
    } else if (screen === "QUIZ") {
      if (day <= 2) {
        trackId = "MAIN-03";
      } else if (day <= 4) {
        trackId = `${hPrefix}-02`;
      } else if (day <= 6) {
        trackId = `${hPrefix}-03`;
      } else if (day <= 8) {
        trackId = `${hPrefix}-04`;
      } else {
        trackId = `${hPrefix}-05`;
      }
    } else if (screen === "INTRO" || screen === "RESULT" || screen === "DAY_END") {
      trackId = "MAIN-02";
    } else if (screen === "EVENT") {
      trackId = `${hPrefix}-01`;
    } else if (screen === "ENDING") {
      const finalAffection = affection[activeHeroineId];
      const finalReputation = workshopState.reputation;
      if (finalAffection >= 80 && finalReputation >= 40) {
        trackId = `${hPrefix}-07`;
      } else {
        trackId = `${hPrefix}-06`;
      }
    }
    const isGatedOnStart = screen === "START" && isAudioGated;
    if (isAudioEnabled && !isGatedOnStart && trackId && TRACKS[trackId]) {
      audioEngine.playTrack(TRACKS[trackId]);
    } else {
      audioEngine.stop();
    }
  }, [screen, workshopState.day, activeHeroineId, affection, workshopState.reputation, isAudioEnabled, isAudioGated]);
  const activeHeroine = HEROINES.find((h) => h.id === activeHeroineId) || HEROINES[0];
  const textSpeedMeta = getTextSpeedMeta(textSpeed);
  const isInstantTextSpeed = textSpeed === "instant" || instantUnreadText;
  const handleStartGame = () => {
    setIsAudioGated(false);
    audioEngine.playSfx("uiGameStart");
    clearSaveAndRefresh();
    setActiveHeroineId("hakima");
    setPreviewHeroineId("hakima");
    setWorkshopState(createInitialWorkshopState());
    setAffection(createInitialAffection(HEROINES.map((h) => h.id)));
    setSeenEventIds([]);
    setActiveEvent(null);
    setVnBacklog([]);
    setSession(null);
    setScreen("PROLOGUE");
  };
  const handleContinue = () => {
    setIsAudioGated(false);
    const data = loadSaveData();
    if (data) {
      audioEngine.playSfx("uiConfirmChime");
      setScreen(data.screen);
      setActiveHeroineId(data.activeHeroineId);
      setRouteMode(data.routeMode || "normal");
      setTextSpeed(data.textSpeed || "normal");
      setInstantUnreadText(data.instantUnreadText === true);
      setBgmVolume(Number.isFinite(data.bgmVolume) ? data.bgmVolume : DEFAULT_AUDIO_VOLUME);
      setSeVolume(Number.isFinite(data.seVolume) ? data.seVolume : DEFAULT_AUDIO_VOLUME);
      setWorkshopState(data.workshopState);
      setAffection(data.affection);
      setSeenEventIds(data.seenEventIds || []);
      setActiveEvent(data.activeEvent || null);
      setVnBacklog(data.vnBacklog || []);
      setIsAudioEnabled(data.isAudioEnabled);
    }
  };
  const handleResetSave = () => {
    if (window.confirm("セーブデータを削除しますか？")) {
      clearSaveAndRefresh();
      setSeenEventIds([]);
      setActiveEvent(null);
    }
  };
  const handleCloseEvent = () => {
    audioEngine.playSfx("uiTapBottle");
    const {
      shouldMarkSeen,
      nextScreen,
      shouldClearBackgroundOverride,
      shouldPlayDayEndSfx
    } = resolveEventCloseActions({ event: activeEvent, isRecallMode });
    if (shouldMarkSeen && activeEvent) {
      setSeenEventIds((prev) => [...prev, activeEvent.id]);
    }
    setActiveEvent(null);
    if (shouldClearBackgroundOverride) {
      setEventBackgroundOverride(null);
    }
    switch (nextScreen) {
      case "MEMORIES":
        setIsRecallMode(false);
        setScreen("MEMORIES");
        break;
      case "INTRO":
        setScreen("INTRO");
        break;
      case "DAY_END":
      default:
        if (shouldPlayDayEndSfx) {
          audioEngine.playSfx("workshopDayEnd");
        }
        setScreen("DAY_END");
        break;
    }
  };
  useEffect(() => {
    const asset = (type, src) => ({ type, src: `${"https://kawauikei.github.io/made-in-maghribal/"}${src}`.replace(/([^:])\/\//g, "$1/") });
    const expressions = ["normal", "joy", "fun", "sorrow", "anger", "surprise", "cry", "student", "social", "maid"];
    const essentialAssets = [
      ...Object.values(TRACKS).map((track) => asset("audio", track.src)),
      ...Object.values(SFX).map((sfx) => asset("audio", sfx.src)),
      ...Object.values(BACKGROUND_IMAGES).map((bg) => asset("image", bg.src)),
      ...Object.values(STILL_IMAGES).map((still) => asset("image", still.src)),
      asset("image", "characters/common/standing_proc/running_group.png"),
      ...itemsData.items.map((item) => asset("image", item.image)),
      ...HEROINES.flatMap((heroine) => expressions.flatMap((expression) => [
        asset("image", `characters/${heroine.id}/face_proc/${expression}.png`),
        asset("image", `characters/${heroine.id}/standing_proc/${expression}.png`)
      ]))
    ].filter((entry, index, list) => list.findIndex((item) => item.src === entry.src) === index);
    const loadAll = async () => {
      await preloadAssets(essentialAssets, setLoadingProgress);
      setIsInitialLoading(false);
    };
    loadAll();
  }, []);
  const preloadAssets = async (assetList, onProgress) => {
    let loadedCount = 0;
    const totalCount = assetList.length;
    if (totalCount === 0) return;
    const loadPromises = assetList.map(async (asset) => {
      try {
        if (asset.type === "image") {
          await new Promise((resolve) => {
            const img = new Image();
            img.src = asset.src;
            img.onload = resolve;
            img.onerror = resolve;
          });
        } else if (asset.type === "audio") {
          const audio = new Audio(asset.src);
          audio.preload = "auto";
        }
        loadedCount++;
        if (onProgress) onProgress(Math.floor(loadedCount / totalCount * 100));
      } catch (err) {
        console.warn("Preload failed:", asset.src);
      }
    });
    await Promise.all(loadPromises);
  };
  const handleSelectHeroine = async (heroineId) => {
    audioEngine.playSfx("uiHeroineSelect");
    setIsHeroineLoading(true);
    setLoadingProgress(0);
    const heroine = HEROINES.find((h) => h.id === heroineId);
    const themeTrack = getTrackById(heroine.themeTrackId);
    const heroineAssets = [
      { type: "audio", src: `${"https://kawauikei.github.io/made-in-maghribal/"}${themeTrack.src}`.replace(/([^:])\/\//g, "$1/") },
      { type: "image", src: `${"https://kawauikei.github.io/made-in-maghribal/"}characters/${heroineId}/standing_proc/normal.png`.replace(/([^:])\/\//g, "$1/") },
      { type: "image", src: `${"https://kawauikei.github.io/made-in-maghribal/"}characters/${heroineId}/face_proc/normal.png`.replace(/([^:])\/\//g, "$1/") }
    ];
    await preloadAssets(heroineAssets, setLoadingProgress);
    setActiveHeroineId(heroineId);
    setWorkshopState((prev) => ({ ...prev, activeHeroineId: heroineId }));
    const { greeting, mergedTalk, newSeenTalkIds } = prepareIntroSequence({
      heroineId,
      currentAffection: affection[heroineId] || 0,
      seenTalkIds,
      routeMode
    });
    setActiveGreeting(greeting);
    setActiveDailyTalk(mergedTalk);
    if (newSeenTalkIds.length > 0) {
      setSeenTalkIds((prev) => [...prev, ...newSeenTalkIds]);
    }
    saveGameData(buildGameSavePayload({
      routeMode,
      workshopState: { ...workshopState, activeHeroineId: heroineId },
      affection,
      textSpeed,
      instantUnreadText,
      bgmVolume,
      seVolume,
      seenEventIds,
      seenTalkIds,
      vnBacklog,
      isAudioEnabled,
      activeHeroineId,
      activeEvent: null,
      screen: "HEROINE_SELECT"
    }));
    const flashbackEvent = resolveHeroineSelectionEvent({ heroineId, seenEventIds });
    setTimeout(() => {
      setIsHeroineLoading(false);
      if (flashbackEvent) {
        setActiveEvent(flashbackEvent);
        setScreen("EVENT");
      } else {
        setScreen("INTRO");
      }
    }, 500);
  };
  const handleNextDay = () => {
    audioEngine.playSfx("uiTapBottle");
    if (workshopState.day >= 10) {
      setScreen("FINAL_RESULT");
    } else {
      const nextDay = workshopState.day + 1;
      setWorkshopState((prev) => ({ ...prev, day: nextDay }));
      const { talk: dayEndTalk, newSeenTalkIds: newDayEndTalkIds } = prepareDayEndTalkSequence({
        heroineId: activeHeroineId,
        currentAffection: affection[activeHeroineId] || 0,
        seenTalkIds,
        routeMode
      });
      if (dayEndTalk) {
        setActiveDailyTalk(dayEndTalk);
        setDailyTalkNextScreen("INTRO");
        if (newDayEndTalkIds.length > 0) {
          setSeenTalkIds((prev) => [...prev, ...newDayEndTalkIds]);
        }
        setScreen("DAILY_TALK");
      } else {
        const { greeting, mergedTalk, newSeenTalkIds } = prepareIntroSequence({
          heroineId: activeHeroineId,
          currentAffection: affection[activeHeroineId] || 0,
          seenTalkIds,
          routeMode
        });
        setActiveGreeting(greeting);
        setActiveDailyTalk(mergedTalk);
        if (newSeenTalkIds.length > 0) {
          setSeenTalkIds((prev) => [...prev, ...newSeenTalkIds]);
        }
        setScreen("INTRO");
      }
    }
  };
  const handleSeeEnding = () => {
    audioEngine.playSfx("uiConfirmChime");
    setScreen("ENDING");
  };
  const handleFinishGame = () => {
    audioEngine.playSfx("uiTapBottle");
    clearSaveAndRefresh();
    setScreen("START");
  };
  const handleBeginService = (talkId = null) => {
    audioEngine.playSfx("uiTapBottle");
    if (talkId) {
      setSeenTalkIds((prev) => {
        if (prev.includes(talkId)) return prev;
        const next = [...prev, talkId];
        saveGameData({
          ...loadSaveData(),
          seenTalkIds: next
        });
        return next;
      });
    }
    setActiveDailyTalk(null);
    setSession(createQuizSession({ questionCount: 5 }));
    setScreen("QUIZ");
  };
  const handleCloseDailyTalk = () => {
    audioEngine.playSfx("uiTapBottle");
    const nextScreen = dailyTalkNextScreen || "DAY_END";
    setDailyTalkNextScreen(null);
    setActiveDailyTalk(null);
    setScreen(nextScreen);
  };
  const handleEndDay = () => {
    if (activeEvent) {
      setScreen("EVENT");
    } else {
      const { talk: resultTalk, newSeenTalkIds: newResultTalkIds } = prepareResultTalkSequence({
        heroineId: activeHeroineId,
        currentAffection: affection[activeHeroineId] || 0,
        seenTalkIds,
        routeMode
      });
      if (resultTalk) {
        setActiveDailyTalk(resultTalk);
        setDailyTalkNextScreen("DAY_END");
        if (newResultTalkIds.length > 0) {
          setSeenTalkIds((prev) => [...prev, ...newResultTalkIds]);
        }
        setScreen("DAILY_TALK");
      } else {
        audioEngine.playSfx("workshopDayEnd");
        setScreen("DAY_END");
      }
    }
  };
  const handleBackToTitle = () => {
    audioEngine.playSfx("uiTapBottle");
    setScreen("START");
    refreshHasSave();
    setEventBackgroundOverride(null);
    setShowOptions(false);
    setShowLog(false);
    setShowHelp(false);
  };
  const handleRecallEventFromMemories = (event) => {
    audioEngine.playSfx("uiConfirmChime");
    setEventBackgroundOverride(null);
    setActiveEvent(event);
    setIsRecallMode(true);
    setActiveHeroineId(event.heroineId);
    setScreen("EVENT");
  };
  const appendVnBacklog = ({ speaker, speakerId, expression, text, screen: sourceScreen }) => {
    if (!text) return;
    setVnBacklog((prev) => {
      const last = prev[prev.length - 1];
      if ((last == null ? void 0 : last.screen) === sourceScreen && (last == null ? void 0 : last.speaker) === speaker && (last == null ? void 0 : last.text) === text) {
        return prev;
      }
      return [
        ...prev,
        {
          speaker: speaker || "",
          speakerId: speakerId || null,
          expression: expression || "normal",
          text,
          screen: sourceScreen || screen,
          heroineId: activeHeroineId,
          routeMode,
          sequence: prev.length + 1
        }
      ];
    });
  };
  const finishQuizWithResult = (correctCount) => {
    var _a2;
    const totalCount = ((_a2 = session == null ? void 0 : session.questions) == null ? void 0 : _a2.length) || 5;
    const result = resolveQuizCompletion({
      correctCount,
      totalCount,
      activeHeroineId,
      currentAffection: affection[activeHeroineId] || 0,
      seenEventIds
    });
    applyQuizResultState(result);
  };
  const applyQuizResultState = (result) => {
    const nextAffection = addAffection(affection, activeHeroineId, result.affectionGain);
    setAffection(nextAffection);
    setLastAffectionGain(result.affectionGain);
    setWorkshopState((prev) => applyWorkshopResult(prev, result.workshopResult));
    if (result.unlockedEvent) {
      setActiveEvent(result.unlockedEvent);
    }
    setScreen("RESULT");
  };
  const handleSelect = (itemId) => {
    if (!session || session.isFinished || quizFeedback) return;
    const updatedSession = answerQuestion(session, itemId);
    const lastAnswer = updatedSession.answers[updatedSession.answers.length - 1];
    const isCorrect = lastAnswer.isCorrect;
    setQuizFeedback({ itemId, isCorrect });
    setTimeout(() => {
      if (isCorrect) {
        audioEngine.playSfx("quizCorrectStarChime");
      } else {
        audioEngine.playSfx("quizWrongSandTap");
      }
      setTimeout(() => {
        setQuizFeedback(null);
        setSession(updatedSession);
        if (updatedSession.isFinished) {
          const correctCount = updatedSession.answers.filter((a) => a.isCorrect).length;
          finishQuizWithResult(correctCount);
        }
      }, 650);
    }, 150);
  };
  const getFullPath = (src) => `${"https://kawauikei.github.io/made-in-maghribal/"}${src}`.replace(/([^:])\/\//g, "$1/");
  const getFileName = (path) => (path == null ? void 0 : path.split("/").pop()) || "";
  const renderBackground = (screenOrId) => {
    const SCREEN_BACKGROUNDS = {
      INTRO: "shopInteriorService",
      RESULT: "shopInteriorService",
      DAY_END: "shopExteriorNight",
      PROLOGUE: "shopExteriorNight"
    };
    const bgId = eventBackgroundOverride || SCREEN_BACKGROUNDS[screenOrId] || screenOrId;
    if (!bgId) return null;
    const bg = BACKGROUND_IMAGES[bgId];
    if (!bg) return null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url(${getFullPath(bg.src)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      zIndex: 0,
      pointerEvents: "none",
      userSelect: "none",
      WebkitUserSelect: "none"
    }, draggable: false }), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(26, 42, 58, 0.5)",
      zIndex: 1,
      pointerEvents: "none",
      userSelect: "none",
      WebkitUserSelect: "none"
    } }));
  };
  const renderThemeStyles = () => /* @__PURE__ */ React.createElement("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Outfit:wght@400;500;700&display=swap');
      
      .game-root {
        font-family: 'Outfit', 'Inter', sans-serif;
        color: ${THEME.parchment};
        background-color: ${THEME.midnight};
        overflow: hidden;
        width: 100%;
        height: 100%;
        position: relative;
        /* Selection Prevention */
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        /* Image Drag Prevention */
        -webkit-user-drag: none;
      }

      /* Global interactive element tuning */
      button, [role="button"], .interactive-card, .item-card, .heroine-card, .vn-box, .quiz-option-0, .quiz-option-1 {
        touch-action: manipulation;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      img {
        -webkit-user-drag: none;
        user-drag: none;
        pointer-events: none;
        user-select: none;
      }

      button:active, .item-card:active { transform: scale(0.96); transition: transform 0.1s; }
      button:focus-visible { outline: 3px solid ${THEME.starGold}; outline-offset: 2px; }
      .heroine-card { transition: transform 0.2s; border: 2px solid ${THEME.brassDark}; }
      .heroine-card:active { transform: scale(0.98); background: ${THEME.sand} !important; }
      .memory-item { border-left: 4px solid ${THEME.brassDark}; background: rgba(0,0,0,0.1); transition: background 0.2s; }
      .memory-item:active { background: rgba(197, 160, 89, 0.2); }
      
      @keyframes screenIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .screen-enter {
        animation: screenIn 0.4s ease-out forwards;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        alignItems: center;
      }

      /* Scrollable areas exception */
      .scrollable-content, .log-content, .help-content, .selectable-text {
        user-select: text;
        -webkit-user-select: text;
        touch-action: pan-y;
      }

      /* Quiz Animations (M9-3 / M-UI-TRANSITION-POLISH) */
      @keyframes staggerIn {
        from { opacity: 0; transform: translateY(15px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .quiz-question-bubble { animation: staggerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .quiz-rhythm-lane { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.2s; }
      .quiz-option-0 { animation: staggerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.4s; }
      .quiz-option-1 { animation: staggerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.55s; }

      .item-card {
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s, background 0.2s;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      .item-card:hover {
        box-shadow: 0 8px 25px rgba(197, 160, 89, 0.25);
      }

      /* Story/VN Button Reveal (M-UI-TRANSITION-POLISH) */
      @keyframes vn-button-reveal {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .vn-button-reveal {
        animation: vn-button-reveal 0.25s ease-out forwards;
      }

      /* VN Global Fade Animations (B-2) */
      @keyframes vn-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes vn-fade-out { from { opacity: 1; } to { opacity: 0; } }

      /* Beat Lane Pulse & Halo (M-RHYTHM-UI-1-POLISH) */
      @keyframes beat-lane-pulse {
        0%, 100% { transform: scale(1); filter: brightness(1); box-shadow: 0 0 8px ${THEME.brass}88; }
        50% { transform: scale(1.15); filter: brightness(1.4); box-shadow: 0 0 20px ${THEME.brass}; }
      }
      @keyframes beat-halo-expand {
        0% { transform: scale(0.8); opacity: 0.9; }
        100% { transform: scale(2.8); opacity: 0; }
      }
      .beat-pulse {
        animation: beat-lane-pulse 2s infinite ease-in-out;
      }
      .beat-halo {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 1px solid ${THEME.brass};
        box-shadow: 0 0 10px ${THEME.brass};
        animation: beat-halo-expand 2s infinite ease-out;
        pointer-events: none;
        z-index: -1;
      }

      /* Customer Silhouette Icon (M-QUIZ-SILHOUETTE-ICON) */
      .customer-silhouette {
        position: relative;
        display: inline-block;
        width: 1.8em;
        height: 1.8em;
        border-radius: 999px;
        background: rgba(35, 25, 18, 0.9);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid rgba(218, 180, 96, 0.45);
        flex: 0 0 auto;
        vertical-align: middle;
        margin-right: 12px;
      }

      .customer-silhouette::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 25%;
        width: 0.52em;
        height: 0.52em;
        transform: translateX(-50%);
        border-radius: 999px;
        background: #f4e9d5;
      }

      .customer-silhouette::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: 20%;
        width: 1.0em;
        height: 0.55em;
        transform: translateX(-50%);
        border-radius: 999px 999px 0.25em 0.25em;
        background: #f4e9d5;
      }

      @keyframes goldFlash {
        0% { box-shadow: 0 0 0 0 rgba(255, 204, 0, 0); border-color: ${THEME.brass}; }
        50% { box-shadow: 0 0 30px 10px rgba(255, 204, 0, 0.8); border-color: #ffcc00; background: #fffdf0; }
        100% { box-shadow: 0 0 15px 5px rgba(255, 204, 0, 0.4); border-color: #ffcc00; background: #fffdf0; }
      }
      .feedback-correct { 
        animation: goldFlash 0.5s ease-out forwards; 
        z-index: 10;
        transform: scale(1.05) !important;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
      }
      .feedback-wrong { 
        animation: shake 0.4s ease-in-out; 
        border-color: #f44 !important; 
        background: #fff5f5 !important;
        opacity: 0.8;
      }
    `);
  const utilityHeaderStyle = {
    width: "100%",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "6px 8px",
    marginBottom: "8px",
    background: "rgba(26, 42, 58, 0.96)",
    borderBottom: `1px solid ${THEME.brass}`,
    boxSizing: "border-box",
    flexShrink: 0,
    zIndex: 20
  };
  const utilityBackButtonStyle = {
    ...buttonStyle,
    margin: 0,
    padding: "7px 10px",
    minWidth: "72px",
    fontSize: "0.82em",
    background: THEME.nightBlue,
    color: THEME.sand,
    border: `1px solid ${THEME.brass}`,
    boxShadow: "none"
  };
  const renderUtilityHeader = (title, action = handleBackToTitle, right = null, testId = null) => /* @__PURE__ */ React.createElement("div", { style: utilityHeaderStyle }, /* @__PURE__ */ React.createElement("button", { "data-testid": testId ? `${testId}-back` : void 0, onClick: action, style: utilityBackButtonStyle }, "戻る"), /* @__PURE__ */ React.createElement("div", { style: {
    color: THEME.sand,
    fontWeight: "bold",
    fontSize: "0.95em",
    textAlign: "center",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis"
  } }, title), /* @__PURE__ */ React.createElement("div", { style: { minWidth: "72px", display: "flex", justifyContent: "flex-end" } }, right));
  const getFaceIcon = (id, type, expression) => {
    const assetPath = getHeroineAsset(id, type, expression);
    return assetPath ? `${"https://kawauikei.github.io/made-in-maghribal/"}${assetPath}`.replace(/([^:])\/\//g, "$1/") : null;
  };
  let mainContent = null;
  if (screen === "START") {
    mainContent = /* @__PURE__ */ React.createElement(
      StartScreen,
      {
        screen,
        routeMode,
        setRouteMode,
        hasSave,
        onContinue: handleContinue,
        onNewGame: handleStartGame,
        onOpenMemories: () => setScreen("MEMORIES"),
        onOpenOptions: () => setShowOptions(true),
        onOpenSoundTest: () => setShowSoundTest(true),
        onOpenVisualTest: () => setScreen("VISUAL_TEST"),
        onClearSaveData: handleResetSave,
        onOpenLog: () => setShowLog(true),
        onOpenHelp: () => setShowHelp(true),
        renderThemeStyles,
        debugModeEnabled,
        onToggleDebug: () => setDebugModeEnabled(!debugModeEnabled)
      }
    );
  } else if (screen === "PROLOGUE") {
    mainContent = /* @__PURE__ */ React.createElement(
      PrologueScreen,
      {
        screen,
        routeMode,
        textSpeedMeta,
        isInstantTextSpeed,
        onOpenLog: () => setShowLog(true),
        onOpenOptions: () => setShowOptions(true),
        onOpenHelp: () => setShowHelp(true),
        onVnAreaClick: handleVnAreaClick,
        onPageComplete: (data) => appendVnBacklog({ ...data, screen: "PROLOGUE" }),
        onAdvanceToHeroineSelect: () => {
          audioEngine.playSfx("uiClickForward");
          setScreen("HEROINE_SELECT");
        },
        renderThemeStyles,
        renderBackground,
        HeroineDisplay,
        audioEngine,
        vnRef,
        getFaceIcon,
        containerStyle,
        titleStyle,
        cardStyle,
        buttonStyle
      }
    );
  } else if (screen === "INTRO") {
    mainContent = /* @__PURE__ */ React.createElement(
      IntroScreen,
      {
        activeHeroine,
        activeDailyTalk,
        activeGreeting,
        day: workshopState.day,
        screen,
        routeMode,
        textSpeedMeta,
        isInstantTextSpeed,
        onOpenLog: () => setShowLog(true),
        onOpenOptions: () => setShowOptions(true),
        onOpenHelp: () => setShowHelp(true),
        onVnAreaClick: handleVnAreaClick,
        onPageComplete: (data) => appendVnBacklog({ ...data, screen: "INTRO" }),
        onBeginService: handleBeginService,
        renderThemeStyles,
        renderBackground,
        HeroineDisplay,
        audioEngine,
        vnRef,
        getFaceIcon,
        containerStyle,
        titleStyle,
        cardStyle,
        buttonStyle,
        narrativeBoxStyle
      }
    );
  } else if (screen === "RESULT" && session) {
    mainContent = /* @__PURE__ */ React.createElement(
      ResultScreen,
      {
        session,
        getRankInfo,
        getWorkshopResult,
        containerStyle,
        handleVnAreaClick,
        renderThemeStyles,
        renderBackground,
        screen,
        routeMode,
        onOpenLog: () => setShowLog(true),
        onOpenOptions: () => setShowOptions(true),
        onOpenHelp: () => setShowHelp(true),
        titleStyle,
        cardStyle,
        vnRef,
        textSpeedMeta,
        shouldSkipTypewriter,
        isInstantTextSpeed,
        appendVnBacklog,
        handleEndDay,
        activeHeroine,
        HeroineDisplay,
        getResultExpression,
        lastAffectionGain,
        buttonStyle,
        handleNextDay
      }
    );
  } else if (screen === "DAY_END") {
    const correctCount = session ? session.answers.filter((a) => a.isCorrect).length : 0;
    const mgmt = getWorkshopResult(correctCount);
    mainContent = /* @__PURE__ */ React.createElement(
      "div",
      {
        style: { ...containerStyle, position: "relative" },
        onClick: handleVnAreaClick
      },
      renderThemeStyles(),
      renderBackground(screen),
      /* @__PURE__ */ React.createElement("div", { style: { zIndex: 2, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, width: "90%", maxWidth: "300px", background: "rgba(255,255,255,0.95)", padding: "20px" } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 15px 0", fontSize: "1em", color: "#666", borderBottom: "1px solid #ddd", paddingBottom: "5px" } }, "今回の営業記録"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-around", marginBottom: "15px" } }, /* @__PURE__ */ React.createElement("div", null, "売上: ", /* @__PURE__ */ React.createElement("span", { style: { color: THEME.brassDark, fontWeight: "bold" } }, mgmt.sales, "G")), /* @__PURE__ */ React.createElement("div", null, "評判: ", /* @__PURE__ */ React.createElement("span", { style: { color: mgmt.reputation >= 0 ? THEME.oasisTeal : "#844", fontWeight: "bold" } }, mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "left", fontSize: "0.85em", color: "#444", borderTop: "1px solid #ddd", paddingTop: "15px" } }, /* @__PURE__ */ React.createElement("strong", null, "現在の工房の状態(第", workshopState.day, "回 営業終了)"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" } }, /* @__PURE__ */ React.createElement("div", null, "総売上: ", /* @__PURE__ */ React.createElement("span", { style: { color: THEME.brassDark, fontWeight: "bold" } }, workshopState.sales, "G")), /* @__PURE__ */ React.createElement("div", null, "総評判: ", /* @__PURE__ */ React.createElement("span", { style: { color: workshopState.reputation >= 0 ? THEME.oasisTeal : "#844", fontWeight: "bold" } }, workshopState.reputation >= 0 ? `+${workshopState.reputation}` : workshopState.reputation)), /* @__PURE__ */ React.createElement("div", null, "満足度: ", /* @__PURE__ */ React.createElement("span", { style: { color: workshopState.satisfaction >= 0 ? THEME.oasisTeal : "#844", fontWeight: "bold" } }, workshopState.satisfaction >= 0 ? `+${workshopState.satisfaction}` : workshopState.satisfaction)), /* @__PURE__ */ React.createElement("div", null, "親密度: ", /* @__PURE__ */ React.createElement("span", { style: { color: THEME.brassDark, fontWeight: "bold" } }, affection[activeHeroine.id], " / 100"))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { onClick: handleNextDay, className: "vn-button-reveal", style: { ...buttonStyle, width: "100%", maxWidth: "280px", margin: 0 } }, "次の営業へ"), /* @__PURE__ */ React.createElement("button", { onClick: handleBackToTitle, className: "vn-button-reveal", style: { ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: "100%", maxWidth: "280px", margin: 0 } }, "タイトルへ戻る")))
    );
  } else if (screen === "DAILY_TALK" && activeDailyTalk) {
    mainContent = /* @__PURE__ */ React.createElement(
      "div",
      {
        "data-testid": "daily-talk-screen",
        style: { ...containerStyle, position: "relative", overflow: "hidden" },
        onClick: handleVnAreaClick
      },
      renderThemeStyles(),
      renderBackground(screen === "DAILY_TALK" ? "shopInteriorService" : screen),
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        bottom: "8%",
        left: 0,
        width: "100%",
        zIndex: 2,
        pointerEvents: "none",
        height: "77%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        filter: "drop-shadow(0 0 15px rgba(0,0,0,0.3))"
      } }, /* @__PURE__ */ React.createElement(
        HeroineDisplay,
        {
          heroine: activeHeroine,
          type: "standing",
          size: "large",
          expression: "normal",
          noBorder: true,
          style: { height: "100%", width: "auto", boxShadow: "none" }
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { zIndex: 5, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(
        GameHud,
        {
          screen,
          routeMode,
          onOpenLog: () => setShowLog(true),
          onOpenOptions: () => setShowOptions(true),
          onOpenHelp: () => setShowHelp(true)
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 auto" } })),
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 6,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)"
      } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", boxSizing: "border-box", position: "relative" } }, /* @__PURE__ */ React.createElement(
        VNBox,
        {
          ref: vnRef,
          speaker: ((_c = (_b = activeDailyTalk.pages) == null ? void 0 : _b[0]) == null ? void 0 : _c.speaker) || "",
          pages: activeDailyTalk.pages.map((page) => {
            let inferredId = page.speakerId;
            if (!inferredId) {
              if (page.speaker === "ナーディル") inferredId = "nader";
              else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
            }
            return { ...page, speakerId: inferredId };
          }),
          themeColor: activeHeroine.themeColor,
          speed: textSpeedMeta.delay,
          skip: shouldSkipTypewriter(isInstantTextSpeed, false),
          getFaceIcon,
          onPageComplete: (data) => appendVnBacklog({ ...data, screen: "DAILY_TALK" }),
          onComplete: handleCloseDailyTalk
        }
      )))
    );
  } else if (screen === "EVENT" && activeEvent) {
    const still = activeEvent.stillImageId ? STILL_IMAGES[activeEvent.stillImageId] : null;
    if (!still) {
      mainContent = /* @__PURE__ */ React.createElement(
        "div",
        {
          "data-testid": "event-screen-normal",
          style: { ...containerStyle, position: "relative", overflow: "hidden" },
          onClick: handleVnAreaClick
        },
        renderThemeStyles(),
        renderBackground(screen),
        /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          bottom: "8%",
          left: 0,
          width: "100%",
          zIndex: 2,
          pointerEvents: "none",
          height: "77%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          filter: "drop-shadow(0 0 15px rgba(0,0,0,0.3))"
        } }, /* @__PURE__ */ React.createElement(
          HeroineDisplay,
          {
            heroine: activeHeroine,
            type: "standing",
            size: "large",
            expression: eventHeroineExpression,
            noBorder: true,
            style: { height: "100%", width: "auto", boxShadow: "none" }
          }
        )),
        /* @__PURE__ */ React.createElement("div", { style: { zIndex: 5, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(
          GameHud,
          {
            screen,
            routeMode,
            onOpenLog: () => setShowLog(true),
            onOpenOptions: () => setShowOptions(true),
            onOpenHelp: () => setShowHelp(true)
          }
        ), /* @__PURE__ */ React.createElement("h1", { style: {
          ...titleStyle,
          position: "absolute",
          top: "8px",
          left: "12px",
          margin: 0,
          fontSize: "1.2em",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          textAlign: "left",
          maxWidth: "70%",
          zIndex: 10
        } }, "愛着の記録: ", activeEvent.title), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 auto" } })),
        /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 6,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)"
        } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", boxSizing: "border-box", position: "relative" } }, /* @__PURE__ */ React.createElement(
          VNBox,
          {
            ref: vnRef,
            speaker: activeEvent.speaker,
            pages: getEventPages(activeEvent, routeMode).map((page) => {
              if (page.speakerId) return page;
              let inferredId = null;
              if (page.speaker === "ナーディル") inferredId = "nader";
              else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
              return { ...page, speakerId: inferredId };
            }),
            themeColor: activeHeroine.themeColor,
            speed: textSpeedMeta.delay,
            skip: shouldSkipTypewriter(isInstantTextSpeed, seenEventIds.includes(activeEvent.id)),
            getFaceIcon,
            onPageChange: (index) => {
              const pages = getEventPages(activeEvent, routeMode);
              const page = pages[index];
              if ((page == null ? void 0 : page.expression) && (page == null ? void 0 : page.speakerId) === activeHeroine.id) {
                setEventHeroineExpression(page.expression);
              }
              setEventSpeakerId((page == null ? void 0 : page.speakerId) || null);
              if (page == null ? void 0 : page.backgroundId) {
                setEventBackgroundOverride(page.backgroundId);
              }
            },
            onPageComplete: (data) => appendVnBacklog({ ...data, screen: "EVENT" }),
            onComplete: handleCloseEvent
          }
        )))
      );
    } else {
      mainContent = /* @__PURE__ */ React.createElement(
        "div",
        {
          "data-testid": "event-screen-still",
          style: { ...containerStyle, position: "relative", overflow: "hidden" },
          onClick: handleVnAreaClick
        },
        renderThemeStyles(),
        ((_d = still.stillCrop) == null ? void 0 : _d.mode) === "heroine_pan" && (() => {
          const animName = `still-pan-${still.id}`;
          const start = still.stillCrop.startPosition || "50% 50%";
          const end = still.stillCrop.endPosition || "50% 50%";
          const dur = still.stillCrop.durationMs || 1200;
          return /* @__PURE__ */ React.createElement("style", { key: animName }, `
                @keyframes ${animName} {
                  from { object-position: ${start}; }
                  to   { object-position: ${end}; }
                }
                .still-pan-img-${still.id} {
                  animation: ${animName} ${dur}ms ease-out forwards;
                }
              `);
        })(),
        /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          backgroundColor: "#000"
        } }, /* @__PURE__ */ React.createElement(
          "img",
          {
            src: getFullPath(still.src),
            alt: still.label,
            className: ((_e = still.stillCrop) == null ? void 0 : _e.mode) === "heroine_pan" ? `still-pan-img-${still.id}` : void 0,
            style: {
              width: "100%",
              height: "100%",
              objectFit: ((_f = still.stillCrop) == null ? void 0 : _f.objectFit) || "cover",
              objectPosition: ((_g = still.stillCrop) == null ? void 0 : _g.mode) === "heroine_pan" ? still.stillCrop.startPosition || "50% 50%" : ((_h = still.stillCrop) == null ? void 0 : _h.objectPosition) || `${(still.focusX ?? 0.5) * 100}% ${(still.focusY ?? 0.5) * 100}%`
            },
            onError: (e) => {
              e.target.style.display = "none";
              if (e.target.parentNode) {
                e.target.parentNode.innerHTML = '<span style="color:#f44; display:flex; align-items:center; justify-content:center; height:100%; font-size: 0.8em;">Still Load Failed</span>';
              }
            }
          }
        ), /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
          zIndex: 2
        } }), /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "20%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
          zIndex: 2
        } })),
        /* @__PURE__ */ React.createElement("div", { style: { zIndex: 5, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(
          GameHud,
          {
            screen,
            routeMode,
            onOpenLog: () => setShowLog(true),
            onOpenOptions: () => setShowOptions(true),
            onOpenHelp: () => setShowHelp(true)
          }
        ), /* @__PURE__ */ React.createElement("h1", { style: {
          ...titleStyle,
          position: "absolute",
          top: "8px",
          left: "12px",
          margin: 0,
          fontSize: "1.2em",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          textAlign: "left",
          maxWidth: "70%",
          zIndex: 10
        } }, "愛着の記録: ", activeEvent.title), /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 auto" } })),
        /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 6,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", boxSizing: "border-box", position: "relative" } }, /* @__PURE__ */ React.createElement(
          VNBox,
          {
            ref: vnRef,
            speaker: activeEvent.speaker,
            pages: getEventPages(activeEvent, routeMode).map((page) => {
              if (page.speakerId) return page;
              let inferredId = null;
              if (page.speaker === "ナーディル") inferredId = "nader";
              else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
              return { ...page, speakerId: inferredId };
            }),
            themeColor: activeHeroine.themeColor,
            speed: textSpeedMeta.delay,
            skip: shouldSkipTypewriter(isInstantTextSpeed, seenEventIds.includes(activeEvent.id)),
            getFaceIcon,
            onPageChange: (index) => {
              const pages = getEventPages(activeEvent, routeMode);
              const page = pages[index];
              if ((page == null ? void 0 : page.expression) && (page == null ? void 0 : page.speakerId) === activeHeroine.id) {
                setEventHeroineExpression(page.expression);
              }
              setEventSpeakerId((page == null ? void 0 : page.speakerId) || null);
              if (page == null ? void 0 : page.backgroundId) {
                setEventBackgroundOverride(page.backgroundId);
              }
            },
            onPageComplete: (data) => appendVnBacklog({ ...data, screen: "EVENT" }),
            onComplete: handleCloseEvent
          }
        )))
      );
    }
  } else if (screen === "VISUAL_TEST") {
    mainContent = /* @__PURE__ */ React.createElement(
      VisualTestScreen,
      {
        visualTestMode,
        setVisualTestMode,
        bgTestIndex,
        setBgTestIndex,
        stillTestIndex,
        setStillTestIndex,
        handleBackToTitle,
        getFullPath,
        getFileName,
        renderThemeStyles
      }
    );
  } else if (screen === "MEMORIES") {
    mainContent = /* @__PURE__ */ React.createElement(
      MemoriesScreen,
      {
        screen,
        routeMode,
        seenEventIds,
        unlockAll: isUnlockAllDebug,
        heroines: HEROINES,
        affectionEvents: AFFECTION_EVENTS,
        onBackToTitle: handleBackToTitle,
        onOpenLog: () => setShowLog(true),
        onOpenOptions: () => setShowOptions(true),
        onOpenHelp: () => setShowHelp(true),
        onRecallEvent: handleRecallEventFromMemories,
        renderThemeStyles,
        renderUtilityHeader
      }
    );
  } else if (screen === "HEROINE_SELECT") {
    mainContent = /* @__PURE__ */ React.createElement(
      HeroineSelectScreen,
      {
        previewHeroineId,
        onPreviewHeroineChange: setPreviewHeroineId,
        onSelectHeroine: handleSelectHeroine,
        affection,
        routeMode,
        screen,
        onOpenLog: () => setShowLog(true),
        onOpenOptions: () => setShowOptions(true),
        onOpenHelp: () => setShowHelp(true),
        renderThemeStyles,
        HeroineDisplay,
        getFullPath,
        audioEngine
      }
    );
  } else if (screen === "FINAL_RESULT") {
    const finalAffection = affection[activeHeroineId];
    const finalSales = workshopState.sales;
    const finalReputation = workshopState.reputation;
    mainContent = /* @__PURE__ */ React.createElement(
      "div",
      {
        "data-testid": "final-result-screen",
        style: { ...containerStyle, position: "relative" },
        onClick: handleVnAreaClick
      },
      renderThemeStyles(),
      /* @__PURE__ */ React.createElement(
        GameHud,
        {
          screen,
          routeMode,
          onOpenLog: () => setShowLog(true),
          onOpenOptions: () => setShowOptions(true),
          onOpenHelp: () => setShowHelp(true)
        }
      ),
      /* @__PURE__ */ React.createElement("h1", { style: titleStyle }, "10回の営業総決算"),
      /* @__PURE__ */ React.createElement("div", { style: { ...cardStyle, border: `3px double ${THEME.brass}`, padding: "25px" } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "25px" } }, /* @__PURE__ */ React.createElement(HeroineDisplay, { heroine: activeHeroine, type: "face", size: "medium" }), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "10px", fontSize: "1.2em", fontWeight: "bold", color: THEME.brassDark } }, activeHeroine.name, " との歩み")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: "15px", marginBottom: "30px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", paddingBottom: "8px" } }, /* @__PURE__ */ React.createElement("span", null, "総売上合計"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "bold" } }, finalSales, " G")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", paddingBottom: "8px" } }, /* @__PURE__ */ React.createElement("span", null, "最終的な評判"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "bold", color: finalReputation >= 0 ? THEME.oasisTeal : "#844" } }, finalReputation >= 0 ? `+${finalReputation}` : finalReputation)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", paddingBottom: "8px" } }, /* @__PURE__ */ React.createElement("span", null, activeHeroine.name, " との縁"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "bold", color: THEME.brassDark } }, finalAffection, " / 100"))), /* @__PURE__ */ React.createElement("p", { style: { fontStyle: "italic", color: "#666", fontSize: "0.95em", marginBottom: "30px", lineHeight: "1.6" } }, "10回の営業を締めくくり、次の一歩へ進みます。"), /* @__PURE__ */ React.createElement("button", { onClick: handleSeeEnding, className: "vn-button-reveal", style: { ...buttonStyle, width: "100%", maxWidth: "280px" } }, "結末を見届ける"))
    );
  } else if (screen === "ENDING") {
    const finalAffection = affection[activeHeroineId];
    const finalReputation = workshopState.reputation;
    let endingType = "normal";
    if (finalAffection >= 80 && finalReputation >= 40) {
      endingType = "good";
    } else if (finalAffection < 40) {
      endingType = "bad";
    }
    const endingData = ENDINGS[activeHeroineId][endingType];
    const endingBackgroundId = ((_i = endingData == null ? void 0 : endingData.presentation) == null ? void 0 : _i.backgroundId) || (endingData == null ? void 0 : endingData.bgId) || "shopInteriorService";
    const endingBackground = BACKGROUND_IMAGES[endingBackgroundId] || BACKGROUND_IMAGES.shopInteriorService;
    const endingBackgroundSrc = getFullPath(
      (endingBackground || BACKGROUND_IMAGES.shopInteriorService).src
    );
    mainContent = /* @__PURE__ */ React.createElement(
      "div",
      {
        style: { ...containerStyle, position: "relative" },
        onClick: handleVnAreaClick
      },
      renderThemeStyles(),
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${endingBackgroundSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 0
      } }),
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 1
      } }),
      /* @__PURE__ */ React.createElement("div", { style: { zIndex: 2, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" } }, /* @__PURE__ */ React.createElement("h1", { style: { ...titleStyle, marginTop: "20px" } }, endingData.title), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "flex-end", marginBottom: "20px", width: "100%" } }, /* @__PURE__ */ React.createElement(
        HeroineDisplay,
        {
          heroine: activeHeroine,
          type: "standing",
          size: "large",
          expression: endingData.expression || "normal"
        }
      )), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", padding: "0" } }, /* @__PURE__ */ React.createElement(
        VNBox,
        {
          ref: vnRef,
          speaker: activeHeroine.name,
          pages: endingData.pages.map((page) => {
            if (page.speakerId) return page;
            let inferredId = null;
            if (page.speaker === "ナーディル") inferredId = "nader";
            else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
            return { ...page, speakerId: inferredId };
          }),
          themeColor: activeHeroine.themeColor,
          speed: textSpeedMeta.delay,
          skip: shouldSkipTypewriter(isInstantTextSpeed),
          getFaceIcon,
          onPageComplete: (data) => appendVnBacklog({ ...data, screen: "ENDING" }),
          onComplete: handleFinishGame
        }
      )), /* @__PURE__ */ React.createElement("button", { onClick: handleFinishGame, className: "vn-button-reveal", style: { ...buttonStyle, marginBottom: "20px", width: "100%", maxWidth: "240px" } }, "タイトルへ戻る"))
    );
  } else if (screen === "QUIZ" && session) {
    const quizState = {
      session,
      activeHeroineId,
      activeHeroine,
      quizFeedback,
      routeMode,
      screen
    };
    const quizActions = {
      onOpenLog: () => setShowLog(true),
      onOpenOptions: () => setShowOptions(true),
      onOpenHelp: () => setShowHelp(true),
      onSelectChoice: handleSelect
    };
    const quizHelpers = {
      renderThemeStyles,
      getFullPath
    };
    const quizStyles = {
      containerStyle,
      headerStyle,
      cardStyle,
      customerStyle,
      bubbleStyle,
      itemCardStyle,
      imageStyle,
      itemNameStyle
    };
    mainContent = /* @__PURE__ */ React.createElement(
      QuizScreen,
      {
        quizState,
        quizActions,
        quizHelpers,
        quizStyles
      }
    );
  }
  const renderLoadingOverlay = (message = "Loading...") => /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1e3,
    color: THEME.sand,
    fontFamily: "'Outfit', sans-serif"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "1.2em", marginBottom: "20px", letterSpacing: "0.1em" } }, message), /* @__PURE__ */ React.createElement("div", { style: {
    width: "200px",
    height: "4px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "2px",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: `${loadingProgress}%`,
    height: "100%",
    background: THEME.starGold,
    transition: "width 0.3s"
  } })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "10px", fontSize: "0.8em", opacity: 0.7 } }, loadingProgress, "%"));
  return /* @__PURE__ */ React.createElement("div", { ref: outerWrapperRef, className: "game-root", style: outerWrapperStyle }, renderThemeStyles(), /* @__PURE__ */ React.createElement("div", { style: canvasContainerStyle }, /* @__PURE__ */ React.createElement("div", { style: canvasStyle }, isInitialLoading && renderLoadingOverlay("星瓶堂を開店中..."), isHeroineLoading && renderLoadingOverlay(`${(_j = HEROINES.find((h) => h.id === previewHeroineId)) == null ? void 0 : _j.name}を待っています...`), /* @__PURE__ */ React.createElement(
    OptionsModal,
    {
      isOpen: showOptions,
      onClose: () => setShowOptions(false),
      onReturnTitle: () => {
        setShowOptions(false);
        setScreen("START");
      },
      isAudioEnabled,
      setIsAudioEnabled,
      seVolume,
      setSeVolume,
      bgmVolume,
      setBgmVolume,
      textSpeed,
      setTextSpeed,
      instantUnreadText,
      setInstantUnreadText,
      buttonStyle,
      defaultAudioVolume: DEFAULT_AUDIO_VOLUME,
      textSpeedMeta: TEXT_SPEED_META
    }
  ), /* @__PURE__ */ React.createElement(LogModal, { isOpen: showLog, onClose: () => setShowLog(false), vnBacklog, scrollRef: backlogScrollRef, getFaceIcon }), /* @__PURE__ */ React.createElement(HelpModal, { isOpen: showHelp, onClose: () => setShowHelp(false) }), showSoundTest && /* @__PURE__ */ React.createElement(SoundTest, { onClose: () => setShowSoundTest(false), isAudioEnabled, onToggleAudio: () => setIsAudioEnabled(!isAudioEnabled) }), debugModeEnabled && /* @__PURE__ */ React.createElement(
    DebugPanel,
    {
      routeMode,
      setRouteMode,
      affection,
      setAffection,
      seenEventIds,
      setSeenEventIds,
      autoSkipQuiz,
      setAutoSkipQuiz,
      onTriggerEvent: (ev) => {
        setScreen("EVENT");
        setActiveEvent(ev);
        setEventHeroineExpression("normal");
      }
    }
  ), !isInitialLoading && /* @__PURE__ */ React.createElement("div", { key: screen, className: "screen-enter" }, mainContent || /* @__PURE__ */ React.createElement("div", { style: containerStyle }, /* @__PURE__ */ React.createElement("p", null, "Loading..."), /* @__PURE__ */ React.createElement("button", { onClick: handleBackToTitle, style: buttonStyle }, "タイトルへ戻る"))))));
}
function HeroineDisplay({ heroine, type, size = "large", expression = "normal", noBorder = false, style = {} }) {
  var _a;
  const [imgError, setImgError] = useState(false);
  const [displayExpr, setDisplayExpr] = useState(expression);
  const [prevExpr, setPrevExpr] = useState(null);
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);
  useEffect(() => {
    if (expression !== displayExpr) {
      setPrevExpr(displayExpr);
      setDisplayExpr(expression);
      setIsCurrentLoaded(false);
      const timer = setTimeout(() => setPrevExpr(null), 200);
      return () => clearTimeout(timer);
    }
  }, [expression]);
  const assetPath = getHeroineAsset(heroine.id, type, displayExpr);
  const fullPath = assetPath ? `${"https://kawauikei.github.io/made-in-maghribal/"}${assetPath}`.replace(/([^:])\/\//g, "$1/") : null;
  const prevAssetPath = prevExpr ? getHeroineAsset(heroine.id, type, prevExpr) : null;
  const prevFullPath = prevAssetPath ? `${"https://kawauikei.github.io/made-in-maghribal/"}${prevAssetPath}`.replace(/([^:])\/\//g, "$1/") : null;
  const isStanding = type === "standing";
  const displaySize = size === "large" ? isStanding ? 320 : 120 : size === "medium" ? isStanding ? 180 : 80 : isStanding ? 120 : 60;
  const containerStyle2 = {
    width: isStanding ? `${displaySize * 0.75}px` : `${displaySize}px`,
    height: `${displaySize}px`,
    borderRadius: isStanding ? "16px" : "50%",
    overflow: "hidden",
    backgroundColor: noBorder ? "transparent" : (heroine.themeColor || "#444") + "33",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: noBorder ? "none" : `2px solid ${heroine.themeColor || "#ffcc00"}`,
    boxShadow: noBorder ? "none" : isStanding ? "0 12px 30px rgba(0,0,0,0.5)" : "0 4px 15px rgba(0,0,0,0.3)",
    flexShrink: 0,
    position: "relative",
    ...style
  };
  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: isStanding ? "top center" : ((_a = heroine.visualConfig) == null ? void 0 : _a.facePosition) || "center 20%",
    display: imgError ? "none" : "block",
    userSelect: "none",
    WebkitUserDrag: "none"
  };
  if (!fullPath || imgError) {
    return /* @__PURE__ */ React.createElement("div", { style: containerStyle2 }, /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: `${displaySize * 0.4}px`,
      fontWeight: "bold",
      color: heroine.themeColor || "#111"
    } }, heroine.name ? heroine.name[0] : "?"));
  }
  return /* @__PURE__ */ React.createElement("div", { style: containerStyle2 }, prevFullPath && /* @__PURE__ */ React.createElement(
    "img",
    {
      src: prevFullPath,
      alt: "previous expression",
      style: {
        ...imgStyle,
        position: "absolute",
        zIndex: 1,
        animation: "vn-fade-out 0.2s forwards"
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "img",
    {
      key: displayExpr,
      src: fullPath,
      alt: heroine.name,
      onLoad: () => setIsCurrentLoaded(true),
      style: {
        ...imgStyle,
        zIndex: 2,
        opacity: isCurrentLoaded ? 1 : 0,
        animation: isCurrentLoaded ? "vn-fade-in 0.2s forwards" : "none"
      },
      draggable: false,
      onError: () => setImgError(true)
    }
  ));
}
const containerStyle = {
  width: "100%",
  height: "100%",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  overflow: "hidden",
  position: "relative",
  boxSizing: "border-box"
};
const titleStyle = {
  color: "#e2d1b1",
  fontSize: "1.4em",
  margin: "0 0 12px 0",
  textAlign: "center",
  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
  fontWeight: "bold"
};
const headerStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  fontSize: "0.9em",
  color: "#e2d1b1"
};
const cardStyle = {
  width: "100%",
  padding: "12px",
  border: `1px solid ${THEME.brass}`,
  borderRadius: "8px",
  background: THEME.parchment,
  color: THEME.textDark,
  textAlign: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  position: "relative",
  boxSizing: "border-box"
};
const narrativeBoxStyle = {
  background: "rgba(0, 0, 0, 0.75)",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "30px",
  textAlign: "left",
  lineHeight: "1.8",
  fontSize: "1em",
  color: "#f4e9d5",
  border: `1px solid ${THEME.brass}`,
  borderLeft: `5px solid ${THEME.brass}`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
  backdropFilter: "blur(4px)"
};
const buttonStyle = {
  padding: "12px 24px",
  fontSize: "1.1em",
  background: THEME.brass,
  color: "#1a1a1a",
  border: `2px solid ${THEME.brassDark}`,
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "20px",
  boxShadow: "0 4px 0 #8e6d2e",
  outline: "none",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent"
};
const customerStyle = {
  marginBottom: "15px",
  display: "flex",
  justifyContent: "center"
};
const bubbleStyle = {
  background: "#fff",
  color: "#222",
  padding: "12px 18px",
  borderRadius: "15px",
  position: "relative",
  fontSize: "0.95em",
  fontWeight: "bold",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: "1px solid #ddd"
};
const itemCardStyle = {
  background: "rgba(255, 255, 255, 0.98)",
  padding: "18px",
  borderRadius: "16px",
  // More rounded for modern feel
  cursor: "pointer",
  transition: "transform 0.2s, background 0.2s, box-shadow 0.2s",
  border: `1px solid ${THEME.brass}44`,
  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between"
};
const imageStyle = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "contain",
  borderRadius: "8px",
  marginBottom: "15px",
  background: "rgba(245, 240, 230, 0.5)",
  padding: "10px"
};
const itemNameStyle = {
  fontSize: "0.95em",
  color: THEME.textDark,
  fontWeight: "bold",
  textAlign: "center",
  width: "100%",
  lineHeight: "1.3"
};
export {
  App as default
};
