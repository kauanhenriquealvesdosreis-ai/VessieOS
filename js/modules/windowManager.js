/**
 * WindowManager Module - Gerenciador de Janelas do VessieOS
 * Controla criação, fechamento, minimização e organização de janelas
 */

const WindowManager = {
  // Estado das janelas
  windows: [],
  nextZ: 100,
  activeWindowId: null,

  /**
   * Cria uma nova janela
   * @param {Object} config - Configuração da janela
   * @returns {string} ID da janela criada
   */
  create(config = {}) {
    const id = `win-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const window = {
      id,
      title: config.title || 'Janela',
      icon: config.icon || 'fas fa-window-maximize',
      content: config.content || '',
      width: config.width || 600,
      height: config.height || 400,
      x: config.x || Math.random() * 200 + 50,
      y: config.y || Math.random() * 100 + 50,
      zIndex: ++this.nextZ,
      minimized: false,
      maximized: false,
      resizable: config.resizable !== false,
      closable: config.closable !== false,
      onClose: config.onClose || null,
      onMinimize: config.onMinimize || null,
      onMaximize: config.onMaximize || null,
      onFocus: config.onFocus || null
    };

    this.windows.push(window);
    this.focus(id);
    
    return id;
  },

  /**
   * Foca em uma janela específica
   * @param {string} id - ID da janela
   */
  focus(id) {
    const win = this.windows.find(w => w.id === id);
    if (!win) return;

    // Remove foco de todas as janelas
    this.windows.forEach(w => {
      w.zIndex = w.zIndex > 0 ? w.zIndex : 0;
    });

    // Define novo topo
    win.zIndex = ++this.nextZ;
    this.activeWindowId = id;

    // Callback de foco
    if (win.onFocus) {
      win.onFocus(win);
    }

    this.render();
  },

  /**
   * Minimiza uma janela
   * @param {string} id - ID da janela
   */
  minimize(id) {
    const win = this.windows.find(w => w.id === id);
    if (!win) return;

    win.minimized = true;
    
    if (win.onMinimize) {
      win.onMinimize(win);
    }

    // Se era a ativa, remove o foco
    if (this.activeWindowId === id) {
      this.activeWindowId = null;
    }

    this.render();
  },

  /**
   * Restaura uma janela minimizada
   * @param {string} id - ID da janela
   */
  restore(id) {
    const win = this.windows.find(w => w.id === id);
    if (!win) return;

    win.minimized = false;
    this.focus(id);
  },

  /**
   * Maximiza/Restaura uma janela
   * @param {string} id - ID da janela
   */
  toggleMaximize(id) {
    const win = this.windows.find(w => w.id === id);
    if (!win) return;

    win.maximized = !win.maximized;
    
    if (win.onMaximize) {
      win.onMaximize(win);
    }

    this.focus(id);
  },

  /**
   * Fecha uma janela
   * @param {string} id - ID da janela
   */
  close(id) {
    const index = this.windows.findIndex(w => w.id === id);
    if (index === -1) return;

    const win = this.windows[index];

    // Callback de fechamento
    if (win.onClose) {
      const shouldClose = win.onClose(win);
      if (shouldClose === false) return;
    }

    this.windows.splice(index, 1);

    // Se era a ativa, foca na próxima
    if (this.activeWindowId === id && this.windows.length > 0) {
      const lastWin = this.windows[this.windows.length - 1];
      this.focus(lastWin.id);
    }

    this.render();
  },

  /**
   * Atualiza posição de uma janela
   * @param {string} id - ID da janela
   * @param {number} x - Nova posição X
   * @param {number} y - Nova posição Y
   */
  setPosition(id, x, y) {
    const win = this.windows.find(w => w.id === id);
    if (!win || win.maximized) return;

    win.x = Math.max(0, x);
    win.y = Math.max(0, y);
    this.render();
  },

  /**
   * Atualiza tamanho de uma janela
   * @param {string} id - ID da janela
   * @param {number} width - Nova largura
   * @param {number} height - Nova altura
   */
  setSize(id, width, height) {
    const win = this.windows.find(w => w.id === id);
    if (!win || win.maximized) return;

    win.width = Math.max(300, width);
    win.height = Math.max(200, height);
    this.render();
  },

  /**
   * Obtém uma janela por ID
   * @param {string} id - ID da janela
   * @returns {Object|null}
   */
  get(id) {
    return this.windows.find(w => w.id === id) || null;
  },

  /**
   * Lista todas as janelas
   * @returns {Array}
   */
  list() {
    return [...this.windows];
  },

  /**
   * Fecha todas as janelas
   */
  closeAll() {
    this.windows.forEach(win => {
      if (win.onClose) {
        win.onClose(win);
      }
    });
    this.windows = [];
    this.activeWindowId = null;
    this.render();
  },

  /**
   * Minimiza todas as janelas
   */
  minimizeAll() {
    this.windows.forEach(win => {
      win.minimized = true;
    });
    this.activeWindowId = null;
    this.render();
  },

  /**
   * Renderiza as janelas no DOM (implementação externa)
   */
  render() {
    // Esta função será sobrescrita pelo app principal
    // para atualizar o DOM com o estado atual
    if (typeof this.onRender === 'function') {
      this.onRender(this.windows);
    }
  },

  /**
   * Callback de renderização (definido externamente)
   */
  onRender: null
};

// Exporta o módulo
window.WindowManager = WindowManager;
