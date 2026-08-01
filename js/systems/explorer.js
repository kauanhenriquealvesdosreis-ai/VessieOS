/**
 * ExplorerApp Module - Aplicativo Explorador de Arquivos do VessieOS
 * Interface completa para navegação e gerenciamento de arquivos
 */

const ExplorerApp = {
  // Elementos DOM
  elements: {},
  
  // Estado atual
  currentPath: 'Desktop',
  viewMode: 'grid', // 'grid' ou 'list'
  sortBy: 'name', // 'name', 'type', 'date'
  sortOrder: 'asc', // 'asc' ou 'desc'

  /**
   * Inicializa o aplicativo Explorer
   */
  init() {
    this.createExplorerWindow();
  },

  /**
   * Cria a janela do Explorer
   */
  createExplorerWindow(path = 'Desktop') {
    const content = `
      <div class="explorer-container" style="display:flex;flex-direction:column;height:100%;">
        <!-- Toolbar -->
        <div class="explorer-toolbar" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);background:rgba(255,255,255,.03);">
          <!-- Navigation Buttons -->
          <button class="exp-nav-btn" onclick="ExplorerApp.navigateUp()" title="Voltar" style="background:none;border:none;color:var(--text);padding:6px;cursor:pointer;border-radius:6px;">
            <i class="fas fa-arrow-up"></i>
          </button>
          <button class="exp-nav-btn" onclick="ExplorerApp.refresh()" title="Atualizar" style="background:none;border:none;color:var(--text);padding:6px;cursor:pointer;border-radius:6px;">
            <i class="fas fa-sync-alt"></i>
          </button>
          
          <!-- Path Bar -->
          <div class="exp-path-bar" style="flex:1;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:.85rem;">
            <i class="fas fa-folder" style="color:var(--a);"></i>
            <span id="exp-current-path">${path}</span>
          </div>
          
          <!-- View Options -->
          <button class="exp-view-btn" onclick="ExplorerApp.toggleView()" title="Alternar Visualização" style="background:none;border:none;color:var(--text);padding:6px;cursor:pointer;border-radius:6px;">
            <i class="fas fa-${this.viewMode === 'grid' ? 'list' : 'th'}"></i>
          </button>
          
          <!-- New Folder Button -->
          <button class="exp-new-btn" onclick="ExplorerApp.createNewFolder()" title="Nova Pasta" style="background:var(--a);border:none;color:#fff;padding:6px 12px;cursor:pointer;border-radius:6px;font-size:.85rem;">
            <i class="fas fa-folder-plus"></i> Nova Pasta
          </button>
        </div>
        
        <!-- Sidebar + Content -->
        <div style="display:flex;flex:1;overflow:hidden;">
          <!-- Sidebar -->
          <div class="exp-sidebar" style="width:180px;background:rgba(255,255,255,.02);border-right:1px solid var(--border);padding:8px;overflow-y:auto;">
            <div class="exp-sidebar-section" style="margin-bottom:16px;">
              <div style="font-size:.7rem;font-weight:600;color:var(--dim);text-transform:uppercase;margin-bottom:8px;padding-left:8px;">Locais Rápidos</div>
              ${this.renderQuickAccess()}
            </div>
            <div class="exp-sidebar-section">
              <div style="font-size:.7rem;font-weight:600;color:var(--dim);text-transform:uppercase;margin-bottom:8px;padding-left:8px;">Este Computador</div>
              ${this.renderDrives()}
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="exp-content" style="flex:1;overflow-y:auto;padding:12px;" id="exp-content-area">
            ${this.renderFileGrid(path)}
          </div>
        </div>
        
        <!-- Status Bar -->
        <div class="exp-statusbar" style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;border-top:1px solid var(--border);background:rgba(255,255,255,.02);font-size:.75rem;color:var(--dim);">
          <span id="exp-item-count">0 itens</span>
          <span id="exp-selected-info">Nenhum item selecionado</span>
        </div>
      </div>
    `;

    if (typeof WindowManager !== 'undefined') {
      WindowManager.create({
        title: 'Explorador de Arquivos',
        icon: 'fas fa-folder-open',
        content,
        width: 900,
        height: 550,
        resizable: true
      });
    }
    
    this.currentPath = path;
  },

  /**
   * Renderiza acesso rápido na sidebar
   */
  renderQuickAccess() {
    const quickAccess = [
      { name: 'Desktop', icon: 'fa-desktop' },
      { name: 'Documentos', icon: 'fa-file-alt' },
      { name: 'Downloads', icon: 'fa-download' },
      { name: 'Imagens', icon: 'fa-image' },
      { name: 'Vídeos', icon: 'fa-video' }
    ];

    return quickAccess.map(item => `
      <div class="exp-quick-item" 
           onclick="ExplorerApp.navigateTo('${item.name}')" 
           style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;cursor:pointer;color:var(--text-2);font-size:.85rem;"
           onmouseover="this.style.background='rgba(255,255,255,.05)'"
           onmouseout="this.style.background='transparent'">
        <i class="fas ${item.icon}" style="color:var(--a);width:16px;"></i>
        <span>${item.name}</span>
      </div>
    `).join('');
  },

  /**
   * Renderiza drives na sidebar
   */
  renderDrives() {
    const drives = [
      { name: 'Disco Local (C:)', total: '256 GB', used: '128 GB', icon: 'fa-hdd' },
      { name: 'VessieOS System', total: '—', used: '—', icon: 'fa-compact-disc' }
    ];

    return drives.map(drive => `
      <div class="exp-drive-item" 
           style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;cursor:pointer;color:var(--text-2);font-size:.85rem;"
           onmouseover="this.style.background='rgba(255,255,255,.05)'"
           onmouseout="this.style.background='transparent'">
        <i class="fas ${drive.icon}" style="color:var(--a2);width:16px;"></i>
        <div style="flex:1;">
          <div style="font-size:.8rem;">${drive.name}</div>
          <div style="font-size:.7rem;color:var(--dim);">${drive.used} / ${drive.total}</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Renderiza grid de arquivos
   */
  renderFileGrid(path) {
    if (typeof FileManager === 'undefined') {
      return '<div style="padding:20px;text-align:center;color:var(--dim);">Carregando...</div>';
    }

    const items = FileManager.listDirectory(path);
    
    if (items.length === 0) {
      return `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;color:var(--dim);">
          <i class="fas fa-folder-open" style="font-size:3rem;margin-bottom:16px;opacity:.5;"></i>
          <div style="font-size:.9rem;">Esta pasta está vazia</div>
        </div>
      `;
    }

    // Ordena itens
    const sorted = this.sortItems(items);

    // Separa pastas e arquivos
    const folders = sorted.filter(i => i.type === 'folder');
    const files = sorted.filter(i => i.type === 'file');

    return `
      <div class="exp-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;">
        ${folders.map(folder => this.renderFolderItem(folder)).join('')}
        ${files.map(file => this.renderFileItem(file)).join('')}
      </div>
    `;
  },

  /**
   * Renderiza item de pasta
   */
  renderFolderItem(folder) {
    return `
      <div class="exp-item exp-folder" 
           data-path="${folder.path}" 
           data-type="folder"
           ondblclick="ExplorerApp.navigateTo('${folder.path}')"
           onclick="ExplorerApp.selectItem(this)"
           style="display:flex;flex-direction:column;align-items:center;padding:12px 8px;border-radius:8px;cursor:pointer;transition:.14s;"
           onmouseover="this.style.background='rgba(255,255,255,.08)'"
           onmouseout="if(!this.classList.contains('selected'))this.style.background='transparent'">
        <i class="fas fa-folder" style="font-size:2.5rem;color:#fbbf24;margin-bottom:8px;"></i>
        <span style="font-size:.75rem;color:var(--text);text-align:center;word-break:break-word;line-height:1.3;">${folder.name}</span>
      </div>
    `;
  },

  /**
   * Renderiza item de arquivo
   */
  renderFileItem(file) {
    const icon = this.getFileIcon(file.name);
    const color = this.getFileColor(file.name);
    
    return `
      <div class="exp-item exp-file" 
           data-path="${file.path}" 
           data-type="file"
           onclick="ExplorerApp.selectItem(this)"
           ondblclick="ExplorerApp.openFile('${file.path}')"
           style="display:flex;flex-direction:column;align-items:center;padding:12px 8px;border-radius:8px;cursor:pointer;transition:.14s;"
           onmouseover="this.style.background='rgba(255,255,255,.08)'"
           onmouseout="if(!this.classList.contains('selected'))this.style.background='transparent'">
        <i class="fas ${icon}" style="font-size:2.2rem;color:${color};margin-bottom:8px;"></i>
        <span style="font-size:.75rem;color:var(--text);text-align:center;word-break:break-word;line-height:1.3;">${file.name}</span>
      </div>
    `;
  },

  /**
   * Obtém ícone baseado na extensão do arquivo
   */
  getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'txt': 'fa-file-alt',
      'pdf': 'fa-file-pdf',
      'doc': 'fa-file-word',
      'docx': 'fa-file-word',
      'xls': 'fa-file-excel',
      'xlsx': 'fa-file-excel',
      'jpg': 'fa-file-image',
      'jpeg': 'fa-file-image',
      'png': 'fa-file-image',
      'gif': 'fa-file-image',
      'webp': 'fa-file-image',
      'mp3': 'fa-file-audio',
      'wav': 'fa-file-audio',
      'mp4': 'fa-file-video',
      'avi': 'fa-file-video',
      'mkv': 'fa-file-video',
      'zip': 'fa-file-archive',
      'rar': 'fa-file-archive',
      '7z': 'fa-file-archive',
      'js': 'fa-file-code',
      'html': 'fa-file-code',
      'css': 'fa-file-code',
      'json': 'fa-file-code'
    };
    return icons[ext] || 'fa-file';
  },

  /**
   * Obtém cor baseada na extensão do arquivo
   */
  getFileColor(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const colors = {
      'txt': '#60a5fa',
      'pdf': '#ef4444',
      'doc': 'docx',
      'docx': '#3b82f6',
      'xls': 'xlsx',
      'xlsx': '#22c55e',
      'jpg': 'jpeg',
      'jpeg': '#f59e0b',
      'png': '#f59e0b',
      'gif': '#f59e0b',
      'webp': '#f59e0b',
      'mp3': '#ec4899',
      'wav': '#ec4899',
      'mp4': '#8b5cf6',
      'avi': '#8b5cf6',
      'mkv': '#8b5cf6',
      'zip': '#f97316',
      'rar': '#f97316',
      '7z': '#f97316',
      'js': '#fbbf24',
      'html': '#f97316',
      'css': '#60a5fa',
      'json': '#22c55e'
    };
    return colors[ext] || '#9ca3af';
  },

  /**
   * Ordena itens
   */
  sortItems(items) {
    return [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'date':
          comparison = 0; // Implementar quando tiver datas
          break;
      }
      
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  },

  /**
   * Navega para um caminho
   */
  navigateTo(path) {
    this.currentPath = path;
    const contentArea = document.getElementById('exp-content-area');
    if (contentArea) {
      contentArea.innerHTML = this.renderFileGrid(path);
    }
    
    const pathDisplay = document.getElementById('exp-current-path');
    if (pathDisplay) {
      pathDisplay.textContent = path;
    }
    
    this.updateStatusBar();
  },

  /**
   * Navega para cima (pasta pai)
   */
  navigateUp() {
    const parts = this.currentPath.split('/').filter(p => p);
    if (parts.length > 1) {
      parts.pop();
      this.navigateTo(parts.join('/'));
    } else if (parts.length === 1) {
      this.navigateTo('Desktop');
    }
  },

  /**
   * Atualiza visualização
   */
  toggleView() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    this.refresh();
  },

  /**
   * Atualiza conteúdo
   */
  refresh() {
    const contentArea = document.getElementById('exp-content-area');
    if (contentArea) {
      contentArea.innerHTML = this.renderFileGrid(this.currentPath);
    }
  },

  /**
   * Seleciona um item
   */
  selectItem(element) {
    // Remove seleção anterior
    document.querySelectorAll('.exp-item.selected').forEach(el => {
      el.classList.remove('selected');
      el.style.background = 'transparent';
    });
    
    // Adiciona nova seleção
    element.classList.add('selected');
    element.style.background = 'rgba(96,165,250,.2)';
    
    this.updateStatusBar();
  },

  /**
   * Atualiza barra de status
   */
  updateStatusBar() {
    const items = FileManager.listDirectory(this.currentPath);
    const countElement = document.getElementById('exp-item-count');
    const selectedElement = document.getElementById('exp-selected-info');
    
    if (countElement) {
      countElement.textContent = `${items.length} itens`;
    }
    
    if (selectedElement) {
      const selected = document.querySelector('.exp-item.selected');
      if (selected) {
        const name = selected.querySelector('span').textContent;
        selectedElement.textContent = `Selecionado: ${name}`;
      } else {
        selectedElement.textContent = 'Nenhum item selecionado';
      }
    }
  },

  /**
   * Cria nova pasta
   */
  createNewFolder() {
    const name = prompt('Nome da pasta:');
    if (name && typeof FileManager !== 'undefined') {
      const success = FileManager.createFolder(this.currentPath, name);
      if (success) {
        this.refresh();
        if (typeof toast !== 'undefined') {
          toast('Pasta criada com sucesso! ✨', 'success');
        }
      } else {
        if (typeof toast !== 'undefined') {
          toast('Não foi possível criar a pasta', 'error');
        }
      }
    }
  }
};

// Exporta o módulo
window.ExplorerApp = ExplorerApp;
