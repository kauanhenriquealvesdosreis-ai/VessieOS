# VessieOS - Sistema Operacional Web

Um sistema operacional web completo desenvolvido com HTML5, CSS3 e JavaScript moderno, inspirado no Windows 11 com elementos de macOS, GNOME e KDE Plasma.

## 🚀 Estrutura do Projeto

```
/workspace/
├── index.html              # Ponto de entrada principal
├── css/
│   └── style.css          # Estilos globais e componentes UI
├── js/
│   ├── app.js             # Aplicação principal e lógica do sistema
│   ├── modules/           # Módulos fundamentais do sistema
│   │   ├── fileManager.js     # Gerenciador de arquivos e pastas
│   │   └── windowManager.js   # Gerenciador de janelas
│   └── systems/           # Sistemas e aplicativos
│       ├── explorer.js        # Explorador de arquivos
│       └── settings.js        # Configurações do sistema
├── assets/
│   ├── icons/             # Ícones personalizados
│   └── sounds/            # Efeitos sonoros
└── README.md              # Este arquivo
```

## 🎯 Módulos Implementados

### Core Modules (`js/modules/`)

#### FileManager
- ✅ Navegação em árvore de diretórios
- ✅ Criar, renomear, excluir arquivos e pastas
- ✅ Copiar e colar (área de transferência)
- ✅ Leitura e escrita de arquivos
- ✅ Persistência no localStorage
- ✅ Listagem de diretórios com tipos

#### WindowManager
- ✅ Criação dinâmica de janelas
- ✅ Foco e empilhamento (z-index)
- ✅ Minimizar, maximizar, restaurar
- ✅ Fechamento com callbacks
- ✅ Posicionamento e redimensionamento
- ✅ Renderização integrada com DOM

### Systems (`js/systems/`)

#### ExplorerApp
- ✅ Interface moderna de explorador de arquivos
- ✅ Sidebar com acesso rápido e drives
- ✅ Visualização em grid e lista
- ✅ Barra de navegação e path
- ✅ Ícones por tipo de arquivo
- ✅ Status bar com contagem de itens
- ✅ Integração com FileManager

#### SystemSettings
- ✅ 8 categorias de configurações
- ✅ Interface responsiva e intuitiva
- ✅ Toggle switches animados
- ✅ Integração com estado global

## 🎨 Recursos Visuais

- **Design Híbrido**: Windows 11 base + macOS/GNOME/KDE accents
- **Mica/Acrylic Effects**: Superfícies translúcidas com blur
- **Traffic-Light Controls**: Controles de janela estilo macOS
- **Animações Fluent**: Transições suaves com easing customizado
- **Tema Escuro**: Palette escura com acentos em roxo VessieOS

## 🛠️ Tecnologias

- HTML5 - Estrutura semântica
- CSS3 - Variáveis CSS, Flexbox, Grid, backdrop-filter
- JavaScript ES6+ - Módulos, arrow functions, template literals
- Font Awesome 6.5 - Ícones vetoriais
- Google Fonts - Inter e JetBrains Mono

## 📋 Funcionalidades

- Desktop com ícones e menu de contexto
- Taskbar com Menu Iniciar centralizado
- Janelas arrastáveis e redimensionáveis
- Sistema de arquivos persistente
- Notificações toast
- Game Hub com 40+ jogos
- IA Vessie integrada

---

<div align="center">
  <strong>VessieOS v1.0.3</strong> | Feito com 💜
</div>
