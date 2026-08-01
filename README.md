# VessieOS v3.0 - Sistema Operacional Web Completo

Um sistema operacional web completo e altamente modularizado, desenvolvido com HTML5, CSS3 e JavaScript moderno. Inspirado no Windows 11 com elementos de macOS, GNOME, KDE Plasma e Steam OS.

## 🚀 Estrutura do Projeto Modularizada

```
/workspace/
├── index.html                  # Ponto de entrada principal
├── css/
│   ├── style.css               # Estilos globais e componentes UI
│   └── components/             # Componentes CSS modulares
├── js/
│   ├── app.js                  # Aplicação principal e lógica do sistema
│   ├── modules/                # Módulos fundamentais do sistema (Core)
│   │   ├── fileManager.js      # Gerenciador de arquivos e pastas
│   │   └── windowManager.js    # Gerenciador de janelas avançado
│   ├── systems/                # Sistemas base do SO
│   │   ├── explorer.js         # Explorador de arquivos básico
│   │   └── settings.js         # Configurações do sistema (8 categorias)
│   ├── apps/                   # Aplicativos avançados
│   │   ├── steam.js            # Game Hub estilo Steam Original
│   │   ├── discord.js          # Chat integration com GitHub API
│   │   └── explorerPlus.js     # Explorador de arquivos avançado
│   ├── games/                  # Jogos e entretenimento
│   └── services/               # Serviços de backend/sistema
├── assets/
│   ├── icons/                  # Ícones personalizados
│   └── sounds/                 # Efeitos sonoros
└── README.md                   # Documentação
```

## 🎯 Arquitetura Modular

### Core Modules (`js/modules/`) - Módulo Base do Sistema

#### FileManager
- ✅ Navegação em árvore de diretórios completa
- ✅ CRUD de arquivos e pastas (Criar, Ler, Atualizar, Deletar)
- ✅ Sistema de copiar/colar com clipboard
- ✅ Leitura e escrita de arquivos
- ✅ Persistência automática no localStorage
- ✅ Detecção de tipos de arquivos
- ✅ API pública para integração

#### WindowManager
- ✅ Criação dinâmica de janelas com configuração flexível
- ✅ Sistema de foco e empilhamento (z-index automático)
- ✅ Minimizar, maximizar, restaurar com animações
- ✅ Callbacks de fechamento personalizadas
- ✅ Posicionamento inteligente e redimensionamento
- ✅ Integração com taskbar
- ✅ Suporte a múltiplas instâncias

### Systems (`js/systems/`) - Sistemas Operacionais Base

#### ExplorerApp
- ✅ Interface moderna de explorador de arquivos
- ✅ Sidebar com acesso rápido e unidades
- ✅ Visualização em grid e lista alternável
- ✅ Barra de navegação breadcrumb
- ✅ Ícones dinâmicos por tipo de arquivo
- ✅ Status bar informativa
- ✅ Integração total com FileManager

#### SystemSettings
- ✅ 8 categorias completas:
  - Tela (resolução, wallpaper, escala)
  - Som (volume, efeitos, mute)
  - Notificações (controle por app)
  - Aplicativos (padrões, permissões)
  - Personalização (tema, cores, cursor)
  - Sistema (versão, atualizações)
  - Armazenamento (uso, limpeza)
  - Privacidade (dados, telemetria)
- ✅ Toggle switches animados
- ✅ Persistência de configurações
- ✅ UI responsiva e acessível

### Apps (`js/apps/`) - Aplicativos Avançados

#### Steam App (Game Hub)
- ✅ Interface idêntica à Steam original
- ✅ 5 abas principais:
  - **Biblioteca**: Lista completa de jogos com filtros
  - **Loja**: Destaques e recomendações
  - **Comunidade**: Grupos e atividades
  - **Perfil**: Estatísticas e conquistas
  - **Configurações**: Opções do cliente
- ✅ Sistema de instalação simulada
- ✅ Filtros: Todos, Instalados, Recentes
- ✅ Pesquisa em tempo real
- ✅ Modo grid e lista
- ✅ Cards de jogos com hover effects
- ✅ Botões de Jogar/Instalar dinâmicos
- ✅ Perfil com estatísticas (nível, tempo jogado)
- ✅ Conquistas e badges
- ✅ Persistência de jogos instalados
- ✅ Lançamento de jogos em janelas iframe

#### Discord App (GitHub Integration)
- ✅ Interface inspirada no Discord
- ✅ Servidores baseados em repositórios GitHub
- ✅ Integração segura com API pública do GitHub
- ✅ Canais temáticos:
  - #geral - Conversas gerais
  - #atualizações - Novidades do projeto
  - #github-info - Dados de repositórios em tempo real
  - #aleatório - Conversas livres
- ✅ Cards informativos de repositórios:
  - Stars, Forks, Linguagem
  - Descrição e última atualização
  - Link direto para o repositório
- ✅ Sistema de mensagens local
- ✅ Adicionar servidores customizados
- ✅ Avatares e timestamps
- ✅ Input de mensagens com envio
- ✅ Design fiel ao Discord original

#### Explorer Plus (Explorador Avançado)
- ✅ Interface premium moderna
- ✅ Navegação histórica (voltar/avançar/subir)
- ✅ Path bar clicável interativo
- ✅ Múltiplos modos de visualização:
  - Grid (ícones grandes)
  - Lista (detalhes completos)
- ✅ Sistema de ordenação:
  - Por nome, data, tamanho
  - Ordem ascendente/descendente
- ✅ Pesquisa em tempo real
- ✅ Seleção múltipla (Ctrl+Click)
- ✅ Menu contextual completo:
  - Abrir, Recortar, Copiar
  - Renomear, Excluir
  - Propriedades
- ✅ Drag and drop support
- ✅ Status bar detalhada
- ✅ Ícones por extensão de arquivo
- ✅ Preview de metadados

#### VessieAI Training (IA Treinável)
- ✅ Sistema de treinamento de frases
- ✅ Adicionar padrões e respostas customizadas
- ✅ Gerenciar vocabulário treinado
- ✅ Exportar/Importar dados de treino
- ✅ Integração com API Anthropic (opcional)
- ✅ Respostas rápidas offline
- ✅ Personalidade fofa e carismática
- ✅ Histórico de conversas

## 🎮 Game Hub - Biblioteca de Jogos

**150+ Jogos Disponíveis:**
- Minecraft, Subway Surfers, Among Us
- Friday Night Funkin', Hollow Knight
- Crash Bandicoot série completa
- FIFA, Tekken 3, Tomb Raider
- Drift Hunters, 1v1 LOL
- E muito mais!

**Recursos do Game Hub:**
- Launcher estilo Steam
- Screenshots e ícones
- Categorização automática
- Favoritos e recentes
- Tempo de jogo rastreado

## 🎨 Recursos Visuais Avançados

- **Design Híbrido Premium**: Windows 11 + macOS + Steam OS
- **Glassmorphism**: Efeitos Mica/Acrylic com backdrop-filter
- **Animações Fluent**: Transições 60fps com easing curves
- **Temas Customizáveis**: Claro, Escuro, Auto
- **Wallpapers Dinâmicos**: Galeria com 7+ opções 4K
- **Cursor Personalizável**: Tamanhos e estilos
- **Ícones Temáticos**: Pacotes visuais coesos

## 🛠️ Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| HTML5 | Latest | Estrutura semântica |
| CSS3 | Latest | Variáveis, Grid, Flexbox, Animations |
| JavaScript | ES2023 | Módulos, Async/Await, Classes |
| Font Awesome | 6.5.0 | Ícones vetoriais |
| Google Fonts | Latest | Inter, JetBrains Mono |

## 📋 Funcionalidades Completas

### Sistema Operacional
- ✅ Boot animation personalizada
- ✅ Tela de termos e login seguro
- ✅ Desktop com ícones organizados
- ✅ Taskbar funcional com clock
- ✅ Menu Iniciar com busca
- ✅ Central de notificações
- ✅ Quick toggles (Wi-Fi, Bluetooth, etc.)
- ✅ Sistema de janelas completo
- ✅ Menu de contexto direito
- ✅ Snap layouts (em desenvolvimento)

### Aplicativos Nativos
- ✅ Explorador de Arquivos (2 versões)
- ✅ Configurações do Sistema
- ✅ Terminal/Console
- ✅ Bloco de Notas
- ✅ Calculadora
- ✅ Player de Música
- ✅ Câmera (simulado)
- ✅ Editor de Texto
- ✅ Navegador Web
- ✅ Dashboard de Sistema

### Aplicativos Avançados
- ✅ Steam (Game Hub)
- ✅ Discord (GitHub Integration)
- ✅ VessieAI (IA com treinamento)
- ✅ Nvidia Control Panel (simulado)
- ✅ Educação (apps educativos)
- ✅ Automação (scripts)

## 🔒 Segurança e Privacidade

- API Key opcional para VessieAI (Anthropic)
- Dados armazenados localmente (localStorage)
- Sem coleta de dados externos
- GitHub API usada de forma segura e pública
- Sanitização de input contra XSS

## 📦 Persistência de Dados

O VessieOS salva automaticamente:
- Sistema de arquivos completo
- Wallpapers e temas
- Configurações do sistema
- Jogos instalados (Steam)
- Histórico da VessieAI
- Frases treinadas da IA
- Preferências de usuário

## 🚀 Como Usar os Novos Apps

```javascript
// Abrir Steam
SteamApp.createWindow();

// Abrir Discord
DiscordApp.createWindow();

// Abrir Explorer Plus
ExplorerPlus.createWindow('Desktop');

// Treinar VessieAI
window.openVessieTraining();

// Adicionar frase manualmente
VessieAITraining.addPhrase();
```

## 🔄 Próximas Atualizações (Roadmap)

- [ ] Multi-usuário com perfis
- [ ] Loja de aplicativos
- [ ] Terminal com comandos reais
- [ ] Integração cloud storage
- [ ] Widgets na área de trabalho
- [ ] Modo tablet otimizado
- [ ] Suporte a PWA offline
- [ ] Temas da comunidade

## 🌟 Diferenciais VessieOS v3.0

1. **Arquitetura 100% Modular**: Separação clara entre core, systems e apps
2. **Steam Realista**: Interface fiel ao cliente desktop
3. **Discord + GitHub**: Integração única e inovadora
4. **Explorer Plus**: Recursos profissionais de gerenciamento
5. **VessieAI Treinável**: Personalize sua IA
6. **Performance Otimizada**: Carregamento lazy de módulos
7. **Documentação Completa**: Código comentado e README detalhado

---

<div align="center">

## VessieOS v3.0.0

**Feito com 💜 por Vessie**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)]()
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()

*"Um sistema feito com amor, uma coxinha e muita determinação!"*

</div>
