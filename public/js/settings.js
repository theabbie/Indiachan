document.addEventListener('DOMContentLoaded', function() {
  const settingsButton = document.getElementById('settings');
  if (!settingsButton) return;

  const themes = [
    'yotsuba', 'yotsuba-b', 'tomorrow', 'tomorrow2', 'photon', 'dark-photon',
    'amoled', 'clear', 'pink', 'navy', 'darkblue', 'lain', 'miku', 'chaos',
    'cancer', 'choc', 'robot', 'rei-zero', 'gurochan', 'mushroom', 'teletext',
    'solarized-light', 'solarized-dark', 'tempus-cozette', 'win95', 'cybhub',
    'vapor', 'digi', 'favela', 'iwakura', 'ptchan', 'tchan', '56chan', 'army-green'
  ];

  function getSettings() {
    return {
      theme: localStorage.getItem('theme') || 'yotsuba-b',
      hideImages: localStorage.getItem('hideImages') === 'true',
      hideRecursive: localStorage.getItem('hideRecursive') === 'true',
      smoothScrolling: localStorage.getItem('smoothScrolling') !== 'false',
      localTime: localStorage.getItem('localTime') !== 'false',
      hour24Time: localStorage.getItem('hour24Time') !== 'false',
      relativeTime: localStorage.getItem('relativeTime') !== 'false',
      notificationsEnabled: localStorage.getItem('notificationsEnabled') === 'true',
      notificationYousOnly: localStorage.getItem('notificationYousOnly') === 'true',
      imageLoadingBars: localStorage.getItem('imageLoadingBars') !== 'false',
      live: localStorage.getItem('live') !== 'false',
      scrollToPosts: localStorage.getItem('scrollToPosts') !== 'false',
      defaultVolume: parseFloat(localStorage.getItem('defaultVolume') || '1'),
      loop: localStorage.getItem('loop') === 'true',
    };
  }

  function saveSettings(settings) {
    Object.keys(settings).forEach(key => {
      localStorage.setItem(key, settings[key]);
    });
  }

  function applyTheme(theme) {
    const themeLink = document.getElementById('theme');
    if (themeLink) {
      themeLink.href = `/css/themes/${theme}.css`;
      themeLink.setAttribute('data-theme', theme);
    }
  }

  function createModal() {
    const settings = getSettings();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'settingsmodal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" id="closesettings">&times;</span>
        <h4>Settings</h4>
        <form id="settingsform">
          <div class="row">
            <label for="theme-setting">Theme:</label>
            <select id="theme-setting" name="theme">
              ${themes.map(t => `<option value="${t}" ${settings.theme === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="hideImages" ${settings.hideImages ? 'checked' : ''} />
              Hide images by default
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="hideRecursive" ${settings.hideRecursive ? 'checked' : ''} />
              Hide images recursively
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="smoothScrolling" ${settings.smoothScrolling ? 'checked' : ''} />
              Smooth scrolling
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="localTime" ${settings.localTime ? 'checked' : ''} />
              Show local time
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="hour24Time" ${settings.hour24Time ? 'checked' : ''} />
              24 hour time
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="relativeTime" ${settings.relativeTime ? 'checked' : ''} />
              Relative time
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="live" ${settings.live ? 'checked' : ''} />
              Live post updates
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="notificationsEnabled" ${settings.notificationsEnabled ? 'checked' : ''} />
              Desktop notifications
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="notificationYousOnly" ${settings.notificationYousOnly ? 'checked' : ''} />
              Only notify for replies to you
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="imageLoadingBars" ${settings.imageLoadingBars ? 'checked' : ''} />
              Image loading bars
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="scrollToPosts" ${settings.scrollToPosts ? 'checked' : ''} />
              Scroll to new posts
            </label>
          </div>
          
          <div class="row">
            <label>
              <input type="checkbox" name="loop" ${settings.loop ? 'checked' : ''} />
              Loop videos/audio
            </label>
          </div>
          
          <div class="row">
            <label for="volume-setting">Default volume:</label>
            <input type="range" id="volume-setting" name="defaultVolume" min="0" max="1" step="0.1" value="${settings.defaultVolume}" />
            <span id="volume-value">${Math.round(settings.defaultVolume * 100)}%</span>
          </div>
          
          <div class="row">
            <input type="submit" value="Save" />
            <input type="button" id="resetsettings" value="Reset to defaults" />
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('#closesettings');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    const themeSelect = modal.querySelector('#theme-setting');
    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
    
    const volumeInput = modal.querySelector('#volume-setting');
    const volumeValue = modal.querySelector('#volume-value');
    volumeInput.addEventListener('input', (e) => {
      volumeValue.textContent = Math.round(e.target.value * 100) + '%';
    });
    
    const form = modal.querySelector('#settingsform');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const newSettings = {
        theme: formData.get('theme'),
        hideImages: formData.get('hideImages') === 'on',
        hideRecursive: formData.get('hideRecursive') === 'on',
        smoothScrolling: formData.get('smoothScrolling') === 'on',
        localTime: formData.get('localTime') === 'on',
        hour24Time: formData.get('hour24Time') === 'on',
        relativeTime: formData.get('relativeTime') === 'on',
        notificationsEnabled: formData.get('notificationsEnabled') === 'on',
        notificationYousOnly: formData.get('notificationYousOnly') === 'on',
        imageLoadingBars: formData.get('imageLoadingBars') === 'on',
        live: formData.get('live') === 'on',
        scrollToPosts: formData.get('scrollToPosts') === 'on',
        defaultVolume: formData.get('defaultVolume'),
        loop: formData.get('loop') === 'on',
      };
      saveSettings(newSettings);
      applyTheme(newSettings.theme);
      modal.remove();
    });
    
    const resetBtn = modal.querySelector('#resetsettings');
    resetBtn.addEventListener('click', () => {
      localStorage.clear();
      applyTheme('yotsuba-b');
      modal.remove();
      createModal();
    });
  }

  settingsButton.addEventListener('click', (e) => {
    e.preventDefault();
    createModal();
  });

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  }
});
