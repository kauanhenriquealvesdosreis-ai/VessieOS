/**
 * FileManager Module - Sistema de Arquivos do VessieOS
 * Gerencia operações de arquivo, pastas e navegação
 */

const FileManager = {
  // Estado atual do sistema de arquivos
  state: {
    currentPath: 'Desktop',
    selectedFiles: [],
    clipboard: null,
    clipboardAction: null // 'copy' ou 'cut'
  },

  // Estrutura base do sistema de arquivos
  fs: {
    Desktop: {},
    Documentos: {
      'Bem-vindo.txt': 'Olá! Bem-vindo ao VessieOS 💜\n\nEste é seu espaço pessoal.',
      'Leia-me.txt': 'VessieOS v3.0\n\nFeatures:\n• IA Vessie integrada\n• Dashboard completo\n• Game Hub com jogos\n• Terminal\n• Bloco de notas\n• Calculadora\n• Explorador de arquivos\n• Player de música'
    },
    Downloads: {},
    Imagens: {
      'foto1.png': null,
      'foto2.png': null
    },
    Videos: {},
    Sistema: {
      'Windows': {
        'System32': {},
        'WinSxS': {}
      },
      'Usuários': {}
    }
  },

  /**
   * Navega para um caminho específico
   * @param {string} path - Caminho a navegar
   */
  navigate(path) {
    this.state.currentPath = path;
    this.state.selectedFiles = [];
    return this.getFolder(path);
  },

  /**
   * Obtém o conteúdo de uma pasta
   * @param {string} path - Caminho da pasta
   * @returns {Object} Conteúdo da pasta
   */
  getFolder(path) {
    const parts = path.split('/').filter(p => p);
    let current = this.fs;
    
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return typeof current === 'object' ? current : null;
  },

  /**
   * Cria uma nova pasta
   * @param {string} path - Caminho pai
   * @param {string} name - Nome da pasta
   * @returns {boolean} Sucesso da operação
   */
  createFolder(path, name) {
    const folder = this.getFolder(path);
    if (!folder || !name.trim()) return false;
    
    const normalizedName = name.trim();
    if (folder[normalizedName]) return false;
    
    folder[normalizedName] = {};
    this.persist();
    return true;
  },

  /**
   * Cria um novo arquivo
   * @param {string} path - Caminho pai
   * @param {string} name - Nome do arquivo
   * @param {any} content - Conteúdo do arquivo
   * @returns {boolean} Sucesso da operação
   */
  createFile(path, name, content = '') {
    const folder = this.getFolder(path);
    if (!folder || !name.trim()) return false;
    
    const normalizedName = name.trim();
    if (folder[normalizedName]) return false;
    
    folder[normalizedName] = content;
    this.persist();
    return true;
  },

  /**
   * Renomeia um arquivo ou pasta
   * @param {string} path - Caminho completo do item
   * @param {string} newName - Novo nome
   * @returns {boolean} Sucesso da operação
   */
  rename(path, newName) {
    const parts = path.split('/').filter(p => p);
    const name = parts.pop();
    const parentPath = parts.join('/') || 'Desktop';
    const parent = this.getFolder(parentPath);
    
    if (!parent || !parent[name] || !newName.trim()) return false;
    
    const normalizedName = newName.trim();
    if (parent[normalizedName]) return false;
    
    parent[normalizedName] = parent[name];
    delete parent[name];
    this.persist();
    return true;
  },

  /**
   * Exclui um arquivo ou pasta
   * @param {string} path - Caminho completo do item
   * @returns {boolean} Sucesso da operação
   */
  delete(path) {
    const parts = path.split('/').filter(p => p);
    const name = parts.pop();
    const parentPath = parts.join('/') || 'Desktop';
    const parent = this.getFolder(parentPath);
    
    if (!parent || !parent[name]) return false;
    
    delete parent[name];
    this.persist();
    return true;
  },

  /**
   * Copia um arquivo para a área de transferência
   * @param {string} path - Caminho do arquivo
   */
  copy(path) {
    this.state.clipboard = path;
    this.state.clipboardAction = 'copy';
  },

  /**
   * Recorta um arquivo para a área de transferência
   * @param {string} path - Caminho do arquivo
   */
  cut(path) {
    this.state.clipboard = path;
    this.state.clipboardAction = 'cut';
  },

  /**
   * Cola o arquivo da área de transferência
   * @param {string} destPath - Caminho de destino
   * @returns {boolean} Sucesso da operação
   */
  paste(destPath) {
    if (!this.state.clipboard || !this.state.clipboardAction) return false;
    
    const sourceParts = this.state.clipboard.split('/').filter(p => p);
    const sourceName = sourceParts.pop();
    const sourceParentPath = sourceParts.join('/') || 'Desktop';
    const sourceParent = this.getFolder(sourceParentPath);
    
    if (!sourceParent || !sourceParent[sourceName]) return false;
    
    const destFolder = this.getFolder(destPath);
    if (!destFolder) return false;
    
    const content = sourceParent[sourceName];
    
    // Se for cópia, duplica o conteúdo
    if (this.state.clipboardAction === 'copy') {
      let newName = sourceName;
      let counter = 1;
      const nameParts = sourceName.split('.');
      const ext = nameParts.length > 1 ? nameParts.pop() : null;
      const baseName = ext ? nameParts.join('.') : sourceName;
      
      while (destFolder[newName]) {
        newName = ext ? `${baseName} (${counter}).${ext}` : `${baseName} (${counter})`;
        counter++;
      }
      
      destFolder[newName] = typeof content === 'object' ? JSON.parse(JSON.stringify(content)) : content;
    } 
    // Se for recorte, move o arquivo
    else if (this.state.clipboardAction === 'cut') {
      if (destFolder[sourceName]) return false;
      destFolder[sourceName] = content;
      delete sourceParent[sourceName];
    }
    
    this.state.clipboard = null;
    this.state.clipboardAction = null;
    this.persist();
    return true;
  },

  /**
   * Lê o conteúdo de um arquivo
   * @param {string} path - Caminho do arquivo
   * @returns {any} Conteúdo do arquivo
   */
  readFile(path) {
    const parts = path.split('/').filter(p => p);
    const name = parts.pop();
    const parentPath = parts.join('/') || 'Desktop';
    const parent = this.getFolder(parentPath);
    
    if (!parent || !(name in parent)) return null;
    
    return parent[name];
  },

  /**
   * Escreve conteúdo em um arquivo
   * @param {string} path - Caminho do arquivo
   * @param {any} content - Novo conteúdo
   * @returns {boolean} Sucesso da operação
   */
  writeFile(path, content) {
    const parts = path.split('/').filter(p => p);
    const name = parts.pop();
    const parentPath = parts.join('/') || 'Desktop';
    const parent = this.getFolder(parentPath);
    
    if (!parent || !(name in parent)) return false;
    
    parent[name] = content;
    this.persist();
    return true;
  },

  /**
   * Lista todos os arquivos e pastas de um diretório
   * @param {string} path - Caminho do diretório
   * @returns {Array<{name: string, type: string, path: string}>}
   */
  listDirectory(path) {
    const folder = this.getFolder(path);
    if (!folder) return [];
    
    return Object.entries(folder).map(([name, content]) => ({
      name,
      type: typeof content === 'object' ? 'folder' : 'file',
      path: path === 'Desktop' ? name : `${path}/${name}`
    }));
  },

  /**
   * Persiste o estado no localStorage
   */
  persist() {
    try {
      const state = localStorage.getItem('vessieos_state');
      const data = state ? JSON.parse(state) : {};
      data.fs = this.fs;
      localStorage.setItem('vessieos_state', JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao persistir FileSystem:', e);
    }
  },

  /**
   * Restaura o estado do localStorage
   */
  restore() {
    try {
      const state = localStorage.getItem('vessieos_state');
      if (state) {
        const data = JSON.parse(state);
        if (data.fs) {
          this.fs = data.fs;
        }
      }
    } catch (e) {
      console.error('Erro ao restaurar FileSystem:', e);
    }
  }
};

// Exporta o módulo
window.FileManager = FileManager;
