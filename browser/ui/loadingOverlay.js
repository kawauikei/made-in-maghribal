/**
 * Loading Overlay UI Component
 */

function renderLoadingOverlay(message = 'データを読み込んでいます...') {
  return `
    <div class="asset-loading-overlay" id="loading-overlay" style="opacity: 0; transition: opacity 0.15s ease-out;">
      <div class="asset-loading-card">
        <div class="asset-loading-lantern" aria-hidden="true">
          <span></span>
        </div>
        <p>${message}</p>
      </div>
    </div>
  `;
}

async function showLoading(container, message) {
  const existing = container.querySelector('#loading-overlay');
  if (existing) return;

  const html = renderLoadingOverlay(message);
  container.insertAdjacentHTML('beforeend', html);
  
  const el = container.querySelector('#loading-overlay');
  // Force a reflow and then fade in
  void el.offsetWidth;
  el.style.opacity = '1';

  // Return a promise that resolves after at least one frame to ensure paint
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 50)));
}

async function hideLoading(container) {
  const el = container.querySelector('#loading-overlay');
  if (el) {
    el.style.opacity = '0';
    // Wait for fade out animation before removing
    await new Promise(resolve => setTimeout(resolve, 160));
    el.remove();
  }
}

module.exports = {
  showLoading,
  hideLoading
};
