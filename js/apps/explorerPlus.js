/**
 * Explorer Plus - Explorador de Arquivos Avançado
 * VessieOS - Sistema Operacional Web
 * Com recursos avançados de gerenciamento de arquivos
 */

const ExplorerPlus = (function() {
  'use strict';

  // Estado interno
  let state = {
    currentPath: 'Desktop',
    viewMode: 'grid', // grid, list, details
    sortBy: 'name',
    sortAsc: true,
    selectedFiles: [],
    clipboard: null,
    history: [],
    historyIndex: -1
  };

  // Estilos CSS avançados
  const styles = `
    .explorer-plus {
      display: flex;
      height: 100%;
      background: linear-gradient(135deg, #1e1e2f 0%, #2a2a3e 100%);
      color: #e0e0e0;
      font-family: 'Inter', sans-serif;
    }
    
    .explorer-sidebar {
      width: 220px;
      background: rgba(0, 0, 0, 0.2);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      padding: 16px 0;
      overflow-y: auto;
    }
    
    .explorer-nav-section {
      padding: 0 12px;
      margin-bottom: 20px;
    }
    
    .explorer-nav-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #888;
      margin-bottom: 10px;
      padding-left: 8px;
      font-weight: 600;
    }
    
    .explorer-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #b0b0b0;
      font-size: 0.9rem;
      margin-bottom: 2px;
    }
    
    .explorer-nav-item:hover {
      background: rgba(255, 255, 255, 0.08);
      color: white;
    }
    
    .explorer-nav-item.active {
      background: rgba(96, 165, 250, 0.2);
      color: #60a5fa;
    }
    
    .explorer-nav-item i {
      width: 18px;
      text-align: center;
      font-size: 0.9rem;
    }
    
    .explorer-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .explorer-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(0, 0, 0, 0.1);
    }
    
    .explorer-nav-buttons {
      display: flex;
      gap: 4px;
    }
    
    .explorer-nav-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: rgba(255, 255, 255, 0.05);
      color: #b0b0b0;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .explorer-nav-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .explorer-nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .explorer-path-bar {
      flex: 1;
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      padding: 6px 12px;
      gap: 8px;
    }
    
    .explorer-path-segment {
      color: #60a5fa;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    
    .explorer-path-segment:hover {
      background: rgba(96, 165, 250, 0.1);
    }
    
    .explorer-path-separator {
      color: #666;
    }
    
    .explorer-view-controls {
      display: flex;
      gap: 4px;
    }
    
    .explorer-view-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: rgba(255, 255, 255, 0.05);
      color: #b0b0b0;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .explorer-view-btn.active {
      background: rgba(96, 165, 250, 0.2);
      color: #60a5fa;
    }
    
    .explorer-view-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .explorer-search {
      width: 200px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 6px 12px;
      color: #e0e0e0;
      font-size: 0.85rem;
    }
    
    .explorer-search:focus {
      outline: none;
      border-color: #60a5fa;
    }
    
    .explorer-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    
    .explorer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }
    
    .explorer-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .file-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      border: 1px solid transparent;
    }
    
    .file-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .file-item.selected {
      background: rgba(96, 165, 250, 0.15);
      border-color: rgba(96, 165, 250, 0.3);
    }
    
    .file-icon {
      font-size: 2.5rem;
      margin-bottom: 8px;
      display: block;
    }
    
    .file-name {
      font-size: 0.8rem;
      color: #e0e0e0;
      word-break: break-word;
      line-height: 1.3;
    }
    
    .file-item.list-view {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      text-align: left;
    }
    
    .file-item.list-view .file-icon {
      font-size: 1.5rem;
      margin-bottom: 0;
    }
    
    .file-item.list-view .file-name {
      flex: 1;
    }
    
    .file-meta {
      font-size: 0.75rem;
      color: #888;
      margin-top: 4px;
    }
    
    .explorer-statusbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(0, 0, 0, 0.1);
      font-size: 0.8rem;
      color: #888;
    }
    
    .context-menu {
      position: absolute;
      background: #2a2a3e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 6px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      min-width: 180px;
    }
    
    .context-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      color: #e0e0e0;
      font-size: 0.85rem;
      transition: background 0.2s ease;
    }
    
    .context-menu-item:hover {
      background: rgba(96, 165, 250, 0.15);
      color: #60a5fa;
    }
    
    .context-menu-separator {
      height: 1px;
      background: rgba(255, 255, 255, 0.05);
      margin: 6px 0;
    }
    
    .drop-zone {
      border: 2px dashed #60a5fa;
      background: rgba(96, 165, 250, 0.05);
      border-radius: 8px;
    }
  `;

  // Injetar estilos
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Criar janela do Explorer
  function createWindow(path = 'Desktop') {
    const win = WindowManager.create({
      title: 'Explorador de Arquivos',
      content: '<div class="explorer-plus" style="width:100%;height:100%;"></div>',
      width: 1000,
      height: 650,
      icon: '<i class="fas fa-folder-open" style="color:#fbbf24"></i>'
    });

    const container = win.querySelector('.explorer-plus');
    state.currentPath = path;
    renderExplorer(container);
    
    return win;
  }

  // Renderizar explorador
  function renderExplorer(container) {
    container.innerHTML = `
      <div class="explorer-sidebar">
        <div class="explorer-nav-section">
          <div class="explorer-nav-title">Acesso Rápido</div>
          <div class="explorer-nav-item active" data-path="Desktop">
            <i class="fas fa-desktop"></i>
            <span>Área de Trabalho</span>
          </div>
          <div class="explorer-nav-item" data-path="Downloads">
            <i class="fas fa-download"></i>
            <span>Downloads</span>
          </div>
          <div class="explorer-nav-item" data-path="Documentos">
            <i class="fas fa-file-alt"></i>
            <span>Documentos</span>
          </div>
          <div class="explorer-nav-item" data-path="Imagens">
            <i class="fas fa-image"></i>
            <span>Imagens</span>
          </div>
          <div class="explorer-nav-item" data-path="Music">
            <i class="fas fa-music"></i>
            <span>Músicas</span>
          </div>
          <div class="explorer-nav-item" data-path="Videos">
            <i class="fas fa-video"></i>
            <span>Vídeos</span>
          </div>
        </div>
        
        <div class="explorer-nav-section">
          <div class="explorer-nav-title">Unidades</div>
          <div class="explorer-nav-item" data-path="C:">
            <i class="fas fa-hdd"></i>
            <span>Disco Local (C:)</span>
          </div>
        </div>
      </div>
      
      <div class="explorer-main">
        <div class="explorer-toolbar">
          <div class="explorer-nav-buttons">
            <button class="explorer-nav-btn" id="exp-back" title="Voltar">
              <i class="fas fa-arrow-left"></i>
            </button>
            <button class="explorer-nav-btn" id="exp-forward" title="Avançar">
              <i class="fas fa-arrow-right"></i>
            </button>
            <button class="explorer-nav-btn" id="exp-up" title="Acima">
              <i class="fas fa-level-up-alt"></i>
            </button>
          </div>
          
          <div class="explorer-path-bar" id="exp-path-bar">
            ${renderPathBar()}
          </div>
          
          <div class="explorer-view-controls">
            <button class="explorer-view-btn ${state.viewMode === 'grid' ? 'active' : ''}" 
                    data-view="grid" title="Grade">
              <i class="fas fa-th"></i>
            </button>
            <button class="explorer-view-btn ${state.viewMode === 'list' ? 'active' : ''}" 
                    data-view="list" title="Lista">
              <i class="fas fa-list"></i>
            </button>
          </div>
          
          <input type="text" class="explorer-search" placeholder="Pesquisar..." id="exp-search">
        </div>
        
        <div class="explorer-content" id="exp-content">
          ${renderContent()}
        </div>
        
        <div class="explorer-statusbar">
          <span id="exp-status-left">${getSelectedCount()} itens selecionados</span>
          <span id="exp-status-right">${getItemCount()} itens</span>
        </div>
      </div>
    `;

    attachEvents(container);
  }

  // Renderizar barra de caminho
  function renderPathBar() {
    const parts = state.currentPath.split('/').filter(p => p);
    return parts.map((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      return `
        <span class="explorer-path-segment" data-path="${path}">${part}</span>
        ${index < parts.length - 1 ? '<span class="explorer-path-separator">›</span>' : ''}
      `;
    }).join('');
  }

  // Renderizar conteúdo
  function renderContent() {
    const items = getFileSystemItems(state.currentPath);
    const searchQuery = document.getElementById('exp-search')?.value || '';
    
    let filtered = items.filter(item => {
      if (!searchQuery) return true;
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      if (state.sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (state.sortBy === 'date') {
        comparison = (a.date || 0) - (b.date || 0);
      } else if (state.sortBy === 'size') {
        comparison = (a.size || 0) - (b.size || 0);
      }
      return state.sortAsc ? comparison : -comparison;
    });

    if (state.viewMode === 'grid') {
      return `
        <div class="explorer-grid">
          ${filtered.map(item => `
            <div class="file-item ${state.selectedFiles.includes(item.name) ? 'selected' : ''}" 
                 data-name="${item.name}" data-type="${item.type}">
              <span class="file-icon">${getFileIcon(item.type)}</span>
              <div class="file-name">${item.name}</div>
              ${item.size ? `<div class="file-meta">${formatSize(item.size)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    } else {
      return `
        <div class="explorer-list">
          ${filtered.map(item => `
            <div class="file-item list-view ${state.selectedFiles.includes(item.name) ? 'selected' : ''}" 
                 data-name="${item.name}" data-type="${item.type}">
              <span class="file-icon">${getFileIcon(item.type)}</span>
              <span class="file-name">${item.name}</span>
              <span class="file-meta">${item.type === 'folder' ? 'Pasta' : formatSize(item.size)}</span>
              <span class="file-meta">${item.date ? new Date(item.date).toLocaleDateString() : ''}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  // Obter itens do sistema de arquivos
  function getFileSystemItems(path) {
    const fs = S.fs || {};
    const folder = fs[path] || {};
    
    return Object.keys(folder).map(name => {
      const item = folder[name];
      const isFolder = typeof item === 'object' && item !== null;
      
      return {
        name,
        type: isFolder ? 'folder' : 'file',
        size: isFolder ? null : (item?.size || Math.floor(Math.random() * 10000)),
        date: isFolder ? null : (item?.date || Date.now())
      };
    });
  }

  // Ícone baseado no tipo
  function getFileIcon(type) {
    const icons = {
      'folder': '📁',
      'txt': '📄',
      'pdf': '📕',
      'doc': '📘',
      'xls': '📗',
      'jpg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'mp3': '🎵',
      'mp4': '🎬',
      'zip': '📦',
      'exe': '⚙️',
      'js': '📜',
      'html': '🌐',
      'css': '🎨'
    };
    
    if (type === 'folder') return icons['folder'];
    const ext = type.split('.').pop()?.toLowerCase();
    return icons[ext] || '📄';
  }

  // Formatrar tamanho
  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Contar itens selecionados
  function getSelectedCount() {
    return state.selectedFiles.length;
  }

  // Contar total de itens
  function getItemCount() {
    return getFileSystemItems(state.currentPath).length;
  }

  // Anexar eventos
  function attachEvents(container) {
    // Navegação lateral
    container.querySelectorAll('.explorer-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const path = item.dataset.path;
        navigateTo(path, container);
      });
    });

    // Botões de navegação
    container.querySelector('#exp-back')?.addEventListener('click', () => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.currentPath = state.history[state.historyIndex];
        refresh(container);
      }
    });

    container.querySelector('#exp-forward')?.addEventListener('click', () => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.currentPath = state.history[state.historyIndex];
        refresh(container);
      }
    });

    container.querySelector('#exp-up')?.addEventListener('click', () => {
      const parts = state.currentPath.split('/');
      if (parts.length > 1) {
        parts.pop();
        navigateTo(parts.join('/'), container);
      }
    });

    // Controles de visualização
    container.querySelectorAll('.explorer-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.viewMode = btn.dataset.view;
        container.querySelectorAll('.explorer-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        refresh(container);
      });
    });

    // Barra de caminho
    container.querySelectorAll('.explorer-path-segment').forEach(segment => {
      segment.addEventListener('click', () => {
        navigateTo(segment.dataset.path, container);
      });
    });

    // Pesquisa
    container.querySelector('#exp-search')?.addEventListener('input', () => {
      refresh(container);
    });

    // Seleção de arquivos
    container.querySelectorAll('.file-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
          // Seleção múltipla
          const name = item.dataset.name;
          const index = state.selectedFiles.indexOf(name);
          if (index > -1) {
            state.selectedFiles.splice(index, 1);
          } else {
            state.selectedFiles.push(name);
          }
          refresh(container);
        } else {
          // Clique duplo para abrir
          if (item.dataset.type === 'folder') {
            const newPath = state.currentPath + '/' + item.dataset.name;
            navigateTo(newPath, container);
          }
        }
      });

      item.addEventListener('dblclick', () => {
        if (item.dataset.type === 'folder') {
          const newPath = state.currentPath + '/' + item.dataset.name;
          navigateTo(newPath, container);
        } else {
          // Abrir arquivo
          openFile(item.dataset.name, container);
        }
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, item.dataset.name, container);
      });
    });

    // Click fora para fechar menu contextual
    document.addEventListener('click', () => {
      document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
    });
  }

  // Navegar para caminho
  function navigateTo(path, container) {
    state.currentPath = path;
    state.selectedFiles = [];
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(path);
    state.historyIndex++;
    
    refresh(container);
    
    // Atualizar sidebar
    container.querySelectorAll('.explorer-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.path === path);
    });
  }

  // Atualizar visualização
  function refresh(container) {
    const pathBar = container.querySelector('#exp-path-bar');
    if (pathBar) pathBar.innerHTML = renderPathBar();
    
    const content = container.querySelector('#exp-content');
    if (content) content.innerHTML = renderContent();
    
    const statusLeft = container.querySelector('#exp-status-left');
    if (statusLeft) statusLeft.textContent = `${getSelectedCount()} itens selecionados`;
    
    const statusRight = container.querySelector('#exp-status-right');
    if (statusRight) statusRight.textContent = `${getItemCount()} itens`;
    
    attachEvents(container);
  }

  // Abrir arquivo
  function openFile(fileName, container) {
    toast(`Abrindo ${fileName}...`, 'default');
    // Implementar lógica de abertura de arquivo
  }

  // Mostrar menu contextual
  function showContextMenu(x, y, fileName, container) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.innerHTML = `
      <div class="context-menu-item" data-action="open">
        <i class="fas fa-folder-open"></i> Abrir
      </div>
      <div class="context-menu-item" data-action="cut">
        <i class="fas fa-cut"></i> Recortar
      </div>
      <div class="context-menu-item" data-action="copy">
        <i class="fas fa-copy"></i> Copiar
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-action="rename">
        <i class="fas fa-edit"></i> Renomear
      </div>
      <div class="context-menu-item" data-action="delete">
        <i class="fas fa-trash"></i> Excluir
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-action="properties">
        <i class="fas fa-info-circle"></i> Propriedades
      </div>
    `;

    document.body.appendChild(menu);

    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        handleContextMenuAction(item.dataset.action, fileName, container);
        menu.remove();
      });
    });
  }

  // Ações do menu contextual
  function handleContextMenuAction(action, fileName, container) {
    switch (action) {
      case 'cut':
        state.clipboard = { action: 'cut', file: fileName };
        toast(`${fileName} recortado`, 'default');
        break;
      case 'copy':
        state.clipboard = { action: 'copy', file: fileName };
        toast(`${fileName} copiado`, 'default');
        break;
      case 'delete':
        deleteFile(fileName);
        refresh(container);
        toast(`${fileName} excluído`, 'success');
        break;
      case 'rename':
        renameFile(fileName, container);
        break;
      case 'properties':
        showProperties(fileName);
        break;
    }
  }

  // Excluir arquivo
  function deleteFile(fileName) {
    const fs = S.fs || {};
    const folder = fs[state.currentPath] || {};
    delete folder[fileName];
    persistState();
  }

  // Renomear arquivo
  function renameFile(oldName, container) {
    const newName = prompt('Novo nome:', oldName);
    if (newName && newName !== oldName) {
      const fs = S.fs || {};
      const folder = fs[state.currentPath] || {};
      folder[newName] = folder[oldName];
      delete folder[oldName];
      persistState();
      refresh(container);
      toast('Arquivo renomeado!', 'success');
    }
  }

  // Mostrar propriedades
  function showProperties(fileName) {
    const fs = S.fs || {};
    const folder = fs[state.currentPath] || {};
    const item = folder[fileName];
    
    const size = typeof item === 'object' ? 'Pasta' : (item?.size || 'Desconhecido');
    const date = typeof item === 'object' ? '-' : new Date(item?.date || Date.now()).toLocaleString();
    
    alert(`Propriedades:\n\nNome: ${fileName}\nTipo: ${typeof item === 'object' ? 'Pasta' : 'Arquivo'}\nTamanho: ${size}\nModificado: ${date}`);
  }

  // Persistir estado
  function persistState() {
    try {
      localStorage.setItem('vessieos_fs', JSON.stringify(S.fs));
    } catch (e) {}
  }

  // API pública
  return {
    createWindow,
    getState: () => state,
    navigateTo: (path) => {
      state.currentPath = path;
    },
    refresh: () => {
      const container = document.querySelector('.explorer-plus');
      if (container) renderExplorer(container);
    }
  };
})();

// Exportar para escopo global
window.ExplorerPlus = ExplorerPlus;
