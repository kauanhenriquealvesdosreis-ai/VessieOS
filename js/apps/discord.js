/**
 * Discord App - Integração segura com servidores GitHub
 * VessieOS - Sistema Operacional Web
 * 
 * IMPORTANTE: Este app usa apenas APIs públicas e permitidas do GitHub
 * para mostrar informações de repositórios de forma segura.
 */

const DiscordApp = (function() {
  'use strict';

  // Estado interno
  let state = {
    currentView: 'servers',
    selectedServer: null,
    selectedChannel: null,
    servers: [],
    githubRepos: []
  };

  // Servidores pré-configurados (repositórios GitHub populares)
  const DEFAULT_SERVERS = [
    {
      id: 'vessieos',
      name: 'VessieOS',
      icon: '💜',
      repo: 'vessieos/vessieos',
      description: 'Sistema Operacional Web VessieOS'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: '🪟',
      repo: 'microsoft/vscode',
      description: 'Visual Studio Code'
    },
    {
      id: 'google',
      name: 'Google',
      icon: '🔍',
      repo: 'google/react',
      description: 'Biblioteca React'
    },
    {
      id: 'facebook',
      name: 'Meta',
      icon: '📘',
      repo: 'facebook/react',
      description: 'React Library'
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: '🟢',
      repo: 'nodejs/node',
      description: 'Node.js Runtime'
    }
  ];

  // Estilos CSS
  const styles = `
    .discord-window {
      background: #36393f;
      color: #dcddde;
      font-family: 'Inter', sans-serif;
    }
    
    .discord-sidebar {
      width: 72px;
      background: #202225;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 0;
      overflow-y: auto;
    }
    
    .discord-server {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #36393f;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      position: relative;
    }
    
    .discord-server:hover {
      border-radius: 35%;
      background: #5865f2;
      transform: scale(1.05);
    }
    
    .discord-server.active {
      border-radius: 35%;
      background: #5865f2;
    }
    
    .discord-server::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 0;
      background: white;
      border-radius: 0 4px 4px 0;
      transition: height 0.2s ease;
    }
    
    .discord-server.active::before {
      height: 40px;
    }
    
    .discord-channels {
      width: 240px;
      background: #2f3136;
      display: flex;
      flex-direction: column;
    }
    
    .discord-server-header {
      padding: 16px;
      font-weight: 600;
      color: white;
      border-bottom: 1px solid #202225;
      font-size: 0.95rem;
    }
    
    .discord-channel-list {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
    }
    
    .discord-channel {
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      color: #8e9297;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }
    
    .discord-channel:hover {
      background: #34373c;
      color: #dcddde;
    }
    
    .discord-channel.active {
      background: #393c43;
      color: white;
    }
    
    .discord-channel i {
      font-size: 0.8rem;
      color: #72767d;
    }
    
    .discord-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #36393f;
    }
    
    .discord-topbar {
      height: 48px;
      border-bottom: 1px solid #202225;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
    }
    
    .discord-chat {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    
    .discord-message {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.1s ease;
    }
    
    .discord-message:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    
    .discord-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    
    .discord-message-content {
      flex: 1;
    }
    
    .discord-message-header {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 4px;
    }
    
    .discord-username {
      font-weight: 600;
      color: white;
      font-size: 0.95rem;
    }
    
    .discord-timestamp {
      font-size: 0.75rem;
      color: #72767d;
    }
    
    .discord-message-text {
      color: #dcddde;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    
    .discord-input-area {
      padding: 16px;
      background: #36393f;
    }
    
    .discord-input-wrapper {
      background: #40444b;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .discord-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #dcddde;
      font-size: 0.95rem;
      outline: none;
    }
    
    .discord-input::placeholder {
      color: #72767d;
    }
    
    .discord-send-btn {
      background: #5865f2;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .discord-send-btn:hover {
      background: #4752c4;
      transform: scale(1.05);
    }
    
    .discord-info-card {
      background: #2f3136;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .discord-info-title {
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
      font-size: 1rem;
    }
    
    .discord-info-stat {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #40444b;
      font-size: 0.85rem;
    }
    
    .discord-info-stat:last-child {
      border-bottom: none;
    }
    
    .discord-stat-label {
      color: #b9bbbe;
    }
    
    .discord-stat-value {
      color: #5865f2;
      font-weight: 500;
    }
    
    .discord-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #72767d;
    }
    
    .discord-loading i {
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .discord-welcome {
      text-align: center;
      padding: 60px 20px;
      color: #72767d;
    }
    
    .discord-welcome-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.5;
    }
    
    .discord-welcome h3 {
      color: white;
      margin-bottom: 10px;
    }
  `;

  // Injetar estilos
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Criar janela do Discord
  function createWindow() {
    const win = WindowManager.create({
      title: 'Discord - GitHub Integration',
      content: '<div class="discord-window" style="width:100%;height:100%;display:flex;"></div>',
      width: 1200,
      height: 750,
      icon: '<i class="fab fa-discord" style="color:#5865f2"></i>'
    });

    const container = win.querySelector('.discord-window');
    renderDiscord(container);
    
    return win;
  }

  // Renderizar interface principal
  function renderDiscord(container) {
    container.innerHTML = `
      <div class="discord-sidebar" id="discord-servers">
        ${DEFAULT_SERVERS.map((server, index) => `
          <div class="discord-server ${index === 0 ? 'active' : ''}" 
               data-server="${server.id}" 
               title="${server.name}">
            ${server.icon}
          </div>
        `).join('')}
        <div class="discord-server" title="Adicionar Servidor" style="background:transparent;border:2px dashed #36393f;color:#36393f;font-size:1.5rem;" onclick="DiscordApp.addCustomServer()">+</div>
      </div>
      
      <div class="discord-channels">
        <div class="discord-server-header" id="discord-server-name">VessieOS</div>
        <div class="discord-channel-list" id="discord-channels">
          <div class="discord-channel active" data-channel="general">
            <i class="fas fa-hashtag"></i> geral
          </div>
          <div class="discord-channel" data-channel="updates">
            <i class="fas fa-bullhorn"></i> atualizações
          </div>
          <div class="discord-channel" data-channel="github">
            <i class="fab fa-github"></i> github-info
          </div>
          <div class="discord-channel" data-channel="random">
            <i class="fas fa-comment"></i> aleatório
          </div>
        </div>
      </div>
      
      <div class="discord-main">
        <div class="discord-topbar">
          <i class="fas fa-hashtag" style="color:#72767d"></i>
          <span style="font-weight:600;color:white;" id="discord-channel-name">geral</span>
          <div style="flex:1"></div>
          <i class="fas fa-phone" style="color:#b9bbbe;margin-right:16px;cursor:pointer"></i>
          <i class="fas fa-video" style="color:#b9bbbe;margin-right:16px;cursor:pointer"></i>
          <i class="fas fa-user-friends" style="color:#b9bbbe;cursor:pointer"></i>
        </div>
        
        <div class="discord-chat" id="discord-chat">
          ${renderChat()}
        </div>
        
        <div class="discord-input-area">
          <div class="discord-input-wrapper">
            <button style="background:none;border:none;color:#b9bbbe;cursor:pointer;font-size:1.2rem;">
              <i class="fas fa-plus"></i>
            </button>
            <input type="text" class="discord-input" placeholder="Conversar em #geral" id="discord-message-input">
            <button class="discord-send-btn" id="discord-send-btn">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    attachEvents(container);
    loadGitHubInfo();
  }

  // Renderizar chat
  function renderChat() {
    const messages = [
      {
        user: 'Vessie Bot',
        avatar: '💜',
        time: 'Hoje às 10:30',
        text: 'Bem-vindo ao servidor VessieOS! 💜 Este é um espaço seguro para discutir o projeto.'
      },
      {
        user: 'GitHub Integration',
        avatar: '🐙',
        time: 'Hoje às 10:31',
        text: 'Este canal mostra informações em tempo real dos repositórios do GitHub de forma segura e permitida.'
      },
      {
        user: 'Sistema',
        avatar: '⚙️',
        time: 'Hoje às 10:32',
        text: 'Use os comandos disponíveis para interagir com os repositórios. Todas as requisições usam a API pública do GitHub.'
      }
    ];

    return messages.map(msg => `
      <div class="discord-message">
        <div class="discord-avatar">${msg.avatar}</div>
        <div class="discord-message-content">
          <div class="discord-message-header">
            <span class="discord-username">${msg.user}</span>
            <span class="discord-timestamp">${msg.time}</span>
          </div>
          <div class="discord-message-text">${msg.text}</div>
        </div>
      </div>
    `).join('');
  }

  // Carregar informações do GitHub
  async function loadGitHubInfo() {
    const chatEl = document.getElementById('discord-chat');
    if (!chatEl) return;

    // Adicionar mensagem de carregamento
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'discord-loading';
    loadingMsg.innerHTML = '<i class="fas fa-spinner"></i> Carregando informações do GitHub...';
    chatEl.appendChild(loadingMsg);

    try {
      // Usar API pública do GitHub (sem autenticação necessária para dados públicos)
      const repo = 'vessieos/vessieos'; // Repositório exemplo
      const response = await fetch(`https://api.github.com/repos/${repo}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remover loading
        loadingMsg.remove();

        // Adicionar informação do repositório
        const infoCard = document.createElement('div');
        infoCard.className = 'discord-info-card';
        infoCard.innerHTML = `
          <div class="discord-info-title">
            <i class="fab fa-github" style="margin-right:8px;"></i>
            ${data.full_name || 'Repositório GitHub'}
          </div>
          <div class="discord-info-stat">
            <span class="discord-stat-label">Descrição</span>
            <span class="discord-stat-value">${data.description || 'Sem descrição'}</span>
          </div>
          <div class="discord-info-stat">
            <span class="discord-stat-label">Stars</span>
            <span class="discord-stat-value">⭐ ${data.stargazers_count || 0}</span>
          </div>
          <div class="discord-info-stat">
            <span class="discord-stat-label">Forks</span>
            <span class="discord-stat-value">🍴 ${data.forks_count || 0}</span>
          </div>
          <div class="discord-info-stat">
            <span class="discord-stat-label">Linguagem</span>
            <span class="discord-stat-value">${data.language || 'N/A'}</span>
          </div>
          <div class="discord-info-stat">
            <span class="discord-stat-label">Última atualização</span>
            <span class="discord-stat-value">${new Date(data.updated_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div style="margin-top:12px;">
            <a href="${data.html_url}" target="_blank" 
               style="display:inline-block;background:#5865f2;color:white;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:0.85rem;font-weight:500;">
              <i class="fab fa-github" style="margin-right:6px;"></i>Ver no GitHub
            </a>
          </div>
        `;
        chatEl.appendChild(infoCard);

        // Scroll para baixo
        chatEl.scrollTop = chatEl.scrollHeight;
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      loadingMsg.innerHTML = '⚠️ Não foi possível carregar dados do GitHub. Verifique sua conexão.';
      console.error('Erro ao carregar GitHub:', error);
    }
  }

  // Anexar eventos
  function attachEvents(container) {
    // Selecionar servidor
    container.querySelectorAll('.discord-server').forEach(server => {
      server.addEventListener('click', () => {
        container.querySelectorAll('.discord-server').forEach(s => s.classList.remove('active'));
        server.classList.add('active');
        
        const serverName = server.title || 'Servidor';
        document.getElementById('discord-server-name').textContent = serverName;
        
        // Recarregar informações do GitHub
        loadGitHubInfo();
      });
    });

    // Selecionar canal
    container.querySelectorAll('.discord-channel').forEach(channel => {
      channel.addEventListener('click', () => {
        container.querySelectorAll('.discord-channel').forEach(c => c.classList.remove('active'));
        channel.classList.add('active');
        
        const channelName = channel.textContent.trim();
        document.getElementById('discord-channel-name').textContent = channelName;
        document.querySelector('.discord-input').placeholder = `Conversar em #${channelName}`;
      });
    });

    // Enviar mensagem
    const input = container.querySelector('#discord-message-input');
    const sendBtn = container.querySelector('#discord-send-btn');

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      const chatEl = container.querySelector('#discord-chat');
      const now = new Date();
      const timeStr = `Hoje às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const messageEl = document.createElement('div');
      messageEl.className = 'discord-message';
      messageEl.innerHTML = `
        <div class="discord-avatar">👤</div>
        <div class="discord-message-content">
          <div class="discord-message-header">
            <span class="discord-username">${S.user || 'Visitante'}</span>
            <span class="discord-timestamp">${timeStr}</span>
          </div>
          <div class="discord-message-text">${escapeHtml(text)}</div>
        </div>
      `;

      chatEl.appendChild(messageEl);
      chatEl.scrollTop = chatEl.scrollHeight;
      input.value = '';

      toast('Mensagem enviada!', 'success');
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // Escapar HTML para segurança
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Adicionar servidor customizado
  function addCustomServer() {
    const repoName = prompt('Digite o repositório GitHub (ex: usuario/repositorio):');
    if (repoName) {
      const parts = repoName.split('/');
      if (parts.length === 2) {
        const newServer = {
          id: parts[0],
          name: parts[0],
          icon: '📁',
          repo: repoName,
          description: `Repositório ${repoName}`
        };
        DEFAULT_SERVERS.push(newServer);
        toast(`Servidor ${parts[0]} adicionado!`, 'success');
      } else {
        toast('Formato inválido. Use: usuario/repositorio', 'error');
      }
    }
  }

  // API pública
  return {
    createWindow,
    addCustomServer,
    getState: () => state
  };
})();

// Exportar para escopo global
window.DiscordApp = DiscordApp;
