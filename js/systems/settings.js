/**
 * SystemSettings Module - Configurações do Sistema VessieOS
 * Gerencia todas as configurações e preferências do usuário
 */

const SystemSettings = {
  // Categorias de configuração
  categories: [
    { id: 'display', name: 'Tela', icon: 'fa-desktop' },
    { id: 'sound', name: 'Som', icon: 'fa-volume-up' },
    { id: 'notifications', name: 'Notificações', icon: 'fa-bell' },
    { id: 'apps', name: 'Apps', icon: 'fa-th-large' },
    { id: 'personalization', name: 'Personalização', icon: 'fa-paint-brush' },
    { id: 'system', name: 'Sistema', icon: 'fa-cog' },
    { id: 'storage', name: 'Armazenamento', icon: 'fa-hdd' },
    { id: 'privacy', name: 'Privacidade', icon: 'fa-shield-alt' }
  ],

  /**
   * Abre a janela de Configurações
   */
  open(category = null) {
    const content = `
      <div class="settings-container" style="display:flex;height:100%;">
        <!-- Sidebar -->
        <div class="settings-sidebar" style="width:280px;background:rgba(255,255,255,.02);border-right:1px solid var(--border);padding:16px;overflow-y:auto;">
          <!-- Search -->
          <div class="settings-search" style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px 12px;">
              <i class="fas fa-search" style="color:var(--dim);"></i>
              <input type="text" placeholder="Pesquisar configurações" 
                     style="background:none;border:none;color:var(--text);font-size:.85rem;flex:1;outline:none;"
                     onkeyup="SystemSettings.search(this.value)">
            </div>
          </div>
          
          <!-- User Profile -->
          <div class="settings-user" style="display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:16px;background:rgba(96,165,250,.1);border-radius:10px;">
            <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--a2));display:flex;align-items:center;justify-content:center;font-size:1.5rem;">💜</div>
            <div>
              <div style="font-weight:600;font-size:.9rem;">${S.user || 'Usuário'}</div>
              <div style="font-size:.75rem;color:var(--dim);">Conta Local</div>
            </div>
          </div>
          
          <!-- Categories -->
          <div class="settings-categories">
            ${this.categories.map(cat => `
              <div class="settings-cat-item ${category === cat.id ? 'active' : ''}" 
                   onclick="SystemSettings.showCategory('${cat.id}')"
                   style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;color:var(--text-2);font-size:.85rem;transition:.14s;"
                   onmouseover="this.style.background='rgba(255,255,255,.05)'"
                   onmouseout="if(!this.classList.contains('active'))this.style.background='transparent'">
                <i class="fas ${cat.icon}" style="width:18px;color:${category === cat.id ? 'var(--a)' : 'var(--dim)'};"></i>
                <span style="${category === cat.id ? 'color:var(--text);font-weight:600;' : ''}">${cat.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Content Area -->
        <div class="settings-content" style="flex:1;overflow-y:auto;padding:24px;" id="settings-content-area">
          ${this.renderCategory(category || 'display')}
        </div>
      </div>
    `;

    if (typeof WindowManager !== 'undefined') {
      WindowManager.create({
        title: 'Configurações',
        icon: 'fas fa-cog',
        content,
        width: 950,
        height: 600,
        resizable: true
      });
    }
  },

  /**
   * Renderiza conteúdo de uma categoria
   */
  renderCategory(categoryId) {
    const renderers = {
      display: () => this.renderDisplay(),
      sound: () => this.renderSound(),
      notifications: () => this.renderNotifications(),
      apps: () => this.renderApps(),
      personalization: () => this.renderPersonalization(),
      system: () => this.renderSystem(),
      storage: () => this.renderStorage(),
      privacy: () => this.renderPrivacy()
    };

    return (renderers[categoryId] || renderers.display)();
  },

  /**
   * Mostra uma categoria específica
   */
  showCategory(categoryId) {
    const contentArea = document.getElementById('settings-content-area');
    if (contentArea) {
      contentArea.innerHTML = this.renderCategory(categoryId);
    }
    
    // Atualiza sidebar
    document.querySelectorAll('.settings-cat-item').forEach(item => {
      item.classList.remove('active');
      item.style.background = 'transparent';
    });
    
    const activeItem = document.querySelector(`.settings-cat-item[onclick="SystemSettings.showCategory('${categoryId}')"]`);
    if (activeItem) {
      activeItem.classList.add('active');
      activeItem.style.background = 'rgba(255,255,255,.08)';
    }
  },

  /**
   * Renderiza configurações de Tela
   */
  renderDisplay() {
    return `
      <h2 style="font-size:1.4rem;margin-bottom:24px;">Tela</h2>
      
      <!-- Brightness -->
      <div class="settings-section" style="margin-bottom:28px;">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-sun" style="color:#fbbf24;"></i> Brilho
        </h3>
        <div style="display:flex;align-items:center;gap:16px;">
          <i class="fas fa-sun" style="color:var(--dim);"></i>
          <input type="range" min="0" max="100" value="80" 
                 style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.1);appearance:none;"
                 oninput="SystemSettings.setBrightness(this.value)">
          <i class="fas fa-lightbulb" style="color:var(--a);"></i>
          <span style="width:40px;text-align:right;font-size:.85rem;color:var(--text-2);">80%</span>
        </div>
      </div>
      
      <!-- Night Light -->
      <div class="settings-section" style="margin-bottom:28px;">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-moon" style="color:#a78bfa;"></i> Luz Noturna
        </h3>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,.04);border-radius:10px;">
          <div>
            <div style="font-size:.88rem;font-weight:500;">Luz Noturna</div>
            <div style="font-size:.75rem;color:var(--dim);margin-top:4px;">Reduz luz azul para ajudar no sono</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" onchange="SystemSettings.toggleNightLight(this.checked)" style="display:none;">
            <span style="display:block;width:48px;height:26px;background:rgba(255,255,255,.15);border-radius:13px;position:relative;transition:.3s;"
                  onclick="this.style.background=this.previousElementSibling.checked?'var(--a)':'rgba(255,255,255,.15)';this.querySelector('.toggle-knob').style.transform=this.previousElementSibling.checked?'translateX(22px)':'translateX(0)'">
              <span class="toggle-knob" style="display:block;width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:.3s;box-shadow:0 2px 4px rgba(0,0,0,.3);"></span>
            </span>
          </label>
        </div>
      </div>
      
      <!-- Scale and Layout -->
      <div class="settings-section">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-expand" style="color:var(--a);"></i> Escala e Layout
        </h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="padding:14px;background:rgba(255,255,255,.04);border-radius:10px;">
            <div style="font-size:.85rem;color:var(--dim);margin-bottom:8px;">Escala</div>
            <select style="width:100%;padding:8px;background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:.85rem;outline:none;">
              <option>100% (Recomendado)</option>
              <option>125%</option>
              <option>150%</option>
              <option>175%</option>
              <option>200%</option>
            </select>
          </div>
          <div style="padding:14px;background:rgba(255,255,255,.04);border-radius:10px;">
            <div style="font-size:.85rem;color:var(--dim);margin-bottom:8px;">Resolução</div>
            <select style="width:100%;padding:8px;background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:.85rem;outline:none;">
              <option>1920 x 1080 (Recomendado)</option>
              <option>1600 x 900</option>
              <option>1366 x 768</option>
              <option>1280 x 720</option>
            </select>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renderiza configurações de Som
   */
  renderSound() {
    return `
      <h2 style="font-size:1.4rem;margin-bottom:24px;">Som</h2>
      
      <!-- Output Device -->
      <div class="settings-section" style="margin-bottom:28px;">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-volume-up" style="color:var(--a);"></i> Saída
        </h3>
        <div style="padding:14px;background:rgba(255,255,255,.04);border-radius:10px;">
          <div style="font-size:.85rem;color:var(--dim);margin-bottom:8px;">Dispositivo de Saída</div>
          <select style="width:100%;padding:10px;background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.85rem;outline:none;">
            <option>Alto-falantes (Realtek Audio)</option>
            <option>Fones de Ouvido (USB)</option>
            <option>Dispositivo Digital (HDMI)</option>
          </select>
        </div>
      </div>
      
      <!-- Master Volume -->
      <div class="settings-section" style="margin-bottom:28px;">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-sliders-h" style="color:var(--a2);"></i> Volume Principal
        </h3>
        <div style="display:flex;align-items:center;gap:16px;">
          <i class="fas fa-volume-mute" style="color:var(--dim);" id="vol-icon-left"></i>
          <input type="range" min="0" max="100" value="${S.volume || 70}" 
                 style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.1);appearance:none;"
                 oninput="SystemSettings.setVolume(this.value)">
          <i class="fas fa-volume-up" style="color:var(--a);" id="vol-icon-right"></i>
          <span style="width:40px;text-align:right;font-size:.85rem;color:var(--text-2);">${S.volume || 70}%</span>
        </div>
      </div>
      
      <!-- Sound Effects -->
      <div class="settings-section">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-music" style="color:#ec4899;"></i> Efeitos Sonoros
        </h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${[
            { id: 'sounds', name: 'Sons do Sistema', desc: 'Reproduz sons em ações do sistema' },
            { id: 'notifications', name: 'Sons de Notificação', desc: 'Toca som ao receber notificações' },
            { id: 'startup', name: 'Som de Inicialização', desc: 'Reproduz som ao iniciar o sistema' }
          ].map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,.04);border-radius:10px;">
              <div>
                <div style="font-size:.88rem;font-weight:500;">${item.name}</div>
                <div style="font-size:.75rem;color:var(--dim);margin-top:4px;">${item.desc}</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${S.sounds !== false ? 'checked' : ''} onchange="SystemSettings.toggleSound('${item.id}', this.checked)" style="display:none;">
                <span style="display:block;width:48px;height:26px;background:${S.sounds !== false ? 'var(--a)' : 'rgba(255,255,255,.15)'};border-radius:13px;position:relative;transition:.3s;"
                      onclick="this.style.background=this.previousElementSibling.checked?'var(--a)':'rgba(255,255,255,.15)';this.querySelector('.toggle-knob').style.transform=this.previousElementSibling.checked?'translateX(22px)':'translateX(0)'">
                  <span class="toggle-knob" style="display:block;width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:.3s;box-shadow:0 2px 4px rgba(0,0,0,.3);"></span>
                </span>
              </label>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Renderiza configurações de Notificações
   */
  renderNotifications() {
    return `
      <h2 style="font-size:1.4rem;margin-bottom:24px;">Notificações</h2>
      
      <!-- Master Toggle -->
      <div class="settings-section" style="margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;background:rgba(96,165,250,.1);border-radius:12px;">
          <div>
            <div style="font-size:.95rem;font-weight:600;display:flex;align-items:center;gap:8px;">
              <i class="fas fa-bell" style="color:var(--a);"></i> Central de Notificações
            </div>
            <div style="font-size:.78rem;color:var(--dim);margin-top:6px;">Gerencie todas as suas notificações</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked style="display:none;">
            <span style="display:block;width:52px;height:28px;background:var(--a);border-radius:14px;position:relative;transition:.3s;"
                  onclick="this.querySelector('.toggle-knob').style.transform=this.previousElementSibling.checked?'translateX(24px)':'translateX(0)'">
              <span class="toggle-knob" style="display:block;width:24px;height:24px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:.3s;box-shadow:0 2px 4px rgba(0,0,0,.3);"></span>
            </span>
          </label>
        </div>
      </div>
      
      <!-- App Notifications -->
      <div class="settings-section">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-apps" style="color:var(--a2);"></i> Notificações por App
        </h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            { name: 'Vessie Assistant', icon: '💜', enabled: true },
            { name: 'Game Hub', icon: '🎮', enabled: true },
            { name: 'Explorador de Arquivos', icon: '📁', enabled: true },
            { name: 'Terminal', icon: '💻', enabled: false },
            { name: 'Spotify', icon: '🎵', enabled: true }
          ].map(app => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:rgba(255,255,255,.04);border-radius:10px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <span style="font-size:1.2rem;">${app.icon}</span>
                <span style="font-size:.88rem;">${app.name}</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${app.enabled ? 'checked' : ''} style="display:none;">
                <span style="display:block;width:44px;height:24px;background:${app.enabled ? 'var(--a)' : 'rgba(255,255,255,.15)'};border-radius:12px;position:relative;transition:.3s;"
                      onclick="this.style.background=this.previousElementSibling.checked?'var(--a)':'rgba(255,255,255,.15)';this.querySelector('.toggle-knob').style.transform=this.previousElementSibling.checked?'translateX(20px)':'translateX(0)'">
                  <span class="toggle-knob" style="display:block;width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:.3s;box-shadow:0 2px 4px rgba(0,0,0,.3);"></span>
                </span>
              </label>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Renderiza configurações de Apps
   */
  renderApps() {
    return `
      <h2 style="font-size:1.4rem;margin-bottom:24px;">Aplicativos</h2>
      
      <!-- Default Apps -->
      <div class="settings-section" style="margin-bottom:28px;">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-star" style="color:#fbbf24;"></i> Apps Padrão
        </h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            { type: 'Navegador Web', app: 'Vessie Browser' },
            { type: 'Editor de Texto', app: 'Bloco de Notas' },
            { type: 'Player de Música', app: 'Spotify' },
            { type: 'Player de Vídeo', app: 'VLC Media Player' },
            { type: 'Visualizador de Imagens', app: 'Fotos' }
          ].map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:rgba(255,255,255,.04);border-radius:10px;">
              <span style="font-size:.88rem;color:var(--dim);">${item.type}</span>
              <button style="padding:8px 14px;background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.82rem;cursor:pointer;transition:.14s;"
                      onmouseover="this.style.background='rgba(255,255,255,.12)'"
                      onmouseout="this.style.background='rgba(255,255,255,.08)'">
                ${item.app}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Installed Apps List -->
      <div class="settings-section">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-list" style="color:var(--a);"></i> Apps Instalados
        </h3>
        <div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
          ${APPS.map(app => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,.04);border-radius:10px;">
              <div style="width:36px;height:36px;border-radius:8px;background:${app.bg || 'rgba(255,255,255,.1)'};display:flex;align-items:center;justify-content:center;font-size:1rem;">
                ${typeof app.ic === 'string' && app.ic.includes('fa-') ? `<i class="${app.ic}"></i>` : app.ic || '📦'}
              </div>
              <span style="font-size:.85rem;flex:1;">${app.n}</span>
              <button style="padding:6px 10px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:6px;color:#ef4444;font-size:.75rem;cursor:pointer;transition:.14s;"
                      onmouseover="this.style.background='rgba(239,68,68,.25)'"
                      onmouseout="this.style.background='rgba(239,68,68,.15)'">
                Desinstalar
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Renderiza configurações de Personalização
   */
  renderPersonalization() {
    return `
      <h2 style="font-size:1.4rem;margin-bottom:24px;">Personalização</h2>
      
      <!-- Theme -->
      <div class="settings-section" style="margin-bottom:28px;">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-palette" style="color:var(--a2);"></i> Tema
        </h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          ${[
            { name: 'Escuro', icon: '🌙', active: true },
            { name: 'Claro', icon: '☀️', active: false },
            { name: 'Automático', icon: '🔄', active: false }
          ].map(theme => `
            <div style="padding:16px;background:${theme.active ? 'rgba(96,165,250,.15)' : 'rgba(255,255,255,.04)'};border:${theme.active ? '1px solid var(--a)' : '1px solid var(--border)'};border-radius:12px;text-align:center;cursor:pointer;transition:.14s;"
                 onmouseover="this.style.transform='translateY(-2px)'"
                 onmouseout="this.style.transform='translateY(0)'">
              <div style="font-size:2rem;margin-bottom:8px;">${theme.icon}</div>
              <div style="font-size:.85rem;font-weight:500;">${theme.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Wallpaper Preview -->
      <div class="settings-section">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-image" style="color:var(--a);"></i> Papel de Parede
        </h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
          ${WALLS.slice(0, 6).map(wall => `
            <div style="aspect-ratio:16/9;border-radius:10px;background:url('${wall.u}') center/cover;cursor:pointer;position:relative;overflow:hidden;transition:.14s;"
                 onmouseover="this.style.transform='scale(1.02)'"
                 onmouseout="this.style.transform='scale(1)'"
                 onclick="SystemSettings.setWallpaper('${wall.u}')">
              <div style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(transparent,rgba(0,0,0,.7));font-size:.75rem;color:#fff;">${wall.n}</div>
            </div>
          `).join('')}
        </div>
        <button style="margin-top:14px;padding:10px 16px;background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.85rem;cursor:pointer;transition:.14s;"
                onclick="openSettings('personalization')"
                onmouseover="this.style.background='rgba(255,255,255,.12)'"
                onmouseout="this.style.background='rgba(255,255,255,.08)'">
          Ver todos os wallpapers
        </button>
      </div>
    `;
  },

  /**
   * Renderiza configurações de Sistema
   */
  renderSystem() {
    return `
      <h2 style="font-size:1.4rem;margin-bottom:24px;">Sistema</h2>
      
      <!-- System Info -->
      <div class="settings-section" style="margin-bottom:28px;">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-info-circle" style="color:var(--a);"></i> Informações do Sistema
        </h3>
        <div style="padding:16px;background:rgba(96,165,250,.1);border-radius:12px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            ${[
              { label: 'Edição', value: 'VessieOS Professional' },
              { label: 'Versão', value: '1.0.3' },
              { label: 'Arquitetura', value: '64-bit' },
              { label: 'Base', value: 'Web OS (HTML5/CSS3/JS)' }
            ].map(info => `
              <div>
                <div style="font-size:.75rem;color:var(--dim);">${info.label}</div>
                <div style="font-size:.9rem;font-weight:500;margin-top:4px;">${info.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <!-- Updates -->
      <div class="settings-section" style="margin-bottom:28px;">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-sync-alt" style="color:var(--a2);"></i> Atualizações
        </h3>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,.04);border-radius:10px;">
          <div>
            <div style="font-size:.88rem;font-weight:500;">Verificar Atualizações</div>
            <div style="font-size:.75rem;color:var(--dim);margin-top:4px;">Mantenha seu sistema sempre atualizado</div>
          </div>
          <button style="padding:10px 18px;background:var(--a);border:none;border-radius:8px;color:#fff;font-size:.85rem;font-weight:500;cursor:pointer;transition:.14s;"
                  onmouseover="this.style.filter='brightness(1.1)'"
                  onmouseout="this.style.filter='brightness(1)'">
            Verificar Agora
          </button>
        </div>
      </div>
      
      <!-- Reset Options -->
      <div class="settings-section">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-exclamation-triangle" style="color:#fbbf24;"></i> Opções de Recuperação
        </h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button style="padding:12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.85rem;cursor:pointer;text-align:left;transition:.14s;"
                  onmouseover="this.style.background='rgba(255,255,255,.08)'"
                  onmouseout="this.style.background='rgba(255,255,255,.04)'">
            <div style="font-weight:500;">Restaurar Configurações de Fábrica</div>
            <div style="font-size:.75rem;color:var(--dim);margin-top:4px;">Remove todos os apps e configurações pessoais</div>
          </button>
          <button style="padding:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;color:#ef4444;font-size:.85rem;cursor:pointer;text-align:left;transition:.14s;"
                  onmouseover="this.style.background='rgba(239,68,68,.2)'"
                  onmouseout="this.style.background='rgba(239,68,68,.1)'">
            <div style="font-weight:500;">Reiniciar o Sistema</div>
            <div style="font-size:.75rem;color:var(--dim);margin-top:4px;">Fecha todos os apps e reinicia o VessieOS</div>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Renderiza configurações de Armazenamento
   */
  renderStorage() {
    return `
      <h2 style="font-size:1.4rem;margin-bottom:24px;">Armazenamento</h2>
      
      <!-- Storage Overview -->
      <div class="settings-section" style="margin-bottom:28px;">
        <div style="padding:20px;background:rgba(96,165,250,.1);border-radius:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <div style="font-size:1.1rem;font-weight:600;">Disco Local (C:)</div>
              <div style="font-size:.85rem;color:var(--dim);margin-top:4px;">128 GB usados de 256 GB</div>
            </div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--a);">50%</div>
          </div>
          <div style="height:12px;background:rgba(255,255,255,.1);border-radius:6px;overflow:hidden;">
            <div style="width:50%;height:100%;background:linear-gradient(90deg,var(--a),var(--a2));border-radius:6px;"></div>
          </div>
        </div>
      </div>
      
      <!-- Storage Breakdown -->
      <div class="settings-section">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-chart-pie" style="color:var(--a2);"></i> Uso por Categoria
        </h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            { category: 'Apps e Jogos', size: '45 GB', percent: 35, color: '#60a5fa' },
            { category: 'Documentos', size: '28 GB', percent: 22, color: '#a78bfa' },
            { category: 'Imagens e Vídeos', size: '32 GB', percent: 25, color: '#22d3ee' },
            { category: 'Arquivos Temporários', size: '15 GB', percent: 12, color: '#fbbf24' },
            { category: 'Outros', size: '8 GB', percent: 6, color: '#9ca3af' }
          ].map(item => `
            <div style="padding:12px;background:rgba(255,255,255,.04);border-radius:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:.85rem;">${item.category}</span>
                <span style="font-size:.85rem;color:var(--dim);">${item.size}</span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;">
                <div style="width:${item.percent}%;height:100%;background:${item.color};border-radius:3px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Renderiza configurações de Privacidade
   */
  renderPrivacy() {
    return `
      <h2 style="font-size:1.4rem;margin-bottom:24px;">Privacidade</h2>
      
      <!-- Privacy Overview -->
      <div class="settings-section" style="margin-bottom:28px;">
        <div style="padding:16px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <i class="fas fa-shield-check" style="font-size:1.5rem;color:#22c55e;"></i>
            <div>
              <div style="font-weight:600;color:#22c55e;">Proteção Ativa</div>
              <div style="font-size:.78rem;color:var(--dim);margin-top:4px;">Seus dados estão protegidos localmente</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Privacy Settings -->
      <div class="settings-section">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-user-lock" style="color:var(--a);"></i> Permissões
        </h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            { name: 'Localização', desc: 'Permitir que apps acessem sua localização', enabled: false },
            { name: 'Câmera', desc: 'Controlar acesso à câmera', enabled: true },
            { name: 'Microfone', desc: 'Controlar acesso ao microfone', enabled: true },
            { name: 'Dados de Diagnóstico', desc: 'Enviar dados de uso para melhorias', enabled: false }
          ].map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:rgba(255,255,255,.04);border-radius:10px;">
              <div>
                <div style="font-size:.88rem;font-weight:500;">${item.name}</div>
                <div style="font-size:.75rem;color:var(--dim);margin-top:4px;">${item.desc}</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${item.enabled ? 'checked' : ''} style="display:none;">
                <span style="display:block;width:48px;height:26px;background:${item.enabled ? 'var(--a)' : 'rgba(255,255,255,.15)'};border-radius:13px;position:relative;transition:.3s;"
                      onclick="this.style.background=this.previousElementSibling.checked?'var(--a)':'rgba(255,255,255,.15)';this.querySelector('.toggle-knob').style.transform=this.previousElementSibling.checked?'translateX(22px)':'translateX(0)'">
                  <span class="toggle-knob" style="display:block;width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:.3s;box-shadow:0 2px 4px rgba(0,0,0,.3);"></span>
                </span>
              </label>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Pesquisa nas configurações
   */
  search(query) {
    console.log('Pesquisando:', query);
    // Implementação futura de pesquisa
  },

  /**
   * Define brilho da tela
   */
  setBrightness(value) {
    console.log('Brilho:', value);
  },

  /**
   * Define volume do sistema
   */
  setVolume(value) {
    S.volume = parseInt(value);
    if (typeof persistState === 'function') {
      persistState();
    }
    
    // Atualiza display
    const rightIcon = document.getElementById('vol-icon-right');
    const leftIcon = document.getElementById('vol-icon-left');
    const display = rightIcon.parentElement.querySelector('span:last-child');
    
    if (display) display.textContent = `${value}%`;
    
    if (leftIcon && rightIcon) {
      if (value == 0) {
        leftIcon.className = 'fas fa-volume-mute';
        rightIcon.className = 'fas fa-volume-mute';
      } else if (value < 50) {
        leftIcon.className = 'fas fa-volume-down';
        rightIcon.className = 'fas fa-volume-down';
      } else {
        leftIcon.className = 'fas fa-volume-up';
        rightIcon.className = 'fas fa-volume-up';
      }
    }
  },

  /**
   * Alterna luz noturna
   */
  toggleNightLight(enabled) {
    console.log('Luz noturna:', enabled);
  },

  /**
   * Alterna som
   */
  toggleSound(id, enabled) {
    console.log(`Som ${id}:`, enabled);
  },

  /**
   * Define wallpaper
   */
  setWallpaper(url) {
    S.wallpaper = url;
    if (typeof persistState === 'function') {
      persistState();
    }
    if (typeof renderDesktop === 'function') {
      renderDesktop();
    }
    toast('Wallpaper aplicado com sucesso! ✨', 'success');
  }
};

// Exporta o módulo
window.SystemSettings = SystemSettings;
