/**
 * Browser input bindings for global gameplay/UI actions.
 */

function bindInputHandlers(controller) {
  document.addEventListener('selectstart', (event) => {
    if (event.target.closest('#game-viewport')) event.preventDefault();
  });

  document.addEventListener('dragstart', (event) => {
    if (event.target.closest('#game-viewport')) event.preventDefault();
  });

  document.addEventListener('click', async (event) => {
    if (controller.sfx) controller.sfx.unlock();
    if (controller.bgm) controller.bgm.unlock();
    const target = event.target;
    if (controller.uiState.turnTransitionActive) {
      event.stopPropagation();
      controller.finishTurnTransition(true);
      return;
    }
    if (controller.quizState.inputLocked) return;

    if (target.closest('[data-action="title-start"]')) {
      event.stopPropagation();
      controller.clearRunSaveData();
      controller.endingProgressRecorded = false;
      controller.playSfx('uiConfirmChime');
      await controller.onGlobalAction();
      return;
    }
    if (target.closest('[data-action="title-continue"]')) {
      event.stopPropagation();
      const success = await controller.continueFromSave();
      if (!success) {
        controller.playSfx('uiTapBottle');
        const messageEl = controller.container.querySelector('[data-title-stub-message]');
        if (messageEl) messageEl.textContent = 'つづきから再開できるセーブがありません';
      }
      return;
    }
    if (target.closest('[data-action="title-clear-save"]')) {
      event.stopPropagation();
      controller.clearRunSaveData();
      controller.playSfx('uiTapBottle');
      controller.update();
      return;
    }
    const titlePanelBtn = target.closest('[data-title-panel]');
    if (titlePanelBtn) {
      event.stopPropagation();
      controller.openTitlePanel(titlePanelBtn.getAttribute('data-title-panel'));
      return;
    }
    if (target.closest('[data-action="title-panel-back"]')) {
      event.stopPropagation();
      controller.closeTitlePanel();
      return;
    }
    if (target.closest('[data-action="start-freeplay"]')) {
      event.stopPropagation();
      const bgmEl = document.getElementById('freeplay-bgm');
      const countEl = document.getElementById('freeplay-count');
      await controller.startFreePlay({
        bgmPath: bgmEl ? bgmEl.value : null,
        questionCount: countEl ? Number(countEl.value) : 10
      });
      return;
    }

    const itemDetailBtn = target.closest('[data-item-detail-index]');
    if (itemDetailBtn) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      const index = Number(itemDetailBtn.getAttribute('data-item-detail-index')) || 0;
      controller.uiState.itemDetailModal = { index };
      controller.update();
      return;
    }
    if (target.getAttribute && target.getAttribute('data-action') === 'item-detail-close') {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.uiState.itemDetailModal = null;
      controller.update();
      return;
    }
    const soundBgmBtn = target.closest('[data-sound-bgm-path]');
    if (soundBgmBtn) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      const path = soundBgmBtn.getAttribute('data-sound-bgm-path');
      controller.bgm?.play({
        path,
        id: soundBgmBtn.getAttribute('data-sound-id') || 'preview'
      });
      controller.updateSoundTestStatus(path);
      return;
    }
    const soundSfxBtn = target.closest('[data-sound-sfx-path], [data-sound-sfx-key]');
    if (soundSfxBtn) {
      event.stopPropagation();
      const previewPath = soundSfxBtn.getAttribute('data-sound-sfx-path');
      if (previewPath) {
        try {
          const audio = new Audio(previewPath);
          audio.volume = Math.max(0, Math.min(1, controller.sfx?.volume ?? 0.7));
          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
        } catch (error) {
          controller.playSfx(soundSfxBtn.getAttribute('data-sound-sfx-key'));
        }
      } else {
        controller.playSfx(soundSfxBtn.getAttribute('data-sound-sfx-key'));
      }
      return;
    }
    if (target.closest('[data-action="sound-stop-bgm"]')) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.bgm?.stop();
      controller.updateSoundTestStatus('');
      return;
    }
    const titleStub = target.closest('[data-title-stub]');
    if (titleStub) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      const messageEl = controller.container.querySelector('[data-title-stub-message]');
      if (messageEl) {
        messageEl.textContent = `${titleStub.getAttribute('data-title-stub')}は後続実装です`;
      }
      return;
    }
    if (target.closest('[data-action="open-options"]')) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.openModal('options');
      return;
    }
    if (target.closest('[data-action="open-help"]')) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.openModal('help');
      return;
    }
    if (target.closest('[data-action="close-modal"]')) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.closeModal();
      return;
    }
    if (target.closest('[data-action="toggle-fullscreen"]')) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.toggleFullscreen();
      return;
    }
    const speedBtn = target.closest('[data-action="set-text-speed"]');
    if (speedBtn) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.setTextSpeed(speedBtn.getAttribute('data-speed'));
      return;
    }
    const audioToggleBtn = target.closest('[data-action="set-audio-enabled"]');
    if (audioToggleBtn) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.setAudioEnabled(audioToggleBtn.getAttribute('data-audio-kind'), audioToggleBtn.getAttribute('data-enabled') === 'true');
      return;
    }
    const audioVolumeBtn = target.closest('[data-action="adjust-audio-volume"]');
    if (audioVolumeBtn) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.adjustAudioVolume(audioVolumeBtn.getAttribute('data-audio-kind'), Number(audioVolumeBtn.getAttribute('data-delta')) || 0);
      return;
    }

    if (target.closest('[data-action="skip-text"]')) {
      event.stopPropagation();
      controller.playSfx('uiTapBottle');
      controller.onGlobalAction();
      return;
    }

    if (target.closest('.choice-card')) {
      const choiceCard = target.closest('.choice-card');
      const id = choiceCard.getAttribute('data-item-id');
      const quality = choiceCard.getAttribute('data-item-quality') || 'normal';
      event.stopPropagation();
      controller.answerQuiz(id, quality);
      return;
    }

    if (target.classList.contains('heroine-card')) {
      const id = target.getAttribute('data-id');
      const routeMode = target.getAttribute('data-route-mode-selected') || 'normal';
      event.stopPropagation();
      await controller.selectHeroine(id, routeMode);
      return;
    }

    if (target.tagName === 'BUTTON' || target.closest('button')) {
      event.stopPropagation();
      if (target.classList.contains('btn-next')) {
        controller.playSfx('uiTapBottle');
        await controller.onGlobalAction();
      }
      return;
    }

    if (controller.uiState.modal) {
      if (!target.closest('.ui-modal')) {
        controller.playSfx('uiTapBottle');
        controller.closeModal();
      }
      return;
    }

    if (controller.session.phase === 'TITLE') return;
    if (controller.session.phase === 'HEROINE_SELECT') return;
    if (controller.session.phase === 'MAIN_GAME' && controller.session.subPhase === 'QUIZ') return;
    if (controller.session.phase === 'MAIN_GAME' && controller.session.subPhase === 'TURN_RESULT') return;

    controller.playSfx('uiTapBottle');
    await controller.onGlobalAction();
  });
}

module.exports = {
  bindInputHandlers
};
