/**
 * Steam App - Game Hub no estilo Steam Original
 * VessieOS - Sistema Operacional Web
 */

const SteamApp = (function() {
  'use strict';

  // Estado interno
  let state = {
    currentView: 'library',
    selectedGame: null,
    installedGames: [],
    libraryFilter: 'all',
    searchQuery: '',
    featuredIndex: 0
  };

  // Categorias da Steam
  const categories = [
    { id: 'library', name: 'Biblioteca', icon: 'fas fa-gamepad' },
    { id: 'store', name: 'Loja', icon: 'fas fa-store' },
    { id: 'community', name: 'Comunidade', icon: 'fas fa-users' },
    { id: 'profile', name: 'Perfil', icon: 'fas fa-user-circle' },
    { id: 'settings', name: 'Configurações', icon: 'fas fa-cog' }
  ];

  // Cores temáticas da Steam
  const colors = {
    dark: '#1b2838',
    darker: '#171a21',
    light: '#66c0f4',
    accent: '#577a9c',
    text: '#c7d5e0',
    textDim: '#8b9aa8'
  };

  // Estilos CSS específicos
  const styles = `
    .steam-window {
      background: linear-gradient(135deg, #1b2838 0%, #171a21 100%);
      color: #c7d5e0;
      font-family: 'Inter', sans-serif;
    }
    
    .steam-sidebar {
      width: 220px;
      background: rgba(0, 0, 0, 0.3);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      padding: 20px 0;
      display: flex;
      flex-direction: column;
    }
    
    .steam-logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #66c0f4;
      padding: 0 20px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .steam-nav-item {
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #8b9aa8;
      font-size: 0.9rem;
    }
    
    .steam-nav-item:hover {
      background: rgba(102, 192, 244, 0.1);
      color: #66c0f4;
    }
    
    .steam-nav-item.active {
      background: rgba(102, 192, 244, 0.15);
      color: #66c0f4;
      border-left: 3px solid #66c0f4;
    }
    
    .steam-main {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    
    .steam-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .steam-search {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      padding: 8px 15px;
      color: #c7d5e0;
      width: 300px;
      font-size: 0.85rem;
    }
    
    .steam-search:focus {
      outline: none;
      border-color: #66c0f4;
    }
    
    .steam-featured {
      background: linear-gradient(135deg, rgba(102, 192, 244, 0.1) 0%, rgba(27, 40, 56, 0.5) 100%);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
      border: 1px solid rgba(102, 192, 244, 0.2);
    }
    
    .steam-featured-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #66c0f4;
      margin-bottom: 15px;
    }
    
    .steam-game-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    
    .steam-game-card {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .steam-game-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      border-color: rgba(102, 192, 244, 0.3);
    }
    
    .steam-game-image {
      width: 100%;
      height: 100px;
      object-fit: cover;
      background: rgba(0, 0, 0, 0.3);
    }
    
    .steam-game-info {
      padding: 12px;
    }
    
    .steam-game-name {
      font-size: 0.85rem;
      font-weight: 500;
      color: #c7d5e0;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .steam-game-status {
      font-size: 0.75rem;
      color: #8b9aa8;
    }
    
    .steam-game-status.installed {
      color: #66c0f4;
    }
    
    .steam-game-status.playing {
      color: #4caf50;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    
    .steam-filter-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .steam-filter-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      padding: 6px 14px;
      color: #8b9aa8;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .steam-filter-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #c7d5e0;
    }
    
    .steam-filter-btn.active {
      background: rgba(102, 192, 244, 0.2);
      border-color: #66c0f4;
      color: #66c0f4;
    }
    
    .steam-library-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .steam-library-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }
    
    .steam-library-item:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(102, 192, 244, 0.2);
    }
    
    .steam-library-item.selected {
      background: rgba(102, 192, 244, 0.15);
      border-color: rgba(102, 192, 244, 0.4);
    }
    
    .steam-lib-icon {
      width: 50px;
      height: 50px;
      border-radius: 6px;
      object-fit: cover;
    }
    
    .steam-lib-info {
      flex: 1;
    }
    
    .steam-lib-name {
      font-size: 0.95rem;
      font-weight: 500;
      color: #c7d5e0;
      margin-bottom: 4px;
    }
    
    .steam-lib-time {
      font-size: 0.75rem;
      color: #8b9aa8;
    }
    
    .steam-play-btn {
      background: linear-gradient(135deg, #66c0f4 0%, #4a9fd8 100%);
      border: none;
      border-radius: 4px;
      padding: 10px 24px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .steam-play-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(102, 192, 244, 0.4);
    }
    
    .steam-profile-header {
      background: linear-gradient(135deg, rgba(102, 192, 244, 0.15) 0%, rgba(27, 40, 56, 0.6) 100%);
      border-radius: 8px;
      padding: 25px;
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 25px;
    }
    
    .steam-avatar {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      background: linear-gradient(135deg, #66c0f4 0%, #4a9fd8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      border: 3px solid rgba(102, 192, 244, 0.3);
    }
    
    .steam-profile-info h3 {
      font-size: 1.4rem;
      color: #c7d5e0;
      margin-bottom: 5px;
    }
    
    .steam-profile-info p {
      font-size: 0.85rem;
      color: #8b9aa8;
    }
    
    .steam-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    
    .steam-stat-card {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      padding: 15px;
      text-align: center;
    }
    
    .steam-stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #66c0f4;
      margin-bottom: 5px;
    }
    
    .steam-stat-label {
      font-size: 0.75rem;
      color: #8b9aa8;
    }
    
    .steam-store-banner {
      height: 300px;
      background: linear-gradient(135deg, rgba(102, 192, 244, 0.2) 0%, rgba(27, 40, 56, 0.8) 100%);
      border-radius: 8px;
      margin-bottom: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #66c0f4;
      font-weight: 600;
    }
    
    .steam-section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #c7d5e0;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(102, 192, 244, 0.3);
    }
  `;

  // Injetar estilos
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Criar janela da Steam
  function createWindow() {
    const win = WindowManager.create({
      title: 'Steam',
      content: '<div class="steam-window" style="width:100%;height:100%;display:flex;"></div>',
      width: 1100,
      height: 700,
      icon: '<i class="fab fa-steam" style="color:#66c0f4"></i>'
    });

    const container = win.querySelector('.steam-window');
    renderSteam(container);
    
    return win;
  }

  // Renderizar interface principal
  function renderSteam(container) {
    container.innerHTML = `
      <div class="steam-sidebar">
        <div class="steam-logo">
          <i class="fab fa-steam"></i>
          <span>STEAM</span>
        </div>
        ${categories.map(cat => `
          <div class="steam-nav-item ${cat.id === state.currentView ? 'active' : ''}" 
               data-view="${cat.id}">
            <i class="${cat.icon}"></i>
            <span>${cat.name}</span>
          </div>
        `).join('')}
      </div>
      <div class="steam-main" id="steam-content">
        ${renderContent()}
      </div>
    `;

    attachEvents(container);
  }

  // Renderizar conteúdo baseado na view atual
  function renderContent() {
    switch(state.currentView) {
      case 'library':
        return renderLibrary();
      case 'store':
        return renderStore();
      case 'community':
        return renderCommunity();
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      default:
        return renderLibrary();
    }
  }

  // Renderizar Biblioteca
  function renderLibrary() {
    const games = GAMES || [];
    const filtered = games.filter(game => {
      const matchesSearch = game.n.toLowerCase().includes(state.searchQuery.toLowerCase());
      if (state.libraryFilter === 'installed') {
        return matchesSearch && state.installedGames.includes(game.n);
      } else if (state.libraryFilter === 'recent') {
        return matchesSearch;
      }
      return matchesSearch;
    });

    return `
      <div class="steam-header">
        <h2 style="font-size:1.5rem;color:#c7d5e0;margin:0;">Biblioteca</h2>
        <input type="text" class="steam-search" placeholder="Pesquisar jogos..." 
               value="${state.searchQuery}" id="steam-search-input">
      </div>
      
      <div class="steam-filter-bar">
        <button class="steam-filter-btn ${state.libraryFilter === 'all' ? 'active' : ''}" 
                data-filter="all">Todos os Jogos</button>
        <button class="steam-filter-btn ${state.libraryFilter === 'installed' ? 'active' : ''}" 
                data-filter="installed">Instalados</button>
        <button class="steam-filter-btn ${state.libraryFilter === 'recent' ? 'active' : ''}" 
                data-filter="recent">Recentes</button>
      </div>
      
      <div class="steam-library-list">
        ${filtered.slice(0, 20).map(game => `
          <div class="steam-library-item" data-game="${game.n}">
            <img src="${game.ic || 'https://via.placeholder.com/50'}" 
                 class="steam-lib-icon" alt="${game.n}">
            <div class="steam-lib-info">
              <div class="steam-lib-name">${game.n}</div>
              <div class="steam-lib-time">
                ${state.installedGames.includes(game.n) ? '✓ Instalado' : 'Não instalado'}
              </div>
            </div>
            <button class="steam-play-btn" data-action="${state.installedGames.includes(game.n) ? 'play' : 'install'}">
              ${state.installedGames.includes(game.n) ? 'JOGAR' : 'INSTALAR'}
            </button>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top:20px;text-align:center;color:#8b9aa8;font-size:0.85rem;">
        Mostrando ${filtered.length} de ${games.length} jogos
      </div>
    `;
  }

  // Renderizar Loja
  function renderStore() {
    const games = GAMES || [];
    const featured = games.slice(0, 6);

    return `
      <div class="steam-header">
        <h2 style="font-size:1.5rem;color:#c7d5e0;margin:0;">Loja</h2>
        <input type="text" class="steam-search" placeholder="Pesquisar na loja...">
      </div>
      
      <div class="steam-store-banner">
        <div>
          <div style="font-size:1rem;color:#8b9aa8;margin-bottom:10px;">DESTAQUE DA SEMANA</div>
          <div>OFERTAS ESPECIAIS DE VERÃO</div>
        </div>
      </div>
      
      <div class="steam-section-title">Destaques</div>
      <div class="steam-game-grid">
        ${featured.map(game => `
          <div class="steam-game-card" data-game="${game.n}">
            <img src="${game.ic || 'https://via.placeholder.com/180x100'}" 
                 class="steam-game-image" alt="${game.n}">
            <div class="steam-game-info">
              <div class="steam-game-name">${game.n}</div>
              <div class="steam-game-status">Grátis para Jogar</div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="steam-section-title" style="margin-top:30px;">Recomendados para Você</div>
      <div class="steam-game-grid">
        ${games.slice(6, 12).map(game => `
          <div class="steam-game-card" data-game="${game.n}">
            <img src="${game.ic || 'https://via.placeholder.com/180x100'}" 
                 class="steam-game-image" alt="${game.n}">
            <div class="steam-game-info">
              <div class="steam-game-name">${game.n}</div>
              <div class="steam-game-status">Disponível Agora</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Renderizar Comunidade
  function renderCommunity() {
    return `
      <div class="steam-header">
        <h2 style="font-size:1.5rem;color:#c7d5e0;margin:0;">Comunidade</h2>
      </div>
      
      <div class="steam-section-title">Atividade Recente</div>
      <div style="background:rgba(255,255,255,0.03);border-radius:6px;padding:20px;text-align:center;color:#8b9aa8;">
        <i class="fas fa-users" style="font-size:3rem;margin-bottom:15px;opacity:0.3;"></i>
        <div style="font-size:1.1rem;margin-bottom:10px;">Comunidade Steam</div>
        <div>Conecte-se com outros jogadores, compartilhe conquistas e participe de discussões.</div>
        <button class="steam-play-btn" style="margin-top:20px;">Explorar Comunidade</button>
      </div>
      
      <div class="steam-section-title" style="margin-top:25px;">Grupos Populares</div>
      <div class="steam-game-grid">
        ${['VessieOS Gamers', 'Brasil Steam', 'Indie Games BR', 'Retro Gaming'].map(group => `
          <div class="steam-game-card">
            <div style="height:100px;background:linear-gradient(135deg,#66c0f4,#4a9fd8);display:flex;align-items:center;justify-content:center;">
              <i class="fas fa-users" style="font-size:2rem;color:white;"></i>
            </div>
            <div class="steam-game-info">
              <div class="steam-game-name">${group}</div>
              <div class="steam-game-status">Grupo Público</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Renderizar Perfil
  function renderProfile() {
    const totalGames = GAMES ? GAMES.length : 0;
    const installedCount = state.installedGames.length;

    return `
      <div class="steam-profile-header">
        <div class="steam-avatar">💜</div>
        <div class="steam-profile-info">
          <h3>${S.user || 'Visitante'}</h3>
          <p>Jogador VessieOS • Nível 42</p>
        </div>
      </div>
      
      <div class="steam-stats">
        <div class="steam-stat-card">
          <div class="steam-stat-value">${totalGames}</div>
          <div class="steam-stat-label">Jogos na Biblioteca</div>
        </div>
        <div class="steam-stat-card">
          <div class="steam-stat-value">${installedCount}</div>
          <div class="steam-stat-label">Jogos Instalados</div>
        </div>
        <div class="steam-stat-card">
          <div class="steam-stat-value">127h</div>
          <div class="steam-stat-label">Tempo Total de Jogo</div>
        </div>
      </div>
      
      <div class="steam-section-title" style="margin-top:25px;">Conquistas Recentes</div>
      <div style="background:rgba(255,255,255,0.03);border-radius:6px;padding:20px;">
        <div style="display:flex;gap:15px;flex-wrap:wrap;">
          ${['🏆 Primeiro Jogo', '⚡ Speedrunner', '🎯 Mestre', '🌟 Explorador'].map(achievement => `
            <div style="background:rgba(102,192,244,0.1);border:1px solid rgba(102,192,244,0.2);border-radius:6px;padding:12px 18px;display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.2rem;">${achievement.split(' ')[0]}</span>
              <span style="font-size:0.85rem;color:#c7d5e0;">${achievement.split(' ').slice(1).join(' ')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Renderizar Configurações
  function renderSettings() {
    return `
      <div class="steam-header">
        <h2 style="font-size:1.5rem;color:#c7d5e0;margin:0;">Configurações</h2>
      </div>
      
      <div class="steam-section-title">Geral</div>
      <div style="background:rgba(255,255,255,0.03);border-radius:6px;padding:15px;margin-bottom:15px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div>
            <div style="color:#c7d5e0;font-size:0.9rem;">Modo Offline</div>
            <div style="color:#8b9aa8;font-size:0.75rem;">Jogar sem conexão com a internet</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox">
            <span class="slider"></span>
          </label>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;">
          <div>
            <div style="color:#c7d5e0;font-size:0.9rem;">Notificações de Jogos</div>
            <div style="color:#8b9aa8;font-size:0.75rem;">Receber alertas sobre novos lançamentos</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
        </div>
      </div>
      
      <div class="steam-section-title">Downloads</div>
      <div style="background:rgba(255,255,255,0.03);border-radius:6px;padding:15px;">
        <div style="color:#8b9aa8;font-size:0.85rem;margin-bottom:10px;">Local de Instalação: VessieOS/Games</div>
        <button class="steam-play-btn" style="padding:8px 16px;font-size:0.8rem;">Alterar Pasta</button>
      </div>
    `;
  }

  // Anexar eventos
  function attachEvents(container) {
    // Navegação lateral
    container.querySelectorAll('.steam-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        state.currentView = item.dataset.view;
        container.querySelectorAll('.steam-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const content = container.querySelector('#steam-content');
        content.innerHTML = renderContent();
        attachEvents(container);
      });
    });

    // Filtros da biblioteca
    container.querySelectorAll('.steam-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.libraryFilter = btn.dataset.filter;
        container.querySelectorAll('.steam-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const content = container.querySelector('#steam-content');
        content.innerHTML = renderLibrary();
        attachEvents(container);
      });
    });

    // Pesquisa
    const searchInput = container.querySelector('#steam-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        const content = container.querySelector('#steam-content');
        content.innerHTML = renderLibrary();
        attachEvents(container);
      });
    }

    // Botões de jogo
    container.querySelectorAll('.steam-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const gameItem = btn.closest('.steam-library-item');
        const gameName = gameItem?.dataset.game;
        
        if (action === 'install' && gameName) {
          installGame(gameName, btn);
        } else if (action === 'play' && gameName) {
          playGame(gameName);
        }
      });
    });

    // Cards de jogo
    container.querySelectorAll('.steam-game-card, .steam-library-item').forEach(card => {
      card.addEventListener('dblclick', () => {
        const gameName = card.dataset.game;
        if (gameName) {
          playGame(gameName);
        }
      });
    });
  }

  // Instalar jogo
  function installGame(gameName, btn) {
    if (!state.installedGames.includes(gameName)) {
      state.installedGames.push(gameName);
      btn.textContent = 'JOGAR';
      btn.dataset.action = 'play';
      
      // Atualizar status
      const statusEl = btn.parentElement.querySelector('.steam-lib-time');
      if (statusEl) {
        statusEl.textContent = '✓ Instalado';
        statusEl.classList.add('installed');
      }
      
      toast(`${gameName} instalado com sucesso!`, 'success');
      
      // Persistir
      localStorage.setItem('vessieos_steam_installed', JSON.stringify(state.installedGames));
    }
  }

  // Jogar jogo
  function playGame(gameName) {
    const game = (GAMES || []).find(g => g.n === gameName);
    if (game && game.u) {
      // Abrir em nova janela ou iframe
      const gameWindow = WindowManager.create({
        title: gameName,
        content: `<iframe src="${game.u}" style="width:100%;height:100%;border:none;background:#000;"></iframe>`,
        width: 1280,
        height: 720,
        icon: `<img src="${game.ic}" style="width:16px;height:16px;border-radius:3px;">`
      });
      
      toast(`Iniciando ${gameName}...`, 'default');
    } else {
      toast('Jogo não disponível no momento', 'error');
    }
  }

  // Carregar estado salvo
  function loadState() {
    try {
      const saved = localStorage.getItem('vessieos_steam_installed');
      if (saved) {
        state.installedGames = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao carregar estado da Steam:', e);
    }
  }

  // Inicialização
  loadState();

  // API pública
  return {
    createWindow,
    getState: () => state,
    installGame,
    playGame
  };
})();

// Exportar para escopo global
window.SteamApp = SteamApp;
