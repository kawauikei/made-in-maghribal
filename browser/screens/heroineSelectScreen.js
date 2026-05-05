/**
 * Heroine Selection screen for MadeInMaghribal.
 */

function renderHeroineSelect(controller, view) {
  view.innerHTML = `
    <div class="heroine-select title-screen">
      <h2 class="glow" style="margin-bottom: 30px; color: var(--star-1);">営業パートナーを選択</h2>
      <div class="heroine-list">
        <div class="heroine-card" data-id="HAKIMA">ハキマ（優雅な賢者）</div>
        <div class="heroine-card" data-id="MIRA">ミラ（元気な看板娘）</div>
        <div class="heroine-card" data-id="DARIYA">ダリヤ（神秘的な踊り子）</div>
      </div>
    </div>
  `;
}

module.exports = {
  renderHeroineSelect
};
