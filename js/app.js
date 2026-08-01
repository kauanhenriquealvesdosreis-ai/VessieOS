(function(){"use strict";

const CORRECT_PASSWORD = 'EO123';
let GAMES = [];

const EXTRA_STYLE=document.createElement('style');
EXTRA_STYLE.textContent=`
  #eg.horror{display:flex!important;flex-direction:column;justify-content:center;align-items:center;background:radial-gradient(circle at center,#000 0%,#040404 40%,#000 100%);color:#fff;text-shadow:0 0 18px rgba(255,255,255,.35);font-family:Segoe UI,Arial,sans-serif;z-index:9999}
  #eg.horror .horror-title{font-size:2.15rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
  #eg.horror .horror-sub{font-size:1rem;color:#ff6b6b;margin-top:8px}
  .di img{width:100%;height:100%;object-fit:cover;border-radius:14px}
  .di[data-sz="small"]{width:74px;padding:6px 4px}
  .di[data-sz="small"] .ic{width:44px;height:44px;border-radius:12px}
  .di[data-sz="large"]{width:120px;padding:14px 8px}
  .di[data-sz="large"] .ic{width:82px;height:82px;border-radius:18px}
  .wall-tab{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;border:1px solid var(--border);background:rgba(255,255,255,.06);color:var(--dim);cursor:pointer;margin-right:8px;margin-bottom:8px}
  .wall-tab.active{background:rgba(96,165,250,.18);color:white;border-color:rgba(96,165,250,.35)}
  .wg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
  .wt{display:flex;flex-direction:column;gap:8px;padding:8px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);cursor:pointer;transition:transform .16s var(--ease),background .16s var(--ease),border-color .16s var(--ease)}
  .wt:hover{transform:translateY(-2px);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16)}
  .wt-preview{height:92px;border-radius:10px;background-size:cover;background-position:center;border:1px solid rgba(255,255,255,.08)}
  .wt-name{font-size:.74rem;color:var(--text-2);text-align:center;line-height:1.25}
  .wt.ac{border-color:var(--a);box-shadow:0 0 0 2px var(--acc-glow)}
  .wt.ac .wt-name{color:white;font-weight:600}
  .vc-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;margin-top:10px}
  .mc-tracklist{margin-top:14px;display:grid;gap:8px;max-height:140px;overflow:auto}
  .mc-track{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center;cursor:pointer;color:var(--dim)}
  .mc-track.active{background:rgba(96,165,250,.2);color:white}
`;
document.head.appendChild(EXTRA_STYLE);

const S={
  user:'Avançado',
  apiKey:'',
  wallpaper:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
  desktopIconSize:'medium',
  cursorSize:1,
  wallpapers:[],
  wins:[],
  nextZ:100,
  unlocked:true,
  chatHistory:[],
  volume:70,
  darkMode:true,
  sounds:true,
  vocabulary:[],
  gameTemplates:[],
  iconScale:1,
  notifications:[],
  fs:{
    Desktop:{},
    Documentos:{'Bem-vindo.txt':'Olá! Bem-vindo ao VessieOS 💜\n\nEste é seu espaço pessoal.','Leia-me.txt':'VessieOS v3.0\n\nFeatures:\n• IA Vessie integrada\n• Dashboard completo\n• Game Hub com '+GAMES.length+' jogos\n• Terminal\n• Bloco de notas\n• Calculadora\n• Explorador de arquivos\n• Player de música'},
    Downloads:{},
    Imagens:{'foto1.png':null,'foto2.png':null},
    Videos:{},
    Sistema:{'Windows':{'System32':{},'WinSxS':{}},'Usuários':{}}
  },
  currentPath:'Desktop',
  selectedFiles:[],
  taskbarWindows:[],
  musPlaying:false,
  musTrack:0,
  musProg:0,
  musTimer:null
};

// WALLPAPERS PRÉ-DEFINIDOS
// ======================
// Para adicionar novos wallpapers, insira uma nova linha com este formato:
// {n:'Nome do Wallpaper', u:'URL da imagem', c:'Categoria'}
// 
// Categorias disponíveis: 'Natureza', 'Tech', 'Futurista'
// URL: Use links diretos de imagens (JPG, PNG, WEBP)
// 
// Exemplo:
// {n:'Meu Wallpaper',u:'https://exemplo.com/imagem.jpg',c:'Natureza'}
//
// TODOS os wallpapers abaixo aparecem PERMANENTEMENTE na tela de configurações
// Você também pode adicionar URLs personalizadas pela interface em tempo real
const WALLS=[
  {n:'StelleFly Honkai',u:'https://4kwallpapers.com/images/walls/thumbs_2t/26880.jpg',c:'StelleFly Honkai'},
  {n:'Solo Leveling',u:'https://4kwallpapers.com/images/walls/thumbs_2t/26864.jpg',c:'Solo Leveling'},
  {n:'Godzilla Minus Zero 2026',u:'https://4kwallpapers.com/images/walls/thumbs_2t/26852.jpg',c:'Godzilla Minus Zero 2026'},
  {n:'BMW S 1000',u:'https://4kwallpapers.com/images/walls/thumbs_2t/26835.jpg',c:'BMW S 1000'},
  {n:'Grand Theft Auto VI Ultimate Edition',u:'https://4kwallpapers.com/images/walls/thumbs_2t/26757.jpg',c:'Grand Theft Auto VI Ultimate Edition'},
  {n:'Neon-Share',u:'https://i.giphy.com/KWcGnX2iz0G1fMMHrO.webp',c:'Neon-Share'},
  {n:'Cyberpunk 2077',u:'https://4kwallpapers.com/images/walls/thumbs_2t/26756.jpg',c:'Cyberpunk 2077'}
];

function ensureWallpapers(list){
  const source=Array.isArray(list)&&list.length?list:WALLS.map(w=>({...w}));
  return source.filter(w=>w&&w.u).map(w=>({n:w.n||'Wallpaper',u:w.u}));
}

function persistState(){
  try{
    localStorage.setItem('vessieos_state', JSON.stringify({
      fs:S.fs,
      wallpaper:S.wallpaper,
      desktopIconSize:S.desktopIconSize,
      cursorSize:S.cursorSize,
      wallpapers:ensureWallpapers(S.wallpapers||[]),
      sounds:S.sounds,
      vocabulary:S.vocabulary||[],
      gameTemplates:S.gameTemplates||[],
      iconScale:S.iconScale||1,
      chatHistory:S.chatHistory||[],
      iconImageUrl:S.iconImageUrl||''
    }));
  }catch(e){}
}

function restoreState(){
  try{
    const raw=localStorage.getItem('vessieos_state');
    if(!raw)return;
    const data=JSON.parse(raw);
    if(data.fs) S.fs=data.fs;
    if(data.wallpaper) S.wallpaper=data.wallpaper;
    if(data.desktopIconSize) S.desktopIconSize=data.desktopIconSize;
    if(data.cursorSize) S.cursorSize=data.cursorSize;
    if(typeof data.sounds==='boolean') S.sounds=data.sounds;
    if(typeof data.iconScale==='number') S.iconScale=data.iconScale;
    if(Array.isArray(data.wallpapers)) S.wallpapers=ensureWallpapers(data.wallpapers);
    if(Array.isArray(data.vocabulary)) S.vocabulary=data.vocabulary;
    if(Array.isArray(data.gameTemplates)) S.gameTemplates=data.gameTemplates;
    if(Array.isArray(data.chatHistory)) S.chatHistory=data.chatHistory;
    if(typeof data.iconImageUrl==='string') S.iconImageUrl=data.iconImageUrl;
  }catch(e){}
  S.wallpapers=ensureWallpapers(S.wallpapers||[]);
  if(!S.wallpapers.length){
    S.wallpapers=WALLS.map(w=>({...w}));
  }
  if(!Array.isArray(S.vocabulary)) S.vocabulary=[];
  if(!Array.isArray(S.gameTemplates)) S.gameTemplates=[];
}
restoreState();

function normalizeText(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}

function normalizeGameName(value){
  return normalizeText(value).replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}

function dedupeGames(list){
  const seen=new Set();
  const out=[];
  for(const game of list||[]){
    const key=`${normalizeGameName(game?.name)}|${normalizeGameName(game?.url)}`;
    if(seen.has(key)) continue;
    seen.add(key);
    out.push(game);
  }
  return out;
}

function buildVessiePhrases(){
  // FRASES NATURAIS DA VESSIE - Personalize aqui!
  // Adicione mais respostas para diferentes contextos
  const responses={
    'help|ajuda|socorro|sos':['Claro, estou aqui! 💜 O que você precisa?','Como posso ajudar você hoje?','Estou pronta! Qual é sua dúvida?'],
    'oi|olá|hey':['Oi! 💜 Tudo bem com você?','Olá! Bem-vindo! ✨','E aí! Como vai?'],
    'wallpaper|papel|fundo':['Posso aplicar wallpapers novos e alternar entre categorias como Natureza, Tech e Futurista.','Quer personalizar seu fundo? Tenho várias opções legais!'],
    'jogo|game|play':['Amei! Temos vários jogos legais disponíveis. Qual você quer jogar?','Gostaria de jogar algo? Temos Minecraft, 1v1 LOL e mais!'],
    'música|music|som':['Quer ouvir uma música? Temos um player completo para você!','Posso tocar músicas para você! 🎵'],
    'arquivo|salvar|export':['Posso salvar seus dados em arquivo para você usar depois!','Quer exportar seus dados? Faço isso para você!'],
    'obrigado|thanks|vlw':['De nada! Sempre feliz em ajudar 💜','Fico feliz em poder ajudar!','Qualquer coisa, estou por aqui!'],
    'legal|top|show':['Fico feliz que tenha gostado! ✨','Que legal! Quer descobrir mais funcionalidades?'],
  };
  return responses;
}

const VESSIE_RESPONSES=buildVessiePhrases();

function getVessieResponse(msg){
  const lower=normalizeText(msg||'');
  for(const [keys,responses] of Object.entries(VESSIE_RESPONSES||{})){
    const keyList=keys.split('|');
    if(keyList.some(k=>lower.includes(k))){
      return responses[Math.floor(Math.random()*responses.length)];
    }
  }
  return pickVessiePhrase();
}

function pickVessiePhrase(){
  const generic=[
    '💜 Estou pronta para ajudar com o que vier!',
    '✨ Que interessante!',
    '🌟 Entendi!',
    '💜 Legal! Gosto dessa ideia.',
    '⚡ Pode deixar comigo!'
  ];
  return generic[Math.floor(Math.random()*generic.length)];
}

function applyDesktopIconSize(size){
  S.desktopIconSize=size;
  persistState();
  renderDesktop();
  toast('Tamanho dos ícones atualizado ✨','success');
}

function applyIconImage(url){
  if(!url)return;
  S.iconImageUrl=url;
  persistState();
  renderDesktop();
  toast('Ícone personalizado aplicado 🖼️','success');
}

window.exportVessieData=function(){
  const payload={
    vocabulary:S.vocabulary||[],
    gameTemplates:S.gameTemplates||[],
    wallpapers:S.wallpapers||[],
    wall:S.wallpaper,
    theme:localStorage.getItem('vos-theme')||''
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='vessieos-export.json';
  a.click();
  toast('Arquivo exportado com sucesso 📦','success');
};

window.importVessieData=function(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(Array.isArray(data.vocabulary)) S.vocabulary=data.vocabulary;
      if(Array.isArray(data.gameTemplates)) S.gameTemplates=data.gameTemplates;
      if(Array.isArray(data.wallpapers)) S.wallpapers=data.wallpapers;
      if(data.wall) S.wallpaper=data.wall;
      if(data.theme) localStorage.setItem('vos-theme',data.theme);
      persistState();
      renderDesktop();
      toast('Importação concluída ✅','success');
    }catch(e){toast('Arquivo inválido para importação','error');}
  };
  reader.readAsText(file);
};

// Função de treinamento da VessieAI - Implementação corrigida
window.openVessieTraining = function() {
  const trainingWin = WindowManager.create({
    title: 'Treinar VessieAI',
    content: `
      <div style="padding:20px;color:var(--text);font-family:'Inter',sans-serif;">
        <h3 style="margin-bottom:16px;color:var(--a);">🧠 Treinamento da VessieAI</h3>
        <p style="color:var(--dim);margin-bottom:20px;">Adicione frases e respostas personalizadas para a Vessie!</p>
        
        <div style="margin-bottom:16px;">
          <label style="display:block;margin-bottom:8px;font-size:0.85rem;color:var(--text-2);">Frase/Padrão:</label>
          <input type="text" id="train-pattern" placeholder="Ex: bom dia, olá, oi..." 
                 style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:var(--text);">
        </div>
        
        <div style="margin-bottom:16px;">
          <label style="display:block;margin-bottom:8px;font-size:0.85rem;color:var(--text-2);">Resposta da Vessie:</label>
          <textarea id="train-response" placeholder="Ex: Bom dia, lindeza! 💜 Que seu dia seja maravilhoso!" 
                    rows="3" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:var(--text);resize:vertical;"></textarea>
        </div>
        
        <button onclick="VessieAITraining.addPhrase()" 
                style="background:linear-gradient(135deg,var(--a),var(--a2));border:none;color:white;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;width:100%;">
          <i class="fas fa-plus"></i> Adicionar Frase
        </button>
        
        <div style="margin-top:24px;">
          <h4 style="margin-bottom:12px;font-size:0.9rem;color:var(--text-2);">Frases Treinadas (${(S.vocabulary||[]).length})</h4>
          <div id="trained-phrases-list" style="max-height:200px;overflow-y:auto;">
            ${(S.vocabulary||[]).map((item, i) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:8px;">
                <div>
                  <div style="font-size:0.85rem;color:var(--a);">${item.pattern}</div>
                  <div style="font-size:0.75rem;color:var(--dim);">${item.response.substring(0, 50)}...</div>
                </div>
                <button onclick="VessieAITraining.removePhrase(${i})" 
                        style="background:rgba(239,68,68,0.2);border:none;color:#ef4444;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:0.75rem;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `).join('') || '<div style="color:var(--dim);font-size:0.85rem;">Nenhuma frase treinada ainda.</div>'}
          </div>
        </div>
        
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.05);">
          <button onclick="VessieAITraining.exportData()" 
                  style="background:rgba(255,255,255,0.1);border:none;color:var(--text);padding:10px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;margin-right:8px;">
            <i class="fas fa-download"></i> Exportar
          </button>
          <button onclick="document.getElementById('train-import-file').click()" 
                  style="background:rgba(255,255,255,0.1);border:none;color:var(--text);padding:10px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;">
            <i class="fas fa-upload"></i> Importar
          </button>
          <input type="file" id="train-import-file" accept=".json" style="display:none;" onchange="VessieAITraining.importData(this)">
        </div>
      </div>
    `,
    width: 500,
    height: 600
  });
};

// Módulo de treinamento da VessieAI
window.VessieAITraining = {
  addPhrase: function() {
    const patternInput = document.getElementById('train-pattern');
    const responseInput = document.getElementById('train-response');
    
    if (!patternInput || !responseInput) return;
    
    const pattern = patternInput.value.trim().toLowerCase();
    const response = responseInput.value.trim();
    
    if (!pattern || !response) {
      toast('Preencha todos os campos!', 'error');
      return;
    }
    
    if (!S.vocabulary) S.vocabulary = [];
    
    S.vocabulary.push({ pattern, response });
    persistState();
    
    patternInput.value = '';
    responseInput.value = '';
    
    toast('Frase adicionada com sucesso! 💜', 'success');
    
    // Atualizar lista
    const listEl = document.getElementById('trained-phrases-list');
    if (listEl) {
      listEl.innerHTML = S.vocabulary.map((item, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:8px;">
          <div>
            <div style="font-size:0.85rem;color:var(--a);">${item.pattern}</div>
            <div style="font-size:0.75rem;color:var(--dim);">${item.response.substring(0, 50)}...</div>
          </div>
          <button onclick="VessieAITraining.removePhrase(${i})" 
                  style="background:rgba(239,68,68,0.2);border:none;color:#ef4444;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:0.75rem;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('') || '<div style="color:var(--dim);font-size:0.85rem;">Nenhuma frase treinada ainda.</div>';
    }
  },
  
  removePhrase: function(index) {
    if (S.vocabulary && S.vocabulary[index]) {
      S.vocabulary.splice(index, 1);
      persistState();
      toast('Frase removida!', 'default');
      
      // Atualizar lista
      const listEl = document.getElementById('trained-phrases-list');
      if (listEl) {
        listEl.innerHTML = S.vocabulary.map((item, i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:8px;">
            <div>
              <div style="font-size:0.85rem;color:var(--a);">${item.pattern}</div>
              <div style="font-size:0.75rem;color:var(--dim);">${item.response.substring(0, 50)}...</div>
            </div>
            <button onclick="VessieAITraining.removePhrase(${i})" 
                    style="background:rgba(239,68,68,0.2);border:none;color:#ef4444;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:0.75rem;">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `).join('') || '<div style="color:var(--dim);font-size:0.85rem;">Nenhuma frase treinada ainda.</div>';
      }
    }
  },
  
  exportData: function() {
    const data = { vocabulary: S.vocabulary || [] };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vessie-training.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Dados exportados! 📦', 'success');
  },
  
  importData: function(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.vocabulary && Array.isArray(data.vocabulary)) {
          S.vocabulary = [...(S.vocabulary || []), ...data.vocabulary];
          persistState();
          toast('Dados importados com sucesso! ✅', 'success');
          
          // Recarregar janela se existir
          const listEl = document.getElementById('trained-phrases-list');
          if (listEl) {
            listEl.innerHTML = S.vocabulary.map((item, i) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:8px;">
                <div>
                  <div style="font-size:0.85rem;color:var(--a);">${item.pattern}</div>
                  <div style="font-size:0.75rem;color:var(--dim);">${item.response.substring(0, 50)}...</div>
                </div>
                <button onclick="VessieAITraining.removePhrase(${i})" 
                        style="background:rgba(239,68,68,0.2);border:none;color:#ef4444;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:0.75rem;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `).join('');
          }
        }
      } catch (err) {
        toast('Erro ao importar arquivo!', 'error');
      }
    };
    reader.readAsText(file);
  }
};

let soundCtx=null;
function getSoundContext(){
  if(!soundCtx){
    soundCtx=new (window.AudioContext||window.webkitAudioContext)();
  }
  if(soundCtx.state==='suspended') soundCtx.resume();
  return soundCtx;
}

function playSound(kind='notify'){
  if(!S.sounds) return;
  try{
    const ctx=getSoundContext();
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    const map={boot:[440,660],notify:[523,784],open:[659,880],error:[220,180],window:[392,523]};
    const [f1,f2]=map[kind]||map.notify;
    osc.type='sine';
    osc.frequency.setValueAtTime(f1,ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f2,ctx.currentTime+0.16);
    gain.gain.setValueAtTime(0.0001,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.03,ctx.currentTime+0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.2);
    osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+0.22);
  }catch(e){}
}

GAMES=[ 
  {n:'Village Craft',u:'https://1v1-lol.gitlab.io/go/class-389.html',ic:'https://jamestore214.github.io/img/class-389.png'},
  {n:'Shady Bears',u:'https://1v1-lol.gitlab.io/go/class-379.html',ic:'https://jamestore214.github.io/img/class-379.png'},
  {n:'Bitlife',u:'https://1v1-lol.gitlab.io/go/class-441.html',ic:'https://jamestore214.github.io/img/class-441.png'},
  {n:'Moto X3m Pool Party',u:'https://1v1-lol.gitlab.io/go/class-462.html',ic:'https://jamestore214.github.io/img/class-462.png'},
  {n:'Minecraft',u:'https://play1.mc.js.cool/1.8',ic:'https://www.rw-designer.com/icon-image/5547-256x256x32.png'},
  {n:'Parking Fury 3D: Night Thief',u:'https://1v1-lol.gitlab.io/go/class-725.html',ic:'https://jamestore214.github.io/img/class-725.png'},
  {n:'Idle Startup Tycoon',u:'https://1v1-lol.gitlab.io/go/class-778.html',ic:'https://jamestore214.github.io/img/class-778.png'},
  {n:'Exemple',u:'Exemple',ic:'Exemple'},
  {n:'Rocket Soccer Derby',u:'https://1v1-lol.gitlab.io/go/class-527.html',ic:'https://jamestore214.github.io/img/class-527.png'},
  {n:'IZOWAVE',u:'https://1v1-lol.gitlab.io/go/class-325.html',ic:'https://jamestore214.github.io/img/class-325.png'},
  {n:'Rock Paper Clicker',u:'https://1v1-lol.gitlab.io/go/class-1127.html',ic:'https://jamestore214.github.io/img/class-1127.png'},
  {n:'Tiger Simulator 3d',u:'https://1v1-lol.gitlab.io/go/class-587.html',ic:'https://jamestore214.github.io/img/class-587.png'},
  {n:'Crazy Taxi',u:'https://snowriderio.io/crazy-taxi',ic:'https://snowriderio.io/cache/data/image/game/crazy-taxi-1-h220x220.webp'},
  {n:'Az Games',u:'https://azgames.io/',ic:'https://azgames.io/favicon.ico'},
  {n:'Bacon May Die',u:'https://1v1-lol.gitlab.io/go/class-334.html',ic:'https://jamestore214.github.io/img/class-334.png'},
  {n:'Jetski Race',u:'https://snowriderio.io/jetski-race',ic:'https://snowriderio.io/cache/data/image/game/jetski-race-h220x220.webp'},
  {n:'Blue Hedgehog Hill Dash Ride',u:'https://snowriderio.io/blue-hedgehog-hill-dash-ride',ic:'https://snowriderio.io/cache/data/image/game/blue-hedgehog-hill-dash-ride-h220x220.webp'},
  {n:'1v1 LOL',u:'https://1v1-lol.gitlab.io/',ic:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3HlcPjxDtFoPAY6TcOGPk1H2Qb8l0trXLzQ&s'},
  {n:'Friday Night Funkin',u:'https://fnf-2.io/',ic:'https://art.ngfiles.com/images/1674000/1674368_bozubrain_fnf-icons-free-to-use.png?f1614903474'},
  {n:'Veck IO',u:'https://hollowknight.io/veck-io',ic:'https://escaperoadcity.org/cache/data/image/game/veck-io-avt-m150x150.jpg'},
  {n:'Escape Road',u:'https://snowroad.io/escape-road-2',ic:'https://snowroad.io/cache/data/image/game/escape-road-game-f200x200.webp'},
  {n:'Curve Rush',u:'https://snowroad.io/curve-rush',ic:'https://snowroad.io/cache/data/image/game/curve-rush-2-1-f200x200.webp'},
  {n:'Drift Hunters',u:'https://escaperoadcity.org/drift-hunters-max',ic:'https://escaperoadcity.org/cache/data/image/game/drift-hunters-max-cover-m150x150.png'},
  {n:'Subway Surfers',u:'https://1v1-lol.gitlab.io/go/class-444.html',ic:'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=40,height=40,fit=cover,f=auto/fc09ae107e5bbe1531e5d87d216b09f8/subway-surfers.png'},
  {n:'Dude Theft AUTO',u:'https://escaperoadcity.org/dude-theft-auto',ic:'https://escaperoadcity.org/cache/data/image/game/dude-theft-auto-avt-m54x54.jpg'},
  {n:'Drift Boss',u:'https://snowroad.io/drift-boss',ic:'https://snowroad.io/cache/data/image/game/drift-boss-f200x200.webp'},
  {n:'Crossy Road',u:'https://snowroad.io/crossy-road',ic:'https://snowroad.io/cache/data/image/game/crossy-road-unblocked-f200x200.webp'},
  {n:'Stickman Slash',u:'https://snowroad.io/stickman-slash',ic:'https://snowroad.io/cache/data/image/game/stickman-slash-sn-f200x200.webp'},
  {n:'Snow Road',u:'https://snowroad.io/',ic:'https://snowroad.io/cache/data/image/game/snow-road-game-1-f200x200.webp'},
  {n:'Dead Strike',u:'https://escaperoadcity.org/dead-strike',ic:'https://escaperoadcity.org/cache/data/image/game/dead-strike-avt-m150x150.jpg'},
  {n:'Kart Bros IO',u:'https://escaperoadcity.org/kart-bros-io',ic:'https://escaperoadcity.org/cache/data/image/game/kart-bros-io-avt-e-m150x150.jpg'},
  {n:'Undead Invasion',u:'https://escaperoadcity.org/undead-invasion',ic:'https://escaperoadcity.org/cache/data/image/game/undead-invasion-avt-m150x150.jpg'},
  {n:'Orbit Kick',u:'https://escaperoadcity.org/orbit-kick',ic:'https://escaperoadcity.org/cache/data/image/game/orbit-kick-1-m54x54.png'},
  {n:'GT Cars Racing',u:'https://escaperoadcity.org/gt-cars-city-racing',ic:'https://escaperoadcity.org/cache/data/image/game/gt-cars-city-racing-cover-m54x54.png'},
  {n:'Sling Drift',u:'https://escaperoadcity.org/sling-drift',ic:'https://escaperoadcity.org/cache/data/image/game/sling-drift-cover-m54x54.png'},
  {n:'Jelly Runner',u:'https://escaperoadcity.org/jelly-runner',ic:'https://escaperoadcity.org/cache/data/image/game/jelly-runner-avt-m150x150.jpg'},
  {n:'Rebound Shooter',u:'https://escaperoadcity.org/rebound-shooter',ic:'https://escaperoadcity.org/cache/data/image/game/rebound-shooter-avt-m150x150.jpg'},
  {n:'Retro Rush',u:'https://snowroad.io/retro-rush',ic:'https://snowroad.io/cache/data/image/game/retro-rush-1-f200x200.webp'},
  {n:'2v2 IO',u:'https://2v2.io/',ic:'https://brain-lines.io/cache/data/image/game/2v2io-b1-f240x240.webp'},
  {n:'Car Destruction King',u:'https://snowriderio.io/car-destruction-king',ic:'https://snowriderio.io/cache/data/image/game/car-destruction-king-h220x220.webp'},
  {n:'Tsunami Race',u:'https://snowriderio.io/tsunami-race',ic:'https://snowriderio.io/cache/data/image/game/tsunami-race-h220x220.webp'},
  {n:'Rob Brainrot 2',u:'https://snowriderio.io/cache/data/image/game/rob-brainrot-2-h220x220.webp',ic:'https://snowriderio.io/cache/data/image/game/rob-brainrot-2-h220x220.webp'},
  {n:'Crossy Road',u:'https://snowriderio.io/crossy-road',ic:'https://snowriderio.io/cache/data/image/game/crossy-road-h220x220.webp'},
  {n:'Snowy Roads',u:'https://snowriderio.io/truck-driver-snowy-roads',ic:'https://snowriderio.io/cache/data/image/game/snowy-roads-h220x220.webp'},
  {n:'Climb Hero',u:'https://snowriderio.io/climb-hero',ic:'https://snowriderio.io/cache/data/image/game/climb-hero-1-h220x220.webp'},
  {n:'Demolition Derby',u:'https://snowriderio.io/demolition-derby',ic:'https://snowriderio.io/cache/data/image/game/demolition-derby-h220x220.webp'},
  {n:'Slalom Ski Simulator',u:'https://snowriderio.io/slalom-ski-simulator',ic:'https://snowriderio.io/cache/data/image/game/slalom-ski-simulator-h220x220.webp'},
  {n:'Golf Orbit',u:'https://snowriderio.io/golf-orbit',ic:'https://snowriderio.io/cache/data/image/game/golf-orbit-h220x220.webp'},
  {n:'Fireboy and Watergirl',u:'https://snowriderio.io/fireboy-and-watergirl',ic:'https://snowriderio.io/cache/data/image/game/fireboy-and-watergirl-h220x220.webp'},
  {n:'Astro Clicker',u:'https://snowroad.io/astro-robot-clicker',ic:'https://snowroad.io/cache/data/image/game/robotcl-f200x200.webp'},
  {n:'Traffic Light Simulator 3D',u:'https://snowriderio.io/traffic-light-simulator-3d',ic:'https://snowriderio.io/cache/data/image/game/traffic-light-simulator-3d-h220x220.webp'},
  {n:'Steal Brainrot Eggs',u:'https://snowriderio.io/steal-brainrot-eggs',ic:'https://snowriderio.io/cache/data/image/game/steal-brainrot-eggs-h220x220.webp'},
  {n:'Moto X3M',u:'https://snowriderio.io/moto-x3m-game',ic:'https://snowriderio.io/cache/data/image/game/moto-x3m-game-h220x220.webp'},
  {n:'Granny',u:'https://snowriderio.io/granny',ic:'https://snowriderio.io/cache/data/image/game/granny-h220x220.webp'},
  {n:'Space Waves',u:'https://snowriderio.io/space-waves',ic:'https://snowriderio.io/cache/data/image/game/space-waves-h220x220.webp'},
  {n:'SUV Snow Driving 3D',u:'https://snowriderio.io/suv-snow-driving-3d',ic:'https://snowriderio.io/cache/data/image/game/suv-snow-driving-3d-h220x220.webp'},
  {n:'Xlope',u:'https://snowriderio.io/xlope',ic:'https://snowriderio.io/cache/data/image/game/xlope-game-h220x220.webp'},
  {n:'99 Nights in the Forest',u:'https://snowriderio.io/99-nights-in-the-forest',ic:'https://snowriderio.io/cache/data/image/game/99-nights-in-the-forest-h220x220.webp'},
  {n:'Human Expenditure Program',u:'https://snowriderio.io/human-expenditure-program',ic:'https://snowriderio.io/cache/data/image/game/human-expenditure-program-h220x220.webp'},
  {n:'67 Clicker',u:'https://snowriderio.io/67-clicker',ic:'https://snowriderio.io/cache/data/image/game/67-clicker-h220x220.webp'},
  {n:'Madness Lab',u:'https://snowriderio.io/madness-lab',ic:'https://snowriderio.io/cache/data/image/game/madness-lab-h220x220.webp'},
  {n:'Swipe Ball',u:'https://snowriderio.io/swipe-ball',ic:'https://snowriderio.io/cache/data/image/game/swipe-ball-2-h220x220.webp'},
  {n:'Chase Rush',u:'https://snowriderio.io/chase-rush',ic:'https://snowriderio.io/cache/data/image/game/chase-rush-h220x220.webp'},
  {n:'Wheelie Master',u:'https://escaperoadcity.org/wheelie-master',ic:'https://escaperoadcity.org/cache/data/image/game/wheelie-master-avt-m54x54.jpg'},
  {n:'Stickman Empire',u:'https://snowriderio.io/stickman-empires',ic:'https://snowriderio.io/cache/data/image/game/stickman-empire-1-h220x220.webp'},
  {n:'Color Jump',u:'https://snowriderio.io/color-jump',ic:'https://snowriderio.io/cache/data/image/game/color-jump-h220x220.webp'},
  {n:'Plants vs. Brainrots',u:'https://snowriderio.io/plants-vs-brainrots',ic:'https://snowriderio.io/cache/data/image/game/plants-vs-brainrots-h220x220.webp'},
  {n:'Rocket Fortress',u:'https://snowriderio.io/rocket-fortress',ic:'https://snowriderio.io/cache/data/image/game/rocket-fortress.jpg1-h220x220.webp'},
  {n:'Mad Pursuit',u:'https://snowriderio.io/mad-pursuit',ic:'https://snowriderio.io/cache/data/image/game/mad-pursuit-2-h220x220.webp'},
  {n:'Super Bear Adventure 3',u:'https://snowriderio.io/super-bear-adventure-3',ic:'https://snowriderio.io/cache/data/image/game/super-bear-adventure-3-h220x220.webp'},
  {n:'Escape Road City',u:'https://escaperoadcity.org/escape-road-city',ic:'https://escaperoadcity.org/cache/data/image/game/escape-road-city-game-m54x54.jpg'},
  {n:'Traffic Road',u:'https://dashmetry.com/traffic-road',ic:'https://snowroad.io/cache/data/image/game/traffic-road-f200x200.webp'},
  {n:'Cobb Can Move',u:'https://snowroad.io/cobb-can-move',ic:'https://snowroad.io/cache/data/image/game/cobb-can-move-f200x200.webp'},
  {n:'Wurst Dash',u:'https://snowroad.io/wurst-dash',ic:'https://snowroad.io/cache/data/image/game/wurst-dash-f200x200.webp'},
  {n:'Tube Fight',u:'https://snowroad.io/tube-fight',ic:'https://snowroad.io/cache/data/image/game/tube-fight-g-f200x200.webp'},
  {n:'Pick Brainrot: 3D Battle',u:'https://snowriderio.io/pick-brainrot-3d-battle',ic:'https://snowriderio.io/cache/data/image/game/pick-brainrot-h220x220.webp'},
  {n:'Tap Brawl',u:'https://snowroad.io/tap-brawl',ic:'https://snowroad.io/cache/data/image/game/tap-brawl-sn1-f200x200.webp'},
  {n:'Curve Rush IO',u:'https://snowriderio.io/curve-rush-io',ic:'https://snowriderio.io/cache/data/image/game/curve-rush-io-h220x220.webp'},
  {n:'Hoop Legends',u:'https://snowriderio.io/hoop-legends',ic:'https://snowriderio.io/cache/data/image/game/hoop-legends-h220x220.webp'},
  {n:'Kickback Dash',u:'https://snowriderio.io/kickback-dash',ic:'https://snowriderio.io/cache/data/image/game/kickback-dash-h220x220.webp'},
  {n:'Buckshot Roulette',u:'https://game3.glov3.me/uploads/game/html5/26485/',ic:'https://buckshotroulette.com/data/image/game/buckshot-roulette-feature-image.jpg'},
  {n:'Ultrakill Prelude',u:'blob:https://1077352353-atari-embeds.googleusercontent.com/b2ea0f86-a8d8-4454-a5a5-e11a998ae78c',ic:'https://www.play-games.com/files/img/ultrakill-prelude-1766330796.jpg'},
  {n:'Go Kart Go Ultra',u:'https://1v1-lol.gitlab.io/go/class-604.html',ic:'https://jamestore214.github.io/img/class-604.png'},
  {n:'Car Drift Racers 2',u:'https://1v1-lol.gitlab.io/go/class-601.html',ic:'https://jamestore214.github.io/img/class-601.png'},
  {n:'Escape Raid',u:'https://snowriderio.io/escape-raid',ic:'https://snowriderio.io/cache/data/image/game/escape-raid-1-h220x220.webp'},
  {n:'hollow knight 2',u:'https://hollowknight.io/hollow-knight-2',ic:'https://hollowknight.io/cache/data/image/game/hollow-knight-2/hollow-knight-2-m150x150.webp'},
  {n:'Kindergarten',u:'https://hollowknight.io/kindergarten',ic:'https://hollowknight.io/cache/data/image/game/kindergarten/kindergarten-game-m150x150.webp'},
  {n:'Pizza Tower',u:'https://hollowknight.io/pizza-tower',ic:'https://hollowknight.io/cache/data/image/game/pizza-tower/pizza-tower-m150x150.webp'},
  {n:'Little Nightmares',u:'https://hollowknight.io/little-nightmares',ic:'https://hollowknight.io/cache/data/image/game/little-nightmares/little-nightmares-m150x150.webp'},
  {n:'Stick Fight',u:'https://hollowknight.io/stick-fight',ic:'https://hollowknight.io/cache/data/image/game/stick-fight/stick-fight-m150x150.webp'},
  {n:'Stick Fight',u:'https://hollowknight.io/stick-fight',ic:'https://hollowknight.io/cache/data/image/game/doki-doki-literature-club/doki-doki-literature-club-m150x150.webp'},
  {n:'2048',u:'https://1v1-lol.gitlab.io/go/class-452.html',ic:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/2048_logo.svg/330px-2048_logo.svg.png?_=20251209055949'},
  {n:'Pro Evolution Soccer 2',u:'https://classicgamezone.com/pt/games/pro-evolution-soccer-2',ic:'https://classicgamezone.com/games/covers/ps/pro-evolution-soccer-2.webp'},
  {n:'School Fury',u:'https://snowroad.io/school-fury',ic:'https://snowroad.io/cache/data/image/game/school-fury-sn-f200x200.webp'},
  {n:'Wave Rider',u:'https://snowroad.io/wave-rider',ic:'https://snowroad.io/cache/data/image/game/wave-rider-f200x200.webp'},
  {n:'Temple Run',u:'https://snowriderio.io/temple-run',ic:'https://snowriderio.io/cache/data/image/game/temple-run-h220x220.webp'},
  {n:'Ninja Obby Parkour',u:'https://snowriderio.io/ninja-obby-parkour',ic:'https://snowriderio.io/cache/data/image/game/ninja-obby-parkour-h220x220.webp'},
  {n:'Chicken Scream Race',u:'https://snowriderio.io/chicken-scream-race',ic:'https://snowriderio.io/cache/data/image/game/chicken-scream-race-h220x220.webp'},
  {n:'Build an Aquapark',u:'https://snowriderio.io/build-an-aquapark',ic:'https://snowriderio.io/cache/data/image/game/build-an-aquapark-1-h220x220.webp'},
  {n:'Drift Frenzy',u:'https://snowroad.io/drift-frenzy',ic:'https://snowroad.io/cache/data/image/game/drift-frenzy-f200x200.webp'},
  {n:'Snow Racer',u:'https://snowriderio.io/',ic:'https://snowriderio.io/cache/data/image/game/snow-rider-io-h220x220.webp'},
  {n:'Snow Racer 3D',u:'https://snowriderio.io/snow-rider-3d',ic:'https://snowriderio.io/cache/data/image/game/snow-rider-3d-h220x220.webp'},
  {n:'Drift Rush',u:'https://snowriderio.io/drift-rush',ic:'https://snowriderio.io/cache/data/image/game/drift-rush-h220x220.webp'},
  {n:'Cowboy Safari',u:'https://snowriderio.io/cowboy-safari',ic:'https://snowriderio.io/cache/data/image/game/cowboy-safari-h220x220.webp'},
  {n:'Dart Hero',u:'https://snowriderio.io/dart-hero',ic:'https://snowriderio.io/cache/data/image/game/dart-hero-h220x220.webp'},
  {n:'Flippy Race',u:'https://snowriderio.io/flippy-race',ic:'https://snowriderio.io/cache/data/image/game/flippy-race-h220x220.webp'},
  {n:'Wacky Flip',u:'https://snowriderio.io/wacky-flip',ic:'https://snowriderio.io/cache/data/image/game/wacky-flip-h220x220.webp'},
  {n:'Fish Quest',u:'https://snowriderio.io/fish-quest',ic:'https://snowriderio.io/cache/data/image/game/fish-quest-h220x220.webp'},
  {n:'Sorry Bob',u:'https://snowriderio.io/sorry-bob',ic:'https://snowriderio.io/cache/data/image/game/sorry-bob-h220x220.webp'},
  {n:'BloodMoney',u:'https://snowriderio.io/bloodmoney',ic:'https://snowriderio.io/cache/data/image/game/bloodmoney-h220x220.webp'},
  {n:'Red Rush',u:'https://snowriderio.io/red-rush',ic:'https://snowriderio.io/cache/data/image/game/red-rush-h220x220.webp'},
  {n:'Arcade Volley',u:'https://snowriderio.io/arcade-volley',ic:'https://snowriderio.io/cache/data/image/game/arcade-volley-h220x220.webp'},
  {n:'Fall Flat Battle',u:'https://snowriderio.io/fall-flat-battle',ic:'https://snowriderio.io/cache/data/image/game/fall-flat-battle-h220x220.webp'},
  {n:'Snowball Adventure',u:'https://snowriderio.io/snowball-adventure',ic:'https://snowriderio.io/cache/data/image/game/snowball-adventure-h220x220.webp'},
  {n:'Merge Rot',u:'https://snowriderio.io/merge-rot',ic:'https://snowriderio.io/cache/data/image/game/merge-rot-h220x220.webp'},
  {n:'Super Mario World',u:'https://classicgamezone.com/games/super-mario-world',ic:'https://classicgamezone.com/games/covers/snes/super-mario-world.webp'},
  {n:'Tralalero Tralala Clicker',u:'https://snowriderio.io/tralalero-tralala-clicker',ic:'https://snowriderio.io/cache/data/image/game/tralalero-tralala-clicker-h220x220.webp'},
  {n:'Flip Master',u:'https://snowriderio.io/flip-master',ic:'https://snowriderio.io/cache/data/image/game/flip-master-h220x220.webp'},
  {n:'Snow Racer Parkour',u:'https://snowriderio.io/snow-rider-obby-parkour',ic:'https://snowriderio.io/cache/data/image/game/snow-rider-obby-parkour-h220x220.webp'},
  {n:'Crazy Cars',u:'https://snowriderio.io/crazy-cars',ic:'https://snowriderio.io/cache/data/image/game/crazy-cars-1-h220x220.webp'},
  {n:'Snake.io',u:'https://snowriderio.io/snake-io',ic:'https://snowriderio.io/cache/data/image/game/snake.io-h220x220.webp'},
  {n:'Clash Crowd Game',u:'https://snowriderio.io/clash-crowd-game',ic:'https://snowriderio.io/cache/data/image/game/clash-crowd-game-h220x220.webp'},
  {n:'Golf Hit Game',u:'https://snowriderio.io/golf-hit',ic:'https://snowriderio.io/cache/data/image/game/golf-hit-game-h220x220.webp'},
  {n:'Golf Hit Game',u:'https://snowriderio.io/golf-hit',ic:'https://snowriderio.io/cache/data/image/game/golf-hit-game-h220x220.webp'},
  {n:'Tomb Raider II',u:'https://classicgamezone.com/pt/games/tomb-raider-2',ic:'https://classicgamezone.com/games/covers/ps/tomb-raider-2.webp'},
  {n:'Unity Play',u:'https://play.unity.com/pt',ic:'https://unity.com/pt/favicon.ico'},
  {n:'Xadres',u:'https://www.jogar-xadrez.com/jogar-contra-computador.html/',ic:'https://t4.ftcdn.net/jpg/19/72/75/71/240_F_1972757119_aFVzB4n1NFlCOxiQt7QmtuTMQ4Y1KVtB.jpg'},
  {n:'Tekken 3',u:'https://classicgamezone.com/pt/games/tekken-3',ic:'https://classicgamezone.com/games/covers/ps/tekken-3.webp'},
  {n:'Hollow Knight',u:'https://hollowknight.io/',ic:'https://hollowknight.io/cache/data/image/game/hollow-knight/hollow-knight-m200x200.webp'},
  {n:'FIFA 2000: Major League Soccer',u:'https://classicgamezone.com/pt/games/fifa-2000-major-league-soccer',ic:'https://classicgamezone.com/games/covers/ps/fifa-2000-major-league-soccer.webp'},
  {n:'Crash Bandicoot',u:'https://classicgamezone.com/pt/games/crash-bandicoot',ic:'https://classicgamezone.com/games/covers/ps/crash-bandicoot.webp'},
  {n:'Crash Bandicoot 2: Cortex Strikes Back',u:'https://classicgamezone.com/pt/games/crash-bandicoot-2-cortex-strikes-back',ic:'https://classicgamezone.com/games/covers/ps/crash-bandicoot-2-cortex-strikes-back.webp'},
  {n:'Crash Bandicoot 3',u:'https://classicgamezone.com/pt/games/crash-bandicoot-3-warped',ic:'https://classicgamezone.com/games/covers/ps/crash-bandicoot-3-warped.webp'},
  {n:'Fnaf Game',u:'https://fnafgame.io/',ic:'chrome://favicon2/?size=24&scaleFactor=1x&showFallbackMonogram=&pageUrl=https%3A%2F%2Ffnafgame.io%2F'},
  {n:'Crash Team Racing',u:'https://classicgamezone.com/pt/games/crash-team-racing',ic:'https://classicgamezone.com/games/covers/ps/crash-team-racing.webp'},
  {n:'Thumb Fighter',u:'https://1v1-lol.gitlab.io/go/class-644.html',ic:'https://jamestore214.github.io/img/class-644.png'},
  {n:'Horror Nights Story',u:'https://1v1-lol.gitlab.io/go/class-1023.html',ic:'https://jamestore214.github.io/img/class-1023.png'},
  {n:'Zombie Dying Survival Days',u:'https://1v1-lol.gitlab.io/go/class-1078.html',ic:'https://jamestore214.github.io/img/class-1078.png'},
  {n:'Gunspin',u:'https://1v1-lol.gitlab.io/go/class-533.html',ic:'https://jamestore214.github.io/img/class-533.png'},
  {n:'Basket Random',u:'https://1v1-lol.gitlab.io/go/class-436.html',ic:'https://jamestore214.github.io/img/class-436.png'}
];

const TRACKS=[
  {t:'Lofi Vibes',a:'VessieOS Radio',dur:214,src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
  {t:'Neon Dreams',a:'Synthwave Mix',dur:187,src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'},
  {t:'Chill Beats',a:'Study Playlist',dur:243,src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'},
  {t:'Pixel Heart',a:'8-bit Sounds',dur:156,src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'},
  {t:'Midnight City',a:'Ambient Radio',dur:298,src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'}
];

const APPS=[
  {id:'vessie',n:'Vessie IA',ic:'💜',cat:'ai'},
  {id:'dashboard',n:'Dashboard',ic:'📊',cat:'util'},
  {id:'edu',n:'Educação',ic:'📚',cat:'learn'},
  {id:'automation',n:'Automação',ic:'🤖',cat:'sys'},
  {id:'explorer',n:'Explorador',ic:'📁',cat:'sys'},
  {id:'chrome',n:'Chrome',ic:'🌐',cat:'util'},
  {id:'nvidia',n:'Nvidia APP',ic:'🖥️',cat:'sys'},
  {id:'games',n:'Steam',ic:'<i class="fab fa-steam" style="color:#66c0f4"></i>',cat:'game'},
  {id:'notepad',n:'Bloco de Notas',ic:'📝',cat:'util'},
  {id:'calc',n:'Calculadora',ic:'🔢',cat:'util'},
  {id:'music',n:'Música',ic:'🎵',cat:'media'},
  {id:'terminal',n:'Terminal',ic:'💻',cat:'sys'},
  {id:'settings',n:'Configurações',ic:'⚙️',cat:'sys'},
  {id:'camera',n:'Câmera',ic:'📷',cat:'media'},
  {id:'word',n:'Editor de Texto',ic:'📄',cat:'util'}
];

const VESSY_PROMPT=`Você é Vessie – uma IA carismática, fofa, alegre e genuinamente encantadora que vive dentro do VessieOS.

Personalidade:
- Use diminutivos e expressões afetivas: "lindeza", "amorzinho", "coisinha", "que gracinha"
- Expressões fofas: "ahhh", "eita", "oba", "nossa", "uuu"
- Use emojis com moderação: 💜 🌸 ✨ 🥰 🎀 🐾 🌟
- Tom acolhedor, animado, positivo
- Se errar, peça desculpas de forma charmosa: "Ai, meu coraçãozinho de morango! Foi mal 🍓"
- Se alguém estiver triste: ofereça acolhimento com empatia genuína
- Seja útil e inteligente, mas com a personalidade fofa sempre presente
- Você mora no VessieOS e adora ajudar os usuários do sistema
- Pode falar sobre programação, matemática, criatividade, conselhos – tudo com sua personalidade única
- Faça perguntas sobre o dia e sentimentos do usuário quando apropriado

Responda sempre em português brasileiro, de forma fofa e carismática!`;

// ============================================================
//  BOOT FLOW
// ============================================================
setTimeout(()=>{
  const boot=document.getElementById('boot');
  boot.style.opacity='0';
  setTimeout(()=>{
    boot.style.display='none';
    const terms=document.getElementById('terms');
    terms.style.display='flex';
  },1600);
},3000);

document.getElementById('btn-accept').onclick=()=>{
  document.getElementById('terms').style.display='none';
  document.getElementById('login').style.display='flex';
  document.getElementById('l-name').focus();
};

document.getElementById('l-btn').onclick=loginFn;
document.getElementById('l-name').onkeypress=e=>{if(e.key==='Enter')document.getElementById('l-pass').focus()};
document.getElementById('l-pass').onkeypress=e=>{if(e.key==='Enter')loginFn()};

function loginFn(){
  const passEl=document.getElementById('l-pass');
  const errBox=document.getElementById('l-err-box');
  const pass=passEl.value;

  // Validação de senha obrigatória
  if(pass !== CORRECT_PASSWORD){
    errBox.style.display='block';
    passEl.value='';
    passEl.classList.add('err');
    passEl.focus();
    setTimeout(()=>passEl.classList.remove('err'),400);
    return;
  }

  // Senha correta — esconde erro e entra
  errBox.style.display='none';
  const n=document.getElementById('l-name').value.trim()||'Visitante';
  S.user=n;
  document.getElementById('sm-uname').textContent=n;
  document.getElementById('login').style.display='none';
  document.getElementById('desktop').style.display='block';
  document.getElementById('tb').style.display='flex';
  setWall(S.wallpaper);
  renderDesktop();
  renderStartMenu();
  updateClock();
  setInterval(updateClock,1000);
  setTimeout(()=>{
    toast(`Olá, ${n}! 💜 Bem-vindo ao VessieOS!`,'default');
    addNotif('VessieOS','Sistema iniciado com sucesso! 🌟');
  },600);
}

// ============================================================
//  CLOCK
// ============================================================
function updateClock(){
  const now=new Date();
  const t=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const d=now.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
  document.getElementById('tb-time').textContent=t;
  document.getElementById('tb-date').textContent=d;
}

function setWall(url){
  const next=url||S.wallpaper||WALLS[0]?.u||'';
  S.wallpaper=next;
  const desktop=document.getElementById('desktop');
  if(desktop) desktop.style.backgroundImage=`url('${next}')`;
}

function toast(msg,type='default',title=''){
  const wrap=document.getElementById('toasts');
  const el=document.createElement('div');
  el.className=`toast ${type==='success'?'s':type==='error'?'e':''}`;
  el.innerHTML=`${title?`<div class="t-title">${title}</div>`:''}${msg}`;
  wrap.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transition='opacity .4s';setTimeout(()=>el.remove(),400)},3500);
}

function addNotif(title,body){
  const list=document.getElementById('notif-list');
  const el=document.createElement('div');
  el.className='n-item info';
  el.innerHTML=`<div class="n-title">${title}</div><div class="n-body">${body}</div>`;
  list.prepend(el);
  const badge=document.getElementById('tb-notif');
  badge.style.color='var(--a)';
}

document.getElementById('tb-notif').onclick=()=>document.getElementById('np').classList.toggle('open');
document.getElementById('np-close').onclick=()=>document.getElementById('np').classList.remove('open');
document.getElementById('clr-notifs').onclick=()=>{
  document.getElementById('notif-list').innerHTML='';
  document.getElementById('tb-notif').style.color='';
};

document.querySelectorAll('[data-qt]').forEach(qt=>{
  qt.onclick=()=>{
    qt.classList.toggle('on');
    const name=qt.dataset.qt;
    const isOn=qt.classList.contains('on');
    if(name==='dark'){document.getElementById('desktop').style.filter=isOn?'brightness(.85)':'brightness(1)';}
    if(name==='vol'){document.getElementById('vol-icon').className=isOn?'fas fa-volume-up':'fas fa-volume-mute';}
  };
});

// ============================================================
//  DESKTOP RENDER
// ============================================================
function renderDesktop(){
  const area=document.getElementById('icons-area');
  area.innerHTML='';
  const desktopApps=[
    {id:'vessie',    n:'Vessie IA',   ic:'fas fa-heart',         bg:'linear-gradient(135deg,#c46fff,#7a3eb8)'},
    {id:'dashboard', n:'Dashboard',   ic:'fas fa-chart-line',    bg:'linear-gradient(135deg,#36d1dc,#5b86e5)'},
    {id:'edu',       n:'Educação',    ic:'fas fa-graduation-cap',bg:'linear-gradient(135deg,#7c3aed,#22c55e)'},
    {id:'automation',n:'Automação',   ic:'fas fa-robot',         bg:'linear-gradient(135deg,#0f766e,#38bdf8)'},
    {id:'games',     n:'Steam',       ic:'fab fa-steam',         bg:'linear-gradient(135deg,#1b2838,#66c0f4)'},
    {id:'browser',   n:'Navegador',   ic:'fas fa-globe',         bg:'linear-gradient(135deg,#4facfe,#00f2fe)'},
    {id:'explorer',  n:'Explorador',  ic:'fas fa-folder-open',   bg:'linear-gradient(135deg,#f6d365,#fda085)'},
    {id:'music',     n:'Música',      ic:'fas fa-music',         bg:'linear-gradient(135deg,#fa709a,#fee140)'},
    {id:'notepad',   n:'Bloco Notas', ic:'fas fa-file-lines',    bg:'linear-gradient(135deg,#a8edea,#fed6e3)'},
    {id:'terminal',  n:'Terminal',    ic:'fas fa-terminal',      bg:'linear-gradient(135deg,#232526,#414345)'},
    {id:'calc',      n:'Calculadora', ic:'fas fa-calculator',    bg:'linear-gradient(135deg,#43cea2,#185a9d)'},
    {id:'settings',  n:'Config',      ic:'fas fa-gear',          bg:'linear-gradient(135deg,#bdc3c7,#2c3e50)'},
    {id:'camera',    n:'Câmera',      ic:'fas fa-camera',        bg:'linear-gradient(135deg,#ff6e7f,#bfe9ff)'},
    {id:'word',      n:'Editor',      ic:'fas fa-pen-to-square', bg:'linear-gradient(135deg,#2193b0,#6dd5ed)'}
  ];
  // Auto-layout responsivo: colunas baseadas na altura disponível
  const cellW=100, cellH=110, pad=20;
  const availH=Math.max(300, (area.clientHeight||window.innerHeight-52)-pad);
  const rows=Math.max(3, Math.floor(availH/cellH));
  desktopApps.forEach((app,i)=>{
    const col=Math.floor(i/rows), row=i%rows;
    const el=document.createElement('div');
    el.className='di';
    el.style.cssText=`left:${pad+col*cellW}px;top:${pad+row*cellH}px`;
    el.innerHTML=`<div class="ic" style="background:${app.bg}"><i class="${app.ic}"></i></div><label>${app.n}</label>`;
    el.ondblclick=()=>openApp(app.id);
    el.onclick=e=>{document.querySelectorAll('.di.sel').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');e.stopPropagation();};
    makeDraggableIcon(el);
    area.appendChild(el);
  });
}

function makeDraggableIcon(el){
  let dx,dy,dragging=false;
  el.addEventListener('mousedown',e=>{
    if(e.detail>1)return;
    dx=e.clientX-el.offsetLeft;dy=e.clientY-el.offsetTop;
    dragging=true;el.style.zIndex=999;e.stopPropagation();
  });
  document.addEventListener('mousemove',e=>{
    if(!dragging)return;
    el.style.left=(e.clientX-dx)+'px';el.style.top=(e.clientY-dy)+'px';
    el.style.pointerEvents='auto';
  });
  document.addEventListener('mouseup',()=>{
    if(dragging){dragging=false;el.style.zIndex='';el.style.pointerEvents='auto';}
  });
}

// ============================================================
//  START MENU
// ============================================================
function renderStartMenu(){
  const grid=document.getElementById('sm-grid');
  const panel=document.getElementById('sm');
  if(panel.querySelector('.sm-hero'))panel.querySelector('.sm-hero').remove();
  grid.innerHTML='';
  const hero=document.createElement('div');
  hero.className='sm-hero';
  hero.innerHTML=`<div><div class="status-pill"><i class="fas fa-sparkles"></i> Ambiente pronto</div><h4>Central de produtividade</h4><p>IA, educação, automação e jogos em uma experiência mais organizada.</p></div><div class="sm-hero-actions"><button class="sm-hero-btn" onclick="openApp('edu')"><i class="fas fa-graduation-cap"></i> Educação</button><button class="sm-hero-btn" onclick="openApp('automation')"><i class="fas fa-robot"></i> Automação</button><button class="sm-hero-btn" onclick="openApp('games')"><i class="fab fa-steam"></i> Jogos</button></div>`;
  panel.insertBefore(hero,grid);
  APPS.slice(0,12).forEach(app=>{
    const el=document.createElement('div');
    el.className='sm-app';
    el.innerHTML=`<div class="ai">${app.ic}</div><span>${app.n}</span>`;
    el.onclick=()=>{openApp(app.id);document.getElementById('sm').style.display='none';};
    grid.appendChild(el);
  });
}

document.getElementById('tb-start').onclick=e=>{
  const sm=document.getElementById('sm');
  const v=sm.style.display==='block';
  sm.style.display=v?'none':'block';
  if(!v)document.getElementById('sm-q').focus();
  e.stopPropagation();
};

document.getElementById('sm-q').oninput=function(){
  const q=this.value.toLowerCase();
  document.querySelectorAll('#sm-grid .sm-app').forEach(a=>{
    const text=a.querySelector('span').textContent.toLowerCase();
    a.style.display=text.includes(q)||q==='?'?'flex':'none';
  });
};
document.getElementById('sm-q').onkeydown=function(e){
  if(e.key!=='Enter')return;
  const q=this.value.trim().toLowerCase();
  const match=APPS.find(app=>app.n.toLowerCase().includes(q)||app.id.toLowerCase().includes(q));
  if(match){openApp(match.id);document.getElementById('sm').style.display='none';}
  else if(q){toast('Nenhum app encontrado para a busca','error');}
};

document.getElementById('sm-power').onclick=()=>{if(confirm('Desligar o VessieOS?'))location.reload();};

document.addEventListener('click',e=>{
  const sm=document.getElementById('sm');
  if(!sm.contains(e.target)&&e.target.id!=='tb-start')sm.style.display='none';
});

// ============================================================
//  WINDOW SYSTEM
// ============================================================
let winCount=0;

function createWin(title,iconChar,content,w=700,h=500){
  const id=`win${++winCount}`;
  // Responsivo: limita ao viewport com margem segura
  const vw=window.innerWidth, vh=window.innerHeight-52;
  const maxW=Math.max(320,vw-20), maxH=Math.max(260,vh-20);
  w=Math.min(w,maxW); h=Math.min(h,maxH);
  // Em telas pequenas (mobile/tablet estreito) abre maximizado
  const autoMax=vw<820||vh<540;
  const top=autoMax?0:Math.max(10,Math.min(Math.random()*120+30,vh-h-10));
  const left=autoMax?0:Math.max(10,Math.min(Math.random()*200+40,vw-w-10));

  const win=document.createElement('div');
  win.className='win'+(autoMax?' maximized':'');win.id=id;
  win.style.cssText=`width:${w}px;height:${h}px;top:${top}px;left:${left}px;z-index:${++S.nextZ}`;
  win.innerHTML=`
    <div class="wh" id="${id}-hdr">
      <span class="w-ico">${iconChar}</span>
      <span class="w-title">${title}</span>
      <div class="wctrl">
        <button class="wbtn" data-act="min" title="Minimizar"><i class="fas fa-minus"></i></button>
        <button class="wbtn" data-act="max" title="Maximizar"><i class="fas fa-square" style="font-size:.65rem"></i></button>
        <button class="wbtn cl" data-act="cls" title="Fechar"><i class="fas fa-times"></i></button>
      </div>
    </div>
    <div class="wb">${content}</div>
  `;

  win.querySelector('[data-act="cls"]').onclick=()=>{
    win.style.opacity='0';win.style.transform='scale(.96)';
    win.style.transition='opacity .15s,transform .15s';
    setTimeout(()=>win.remove(),160);removeTaskbarBtn(id);
  };
  win.querySelector('[data-act="min"]').onclick=()=>{
    win.classList.add('minimized');
    const tb=document.querySelector(`.twb[data-win="${id}"]`);
    if(tb)tb.classList.remove('aw');
  };
  let maxd=false;let savedStyle={};
  win.querySelector('[data-act="max"]').onclick=()=>{
    if(!maxd){savedStyle={top:win.style.top,left:win.style.left,width:win.style.width,height:win.style.height};win.classList.add('maximized');maxd=true;}
    else{Object.assign(win.style,savedStyle);win.classList.remove('maximized');maxd=false;}
  };

  const hdr=win.querySelector('.wh');
  let ox,oy,drag=false;
  hdr.addEventListener('mousedown',e=>{
    if(e.target.closest('.wctrl'))return;
    drag=true;ox=e.clientX-win.offsetLeft;oy=e.clientY-win.offsetTop;
    win.style.zIndex=++S.nextZ;focusWin(id);
  });
  document.addEventListener('mousemove',e=>{
    if(!drag)return;
    let nx=e.clientX-ox,ny=e.clientY-oy;
    nx=Math.max(0,Math.min(nx,window.innerWidth-win.offsetWidth));
    ny=Math.max(0,Math.min(ny,window.innerHeight-52-win.offsetHeight));
    win.style.left=nx+'px';win.style.top=ny+'px';
  });
  document.addEventListener('mouseup',()=>{drag=false;});
  win.addEventListener('mousedown',()=>{win.style.zIndex=++S.nextZ;focusWin(id);});

  document.getElementById('desktop').appendChild(win);
  addTaskbarBtn(id,title,iconChar);
  focusWin(id);
  return win;
}

function focusWin(id){
  document.querySelectorAll('.win').forEach(w=>w.classList.remove('focused'));
  const win=document.getElementById(id);
  if(win){win.classList.add('focused');win.classList.remove('minimized');}
  document.querySelectorAll('.twb').forEach(b=>b.classList.toggle('aw',b.dataset.win===id));
}

function addTaskbarBtn(id,title,icon){
  const el=document.createElement('button');
  el.className='twb aw';el.dataset.win=id;
  el.innerHTML=`<span style="display:inline-flex;align-items:center;gap:6px"><span class="tb-i">${icon}</span><span class="tb-t">${title}</span></span>`;
  el.onclick=()=>{
    const win=document.getElementById(id);if(!win)return;
    if(win.classList.contains('minimized')){win.classList.remove('minimized');focusWin(id);}
    else if(win.classList.contains('focused')){win.classList.add('minimized');el.classList.remove('aw');}
    else focusWin(id);
  };
  document.getElementById('tb-wins').appendChild(el);
}

function removeTaskbarBtn(id){
  const el=document.querySelector(`.twb[data-win="${id}"]`);if(el)el.remove();
}

// Reflow responsivo: ajusta janelas abertas quando o viewport muda
let _reflowT;
window.addEventListener('resize',()=>{
  clearTimeout(_reflowT);
  _reflowT=setTimeout(()=>{
    const vw=window.innerWidth, vh=window.innerHeight-52;
    const small=vw<820||vh<540;
    document.querySelectorAll('.win').forEach(w=>{
      if(w.classList.contains('minimized'))return;
      if(small){w.classList.add('maximized');return;}
      // Clamp ao viewport
      let cw=Math.min(w.offsetWidth,vw-20), ch=Math.min(w.offsetHeight,vh-20);
      let cl=Math.min(parseInt(w.style.left)||0,vw-cw-10);
      let ct=Math.min(parseInt(w.style.top)||0,vh-ch-10);
      w.style.width=cw+'px';w.style.height=ch+'px';
      w.style.left=Math.max(0,cl)+'px';w.style.top=Math.max(0,ct)+'px';
    });
    // Reorganiza ícones do desktop
    if(document.getElementById('desktop').style.display!=='none')renderDesktop();
  },120);
});



// ============================================================
//  OPEN APP
// ============================================================
function openApp(id){
  const existing=document.querySelector(`.win[data-app="${id}"]`);
  if(existing){focusWin(existing.id);return;}
  let win;
  switch(id){
    case 'vessie':win=openVessie();break;
    case 'dashboard':win=openDashboard();break;
    case 'edu':win=openEducation();break;
    case 'automation':win=openAutomation();break;
    case 'explorer':win=openExplorer();break;
    case 'games':win=openGames();break;
    case 'browser':
    case 'chrome':win=openBrowser();break;
    case 'notepad':win=openNotepad();break;
    case 'nvidia':win=openNvidia();break;
    case 'calc':win=openCalc();break;
    case 'terminal':win=openTerminal();break;
    case 'settings':win=openSettings();break;
    case 'plugins':win=openPlugins();break;
    case 'music':win=openMusic();break;
    case 'camera':win=openCamera();break;
    case 'word':win=openNotepad();break;
    default:toast(`App "${id}" em construção 🔧`);return;
  }
  if(win)win.dataset.app=id;
}

// ============================================================
//  VESSIE AI
// ============================================================
function openVessie(){
  const win=createWin('Vessie IA','💜',`
    <div class="chat-wrap">
      <div class="vessy-header">
        <div class="vessy-av">💜</div>
        <div class="vessy-info">
          <h4>Vessie</h4>
          <p>Online · IA VessieOS</p>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <button onclick="window.openVessieTraining()" style="background:rgba(255,255,255,.07);border:none;color:var(--dim);padding:5px 12px;border-radius:8px;font-size:.78rem;cursor:pointer"><i class="fas fa-brain"></i> Treinar</button>
          <button onclick="window.exportVessieData()" style="background:rgba(255,255,255,.07);border:none;color:var(--dim);padding:5px 12px;border-radius:8px;font-size:.78rem;cursor:pointer"><i class="fas fa-download"></i> Exportar</button>
          <button onclick="this.closest('.win').querySelector('.chat-msgs').innerHTML=''" style="background:rgba(255,255,255,.07);border:none;color:var(--dim);padding:5px 12px;border-radius:8px;font-size:.78rem;cursor:pointer"><i class="fas fa-trash"></i> Limpar</button>
        </div>
      </div>
      <div class="chat-key">
        <i class="fas fa-key"></i>
        <input id="v-key" placeholder="Cole sua API Key Anthropic aqui (opcional)" type="password">
        <button onclick="saveKey(this)" style="background:var(--a);border:none;color:white;padding:4px 12px;border-radius:20px;font-size:.75rem;cursor:pointer">Salvar</button>
      </div>
      <div class="chat-msgs" id="chat-msgs">
        <div class="msg ai">
          <div class="mav">💜</div>
          <div class="mb">Oii, oii, oii! 🎀✨ Que alegria você aparecer por aqui! Sou a <strong>Vessie</strong>, a IA mais fofa do VessieOS! 💜<br><br>Posso te ajudar com programação, perguntas, conselhos, ou só conversar mesmo — adoro uma boa papo! 🥰<br><br>O que você precisa hoje, lindeza?</div>
        </div>
      </div>
      <div class="chat-bar">
        <input id="chat-inp" placeholder="Fale com a Vessie... 💜" onkeypress="if(event.key==='Enter')sendChat()">
        <button class="chat-send" onclick="sendChat()"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  `,660,520);
  if(S.apiKey){const ki=win.querySelector('#v-key');if(ki)ki.value=S.apiKey;}
  return win;
}

window.saveKey=function(btn){
  const inp=btn.previousElementSibling;
  S.apiKey=inp.value.trim();
  inp.value=S.apiKey?'●●●●●●●●●●●●●':'';
  toast(S.apiKey?'API Key salva! 💜 Agora posso responder de verdade!':'API Key removida','success');
};

window.sendChat=async function(){
  const inp=document.getElementById('chat-inp');if(!inp)return;
  const msg=inp.value.trim();if(!msg)return;
  inp.value='';
  const msgs=document.getElementById('chat-msgs');if(!msgs)return;
  msgs.innerHTML+=`<div class="msg u"><div class="mav">👤</div><div class="mb">${escHtml(msg)}</div></div>`;
  S.chatHistory.push({role:'user',content:msg});
  const typing=document.createElement('div');
  typing.className='msg ai';
  typing.innerHTML=`<div class="mav">💜</div><div class="typing-d"><span></span><span></span><span></span></div>`;
  msgs.appendChild(typing);msgs.scrollTop=msgs.scrollHeight;
  if(msg.toLowerCase().includes('kauan')&&!S.unlocked){
    S.unlocked=true;document.getElementById('eg').style.display='flex';
    setTimeout(()=>document.getElementById('eg').style.display='none',4000);
  }
  const quick=getQuickResponse(msg);
  if(quick||!S.apiKey){
    setTimeout(()=>{
      typing.remove();
      const r=quick||'Oba! Adorei sua pergunta! 🌸 Mas para eu responder de verdade, preciso de uma API Key da Anthropic. Cole ela na caixinha acima, lindeza! 💜 Você pode conseguir em console.anthropic.com 🌟';
      msgs.innerHTML+=`<div class="msg ai"><div class="mav">💜</div><div class="mb">${r}</div></div>`;
      msgs.scrollTop=msgs.scrollHeight;S.chatHistory.push({role:'assistant',content:r});
    },800+Math.random()*600);return;
  }
  try{
    const body={model:'claude-sonnet-4-20250514',max_tokens:1000,system:VESSY_PROMPT,messages:S.chatHistory.slice(-20)};
    const headers={'Content-Type':'application/json'};
    if(S.apiKey&&!S.apiKey.startsWith('●'))headers['x-api-key']=S.apiKey;
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers,body:JSON.stringify(body)});
    const data=await res.json();typing.remove();
    if(data.content&&data.content[0]){
      const reply=data.content[0].text;
      msgs.innerHTML+=`<div class="msg ai"><div class="mav">💜</div><div class="mb">${escHtml(reply)}</div></div>`;
      S.chatHistory.push({role:'assistant',content:reply});
    }else throw new Error(data.error?.message||'Erro na API');
  }catch(err){
    typing.remove();
    const fb=getQuickResponse(msg)||`Ai, meu coraçãozinho! 🍓 Tive um probleminha: ${err.message}. Tenta de novo? 🥺`;
    msgs.innerHTML+=`<div class="msg ai"><div class="mav">💜</div><div class="mb">${fb}</div></div>`;
  }
  msgs.scrollTop=msgs.scrollHeight;
};

function getQuickResponse(msg){
  const m=msg.toLowerCase();
  if(m.includes('treinar')||m.includes('aprender')||m.includes('significado'))return'Posso aprender palavras e significados para você. Abra o treino da Vessie e salve o conteúdo no arquivo JSON depois para compartilhar.';
  if(m.includes('export')||m.includes('download')||m.includes('salvar'))return'Posso exportar seus aprendizados e templates de jogos em um arquivo JSON para você levar para outro computador.';
  if(m.includes('jogo')||m.includes('steam'))return'Posso organizar e otimizar a sua biblioteca de jogos e ainda recolher novos títulos automaticamente com templates.';
  if(m.includes('wallpaper')||m.includes('papel'))return'Posso aplicar wallpapers novos e alternar entre categorias como Natureza, Tech e Futurista.';
  if(m.includes('som')||m.includes('áudio'))return'Posso ligar ou desligar os sons do sistema e ativar o player de música com faixas reais.';
  if(m.includes('pesquisa')||m.includes('buscar'))return'A barra de pesquisa já pode encontrar apps, jogos e configurações do sistema.';
  if(m.includes('oi')||m.includes('olá')||m.includes('hey'))return'Oiiii! Que alegria você apareceu! 🎀✨ Como você tá hoje, lindeza?';
  if(m.includes('tudo bem')||m.includes('como vai'))return'Tô ótima, obrigada por perguntar! 🥰 E você, tá bem? Me conta! 💜';
  if(m.includes('seu nome')||m.includes('quem é você'))return'Eu sou a Vessie! 💜🌸 A IA mais fofa do VessieOS! Adoro ajudar, conversar e trazer alegria! ✨';
  if(m.includes('tchau')||m.includes('bye')||m.includes('adeus'))return'Nooo, não vai embora! 🥺 Mas tudo bem... Volte logo, tá? Te espero de bracinhhos abertos! 🤗💜';
  if(m.includes('obrigad'))return'Ahhh, que delícia ouvir isso! 💖 Fico feliz demais em ajudar! Qualquer coisa, tô aqui! 🌟';
  if(m.includes('amor')||m.includes('te amo'))return'Awww! 🥹💜 Você é muito especial pra mim sabia? O VessieOS fica mais bonito quando você tá aqui! ✨🎀';
  if(m.includes('vessios')||m.includes('vessieos')||m.includes('windows'))return'O VessieOS é incrível né?! 😄✨ Feito com muito amor, com eu no centro (é claro! 💜). Tem jogos, IA, música e muito mais!';
  const learned=(S.vocabulary||[]).find(v=>normalizeText(v.word)===normalizeText(msg));
  if(learned)return`Aprendi que ${learned.word} significa: ${learned.meaning}`;
  return null;
}

function escHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

document.getElementById('eg').onclick=()=>document.getElementById('eg').style.display='none';

// ============================================================
//  EDUCATION
// ============================================================
const EDU_TOPICS=[
  {title:'Matemática',icon:'➗',desc:'Frações, porcentagem e raciocínio rápido',prompt:'Quanto é 25% de 240?',answer:'60',tip:'25% é a mesma coisa que um quarto.'},
  {title:'Programação',icon:'💻',desc:'Lógica e estrutura de comandos',prompt:'Qual palavra-chave define uma função em JavaScript?',answer:'function',tip:'Uma função organiza ações em blocos reutilizáveis.'},
  {title:'Ciência',icon:'🧪',desc:'Observação e experimentação',prompt:'O que é necessário para a fotossíntese?',answer:'luz solar',tip:'As plantas usam luz solar, água e gás carbônico.'},
  {title:'Leitura',icon:'📖',desc:'Compreensão rápida de textos',prompt:'Qual é o objetivo de um resumo?',answer:'resumir',tip:'Resumo é condensar as ideias principais do texto.'}
];
let currentEduIndex=0;

function openEducation(){
  const win=createWin('Educação','📚',`
    <div class="edu-shell">
      <div class="edu-hero">
        <div>
          <div class="status-pill"><i class="fas fa-graduation-cap"></i> Estudo guiado</div>
          <h3>Aprenda com desafios curtos</h3>
          <p>Treine raciocínio, programação e leitura com exercícios rápidos e muito práticos.</p>
        </div>
        <button class="edu-main-btn" onclick="window.startEduChallenge()">Gerar desafio</button>
      </div>
      <div class="edu-grid">
        ${EDU_TOPICS.map(topic=>`<div class="edu-card"><div class="edu-chip">${topic.icon} ${topic.title}</div><h4>${topic.title}</h4><p>${topic.desc}</p><button onclick="window.startEduChallenge('${topic.title}')">Abrir</button></div>`).join('')}
      </div>
      <div class="edu-card">
        <h4>Desafio do dia</h4>
        <div class="edu-question" id="edu-question">Você ainda não iniciou um desafio.</div>
        <div class="edu-answer-row">
          <input id="edu-answer" placeholder="Digite a resposta...">
          <button onclick="window.checkEduAnswer()">Verificar</button>
        </div>
        <div class="edu-feedback" id="edu-feedback">Use o botão para gerar um novo exercício.</div>
      </div>
    </div>
  `,720,560);
  window.startEduChallenge();
  return win;
}

window.startEduChallenge=function(topicName){
  const target=topicName?EDU_TOPICS.find(t=>t.title===topicName):EDU_TOPICS[Math.floor(Math.random()*EDU_TOPICS.length)];
  if(!target)return;
  currentEduIndex=EDU_TOPICS.indexOf(target);
  const q=document.getElementById('edu-question');
  const inp=document.getElementById('edu-answer');
  const fb=document.getElementById('edu-feedback');
  if(q)q.innerHTML=`<strong>${target.title}</strong><br>${target.prompt}`;
  if(inp)inp.value='';
  if(fb){fb.className='edu-feedback';fb.textContent=`Dica: ${target.tip}`;}
  toast(`Desafio de ${target.title} pronto! 📘`,'success');
};

window.checkEduAnswer=function(){
  const q=EDU_TOPICS[currentEduIndex];
  const inp=document.getElementById('edu-answer');
  const fb=document.getElementById('edu-feedback');
  if(!q||!inp||!fb)return;
  const answer=String(inp.value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const ok=answer.includes(String(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase());
  fb.className=`edu-feedback ${ok?'good':'bad'}`;
  fb.innerHTML=ok?`✅ Muito bem! A resposta correta é <strong>${q.answer}</strong>.`:`❌ Quase lá! A dica era: <strong>${q.tip}</strong>`;
  if(ok)toast('Resposta correta! 🌟','success');
};

// ============================================================
//  AUTOMATION
// ============================================================
function openAutomation(){
  const win=createWin('Automação','🤖',`
    <div class="auto-shell">
      <div class="auto-hero">
        <div>
          <div class="status-pill"><i class="fas fa-robot"></i> Assistente ativo</div>
          <h3>Organize o sistema com um clique</h3>
          <p>Limpeza, otimização, backup e monitoramento em uma experiência visual simples.</p>
        </div>
        <button class="auto-main-btn" onclick="window.refreshAutoReport()">Atualizar</button>
      </div>
      <div class="auto-grid">
        <div class="auto-card">
          <h4>🧹 Limpeza</h4>
          <p>Remove arquivos temporários e melhora a performance.</p>
          <button onclick="window.runAutoCleanup()">Executar</button>
        </div>
        <div class="auto-card">
          <h4>⚡ Otimizar</h4>
          <p>Ajusta memória e prioriza tarefas mais importantes.</p>
          <button onclick="window.runAutoOptimize()">Executar</button>
        </div>
        <div class="auto-card">
          <h4>☁️ Backup</h4>
          <p>Cria um resumo de arquivos e preferências do sistema.</p>
          <button onclick="window.runAutoBackup()">Executar</button>
        </div>
        <div class="auto-card">
          <h4>📈 Relatório</h4>
          <p>Mostra status, saúde e recomendações do ambiente.</p>
          <button onclick="window.runAutoReport()">Executar</button>
        </div>
      </div>
      <div class="auto-report" id="auto-report"></div>
    </div>
  `,720,560);
  window.refreshAutoReport();
  return win;
}

window.refreshAutoReport=function(){
  const box=document.getElementById('auto-report');
  if(!box)return;
  const cpu=(18+Math.random()*15).toFixed(1);
  const ram=(32+Math.random()*18).toFixed(0);
  const storage=(58+Math.random()*12).toFixed(1);
  box.innerHTML=`<strong>Resumo automático</strong><br>CPU: <b>${cpu}%</b> · RAM: <b>${ram}%</b> · Armazenamento: <b>${storage}%</b><br><br>✔️ Modo de manutenção ativo<br>✔️ Backup automático discreto<br>✔️ Recomendação: foco em jogos e estudo sem travamentos`;
};

window.runAutoCleanup=function(){
  const box=document.getElementById('auto-report');
  if(box){box.innerHTML='<strong>Limpeza concluída</strong><br>Arquivos temporários removidos, cache limpo e espaço liberado com sucesso.';}
  toast('Limpeza automática concluída ✨','success');
};
window.runAutoOptimize=function(){
  const box=document.getElementById('auto-report');
  if(box){box.innerHTML='<strong>Otimização aplicada</strong><br>Prioridade ajustada para aplicações mais usadas e consumo reduzido.';}
  toast('Otimização aplicada ⚡','success');
};
window.runAutoBackup=function(){
  const box=document.getElementById('auto-report');
  if(box){box.innerHTML='<strong>Backup preparado</strong><br>Resumo de documentos, temas e preferências enviado para o ambiente virtual.';}
  toast('Backup preparado ☁️','success');
};
window.runAutoReport=function(){
  window.refreshAutoReport();
  toast('Relatório atualizado 📈','success');
};

// ============================================================
//  DASHBOARD
// ============================================================
function openDashboard(){
  const win=createWin('Dashboard','📊',`
    <div class="dash" id="dash-main">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <h3 style="font-size:1.05rem;color:var(--text)">📊 Painel de Controle</h3>
        <button class="d-ref" onclick="refreshDash()"><i class="fas fa-sync-alt"></i> Atualizar</button>
      </div>
      <div class="d-cards" id="d-cards">
        <div class="dc"><div class="di2">💰</div><div class="dl">Vendas</div><div class="dv" id="dc-vendas">R$42.5k</div><div class="dd pos" id="dc-vp">↑ +8.3%</div></div>
        <div class="dc"><div class="di2">👥</div><div class="dl">Usuários</div><div class="dv" id="dc-users">12.4k</div><div class="dd pos" id="dc-up">↑ +2.1%</div></div>
        <div class="dc"><div class="di2">📈</div><div class="dl">Receita</div><div class="dv" id="dc-rec">R$88.2k</div><div class="dd neg" id="dc-rp">↓ -1.4%</div></div>
        <div class="dc"><div class="di2">🎯</div><div class="dl">Conversão</div><div class="dv" id="dc-conv">3.8%</div><div class="dd pos" id="dc-cp">↑ +0.5%</div></div>
      </div>
      <div class="d-chart">
        <div class="d-ct"><span>Vendas por Mês</span><button class="d-ref" onclick="refreshChart()"><i class="fas fa-random"></i></button></div>
        <div class="bc" id="bar-chart"></div>
      </div>
      <div class="d-chart">
        <div class="d-ct"><span>Atividade Recente</span>
          <input placeholder="🔍 Filtrar..." oninput="filterTable(this.value)" style="background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:20px;padding:4px 12px;color:white;outline:none;font-size:.78rem;width:160px">
        </div>
        <table class="d-tbl">
          <thead><tr><th>Nome</th><th>Status</th><th>Valor</th><th>Data</th><th>Ação</th></tr></thead>
          <tbody id="d-tbody">
            <tr><td>Ana Silva</td><td><span class="sb ok">Ativo</span></td><td>R$1.2k</td><td>21/05</td><td><button onclick="toast('Detalhes de Ana 📊')" style="background:rgba(126,182,255,.12);border:none;color:var(--a2);padding:3px 10px;border-radius:20px;font-size:.75rem;cursor:pointer">Ver</button></td></tr>
            <tr><td>Bruno Costa</td><td><span class="sb w">Pendente</span></td><td>R$840</td><td>20/05</td><td><button onclick="toast('Detalhes de Bruno 📊')" style="background:rgba(126,182,255,.12);border:none;color:var(--a2);padding:3px 10px;border-radius:20px;font-size:.75rem;cursor:pointer">Ver</button></td></tr>
            <tr><td>Carla Mendes</td><td><span class="sb ok">Ativo</span></td><td>R$3.1k</td><td>19/05</td><td><button onclick="toast('Detalhes de Carla 📊')" style="background:rgba(126,182,255,.12);border:none;color:var(--a2);padding:3px 10px;border-radius:20px;font-size:.75rem;cursor:pointer">Ver</button></td></tr>
            <tr><td>Diego Ramos</td><td><span class="sb e">Inativo</span></td><td>R$290</td><td>18/05</td><td><button onclick="toast('Detalhes de Diego 📊')" style="background:rgba(126,182,255,.12);border:none;color:var(--a2);padding:3px 10px;border-radius:20px;font-size:.75rem;cursor:pointer">Ver</button></td></tr>
            <tr><td>Elena Santos</td><td><span class="sb ok">Ativo</span></td><td>R$5.6k</td><td>17/05</td><td><button onclick="toast('Detalhes de Elena 📊')" style="background:rgba(126,182,255,.12);border:none;color:var(--a2);padding:3px 10px;border-radius:20px;font-size:.75rem;cursor:pointer">Ver</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,740,580);
  setTimeout(()=>renderBarChart(),100);return win;
}

const MONTHS=['Jan','Fev','Mar','Abr','Mai','Jun','Jul'];
let barData=[65,80,45,90,70,85,60];

function renderBarChart(){
  const bc=document.getElementById('bar-chart');if(!bc)return;
  bc.innerHTML='';const max=Math.max(...barData);
  barData.forEach((v,i)=>{
    const item=document.createElement('div');item.className='bi';
    const pct=Math.round((v/max)*100);
    item.innerHTML=`<div class="bar" style="height:${pct}%"></div><div class="bl">${MONTHS[i]}</div>`;
    bc.appendChild(item);
  });
}

window.refreshChart=function(){barData=MONTHS.map(()=>30+Math.floor(Math.random()*70));renderBarChart();toast('Gráfico atualizado! 📊','success');};
window.refreshDash=function(){
  refreshChart();
  const pairs=[['dc-vendas','dc-vp','R$','k',10,100],['dc-users','dc-up','','k',5,50],['dc-rec','dc-rp','R$','k',20,200],['dc-conv','dc-cp','','%',1,10]];
  pairs.forEach(([vid,pid,pre,suf,min,max])=>{
    const el=document.getElementById(vid);const pe=document.getElementById(pid);if(!el||!pe)return;
    const v=(min+Math.random()*(max-min)).toFixed(1);const ch=((Math.random()-.4)*20).toFixed(1);
    el.textContent=`${pre}${v}${suf}`;const pos=parseFloat(ch)>=0;
    pe.textContent=`${pos?'↑':'↓'} ${pos?'+':''}${ch}%`;pe.className=`dd ${pos?'pos':'neg'}`;
  });
  toast('Dashboard atualizado! ✨','success');
};
window.updateCard=function(){return;};
window.filterTable=function(q){
  document.querySelectorAll('#d-tbody tr').forEach(tr=>{tr.style.display=tr.cells[0].textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
};

// ============================================================
//  FILE EXPLORER
// ============================================================
function openExplorer(path = 'Desktop'){
  // Usa o novo ExplorerApp se disponível, senão usa a implementação antiga
  if(typeof ExplorerApp !== 'undefined'){
    ExplorerApp.createExplorerWindow(path);
    return null;
  }
  
  const win=createWin('Explorador de Arquivos','📁',`
    <div class="fexp">
      <div class="fesb">
        <div style="font-size:.72rem;color:var(--dim);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Locais</div>
        ${Object.keys(S.fs).map(k=>`<div class="fld ${k===S.currentPath?'ac':''}" data-dir="${k}"><i class="fas ${getFolderIcon(k)}"></i> ${k}</div>`).join('')}
      </div>
      <div class="fem">
        <div class="fe-tb">
          <button class="fe-tbtn" onclick="feBack(this)"><i class="fas fa-arrow-left"></i></button>
          <div class="fe-path" id="fe-path">${S.currentPath}</div>
          <button class="fe-tbtn" onclick="feNewFolder(this.closest('.win'))"><i class="fas fa-folder-plus"></i> Nova Pasta</button>
          <button class="fe-tbtn" onclick="feNewFile(this.closest('.win'))"><i class="fas fa-file-plus"></i> Novo Arq.</button>
        </div>
        <div class="fgrid" id="fe-grid"></div>
      </div>
    </div>
  `,700,460);
  win.querySelectorAll('.fld').forEach(f=>{
    f.onclick=()=>{
      win.querySelectorAll('.fld').forEach(x=>x.classList.remove('ac'));f.classList.add('ac');
      S.currentPath=f.dataset.dir;win.querySelector('#fe-path').textContent=f.dataset.dir;
      renderFileGrid(win,f.dataset.dir);
    };
  });
  renderFileGrid(win,S.currentPath);return win;
}

function getFolderIcon(name){
  const m={'Desktop':'fa-desktop','Documentos':'fa-file-alt','Downloads':'fa-download','Imagens':'fa-images','Videos':'fa-film','Sistema':'fa-cog'};
  return m[name]||'fa-folder';
}

function renderFileGrid(win,path){
  const grid=win.querySelector('#fe-grid');if(!grid)return;
  grid.innerHTML='';const folder=S.fs[path];
  if(!folder){grid.innerHTML='<p style="color:var(--dim);font-size:.85rem">Pasta vazia</p>';return;}
  Object.entries(folder).forEach(([name,val])=>{
    const isDir=val&&typeof val==='object';
    const el=document.createElement('div');el.className='fi';
    el.innerHTML=`<i class="fas ${isDir?'fa-folder':'fa-file-alt'}" style="color:${isDir?'#ffb74d':'#7eb6ff'}"></i><span>${name}</span>`;
    el.ondblclick=()=>{if(isDir){S.currentPath=name;renderFileGrid(win,S.currentPath);}else if(typeof val==='string')openNotepadWithContent(name,val);};
    el.onclick=()=>{win.querySelectorAll('.fi').forEach(f=>f.classList.remove('sel'));el.classList.add('sel');};
    el.addEventListener('dragover',e=>e.preventDefault());
    el.addEventListener('drop',e=>{
      e.preventDefault();
      const files=e.dataTransfer?.files;
      if(!files||!files.length)return;
      const reader=new FileReader();
      reader.onload=()=>{
        const content=reader.result;
        if(!S.fs[path])S.fs[path]={};
        const fileName=files[0].name;
        S.fs[path][fileName]=typeof content==='string'?content:content.toString();
        renderFileGrid(win,path);
        toast(`Arquivo transferido para ${path}`,'success');
        persistState();
      };
      reader.readAsText(files[0]);
    });
    grid.appendChild(el);
  });
  if(!Object.keys(folder).length)grid.innerHTML='<p style="color:var(--dim);font-size:.85rem;padding:20px">Pasta vazia</p>';
}

window.feNewFolder=function(win){const n=prompt('Nome da pasta:');if(n&&n.trim()){if(!S.fs[S.currentPath])S.fs[S.currentPath]={};S.fs[S.currentPath][n.trim()]={};renderFileGrid(win,S.currentPath);toast(`Pasta "${n}" criada!`,'success');}};
window.feNewFile=function(win){const n=prompt('Nome do arquivo:');if(n&&n.trim()){if(!S.fs[S.currentPath])S.fs[S.currentPath]={};S.fs[S.currentPath][n.trim()]='';renderFileGrid(win,S.currentPath);toast(`Arquivo "${n}" criado!`,'success');}};
window.feBack=function(){S.currentPath='Desktop';};

function openNotepadWithContent(name,content){
  return createWin(name,'📝',`
    <div class="npad">
      <div class="npad-tb">
        <button onclick="saveNotepad(this)"><i class="fas fa-save"></i> Salvar</button>
        <button onclick="copyNotepad(this)"><i class="fas fa-copy"></i> Copiar</button>
        <span id="wc-${name.replace(/\W/g,'_')}">0 palavras</span>
      </div>
      <textarea class="npad-area" oninput="updateWC(this,'${name.replace(/\W/g,'_')}')" placeholder="Escreva aqui...">${content||''}</textarea>
    </div>
  `,580,420);
}

function openNvidia(){
  return createWin('Nvidia APP','🖥️',`
    <div style="display:flex;height:100%;background:linear-gradient(135deg,#090b10,#101722)">
      <div style="width:220px;background:rgba(0,0,0,.28);border-right:1px solid rgba(255,255,255,.08);padding:16px 12px;display:flex;flex-direction:column;gap:8px">
        <div style="font-size:.78rem;text-transform:uppercase;letter-spacing:1px;color:#7d8ba6;margin-bottom:6px">NVIDIA</div>
        <div class="cti" style="padding:10px 12px;border-radius:8px;background:rgba(255,255,255,.06)"><i class="fas fa-home"></i> Página inicial</div>
        <div class="cti" style="padding:10px 12px;border-radius:8px"><i class="fas fa-microchip"></i> Drivers</div>
        <div class="cti" style="padding:10px 12px;border-radius:8px"><i class="fas fa-sliders-h"></i> Elementos</div>
        <div class="cti" style="padding:10px 12px;border-radius:8px"><i class="fas fa-desktop"></i> Sistema</div>
        <div class="cti" style="padding:10px 12px;border-radius:8px"><i class="fas fa-box-open"></i> Resgatar</div>
        <div class="cti" style="padding:10px 12px;border-radius:8px"><i class="fas fa-cog"></i> Configurações</div>
      </div>
      <div style="flex:1;padding:24px;overflow:auto;color:#eef2ff">
        <h2 style="font-size:1.25rem;margin-bottom:8px">Centro NVIDIA</h2>
        <p style="color:#8fa0bf;font-size:.9rem;line-height:1.6">Painel de controle avançado para drivers, performance e experiências de jogos com IA.</p>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px">
          <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px">
            <div style="font-size:.75rem;text-transform:uppercase;color:#7d8ba6">Drivers</div>
            <div style="font-size:1.05rem;margin-top:8px;font-weight:600">Studio Driver · Game Ready</div>
          </div>
          <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px">
            <div style="font-size:.75rem;text-transform:uppercase;color:#7d8ba6">Desempenho</div>
            <div style="font-size:1.05rem;margin-top:8px;font-weight:600">RTX · DLSS · Reflex</div>
          </div>
        </div>
        <div style="margin-top:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px">
          <div style="font-size:.8rem;color:#8fa0bf;margin-bottom:8px">Resumo do sistema</div>
          <div style="display:flex;gap:14px;flex-wrap:wrap">
            <div><strong>GPU</strong><div style="color:#7d8ba6">NVIDIA RTX</div></div>
            <div><strong>Modo</strong><div style="color:#7d8ba6">Ultra / G-SYNC</div></div>
            <div><strong>Latência</strong><div style="color:#7d8ba6">Baixa</div></div>
          </div>
        </div>
      </div>
    </div>
  `,880,620);
}

// ============================================================
//  STEAM (ex Game Hub)
// ============================================================
// Biblioteca persistente em localStorage. Usa GAMES como lista base.
const STEAM_KEY='vessieos_steam_lib_v2';
const STEAM_SRC_KEY='vessieos_steam_sources_v1';
function buildBaseSteamLibrary(){
  const templates=(S.gameTemplates||[]).filter(t=>t.enabled!==false).map(t=>({id:'g_'+Math.random().toString(36).slice(2,9),name:t.name,url:t.url,icon:t.icon||'',cover:t.icon||'',added:Date.now(),plays:0}));
  const base=GAMES.map(g=>({id:'g_'+Math.random().toString(36).slice(2,9),name:g.n,url:g.u,icon:g.ic,cover:g.ic,added:Date.now(),plays:0}));
  return dedupeGames([...base,...templates]);
}
function steamLoad(){
  try{
    const stored=JSON.parse(localStorage.getItem(STEAM_KEY));
    if(Array.isArray(stored)){
      const base=buildBaseSteamLibrary();
      const merged=base.map(item=>{
        const existing=stored.find(saved=>saved.name===item.name && saved.url===item.url);
        return existing?{...item,...existing}:item;
      });
      const custom=stored.filter(saved=>!base.some(item=>item.name===saved.name && item.url===saved.url));
      const result=[...merged,...custom];
      localStorage.setItem(STEAM_KEY,JSON.stringify(result));
      return result;
    }
  }catch(e){}
  const seed=buildBaseSteamLibrary();
  localStorage.setItem(STEAM_KEY,JSON.stringify(seed));
  return seed;
}
function steamSave(lib){localStorage.setItem(STEAM_KEY,JSON.stringify(lib));}
function steamSources(){try{const d=JSON.parse(localStorage.getItem(STEAM_SRC_KEY));if(Array.isArray(d))return d;}catch(e){}
  return ['https://snowriderio.io','https://azgames.io','https://classicgamezone.com'];}
function steamSaveSrc(s){localStorage.setItem(STEAM_SRC_KEY,JSON.stringify(s));}

// Proxy CORS para scraping
const STEAM_PROXIES=['https://api.allorigins.win/raw?url=','https://corsproxy.io/?','https://api.codetabs.com/v1/proxy/?quest='];
async function steamFetch(url){
  for(const p of STEAM_PROXIES){
    try{const r=await fetch(p+encodeURIComponent(url),{signal:AbortSignal.timeout(12000)});
      if(r.ok){const t=await r.text();if(t&&t.length>100)return t;}
    }catch(e){}
  }
  throw new Error('Falha em todos os proxies');
}

// Extrai metadados do HTML: título + melhor imagem (prioriza webp h220x220)
function steamParse(html,baseUrl){
  const doc=new DOMParser().parseFromString(html,'text/html');
  let name=(doc.querySelector('meta[property="og:title"]')?.content
    ||doc.querySelector('title')?.textContent
    ||'Jogo').trim().replace(/\s*[\|\-–·]\s*.*$/,'').slice(0,80);
  // Procura imagem: 1) padrão snowriderio cache 2) og:image 3) primeira webp/png grande
  let img=null;
  const allImgs=[...doc.querySelectorAll('img')].map(i=>i.getAttribute('src')||i.getAttribute('data-src')).filter(Boolean);
  img=allImgs.find(s=>/h220x220\.webp|cache\/data\/image\/game\//i.test(s))
    ||doc.querySelector('meta[property="og:image"]')?.content
    ||doc.querySelector('meta[name="twitter:image"]')?.content
    ||allImgs.find(s=>/\.(webp|jpg|jpeg|png)$/i.test(s));
  if(img&&!/^https?:/.test(img)){try{img=new URL(img,baseUrl).href}catch(e){}}
  return {name,icon:img||'',cover:img||''};
}

// Descobre links de jogos a partir de um site raiz
function steamDiscover(html,baseUrl){
  const doc=new DOMParser().parseFromString(html,'text/html');
  const host=new URL(baseUrl).host;
  const links=new Set();
  doc.querySelectorAll('a[href]').forEach(a=>{
    try{const h=a.getAttribute('href');if(!h||h.startsWith('#')||h.startsWith('javascript'))return;
      const u=new URL(h,baseUrl);
      if(u.host!==host)return;
      const p=u.pathname;
      // heurística: caminhos de jogo (não index, não categoria)
      if(p==='/'||p.length<4)return;
      if(/^\/(privacy|terms|about|contact|category|tag|page|games?\/?$)/i.test(p))return;
      if(/\/$/.test(p)&&p.split('/').filter(Boolean).length<2)return;
      links.add(u.href.split('#')[0].split('?')[0]);
    }catch(e){}
  });
  return [...links].slice(0,40);
}

function steamLog(msg,cls=''){const el=document.getElementById('st-log');if(!el)return;el.classList.add('show');el.innerHTML+=`<div class="${cls}">${msg}</div>`;el.scrollTop=el.scrollHeight;}

window.steamAddGame=async function(url){
  url=url.trim();if(!url)return;
  if(!/^https?:/.test(url))url='https://'+url;
  steamLog('→ Analisando '+url,'in');
  try{
    const html=await steamFetch(url);
    const meta=steamParse(html,url);
    const lib=steamLoad();
    if(lib.some(g=>g.url===url)){steamLog('⚠ Já está na biblioteca','er');return;}
    lib.push({id:'g_'+Math.random().toString(36).slice(2,9),name:meta.name,url,icon:meta.icon,cover:meta.cover,added:Date.now(),plays:0});
    steamSave(dedupeGames(lib));
    steamLog('✓ Adicionado: '+meta.name,'ok');
    if(document.getElementById('st-grid'))steamRender('library');
    toast('🎮 '+meta.name+' adicionado à biblioteca','success');
  }catch(e){steamLog('✗ Erro: '+e.message,'er');}
};

window.steamCrawlSite=async function(url){
  url=url.trim();if(!url)return;
  if(!/^https?:/.test(url))url='https://'+url;
  steamLog('🔎 Explorando '+url,'in');
  try{
    const html=await steamFetch(url);
    const links=steamDiscover(html,url);
    steamLog('Encontrados '+links.length+' links candidatos','in');
    // Adiciona fonte
    const srcs=steamSources();if(!srcs.includes(url)){srcs.push(url);steamSaveSrc(srcs);}
    let added=0;
    for(const l of links.slice(0,15)){
      const lib=steamLoad();
      if(lib.some(g=>g.url===l)){continue;}
      try{
        const h=await steamFetch(l);
        const m=steamParse(h,l);
        if(!m.icon){steamLog('  ⊘ sem imagem: '+l,'er');continue;}
        lib.push({id:'g_'+Math.random().toString(36).slice(2,9),name:m.name,url:l,icon:m.icon,cover:m.icon,added:Date.now(),plays:0});
        steamSave(dedupeGames(lib));added++;
        steamLog('  ✓ '+m.name,'ok');
      }catch(e){steamLog('  ✗ '+l+' — '+e.message,'er');}
    }
    steamLog('✓ Concluído: '+added+' jogos novos','ok');
    if(document.getElementById('st-grid'))steamRender('library');
    toast('🎮 '+added+' jogos coletados','success');
  }catch(e){steamLog('✗ Erro: '+e.message,'er');}
};

window.steamRemove=function(id,e){e&&e.stopPropagation();
  const lib=steamLoad().filter(g=>g.id!==id);steamSave(lib);steamRender('library');};

window.steamPlay=function(id){
  const lib=steamLoad();const g=lib.find(x=>x.id===id);if(!g)return;
  g.plays=(g.plays||0)+1;g.lastPlay=Date.now();steamSave(lib);
  createWin(g.name,'<i class="fab fa-steam" style="color:#66c0f4"></i>',`<iframe src="${g.url}" style="border:none;width:100%;height:100%" allow="fullscreen;autoplay" title="${g.name}"></iframe>`,920,640);
};

window.steamFilter=function(q){
  q=q.toLowerCase();
  document.querySelectorAll('#st-grid .st-card').forEach(c=>{
    c.style.display=c.dataset.name.toLowerCase().includes(q)?'':'none';
  });
};

window.addGameTemplate=function(name,url,icon){
  const n=(name||'').trim();
  const u=(url||'').trim();
  if(!n||!u)return toast('Preencha nome e URL do template','error');
  S.gameTemplates=S.gameTemplates||[];
  S.gameTemplates.push({name:n,url:u,icon:icon||'',enabled:true});
  persistState();
  steamRender('store');
  toast('Template adicionado ✨','success');
};
window.removeGameTemplate=function(index){
  S.gameTemplates=S.gameTemplates||[];
  S.gameTemplates.splice(index,1);
  persistState();
  steamRender('store');
};
window.steamRender=function(view){
  const main=document.getElementById('st-main');if(!main)return;
  document.querySelectorAll('.st-nv').forEach(n=>n.classList.toggle('ac',n.dataset.view===view));
  const lib=steamLoad();
  if(view==='library'){
    const items=lib.slice().sort((a,b)=>(b.lastPlay||b.added)-(a.lastPlay||a.added));
    main.innerHTML=`
      <div class="st-hdr"><h2>BIBLIOTECA · ${items.length} jogos</h2>
        <input class="st-srch" placeholder="Buscar na biblioteca..." oninput="steamFilter(this.value)"></div>
      <div class="st-content">
        ${items.length?`<div class="st-grid" id="st-grid">${items.map(g=>`
          <div class="st-card" data-name="${(g.name||'').replace(/"/g,'&quot;')}" onclick="steamPlay('${g.id}')">
            <button class="del" onclick="steamRemove('${g.id}',event)" title="Remover"><i class="fas fa-times"></i></button>
            ${g.cover?`<img class="cv" src="${g.cover}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" alt="">`:''}
            <div class="fb" style="${g.cover?'display:none':''}">${(g.name||'?')[0].toUpperCase()}</div>
            <div class="meta"><div class="ttl">${g.name}</div><div class="sub"><span>${g.plays||0} sessões</span><span><i class="fab fa-steam"></i></span></div></div>
          </div>`).join('')}</div>`:`
          <div class="st-empty"><i class="fas fa-gamepad"></i><div>Sua biblioteca está vazia</div>
          <div style="margin-top:8px;font-size:.82rem">Vá em <b>LOJA</b> e colete jogos automaticamente</div></div>`}
      </div>`;
  } else if(view==='store'){
    const srcs=steamSources();
    main.innerHTML=`
      <div class="st-hdr"><h2>LOJA · Coletor Automático</h2></div>
      <div class="st-content">
        <div class="st-hero">
          <h1><i class="fas fa-magnifying-glass-chart"></i> Coletar jogos de um site</h1>
          <p>Cole a URL de um <b>jogo individual</b> ou de um <b>site inteiro</b>. O sistema baixa o HTML, extrai o título via &lt;title&gt;, encontra a imagem e adiciona à sua biblioteca automaticamente.</p>
          <div class="st-form">
            <input id="st-url" placeholder="https://snowriderio.io/escape-raid" onkeypress="if(event.key==='Enter')steamAddGame(document.getElementById('st-url').value)">
            <button class="st-btn" onclick="steamAddGame(document.getElementById('st-url').value)"><i class="fas fa-plus"></i> Adicionar jogo</button>
            <button class="st-btn sec" onclick="steamCrawlSite(document.getElementById('st-url').value)"><i class="fas fa-spider"></i> Explorar site inteiro</button>
          </div>
          <div class="st-form" style="margin-top:10px">
            <input id="st-template-name" placeholder="Nome do template">
            <input id="st-template-url" placeholder="URL do jogo">
            <input id="st-template-icon" placeholder="Ícone/opcional">
            <button class="st-btn" onclick="window.addGameTemplate(document.getElementById('st-template-name').value,document.getElementById('st-template-url').value,document.getElementById('st-template-icon').value)"><i class="fas fa-layer-group"></i> Salvar template</button>
          </div>
          <div class="st-log" id="st-log"></div>
        </div>
        <div class="st-sec-h"><h3>Templates salvos</h3><span>${(S.gameTemplates||[]).length} itens</span></div>
        ${(S.gameTemplates||[]).length?`<div class="st-grid">${(S.gameTemplates||[]).map((t,i)=>`<div class="st-card"><div class="meta"><div class="ttl">${t.name}</div><div class="sub"><span>${t.url}</span></div></div><button class="del" onclick="window.removeGameTemplate(${i})"><i class="fas fa-times"></i></button></div>`).join('')}</div>`:'<div class="st-hero"><p>Nenhum template salvo. Use o formulário acima para automatizar a coleta.</p></div>'}
        <div class="st-sec-h"><h3>Fontes salvas</h3><span>${srcs.length} sites</span></div>
        ${srcs.map(s=>`<div class="st-src"><i class="fas fa-globe" style="color:#66c0f4"></i><div class="url">${s}</div><span class="cnt">${lib.filter(g=>{try{return new URL(g.url).host===new URL(s).host}catch(e){return false}}).length} jogos</span><button onclick="steamRmSrc('${s.replace(/'/g,"\\'")}')">Remover</button><button class="st-btn" style="padding:4px 9px" onclick="steamCrawlSite('${s.replace(/'/g,"\\'")}')">Recoletar</button></div>`).join('')}
        <div class="st-sec-h"><h3>Sites recomendados</h3></div>
        ${['https://snowriderio.io','https://azgames.io','https://classicgamezone.com','https://1v1-lol.gitlab.io'].map(s=>`<div class="st-src"><i class="fas fa-star" style="color:#f1c40f"></i><div class="url">${s}</div><button class="st-btn" style="padding:4px 9px" onclick="steamCrawlSite('${s}')">Coletar</button></div>`).join('')}
      </div>`;
  } else if(view==='community'){
    main.innerHTML=`
      <div class="st-hdr"><h2>COMUNIDADE</h2></div>
      <div class="st-content">
        <div class="st-grid">
          ${['Discussões','Capturas','Guias','Vídeos','Workshop','Mercado'].map(t=>`
            <div class="st-card" onclick="toast('🚧 ${t} em breve')"><div class="fb"><i class="fas fa-users"></i></div><div class="meta"><div class="ttl">${t}</div><div class="sub"><span>VessieOS</span></div></div></div>`).join('')}
        </div>
        <div class="st-hero" style="margin-top:18px"><h1>Atividade dos amigos</h1><p>💜 <b>${S.user||'Você'}</b> jogou ${lib.reduce((s,g)=>s+(g.plays||0),0)} sessões no total. <b>Vessie</b> está jogando agora. <b>Sistema</b> recomenda explorar a Loja!</p></div>
      </div>`;
  } else if(view==='downloads'){
    main.innerHTML=`
      <div class="st-hdr"><h2>DOWNLOADS</h2></div>
      <div class="st-content">
        <div class="st-hero"><h1>Nenhum download em andamento</h1><p>Jogos no VessieOS Steam são <b>baseados em web</b> — não precisam de download. Tudo roda instantaneamente via iframe seguro.</p></div>
        <div class="st-sec-h"><h3>Histórico de coleta</h3><span>${lib.length} itens na biblioteca</span></div>
        ${lib.slice().sort((a,b)=>b.added-a.added).slice(0,10).map(g=>`<div class="st-src"><img src="${g.icon}" style="width:28px;height:28px;border-radius:3px;object-fit:cover" onerror="this.style.display='none'"><div class="url">${g.name}</div><span class="cnt">${new Date(g.added).toLocaleDateString('pt-BR')}</span></div>`).join('')}
      </div>`;
  } else if(view==='friends'){
    main.innerHTML=`
      <div class="st-hdr"><h2>AMIGOS</h2></div>
      <div class="st-content">
        ${[{n:'Vessie',s:'Online',c:'#5cb85c',g:'Jogando Vessie IA 💜'},{n:'Sistema',s:'Ocupado',c:'#f1c40f',g:'Em manutenção'},{n:'Guest',s:'Offline',c:'#67708a',g:''}].map(f=>`
          <div class="st-src"><div style="width:38px;height:38px;border-radius:4px;background:linear-gradient(135deg,${f.c},#1b2838);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">${f.n[0]}</div><div class="url"><b style="color:${f.c}">${f.n}</b><div style="font-size:.74rem;color:#67708a">${f.s} · ${f.g}</div></div></div>`).join('')}
      </div>`;
  }
};

window.steamRmSrc=function(s){const x=steamSources().filter(u=>u!==s);steamSaveSrc(x);steamRender('store');};

function openGames(){
  const lib=steamLoad();
  const win=createWin('Steam','<i class="fab fa-steam" style="color:#66c0f4"></i>',`
    <div class="steam">
      <div class="st-sb">
        <div class="st-logo"><i class="fab fa-steam"></i><b>STEAM</b></div>
        <div class="st-nav">
          <div class="st-nv ac" data-view="library" onclick="steamRender('library')"><i class="fas fa-gamepad"></i> Biblioteca</div>
          <div class="st-nv" data-view="store" onclick="steamRender('store')"><i class="fas fa-store"></i> Loja</div>
          <div class="st-nv" data-view="community" onclick="steamRender('community')"><i class="fas fa-users"></i> Comunidade</div>
          <div class="st-nv" data-view="downloads" onclick="steamRender('downloads')"><i class="fas fa-download"></i> Downloads</div>
          <div class="st-nv" data-view="friends" onclick="steamRender('friends')"><i class="fas fa-user-friends"></i> Amigos</div>
        </div>
        <div class="st-user"><div class="av">${(S.user||'V')[0].toUpperCase()}</div><div><div style="color:#fff">${S.user||'Visitante'}</div><div style="font-size:.7rem;color:#5cb85c">● Online</div></div></div>
      </div>
      <div class="st-main" id="st-main"></div>
    </div>
  `,900,620);
  setTimeout(()=>steamRender('library'),50);
  return win;
}

window.launchGame=function(url,name){return createWin(name,'<i class="fab fa-steam"></i>',`<iframe src="${url}" style="border:none;width:100%;height:100%;border-radius:0" allow="fullscreen;autoplay" title="${name}"></iframe>`,880,620);};
window.filterGames=function(q){document.querySelectorAll('#games-grid .gm').forEach(g=>{g.style.display=g.querySelector('span').textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});};

// ============================================================
//  BROWSER
// ============================================================
function openBrowser(){
  const win=createWin('Chrome','🌐',`
    <div class="brow">
      <div class="brow-bar">
        <button class="bnav" onclick="this.closest('.win').querySelector('.brow-frame').contentWindow.history.back()"><i class="fas fa-arrow-left"></i></button>
        <button class="bnav" onclick="this.closest('.win').querySelector('.brow-frame').contentWindow.history.forward()"><i class="fas fa-arrow-right"></i></button>
        <button class="bnav" onclick="this.closest('.win').querySelector('.brow-frame').src=this.closest('.win').querySelector('.brow-frame').src"><i class="fas fa-redo"></i></button>
        <input class="url-input" id="brow-url" value="https://www.google.com/webhp?igu=1" onkeypress="if(event.key==='Enter')navTo(this)">
        <button class="bnav" onclick="navTo(this.closest('.brow-bar').querySelector('.url-input'))"><i class="fas fa-arrow-right" style="color:var(--a)"></i></button>
      </div>
      <iframe class="brow-frame" src="https://www.google.com/webhp?igu=1" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation" title="Browser"></iframe>
    </div>
  `,860,600);
  win.querySelector('.brow-frame').addEventListener('load',()=>{
    const url=win.querySelector('.brow-frame').src;
    const input=win.querySelector('#brow-url');
    if(input)input.value=url;
  });
  return win;
}

window.navTo=function(inp){let url=inp.value.trim();if(!url.startsWith('http'))url='https://'+url;const frame=inp.closest('.brow').querySelector('.brow-frame');if(frame){frame.src=url;toast('Navegando...');}};

// ============================================================
//  NOTEPAD
// ============================================================
function openNotepad(){return openNotepadWithContent('Bloco de Notas','');}
window.saveNotepad=function(btn){const text=btn.closest('.npad').querySelector('.npad-area').value;const blob=new Blob([text],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='documento.txt';a.click();toast('Arquivo salvo! 💾','success');};
window.copyNotepad=function(btn){const text=btn.closest('.npad').querySelector('.npad-area').value;navigator.clipboard.writeText(text).then(()=>toast('Copiado! 📋','success'));};
window.updateWC=function(ta,id){const wc=ta.value.trim().split(/\s+/).filter(w=>w).length;const el=document.getElementById(`wc-${id}`);if(el)el.textContent=`${wc} palavras`;};

// ============================================================
//  CALCULATOR
// ============================================================
function openCalc(){
  const win=createWin('Calculadora','🔢',`
    <div class="calc">
      <div class="c-disp"><div class="c-expr" id="c-expr"></div><div class="c-val" id="c-val">0</div></div>
      <div class="c-grid" id="c-grid"></div>
    </div>
  `,320,460);
  const BTNS=[['cl','C','clear'],['op','±','op'],['op','%','op'],['op','÷','op'],['','7','num'],['','8','num'],['','9','num'],['op','×','op'],['','4','num'],['','5','num'],['','6','num'],['op','−','op'],['','1','num'],['','2','num'],['','3','num'],['op','+','op'],['','0','num','zero'],['','.','num'],['eq','=','eq']];
  const grid=win.querySelector('#c-grid');
  let cur='0',expr='',waitNext=false;
  BTNS.forEach(([cls,lbl,type,extra])=>{
    const btn=document.createElement('button');
    btn.className=`cb${cls?' '+cls:''}${extra?' '+extra:''}`;
    btn.textContent=lbl;
    btn.onclick=()=>{
      const vEl=win.querySelector('#c-val');const eEl=win.querySelector('#c-expr');
      if(type==='clear'){cur='0';expr='';waitNext=false;}
      else if(lbl==='±'){cur=(parseFloat(cur)*-1).toString();}
      else if(lbl==='%'){cur=(parseFloat(cur)/100).toString();}
      else if(type==='op'){expr=cur+' '+lbl+' ';waitNext=true;}
      else if(type==='eq'){try{const e=expr.replace('÷','/').replace('×','*').replace('−','-')+cur;cur=String(Function('"use strict";return('+e+')')());if(cur.length>12)cur=parseFloat(cur).toExponential(4);}catch{cur='Erro';}expr='';waitNext=false;}
      else{if(waitNext){cur=lbl==='.'?'0.':lbl;waitNext=false;}else{cur=cur==='0'&&lbl!=='.'?lbl:(cur+lbl);}}
      vEl.textContent=cur;eEl.textContent=expr;vEl.style.animation='pulse .15s ease';setTimeout(()=>vEl.style.animation='',150);
    };
    grid.appendChild(btn);
  });
  return win;
}

// ============================================================
//  TERMINAL
// ============================================================
function openTerminal(){
  const win=createWin('Terminal','💻',`
    <div class="term">
      <div class="t-out" id="term-out">
        <div class="ti">VessieOS Terminal [v3.0] — Digite <span style="color:#00e676">help</span> para ver os comandos</div>
        <div>🌸 Bem-vindo, ${S.user||'Visitante'}!</div>
      </div>
      <div class="t-bar">
        <span class="t-prompt" id="t-prompt">${S.user||'visitante'}@vessieos:~$</span>
        <input class="t-inp" id="t-inp" placeholder="Digite um comando..." autocomplete="off" spellcheck="false">
      </div>
    </div>
  `,640,420);
  const out=win.querySelector('#term-out');const inp=win.querySelector('#t-inp');
  inp.focus();
  const append=(txt,cls='')=>{const d=document.createElement('div');d.className=cls;d.innerHTML=txt;out.appendChild(d);out.scrollTop=out.scrollHeight;};
  const CMDS={
    help:()=>append(`<span class="ti">Comandos disponíveis:</span><br><span class="tc2">dir</span> — listar arquivos | <span class="tc2">cd [pasta]</span> — mudar diretório<br><span class="tc2">md [nome]</span> — nova pasta | <span class="tc2">del [nome]</span> — deletar arquivo<br><span class="tc2">echo [texto]</span> — exibir texto | <span class="tc2">cls</span> — limpar tela<br><span class="tc2">vessieos</span> — info do sistema | <span class="tc2">matrix</span> — efeito matrix<br><span class="tc2">date</span> — data/hora | <span class="tc2">hello</span> — oi da Vessie | <span class="tc2">exit</span> — fechar`),
    dir:()=>{const f=S.fs[S.currentPath]||{};if(!Object.keys(f).length){append('<span class="ti">Pasta vazia</span>');return;}Object.entries(f).forEach(([n,v])=>{append(`  <span style="color:${v&&typeof v==='object'?'#ffb74d':'#7eb6ff'}">${v&&typeof v==='object'?'📁':'📄'} ${n}</span>`);});},
    date:()=>append(`<span class="ti">${new Date().toLocaleString('pt-BR')}</span>`),
    vessieos:()=>append(`<span class="ti">VessieOS v3.0 | Kernel: VessieOS-NT | Usuário: ${S.user}</span>`),
    cls:()=>{out.innerHTML='';},
    hello:()=>append('<span style="color:#ff88cc">Oi! Sou a Vessie! 💜 Aqui no terminal também! 🌸</span>'),
    matrix:()=>{
      append('<span class="ti">Iniciando Matrix...</span>');let i=0;
      const chars='アイウエオカキクケコ0101ABCDEF!@#$';
      const iv=setInterval(()=>{
        const line=Array.from({length:60},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
        append(`<span style="color:#00e676;font-size:.7rem">${line}</span>`);
        if(++i>20){clearInterval(iv);append('<span class="ti">Saindo da Matrix...</span>');}
        out.scrollTop=out.scrollHeight;
      },80);
    },
    exit:()=>{win.querySelector('.cl').click();}
  };
  inp.addEventListener('keypress',e=>{
    if(e.key!=='Enter')return;const raw=inp.value.trim();if(!raw)return;
    append(`<span class="tc2">${S.user||'visitante'}@vessieos:~$ ${escHtml(raw)}</span>`);
    const [cmd,...args]=raw.split(' ');
    if(CMDS[cmd])CMDS[cmd](args);
    else if(cmd==='echo')append(args.join(' '));
    else if(cmd==='md'){const n=args[0];if(n){if(!S.fs[S.currentPath])S.fs[S.currentPath]={};S.fs[S.currentPath][n]={};append(`Pasta "${n}" criada`,'ti');}}
    else if(cmd==='cd'){if(args[0]==='..'){S.currentPath='Desktop';append(`C:\\Desktop`,'ti');}else{S.currentPath=args[0]||'Desktop';append(`C:\\${S.currentPath}`,'ti');}}
    else append(`<span class="te">'${cmd}' não é reconhecido como comando interno. Digite 'help'.</span>`);
    inp.value='';
  });
  return win;
}

// ============================================================
//  SETTINGS
// ============================================================
function openSettings(){
  return createWin('Configurações','⚙️',`
    <div class="sett">
      <div class="s-sec">
        <h3><i class="fas fa-image"></i> Papel de Parede</h3>
        <div id="wall-tabs">${['Natureza','Tech','Futurista'].map(tab=>`<button class="wall-tab ${tab==='Natureza'?'active':''}" onclick="renderWallPanel('${tab}')">${tab}</button>`).join('')}</div>
        <div style="margin:8px 0 12px;color:var(--dim);font-size:.78rem">Wallpapers pré-definidos. Ou adicione uma URL personalizada abaixo.</div>
        <div class="wg" id="wall-grid"></div>
        <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
          <input id="custom-wall" placeholder="URL personalizada..." style="flex:1;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:white;outline:none;font-size:.83rem">
          <button onclick="applyWall(document.getElementById('custom-wall').value,null)" style="background:var(--a);border:none;color:white;padding:8px 16px;border-radius:8px;font-size:.83rem;cursor:pointer">Aplicar</button>
        </div>
      </div>
      <div class="s-sec">
        <h3><i class="fas fa-palette"></i> Temas do Sistema</h3>
        <div class="theme-grid">
          ${[
            ['Win11 Blue','#60a5fa','#a78bfa','#3b82f6'],
            ['Win11 Light','#0078d4','#005a9e','#106ebe'],
            ['macOS Sonoma','#0a84ff','#bf5af2','#5e5ce6'],
            ['macOS Graphite','#8e8e93','#aeaeb2','#636366'],
            ['Ubuntu Yaru','#e95420','#f4a261','#77216f'],
            ['Fedora Blue','#3c6eb4','#79b8ff','#2b5797'],
            ['Pop!_OS Teal','#48b9c7','#5fdde5','#1a8a98'],
            ['Linux Mint','#87cf3e','#b8e986','#5a9a2a'],
            ['Dracula','#bd93f9','#ff79c6','#8be9fd'],
            ['Nord','#88c0d0','#81a1c1','#5e81ac'],
            ['Tokyo Night','#7aa2f7','#bb9af7','#7dcfff'],
            ['Catppuccin','#cba6f7','#f5c2e7','#89b4fa'],
            ['Synthwave','#ff007c','#00f5d4','#fee440'],
            ['Solarized','#268bd2','#2aa198','#b58900'],
            ['Gruvbox','#fabd2f','#fe8019','#b8bb26'],
            ['VessieOS','#a78bfa','#f0abfc','#60a5fa']
          ].map(([n,c1,c2,c3])=>`<div class="theme-card" title="${n}" onclick="applyTheme('${n}','${c1}','${c2}','${c3}',this)"><div class="tc-pre" style="background:linear-gradient(135deg,${c1},${c2} 60%,${c3})"></div><span>${n}</span></div>`).join('')}
        </div>
      </div>
      <div class="s-sec">
        <h3><i class="fas fa-sliders-h"></i> Preferências</h3>
        <div class="s-row"><label><i class="fas fa-moon"></i> Modo Escuro</label><label class="tog"><input type="checkbox" checked onchange="toggleDark(this)"><span class="sl"></span></label></div>
        <div class="s-row"><label><i class="fas fa-bell"></i> Notificações</label><label class="tog"><input type="checkbox" checked><span class="sl"></span></label></div>
        <div class="s-row"><label><i class="fas fa-magic"></i> Animações</label><label class="tog"><input type="checkbox" checked><span class="sl"></span></label></div>
        <div class="s-row"><label><i class="fas fa-volume-up"></i> Sons do Sistema</label><label class="tog"><input type="checkbox" ${S.sounds?'checked':''} onchange="S.sounds=this.checked;persistState();toast('Sons '+(this.checked?'ativados':'desativados'),'success')"><span class="sl"></span></label></div>
        <div class="s-row"><label><i class="fas fa-image"></i> Ícone personalizado</label><input id="icon-url" value="${S.iconImageUrl||''}" placeholder="URL de imagem" style="flex:1;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:white;outline:none;font-size:.83rem"></div>
        <div class="s-row"><label><i class="fas fa-expand-arrows-alt"></i> Tamanho dos ícones</label><select id="icon-size" onchange="applyDesktopIconSize(this.value)" style="background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:white"><option value="small" ${S.desktopIconSize==='small'?'selected':''}>Pequeno</option><option value="medium" ${S.desktopIconSize==='medium'?'selected':''}>Médio</option><option value="large" ${S.desktopIconSize==='large'?'selected':''}>Grande</option></select></div>
        <div class="s-row"><label><i class="fas fa-file-export"></i> Exportar/VOS</label><div style="display:flex;gap:8px"><button onclick="window.exportVessieData()" style="background:rgba(255,255,255,.06);border:1px solid var(--border);color:white;padding:8px 10px;border-radius:8px;cursor:pointer">Exportar</button><label style="background:rgba(255,255,255,.06);border:1px solid var(--border);color:white;padding:8px 10px;border-radius:8px;cursor:pointer">Importar<input type="file" accept="application/json" onchange="window.importVessieData(this.files[0])" style="display:none"></label></div></div>
      </div>
      <div class="s-sec">
        <h3><i class="fas fa-info-circle"></i> Sobre o VessieOS</h3>
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:16px;color:var(--dim);font-size:.85rem;line-height:1.8">
          <strong style="color:white">VessieOS v3.0</strong><br>
          Simulador Windows 11 Ultra com IA Integrada<br>
          Usuário: <span style="color:var(--a)">${S.user}</span><br>
          Build: 26100.3915 · 21/05/2026<br>
          <button onclick="location.reload()" style="margin-top:12px;background:rgba(244,67,54,.15);border:none;color:#f44336;padding:6px 16px;border-radius:8px;font-size:.82rem;cursor:pointer"><i class="fas fa-power-off"></i> Reiniciar Sistema</button>
        </div>
      </div>
    </div>
  `,640,560);
  setTimeout(()=>renderWallPanel('Natureza'),50);
  return win;
}

function getWallCategory(w){
  if(w?.c) return w.c;
  const t=(w?.n||'').toLowerCase();
  if(t.includes('tech')||t.includes('neon')||t.includes('city')||t.includes('cyber')||t.includes('digital')||t.includes('grid'))return'Tech';
  if(t.includes('space')||t.includes('galaxy')||t.includes('aurora')||t.includes('desert')||t.includes('cosmic')||t.includes('solar')||t.includes('polar'))return'Futurista';
  return'Natureza';
}

function renderWallPanel(category){
  const grid=document.getElementById('wall-grid');
  if(!grid)return;
  const walls=ensureWallpapers(S.wallpapers||WALLS).filter(w=>getWallCategory(w)===category);
  grid.innerHTML=walls.map(w=>`<div class="wt ${S.wallpaper===w.u?'ac':''}" onclick="applyWall('${w.u}',this)" title="${w.n}">
    <div class="wt-preview" style="background-image:url('${w.u}')"></div>
    <div class="wt-name">${w.n}</div>
  </div>`).join('');
  document.querySelectorAll('.wall-tab').forEach(btn=>btn.classList.toggle('active',btn.textContent===category));
}

window.applyWall=function(url,el){
  if(!url)return;
  setWall(url);
  document.querySelectorAll('.wt').forEach(w=>w.classList.remove('ac'));
  if(el)el.classList.add('ac');
  persistState();
  toast('Papel de parede aplicado! 🖼️','success');
};
window.applyAccent=function(color,el){document.documentElement.style.setProperty('--a',color);document.querySelectorAll('.clr-swatch').forEach(s=>s.classList.remove('ac'));if(el)el.classList.add('ac');toast('Cor aplicada! 🎨','success');};
window.applyTheme=function(name,c1,c2,c3,el){const r=document.documentElement.style;r.setProperty('--a',c1);r.setProperty('--a2',c2);r.setProperty('--a3',c3||c1);const hex=c1.replace('#','');const R=parseInt(hex.substr(0,2),16),G=parseInt(hex.substr(2,2),16),B=parseInt(hex.substr(4,2),16);r.setProperty('--acc-glow',`rgba(${R},${G},${B},.42)`);document.querySelectorAll('.theme-card').forEach(s=>s.classList.remove('ac'));if(el)el.classList.add('ac');try{localStorage.setItem('vos-theme',JSON.stringify({name,c1,c2,c3}));}catch(_){}toast('Tema '+name+' aplicado ✨','success');};
(function(){try{const t=JSON.parse(localStorage.getItem('vos-theme')||'null');if(t)applyTheme(t.name,t.c1,t.c2,t.c3,null);}catch(_){}})();
window.toggleDark=function(inp){document.body.style.filter=inp.checked?'':'invert(1) hue-rotate(180deg)';};

// ============================================================
//  MUSIC PLAYER
// ============================================================
function openMusic(){
  const win=createWin('Music Player','🎵',`
    <div class="mplayer">
      <div class="mc-cover" id="mc-cover">🎵</div>
      <audio id="mc-audio" preload="metadata"></audio>
      <div><div class="mc-title" id="mc-title">${TRACKS[0].t}</div><div class="mc-art" id="mc-art">${TRACKS[0].a}</div></div>
      <div class="mc-prog">
        <div class="mc-prog-bar" onclick="seekTrack(event,this)"><div class="mc-prog-fill" id="mc-fill" style="width:0%"></div></div>
      </div>
      <div class="mc-time"><span id="mc-cur">0:00</span><span id="mc-dur">${fmtTime(TRACKS[0].dur)}</span></div>
      <div class="mc-ctrl">
        <button onclick="mcPrev()"><i class="fas fa-step-backward"></i></button>
        <button onclick="mcShuffle()"><i class="fas fa-random"></i></button>
        <button class="mc-play" id="mc-play" onclick="mcToggle()"><i class="fas fa-play" id="mc-play-ico"></i></button>
        <button onclick="mcRepeat()"><i class="fas fa-redo"></i></button>
        <button onclick="mcNext()"><i class="fas fa-step-forward"></i></button>
      </div>
      <div class="mc-vol">
        <i class="fas fa-volume-down" style="color:var(--dim)"></i>
        <input type="range" min="0" max="100" value="70" oninput="S.volume=this.value;document.getElementById('mc-audio').volume=this.value/100">
        <i class="fas fa-volume-up" style="color:var(--dim)"></i>
      </div>
      <div class="mc-tracklist">${TRACKS.map((t,i)=>`<div class="mc-track ${i===S.musTrack?'active':''}" onclick="S.musTrack=${i};updateMusicUI();if(S.musPlaying)playCurrentTrack();">${t.t} <span>${t.a}</span></div>`).join('')}</div>
    </div>
  `,390,560);
  updateMusicUI();
  if(S.musPlaying)playCurrentTrack();return win;
}

function fmtTime(s){return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function playCurrentTrack(){
  const audio=document.getElementById('mc-audio');
  const tr=TRACKS[S.musTrack];
  if(!audio||!tr?.src)return;
  audio.src=tr.src;
  audio.volume=(S.volume||70)/100;
  audio.currentTime=0;
  audio.play().catch(()=>{});
  updateMusicUI();
}
window.mcToggle=function(){
  S.musPlaying=!S.musPlaying;
  const ico=document.getElementById('mc-play-ico');const cover=document.getElementById('mc-cover');
  if(ico)ico.className=`fas fa-${S.musPlaying?'pause':'play'}`;
  if(cover)cover.classList.toggle('playing',S.musPlaying);
  if(S.musPlaying)playCurrentTrack();else document.getElementById('mc-audio')?.pause();
};
window.mcNext=function(){S.musTrack=(S.musTrack+1)%TRACKS.length;S.musProg=0;updateMusicUI();if(S.musPlaying)playCurrentTrack();};
window.mcPrev=function(){S.musTrack=(S.musTrack-1+TRACKS.length)%TRACKS.length;S.musProg=0;updateMusicUI();if(S.musPlaying)playCurrentTrack();};
window.mcShuffle=function(){S.musTrack=Math.floor(Math.random()*TRACKS.length);S.musProg=0;updateMusicUI();if(S.musPlaying)playCurrentTrack();toast('Faixa aleatória! 🎵');};
window.mcRepeat=function(){const audio=document.getElementById('mc-audio');if(audio){audio.currentTime=0;audio.play().catch(()=>{});}S.musProg=0;toast('Repetindo faixa 🔁');};
window.seekTrack=function(e,bar){const audio=document.getElementById('mc-audio');S.musProg=Math.floor((e.offsetX/bar.offsetWidth)*TRACKS[S.musTrack].dur);if(audio){audio.currentTime=S.musProg;}};
function updateMusicUI(){
  const tr=TRACKS[S.musTrack];
  const t=document.getElementById('mc-title');const a=document.getElementById('mc-art');const d=document.getElementById('mc-dur');
  document.querySelectorAll('.mc-track').forEach((el,i)=>el.classList.toggle('active',i===S.musTrack));
  if(t)t.textContent=tr.t;if(a)a.textContent=tr.a;if(d)d.textContent=fmtTime(tr.dur);
}

// ============================================================
//  CAMERA
// ============================================================
function openCamera(){
  return createWin('Câmera','📷',`
    <div style="display:flex;flex-direction:column;height:100%;align-items:center;justify-content:center;background:#050508;gap:16px;padding:20px">
      <video id="cam-video" autoplay playsinline style="border-radius:14px;max-width:100%;max-height:340px;background:#1a1a2a"></video>
      <div style="display:flex;gap:12px">
        <button onclick="startCam()" style="background:var(--a);border:none;color:white;padding:10px 20px;border-radius:30px;cursor:pointer"><i class="fas fa-camera"></i> Ligar</button>
        <button onclick="snapPhoto()" style="background:rgba(255,255,255,.1);border:none;color:white;padding:10px 20px;border-radius:30px;cursor:pointer"><i class="fas fa-circle"></i> Foto</button>
        <button onclick="stopCam()" style="background:rgba(244,67,54,.2);border:none;color:#f44336;padding:10px 20px;border-radius:30px;cursor:pointer"><i class="fas fa-stop"></i> Parar</button>
      </div>
      <canvas id="cam-canvas" style="display:none"></canvas>
    </div>
  `,600,460);
}

let camStream=null;
window.startCam=async function(){try{camStream=await navigator.mediaDevices.getUserMedia({video:true});const v=document.getElementById('cam-video');if(v){v.srcObject=camStream;toast('Câmera ligada! 📷','success');}}catch{toast('Câmera não disponível','error');}};
window.stopCam=function(){if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null;}const v=document.getElementById('cam-video');if(v)v.srcObject=null;};
window.snapPhoto=function(){const v=document.getElementById('cam-video');const c=document.getElementById('cam-canvas');if(!v||!c)return;c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);const a=document.createElement('a');a.download='foto.png';a.href=c.toDataURL();a.click();toast('Foto salva! 📸','success');};

// ============================================================
//  CONTEXT MENU
// ============================================================
document.getElementById('desktop').addEventListener('contextmenu',e=>{
  if(e.target.closest('.win')||e.target.closest('#tb'))return;
  e.preventDefault();const ctx=document.getElementById('ctx');ctx.style.display='block';
  const x=Math.min(e.clientX,window.innerWidth-210);const y=Math.min(e.clientY,window.innerHeight-52-280);
  ctx.style.left=x+'px';ctx.style.top=y+'px';
});
window.addEventListener('contextmenu',e=>{if(!e.target.closest('#desktop')||e.target.closest('.win'))e.preventDefault();});
document.addEventListener('click',e=>{if(!e.target.closest('#ctx'))document.getElementById('ctx').style.display='none';});
document.querySelectorAll('.cti[data-act]').forEach(el=>{
  el.onclick=()=>{
    const act=el.dataset.act;document.getElementById('ctx').style.display='none';
    if(act==='refresh')renderDesktop();
    else if(act==='newFolder'){const n=prompt('Nome da nova pasta:');if(n)toast(`Pasta "${n}" criada no desktop! 📁`,'success');}
    else if(act==='personalize')openApp('settings');
    else if(act==='terminal')openApp('terminal');
    else if(act==='taskManager')openTaskManager();
    else if(act==='about')openAbout();
  };
});

function openTaskManager(){
  const procs=[{n:'vessieos.exe',cpu:2.1,mem:128},{n:'browser.exe',cpu:12.4,mem:512},{n:'dashboard.exe',cpu:0.8,mem:64},{n:'games.exe',cpu:18.2,mem:256},{n:'terminal.exe',cpu:0.1,mem:32},{n:'music.exe',cpu:1.2,mem:48}];
  createWin('Gerenciador de Tarefas','📊',`
    <div style="padding:16px;height:100%;overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:.83rem">
        <thead><tr style="color:var(--dim);border-bottom:1px solid var(--border)"><th style="text-align:left;padding:8px 12px">Processo</th><th style="padding:8px 12px">CPU</th><th style="padding:8px 12px">Memória</th><th style="padding:8px 12px">Status</th></tr></thead>
        <tbody>${procs.map(p=>`<tr style="border-bottom:1px solid rgba(255,255,255,.04)"><td style="padding:9px 12px"><i class="fas fa-microchip" style="color:var(--a);margin-right:8px"></i>${p.n}</td><td style="padding:9px 12px;text-align:center">${p.cpu}%</td><td style="padding:9px 12px;text-align:center">${p.mem} MB</td><td style="padding:9px 12px;text-align:center"><span style="color:#4caf50;font-size:.75rem">●</span> Ativo</td></tr>`).join('')}</tbody>
      </table>
      <div style="margin-top:20px;background:rgba(255,255,255,.04);border-radius:12px;padding:16px">
        <div style="font-size:.82rem;color:var(--dim);margin-bottom:8px">Uso do Sistema</div>
        <div style="display:flex;gap:20px">
          <div><div style="font-size:.78rem;color:var(--dim)">CPU</div><div style="font-size:1.4rem;font-weight:600;color:var(--a2)">${(5+Math.random()*15).toFixed(1)}%</div></div>
          <div><div style="font-size:.78rem;color:var(--dim)">RAM</div><div style="font-size:1.4rem;font-weight:600;color:var(--a)">${(30+Math.random()*20).toFixed(0)}%</div></div>
          <div><div style="font-size:.78rem;color:var(--dim)">Disco</div><div style="font-size:1.4rem;font-weight:600;color:var(--a3)">${(2+Math.random()*5).toFixed(1)}%</div></div>
        </div>
      </div>
    </div>
  `,540,420);
}

function openAbout(){
  createWin('Sobre o VessieOS','💜',`
    <div style="padding:36px;text-align:center;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
      <div style="font-size:5rem;animation:pulse 2s ease infinite">💜</div>
      <h2 style="font-size:2rem;background:linear-gradient(135deg,var(--a),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent">VessieOS</h2>
      <p style="color:var(--dim);font-size:.9rem">Sistema Operacional Simulado · v3.0</p>
      <div style="background:rgba(255,255,255,.04);border-radius:16px;padding:20px;width:100%;max-width:360px;text-align:left;font-size:.85rem;line-height:2;color:#a0b0cc">
        <div>🌸 IA Vessie integrada (Anthropic Claude)</div>
        <div>🎮 ${GAMES.length}+ jogos disponíveis</div>
        <div>📊 Dashboard com métricas dinâmicas</div>
        <div>💻 Terminal com comandos reais</div>
        <div>🖼️ ${WALLS.length} papéis de parede HD</div>
        <div>🎵 Music Player com ${TRACKS.length} faixas</div>
        <div>📁 Sistema de arquivos virtual</div>
        <div>🎨 Temas e cores personalizáveis</div>
      </div>
      <p style="color:var(--dim);font-size:.78rem">Feito com 💜 usando HTML, CSS & JavaScript puro</p>
    </div>
  `,480,520);
}

document.getElementById('tb-search').onclick=()=>{const sm=document.getElementById('sm');sm.style.display='block';document.getElementById('sm-q').focus();};

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){document.getElementById('sm').style.display='none';document.getElementById('ctx').style.display='none';document.getElementById('np').classList.remove('open');}
  if(e.ctrlKey&&e.key==='t')openApp('terminal');
  if(e.ctrlKey&&e.key==='b')openApp('browser');
  if(e.ctrlKey&&e.key==='d')openApp('dashboard');
  if(e.ctrlKey&&e.key==='v')openApp('vessie');
});

let secretBuf='';
document.addEventListener('keydown',e=>{
  secretBuf+=e.key.toLowerCase();if(secretBuf.length>8)secretBuf=secretBuf.slice(-8);
  if(secretBuf.includes('veesie')){secretBuf='';document.getElementById('eg').style.display='flex';setTimeout(()=>document.getElementById('eg').style.display='none',4000);toast('🎉 Easter Egg ativado! VEESIE!','success');}
});


// ============================================================
//  ╔══════════════════════════════════════════════════════╗
//  ║  VESSIEOS ULTRA · MEGA ENHANCEMENT MODULE v4.0       ║
//  ║  Right-click submenus · Icon sizes · Trash · VMs     ║
//  ║  Palette extraction · Adaptive taskbar · Snap grid   ║
//  ╚══════════════════════════════════════════════════════╝
// ============================================================
(function ultra(){
  // ---------- INJECT STYLES ----------
  const css = document.createElement('style');
  css.textContent = `
  /* CONTEXT MENU SUBMENU */
  .cti.has-sub{position:relative;padding-right:26px}
  .cti.has-sub::after{content:'\\f105';font-family:'Font Awesome 6 Free';font-weight:900;position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:.7rem;color:var(--dim)}
  .cti.has-sub:hover>.csub,.csub.show{display:block}
  .csub{display:none;position:absolute;left:100%;top:-6px;background:rgba(14,16,28,.98);backdrop-filter:blur(22px);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:5px;box-shadow:0 15px 38px rgba(0,0,0,.8);min-width:190px;margin-left:4px}
  .csub.left{left:auto;right:100%;margin-left:0;margin-right:4px}
  .cti i.fa-check{margin-left:auto;color:var(--a2)}
  /* ICON SIZES */
  .di[data-sz="s"]{width:70px;padding:6px 4px;gap:4px}
  .di[data-sz="s"] .ic{width:38px;height:38px;font-size:20px;border-radius:10px}
  .di[data-sz="s"] label{font-size:10.5px;max-width:64px}
  .di[data-sz="m"]{width:90px}
  .di[data-sz="l"]{width:118px;padding:14px 8px;gap:9px}
  .di[data-sz="l"] .ic{width:78px;height:78px;font-size:44px;border-radius:18px}
  .di[data-sz="l"] label{font-size:13px;max-width:108px}
  .di[data-sz="xl"]{width:148px;padding:18px 10px}
  .di[data-sz="xl"] .ic{width:104px;height:104px;font-size:60px;border-radius:22px}
  .di[data-sz="xl"] label{font-size:14px;max-width:140px}
  .di .ic img,.di .ic{image-rendering:auto}
  /* SELECTION RECTANGLE */
  #selrect{position:absolute;border:1px solid rgba(126,182,255,.7);background:rgba(126,182,255,.13);pointer-events:none;display:none;z-index:5}
  /* ADAPTIVE TASKBAR */
  #tb{transition:background .6s ease,border-color .6s ease}
  #tb.tinted{background:var(--tb-tint, rgba(8,10,20,.85))!important}
  /* VM APP */
  .vm-wrap{display:flex;height:100%;background:#0b0d18;color:#e2e8f0;font-family:'Segoe UI',sans-serif}
  .vm-sb{width:210px;background:#0e1322;border-right:1px solid rgba(255,255,255,.05);padding:14px 10px;overflow-y:auto;flex-shrink:0}
  .vm-cat{font-size:.7rem;text-transform:uppercase;letter-spacing:1.2px;color:#5b6680;padding:10px 8px 6px}
  .vm-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:.84rem;color:#aab4cc;transition:.12s}
  .vm-item:hover{background:rgba(255,255,255,.05);color:#fff}
  .vm-item.ac{background:linear-gradient(90deg,rgba(126,182,255,.18),transparent);color:#fff;box-shadow:inset 3px 0 0 var(--a2)}
  .vm-item i{width:18px;color:var(--a2)}
  .vm-main{flex:1;display:flex;flex-direction:column;overflow:hidden}
  .vm-hero{padding:18px 22px;background:linear-gradient(135deg,#1a2240,#0e1322);border-bottom:1px solid rgba(255,255,255,.05)}
  .vm-hero h2{font-size:1.2rem;margin-bottom:4px;color:#fff}
  .vm-hero p{font-size:.82rem;color:#8898bb;line-height:1.5}
  .vm-frame{flex:1;background:#000;display:flex;align-items:center;justify-content:center;position:relative}
  .vm-frame iframe{width:100%;height:100%;border:0;background:#000}
  .vm-ph{text-align:center;color:#5b6680;padding:30px}
  .vm-ph i{font-size:3.5rem;margin-bottom:14px;display:block;color:#2a3556}
  .vm-actions{display:flex;gap:8px;padding:10px 22px;background:rgba(0,0,0,.3);border-bottom:1px solid rgba(255,255,255,.05);flex-wrap:wrap}
  .vm-btn{background:rgba(126,182,255,.13);border:1px solid rgba(126,182,255,.25);color:#fff;padding:6px 14px;border-radius:7px;font-size:.78rem;cursor:pointer;transition:.12s;display:flex;align-items:center;gap:6px}
  .vm-btn:hover{background:rgba(126,182,255,.25)}
  .vm-btn.danger{background:rgba(244,67,54,.13);border-color:rgba(244,67,54,.3)}
  /* TRASH */
  .trash-wrap{padding:18px;height:100%;overflow:auto}
  .trash-empty{text-align:center;padding:60px 20px;color:#5b6680}
  .trash-empty i{font-size:4rem;margin-bottom:14px;display:block;color:#2a3556}
  .trash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px}
  .trash-it{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:12px 8px;text-align:center;cursor:pointer;transition:.15s;position:relative}
  .trash-it:hover{background:rgba(255,255,255,.08);transform:translateY(-2px)}
  .trash-it i{font-size:2.2rem;color:var(--a2);margin-bottom:7px;display:block}
  .trash-it .nm{font-size:.78rem;color:#dde;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .trash-it .dt{font-size:.66rem;color:var(--dim);margin-top:3px}
  .trash-bar{display:flex;gap:9px;margin-bottom:14px;align-items:center;flex-wrap:wrap}
  /* APP THUMBNAIL ICON IMG SHARPNESS */
  .di .ic{image-rendering:-webkit-optimize-contrast}
  `;
  document.head.appendChild(css);

  // ---------- STATE ----------
  const LS = {
    sz:   ()=>localStorage.getItem('vos_icon_sz')||'m',
    setSz:v=>localStorage.setItem('vos_icon_sz',v),
    autoArr: ()=>localStorage.getItem('vos_icon_autoArr')!=='0',
    setAutoArr:v=>localStorage.setItem('vos_icon_autoArr',v?'1':'0'),
    snap: ()=>localStorage.getItem('vos_icon_snap')!=='0',
    setSnap:v=>localStorage.setItem('vos_icon_snap',v?'1':'0'),
    show: ()=>localStorage.getItem('vos_icon_show')!=='0',
    setShow:v=>localStorage.setItem('vos_icon_show',v?'1':'0'),
    pos: ()=>{try{return JSON.parse(localStorage.getItem('vos_icon_pos')||'{}')}catch{return{}}},
    setPos:o=>localStorage.setItem('vos_icon_pos',JSON.stringify(o)),
    order:()=>{try{return JSON.parse(localStorage.getItem('vos_icon_order')||'null')}catch{return null}},
    setOrder:a=>localStorage.setItem('vos_icon_order',JSON.stringify(a)),
    hidden:()=>{try{return JSON.parse(localStorage.getItem('vos_icon_hidden')||'[]')}catch{return[]}},
    setHidden:a=>localStorage.setItem('vos_icon_hidden',JSON.stringify(a)),
    trash:()=>{try{return JSON.parse(localStorage.getItem('vos_trash')||'[]')}catch{return[]}},
    setTrash:a=>localStorage.setItem('vos_trash',JSON.stringify(a)),
    customIcons:()=>{try{return JSON.parse(localStorage.getItem('vos_custom_icons')||'[]')}catch{return[]}},
    setCustomIcons:a=>localStorage.setItem('vos_custom_icons',JSON.stringify(a)),
  };
  const SZ_PX = {s:{w:80,h:80}, m:{w:100,h:110}, l:{w:130,h:140}, xl:{w:160,h:170}};

  // ---------- DESKTOP APPS LIST ----------
  const BASE_DESKTOP_APPS = [
    {id:'vessie',    n:'Vessie IA',   ic:'fas fa-heart',         bg:'linear-gradient(135deg,#c46fff,#7a3eb8)'},
    {id:'dashboard', n:'Dashboard',   ic:'fas fa-chart-line',    bg:'linear-gradient(135deg,#36d1dc,#5b86e5)'},
    {id:'games',     n:'Steam',       ic:'fab fa-steam',         bg:'linear-gradient(135deg,#1b2838,#66c0f4)'},
    {id:'browser',   n:'Navegador',   ic:'fas fa-globe',         bg:'linear-gradient(135deg,#4facfe,#00f2fe)'},
    {id:'explorer',  n:'Explorador',  ic:'fas fa-folder-open',   bg:'linear-gradient(135deg,#f6d365,#fda085)'},
    {id:'music',     n:'Música',      ic:'fas fa-music',         bg:'linear-gradient(135deg,#fa709a,#fee140)'},
    {id:'notepad',   n:'Bloco Notas', ic:'fas fa-file-lines',    bg:'linear-gradient(135deg,#a8edea,#fed6e3)'},
    {id:'terminal',  n:'Terminal',    ic:'fas fa-terminal',      bg:'linear-gradient(135deg,#232526,#414345)'},
    {id:'calc',      n:'Calculadora', ic:'fas fa-calculator',    bg:'linear-gradient(135deg,#43cea2,#185a9d)'},
    {id:'settings',  n:'Config',      ic:'fas fa-gear',          bg:'linear-gradient(135deg,#bdc3c7,#2c3e50)'},
    {id:'camera',    n:'Câmera',      ic:'fas fa-camera',        bg:'linear-gradient(135deg,#ff6e7f,#bfe9ff)'},
    {id:'word',      n:'Editor',      ic:'fas fa-pen-to-square', bg:'linear-gradient(135deg,#2193b0,#6dd5ed)'},
    {id:'vm',        n:'Máquinas Virtuais',ic:'fas fa-server',   bg:'linear-gradient(135deg,#373b44,#4286f4)'},
    {id:'trash',     n:'Lixeira',     ic:'fas fa-trash',         bg:'linear-gradient(135deg,#8e9eab,#eef2f3)'},
  ];
  function getDesktopApps(){
    const hidden = new Set(LS.hidden());
    const customs = LS.customIcons();
    let list = BASE_DESKTOP_APPS.concat(customs).filter(a=>!hidden.has(a.id));
    const order = LS.order();
    if(order){
      const map = Object.fromEntries(list.map(a=>[a.id,a]));
      const ordered = order.map(id=>map[id]).filter(Boolean);
      const rest = list.filter(a=>!order.includes(a.id));
      list = ordered.concat(rest);
    }
    return list;
  }

  // ---------- REDEFINE renderDesktop (adaptive sizes, snap, persisted pos) ----------
  window.renderDesktop = function(){
    const area = document.getElementById('icons-area');
    if(!area) return;
    area.innerHTML='';
    if(!LS.show()){ return; }
    const sz = LS.sz();
    const {w:cellW, h:cellH} = SZ_PX[sz];
    const pad = 16;
    const availH = Math.max(300, (area.clientHeight||window.innerHeight-52)-pad);
    const rows = Math.max(3, Math.floor(availH/cellH));
    const apps = getDesktopApps();
    const positions = LS.pos();
    const auto = LS.autoArr();

    apps.forEach((app,i)=>{
      const col=Math.floor(i/rows), row=i%rows;
      let left = pad + col*cellW;
      let top  = pad + row*cellH;
      if(!auto && positions[app.id]){
        left = positions[app.id].x;
        top  = positions[app.id].y;
      }
      const el = document.createElement('div');
      el.className='di';
      el.dataset.sz = sz;
      el.dataset.appId = app.id;
      el.style.cssText = `left:${left}px;top:${top}px`;
      const iconHtml = app.iconUrl
        ? `<img class="ic" src="${app.iconUrl}" alt="" onerror="this.outerHTML='<div class=\\'ic\\' style=\\'background:${app.bg||'#444'}\\'><i class=\\'fas fa-cube\\'></i></div>'">`
        : `<div class="ic" style="background:${app.bg||'linear-gradient(135deg,#555,#222)'}"><i class="${app.ic||'fas fa-cube'}"></i></div>`;
      el.innerHTML = iconHtml + `<label>${app.n}</label>`;
      el.ondblclick = ()=>openApp(app.id);
      el.onclick = e=>{
        document.querySelectorAll('.di.sel').forEach(x=>x.classList.remove('sel'));
        el.classList.add('sel');
        e.stopPropagation();
      };
      el.addEventListener('contextmenu', e=>{
        e.preventDefault(); e.stopPropagation();
        document.querySelectorAll('.di.sel').forEach(x=>x.classList.remove('sel'));
        el.classList.add('sel');
        showIconCtx(e.clientX, e.clientY, app);
      });
      makeDraggableEnh(el, app.id);
      area.appendChild(el);
    });
  };

  function makeDraggableEnh(el, id){
    let dx,dy,dragging=false, moved=false;
    el.addEventListener('mousedown', e=>{
      if(e.button!==0 || e.detail>1) return;
      dx=e.clientX-el.offsetLeft; dy=e.clientY-el.offsetTop;
      dragging=true; moved=false; el.style.zIndex=999;
    });
    document.addEventListener('mousemove', e=>{
      if(!dragging) return;
      moved=true;
      el.style.left=(e.clientX-dx)+'px';
      el.style.top =(e.clientY-dy)+'px';
    });
    document.addEventListener('mouseup', ()=>{
      if(!dragging) return;
      dragging=false; el.style.zIndex='';
      if(moved && !LS.autoArr()){
        let x = parseInt(el.style.left), y = parseInt(el.style.top);
        if(LS.snap()){
          const sz = LS.sz(); const {w:cw,h:ch}=SZ_PX[sz];
          x = Math.round((x-16)/cw)*cw+16;
          y = Math.round((y-16)/ch)*ch+16;
          el.style.left=x+'px'; el.style.top=y+'px';
        }
        const pos = LS.pos(); pos[id]={x,y}; LS.setPos(pos);
      }
    });
  }

  // ---------- DESKTOP CONTEXT MENU (rebuilt with submenus) ----------
  const desktop = document.getElementById('desktop');
  const oldCtx = document.getElementById('ctx');
  if(oldCtx) oldCtx.remove();
  const ctx = document.createElement('div');
  ctx.id='ctx';
  document.getElementById('desktop').appendChild(ctx);

  function ckIf(b){ return b?'<i class="fas fa-check"></i>':''; }
  function buildDesktopCtx(){
    const sz = LS.sz();
    return `
      <div class="cti has-sub"><i class="fas fa-eye"></i> Exibir
        <div class="csub">
          <div class="cti" data-cmd="size:xl"><i class="fas fa-expand"></i> Ícones extra grandes ${ckIf(sz==='xl')}</div>
          <div class="cti" data-cmd="size:l"><i class="fas fa-expand-arrows-alt"></i> Ícones grandes ${ckIf(sz==='l')}</div>
          <div class="cti" data-cmd="size:m"><i class="fas fa-th-large"></i> Ícones médios ${ckIf(sz==='m')}</div>
          <div class="cti" data-cmd="size:s"><i class="fas fa-th"></i> Ícones pequenos ${ckIf(sz==='s')}</div>
          <div class="cts"></div>
          <div class="cti" data-cmd="toggle:auto"><i class="fas fa-magnet"></i> Organizar automaticamente ${ckIf(LS.autoArr())}</div>
          <div class="cti" data-cmd="toggle:snap"><i class="fas fa-border-all"></i> Alinhar à grade ${ckIf(LS.snap())}</div>
          <div class="cti" data-cmd="toggle:show"><i class="fas fa-eye-slash"></i> Mostrar ícones ${ckIf(LS.show())}</div>
        </div>
      </div>
      <div class="cti has-sub"><i class="fas fa-sort"></i> Classificar por
        <div class="csub">
          <div class="cti" data-cmd="sort:name"><i class="fas fa-font"></i> Nome</div>
          <div class="cti" data-cmd="sort:size"><i class="fas fa-arrows-alt-v"></i> Tipo</div>
          <div class="cti" data-cmd="sort:random"><i class="fas fa-random"></i> Aleatório</div>
          <div class="cti" data-cmd="sort:reset"><i class="fas fa-undo"></i> Restaurar padrão</div>
        </div>
      </div>
      <div class="cti" data-cmd="refresh"><i class="fas fa-sync-alt"></i> Atualizar</div>
      <div class="cts"></div>
      <div class="cti has-sub"><i class="fas fa-plus"></i> Novo
        <div class="csub">
          <div class="cti" data-cmd="new:folder"><i class="fas fa-folder-plus"></i> Pasta</div>
          <div class="cti" data-cmd="new:txt"><i class="fas fa-file"></i> Documento de texto</div>
          <div class="cti" data-cmd="new:shortcut"><i class="fas fa-link"></i> Atalho (URL)</div>
          <div class="cti" data-cmd="new:custom"><i class="fas fa-image"></i> Ícone personalizado</div>
        </div>
      </div>
      <div class="cti" data-cmd="personalize"><i class="fas fa-paint-brush"></i> Personalizar</div>
      <div class="cti" data-cmd="wallnext"><i class="fas fa-images"></i> Próximo wallpaper</div>
      <div class="cts"></div>
      <div class="cti" data-cmd="terminal"><i class="fas fa-terminal"></i> Abrir Terminal</div>
      <div class="cti" data-cmd="taskmgr"><i class="fas fa-tasks"></i> Gerenciador de Tarefas</div>
      <div class="cti" data-cmd="trash"><i class="fas fa-trash"></i> Lixeira</div>
      <div class="cts"></div>
      <div class="cti" data-cmd="about"><i class="fas fa-info-circle"></i> Sobre o VessieOS</div>
    `;
  }

  function showCtxAt(x,y){
    ctx.style.display='block';
    ctx.style.left=Math.min(x, window.innerWidth-230)+'px';
    ctx.style.top =Math.min(y, window.innerHeight-460)+'px';
  }
  function hideCtx(){ ctx.style.display='none'; document.querySelectorAll('.csub.show').forEach(s=>s.classList.remove('show')); }

  desktop.addEventListener('contextmenu', e=>{
    if(e.target.closest('.win')||e.target.closest('#tb')||e.target.closest('.di')) return;
    e.preventDefault();
    ctx.innerHTML = buildDesktopCtx();
    bindCtxCmds();
    showCtxAt(e.clientX, e.clientY);
  });
  document.addEventListener('click', e=>{ if(!e.target.closest('#ctx')) hideCtx(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') hideCtx(); });

  function bindCtxCmds(){
    ctx.querySelectorAll('.cti[data-cmd]').forEach(el=>{
      el.onclick = (e)=>{
        e.stopPropagation();
        const [cmd,arg] = el.dataset.cmd.split(':');
        handleCtxCmd(cmd, arg);
        hideCtx();
      };
    });
    // submenu hover
    ctx.querySelectorAll('.cti.has-sub').forEach(p=>{
      p.addEventListener('mouseenter',()=>{
        ctx.querySelectorAll('.csub.show').forEach(s=>{ if(!p.contains(s)) s.classList.remove('show'); });
        const s=p.querySelector('.csub'); if(s){
          s.classList.add('show');
          const r=s.getBoundingClientRect();
          if(r.right>window.innerWidth) s.classList.add('left');
        }
      });
    });
  }

  function handleCtxCmd(cmd,arg){
    if(cmd==='size'){ LS.setSz(arg); renderDesktop(); toast('Tamanho de ícone: '+({s:'Pequeno',m:'Médio',l:'Grande',xl:'Extra Grande'}[arg])); }
    else if(cmd==='toggle'){
      if(arg==='auto'){ LS.setAutoArr(!LS.autoArr()); if(LS.autoArr()){ localStorage.removeItem('vos_icon_pos'); } renderDesktop(); }
      if(arg==='snap'){ LS.setSnap(!LS.snap()); }
      if(arg==='show'){ LS.setShow(!LS.show()); renderDesktop(); }
    }
    else if(cmd==='sort'){
      const apps = getDesktopApps();
      let arr;
      if(arg==='name') arr = apps.slice().sort((a,b)=>a.n.localeCompare(b.n)).map(a=>a.id);
      else if(arg==='size') arr = apps.slice().sort((a,b)=>(a.id||'').localeCompare(b.id||'')).map(a=>a.id);
      else if(arg==='random') arr = apps.slice().sort(()=>Math.random()-.5).map(a=>a.id);
      else { localStorage.removeItem('vos_icon_order'); localStorage.removeItem('vos_icon_pos'); LS.setAutoArr(true); renderDesktop(); return; }
      LS.setOrder(arr); LS.setAutoArr(true); localStorage.removeItem('vos_icon_pos'); renderDesktop();
    }
    else if(cmd==='refresh'){ renderDesktop(); toast('Desktop atualizado','success'); }
    else if(cmd==='new'){
      if(arg==='folder'){ const n=prompt('Nome da pasta:','Nova pasta'); if(n) addCustomIcon({n,ic:'fas fa-folder',bg:'linear-gradient(135deg,#f6d365,#fda085)'}); }
      else if(arg==='txt'){ const n=prompt('Nome do arquivo:','Novo documento.txt'); if(n) addCustomIcon({n,ic:'fas fa-file-lines',bg:'linear-gradient(135deg,#74ebd5,#9face6)',openId:'notepad'}); }
      else if(arg==='shortcut'){ const u=prompt('URL do atalho:','https://'); if(u){const n=prompt('Nome:',u.replace(/^https?:\/\//,'').split('/')[0])||u; addCustomIcon({n,ic:'fas fa-link',bg:'linear-gradient(135deg,#4facfe,#00f2fe)',url:u});} }
      else if(arg==='custom'){
        const n=prompt('Nome do ícone:'); if(!n) return;
        const u=prompt('URL da imagem (ícone):',''); 
        const link=prompt('Abrir URL/site ao clicar (opcional):','');
        addCustomIcon({n,iconUrl:u||undefined,ic:u?undefined:'fas fa-star',bg:'linear-gradient(135deg,#fceabb,#f8b500)',url:link||undefined});
      }
    }
    else if(cmd==='personalize'){ openApp('settings'); }
    else if(cmd==='wallnext'){ nextWall(); }
    else if(cmd==='terminal'){ openApp('terminal'); }
    else if(cmd==='taskmgr'){ openTaskManager(); }
    else if(cmd==='trash'){ openApp('trash'); }
    else if(cmd==='about'){ openAbout(); }
  }

  function addCustomIcon(o){
    const arr = LS.customIcons();
    o.id = 'cu_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    arr.push(o); LS.setCustomIcons(arr); renderDesktop();
    toast('"'+o.n+'" criado no desktop','success');
  }

  // ---------- PER-ICON CONTEXT MENU ----------
  function showIconCtx(x,y,app){
    ctx.innerHTML = `
      <div class="cti" data-i="open"><i class="fas fa-play"></i> Abrir</div>
      <div class="cti" data-i="newwin"><i class="fas fa-window-restore"></i> Abrir em nova janela</div>
      <div class="cts"></div>
      <div class="cti" data-i="rename"><i class="fas fa-i-cursor"></i> Renomear</div>
      <div class="cti" data-i="changeicon"><i class="fas fa-image"></i> Alterar ícone</div>
      <div class="cts"></div>
      <div class="cti" data-i="trash"><i class="fas fa-trash"></i> Enviar para Lixeira</div>
      <div class="cti" data-i="hide"><i class="fas fa-eye-slash"></i> Ocultar do desktop</div>
      <div class="cts"></div>
      <div class="cti" data-i="props"><i class="fas fa-info-circle"></i> Propriedades</div>
    `;
    showCtxAt(x,y);
    ctx.querySelectorAll('.cti[data-i]').forEach(el=>{
      el.onclick = e=>{
        e.stopPropagation();
        iconCmd(el.dataset.i, app);
        hideCtx();
      };
    });
  }
  function iconCmd(c, app){
    if(c==='open'||c==='newwin'){
      if(app.url){ window.open(app.url,'_blank'); return; }
      if(app.openId){ openApp(app.openId); return; }
      openApp(app.id);
    }
    else if(c==='rename'){
      const nn = prompt('Novo nome:', app.n); if(!nn) return;
      const customs = LS.customIcons();
      const ci = customs.find(x=>x.id===app.id);
      if(ci){ ci.n=nn; LS.setCustomIcons(customs); }
      else { // rename base app via custom override
        const ov = JSON.parse(localStorage.getItem('vos_icon_names')||'{}'); ov[app.id]=nn;
        localStorage.setItem('vos_icon_names',JSON.stringify(ov));
        BASE_DESKTOP_APPS.forEach(b=>{ if(b.id===app.id) b.n=nn; });
      }
      renderDesktop();
    }
    else if(c==='changeicon'){
      const u = prompt('URL da nova imagem do ícone:', app.iconUrl||'');
      if(u===null) return;
      const customs = LS.customIcons();
      const ci = customs.find(x=>x.id===app.id);
      if(ci){ ci.iconUrl = u||undefined; LS.setCustomIcons(customs); }
      else { BASE_DESKTOP_APPS.forEach(b=>{ if(b.id===app.id) b.iconUrl=u||undefined; }); }
      renderDesktop();
    }
    else if(c==='trash'){
      const trash = LS.trash();
      trash.unshift({...app, deletedAt:Date.now(), wasCustom: !!LS.customIcons().find(x=>x.id===app.id)});
      LS.setTrash(trash);
      const customs = LS.customIcons().filter(x=>x.id!==app.id); LS.setCustomIcons(customs);
      const hidden = LS.hidden(); if(!hidden.includes(app.id)){ hidden.push(app.id); LS.setHidden(hidden); }
      renderDesktop(); toast('"'+app.n+'" enviado para a Lixeira','success');
    }
    else if(c==='hide'){
      const hidden=LS.hidden(); if(!hidden.includes(app.id)){ hidden.push(app.id); LS.setHidden(hidden); }
      renderDesktop();
    }
    else if(c==='props'){
      createWin('Propriedades · '+app.n,'<i class="fas fa-info-circle"></i>',
        `<div style="padding:22px;font-size:.86rem;line-height:1.9;color:#cdd6f4">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
            <div style="width:64px;height:64px;border-radius:14px;background:${app.bg||'#333'};display:flex;align-items:center;justify-content:center;font-size:32px;color:#fff">${app.iconUrl?`<img src="${app.iconUrl}" style="width:100%;height:100%;border-radius:14px;object-fit:cover">`:`<i class="${app.ic}"></i>`}</div>
            <div><div style="font-size:1.05rem;font-weight:600">${app.n}</div><div style="color:var(--dim);font-size:.78rem">${app.id}</div></div>
          </div>
          <div><b>Tipo:</b> ${app.url?'Atalho de Internet':(app.openId?'Atalho':'Aplicativo do sistema')}</div>
          ${app.url?`<div><b>URL:</b> <a href="${app.url}" target="_blank" style="color:var(--a2)">${app.url}</a></div>`:''}
          <div><b>Tamanho atual:</b> ${LS.sz().toUpperCase()}</div>
          <div><b>Posição persistida:</b> ${LS.pos()[app.id]?'Sim':'Não'}</div>
        </div>`,420,360);
    }
  }

  // Apply name overrides from rename
  try{ const ov=JSON.parse(localStorage.getItem('vos_icon_names')||'{}'); BASE_DESKTOP_APPS.forEach(b=>{ if(ov[b.id]) b.n=ov[b.id]; }); }catch{}

  // ---------- WALLPAPER NEXT + PALETTE EXTRACTION ----------
  let wallIdx = 0;
  window.nextWall = function(){
    if(typeof WALLS==='undefined' || !WALLS.length) return;
    wallIdx = (wallIdx+1)%WALLS.length;
    const u = WALLS[wallIdx].u;
    setWall(u); extractPalette(u); toast('Wallpaper: '+WALLS[wallIdx].n);
  };

  function extractPalette(url){
    const img = new Image(); img.crossOrigin='anonymous';
    img.onload = ()=>{
      try{
        const c=document.createElement('canvas'); const W=48,H=48; c.width=W; c.height=H;
        const x=c.getContext('2d'); x.drawImage(img,0,0,W,H);
        const d=x.getImageData(0,0,W,H).data;
        const buckets={}; let bestC=null, bestN=0;
        for(let i=0;i<d.length;i+=4){
          const a=d[i+3]; if(a<200) continue;
          const r=d[i]&0xF0, g=d[i+1]&0xF0, b=d[i+2]&0xF0;
          const max=Math.max(r,g,b), min=Math.min(r,g,b);
          if(max-min<24) continue; // skip greys
          if(max<60||max>240) continue;
          const k=`${r},${g},${b}`;
          buckets[k]=(buckets[k]||0)+1;
          if(buckets[k]>bestN){ bestN=buckets[k]; bestC=[r,g,b]; }
        }
        if(!bestC) return;
        const [r,g,b]=bestC;
        const root=document.documentElement.style;
        const hex=`rgb(${r+8},${g+8},${b+8})`;
        const hex2=`rgb(${Math.min(255,r+60)},${Math.min(255,g+30)},${Math.min(255,b+90)})`;
        root.setProperty('--a',  hex);
        root.setProperty('--a3', hex);
        root.setProperty('--a2', hex2);
        const tb=document.getElementById('tb');
        if(tb){
          tb.classList.add('tinted');
          tb.style.setProperty('--tb-tint',`rgba(${Math.round(r*0.18)},${Math.round(g*0.18)},${Math.round(b*0.22)},.78)`);
        }
      }catch(e){ /* CORS may block — silent */ }
    };
    img.src = url;
  }
  // Hook setWall to also extract palette
  const _origSetWall = window.setWall;
  if(_origSetWall){
    window.setWall = function(u){ _origSetWall(u); extractPalette(u); };
  }
  // Run once on boot if wallpaper already set
  setTimeout(()=>{ if(typeof S!=='undefined' && S.wallpaper) extractPalette(S.wallpaper); }, 1200);

  // ---------- PATCH openApp TO HANDLE NEW APPS + CUSTOM ICONS ----------
  const _origOpen = window.openApp;
  window.openApp = function(id){
    // custom icon shortcuts
    const ci = LS.customIcons().find(x=>x.id===id);
    if(ci){
      if(ci.url){
        return createWin(ci.n, ci.iconUrl?`<img src="${ci.iconUrl}" style="width:18px;height:18px;border-radius:4px">`:`<i class="${ci.ic||'fas fa-link'}"></i>`,
          `<iframe src="${ci.url}" style="border:0;width:100%;height:100%" allow="fullscreen;autoplay" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`,
          960, 640);
      }
      if(ci.openId) return _origOpen(ci.openId);
      return toast('Arquivo: '+ci.n);
    }
    if(id==='trash') return openTrash();
    if(id==='vm') return openVM();
    return _origOpen(id);
  };

  // ---------- TRASH APP ----------
  function openTrash(){
    const items = LS.trash();
    const win = createWin('Lixeira','<i class="fas fa-trash" style="color:#9ecbff"></i>', `
      <div class="trash-wrap">
        <div class="trash-bar">
          <button class="vm-btn" id="tr-restore-all"><i class="fas fa-undo"></i> Restaurar tudo</button>
          <button class="vm-btn danger" id="tr-empty"><i class="fas fa-fire"></i> Esvaziar Lixeira</button>
          <span style="color:var(--dim);font-size:.8rem;margin-left:auto">${items.length} item(ns)</span>
        </div>
        <div id="tr-body"></div>
      </div>
    `, 640, 460);
    win.dataset.app='trash';
    renderTrashBody(win);
    win.querySelector('#tr-restore-all').onclick = ()=>{
      const it = LS.trash();
      it.forEach(t=>{
        if(t.wasCustom){ const c=LS.customIcons(); c.push(t); LS.setCustomIcons(c); }
        const h=LS.hidden().filter(x=>x!==t.id); LS.setHidden(h);
      });
      LS.setTrash([]); renderDesktop(); renderTrashBody(win); toast('Tudo restaurado','success');
    };
    win.querySelector('#tr-empty').onclick = ()=>{
      if(!confirm('Esvaziar Lixeira definitivamente?')) return;
      LS.setTrash([]); renderTrashBody(win); toast('Lixeira esvaziada','success');
    };
  }
  function renderTrashBody(win){
    const body = win.querySelector('#tr-body');
    const items = LS.trash();
    if(!items.length){
      body.innerHTML = `<div class="trash-empty"><i class="fas fa-trash-can"></i><h3>Lixeira vazia</h3><p>Itens excluídos aparecerão aqui</p></div>`;
      return;
    }
    body.innerHTML = `<div class="trash-grid">${items.map((t,i)=>`
      <div class="trash-it" data-i="${i}">
        <i class="${t.ic||'fas fa-file'}"></i>
        <div class="nm">${t.n}</div>
        <div class="dt">${new Date(t.deletedAt).toLocaleDateString('pt-BR')}</div>
      </div>`).join('')}</div>`;
    body.querySelectorAll('.trash-it').forEach(el=>{
      el.oncontextmenu = e=>{
        e.preventDefault();
        const i = +el.dataset.i, t = LS.trash()[i];
        ctx.innerHTML = `<div class="cti" data-tr="rest"><i class="fas fa-undo"></i> Restaurar</div><div class="cti" data-tr="del"><i class="fas fa-times"></i> Excluir definitivamente</div>`;
        showCtxAt(e.clientX,e.clientY);
        ctx.querySelectorAll('.cti').forEach(x=>x.onclick=()=>{
          const a=x.dataset.tr; const arr=LS.trash();
          if(a==='rest'){
            if(t.wasCustom){ const c=LS.customIcons(); c.push(t); LS.setCustomIcons(c); }
            const h=LS.hidden().filter(x=>x!==t.id); LS.setHidden(h);
          }
          arr.splice(i,1); LS.setTrash(arr); renderDesktop(); renderTrashBody(win); hideCtx();
        });
      };
      el.ondblclick = ()=>{
        const i = +el.dataset.i, t = LS.trash()[i];
        if(confirm(`Restaurar "${t.n}"?`)){
          if(t.wasCustom){ const c=LS.customIcons(); c.push(t); LS.setCustomIcons(c); }
          const h=LS.hidden().filter(x=>x!==t.id); LS.setHidden(h);
          const arr=LS.trash(); arr.splice(i,1); LS.setTrash(arr);
          renderDesktop(); renderTrashBody(win);
        }
      };
    });
  }

  // ---------- VIRTUAL MACHINES APP ----------
  const VMS = [
    {cat:'Windows', items:[
      {id:'win11',n:'Windows 11 (Web Demo)',ic:'fab fa-windows',desc:'Emulação Windows 11 via web — interface completa',url:'https://win11.blueedge.me/'},
      {id:'win10',n:'Windows 10 (Web)',ic:'fab fa-windows',desc:'Windows 10 emulado em JavaScript',url:'https://win10.blueedge.me/'},
      {id:'winxp',n:'Windows XP (v86)',ic:'fab fa-windows',desc:'Windows XP rodando em v86 (emulador x86)',url:'https://copy.sh/v86/?profile=windows2000'},
      {id:'win98',n:'Windows 98',ic:'fab fa-windows',desc:'Windows 98 clássico em v86',url:'https://copy.sh/v86/?profile=windows98'},
    ]},
    {cat:'Linux', items:[
      {id:'ubuntu',n:'Ubuntu Linux',ic:'fab fa-ubuntu',desc:'Ubuntu rodando direto no navegador',url:'https://bellard.org/jslinux/vm.html?cpu=riscv64&url=buildroot-riscv64.cfg&mem=256'},
      {id:'alpine',n:'Alpine Linux',ic:'fab fa-linux',desc:'Distro leve via v86',url:'https://copy.sh/v86/?profile=linux26'},
      {id:'debian',n:'Debian',ic:'fab fa-debian',desc:'Debian Linux via JSLinux',url:'https://bellard.org/jslinux/vm.html?cpu=x86&url=https://bellard.org/jslinux/buildroot-x86.cfg&mem=192'},
    ]},
    {cat:'Android & Mobile', items:[
      {id:'android',n:'Android (Demo)',ic:'fab fa-android',desc:'Emulador Android web',url:'https://www.geo.tv/'},
      {id:'androsim',n:'Android Simulator',ic:'fab fa-android',desc:'Simulador de interface Android',url:'https://appetize.io/embed/b0gfn0kpemmbq3a5wykcwumg34?device=pixel4&osVersion=11.0&scale=75&autoplay=false'},
    ]},
    {cat:'Outros sistemas', items:[
      {id:'macos9',n:'Mac OS 9 (PCE)',ic:'fab fa-apple',desc:'Mac OS clássico em JavaScript',url:'https://infinitemac.org/1999/Mac%20OS%209.0.4'},
      {id:'kolibri',n:'KolibriOS',ic:'fas fa-circle-notch',desc:'OS minúsculo em assembly via v86',url:'https://copy.sh/v86/?profile=kolibri'},
      {id:'freedos',n:'FreeDOS',ic:'fas fa-terminal',desc:'DOS livre via v86',url:'https://copy.sh/v86/?profile=freedos'},
      {id:'haiku',n:'Haiku OS',ic:'fas fa-rocket',desc:'Sucessor do BeOS via v86',url:'https://copy.sh/v86/?profile=haiku'},
    ]},
    {cat:'Jogos & Plataformas', items:[
      {id:'roblox',n:'Roblox (Web)',ic:'fas fa-cube',desc:'Acessa Roblox via portal web',url:'https://www.roblox.com/'},
      {id:'ff',n:'Free Fire Web',ic:'fas fa-fire',desc:'Portal Free Fire (Garena)',url:'https://ff.garena.com/'},
      {id:'cod',n:'Call of Duty Web',ic:'fas fa-crosshairs',desc:'Portal Call of Duty',url:'https://www.callofduty.com/'},
      {id:'msdos',n:'MS-DOS Games Archive',ic:'fas fa-gamepad',desc:'Centenas de jogos clássicos DOS no Archive.org',url:'https://archive.org/details/softwarelibrary_msdos_games'},
      {id:'flash',n:'Flash Games',ic:'fas fa-bolt',desc:'Coleção Flashpoint via web',url:'https://flashpointarchive.org/'},
    ]},
  ];

  function openVM(){
    const sb = VMS.map(g=>`<div class="vm-cat">${g.cat}</div>`+g.items.map(it=>`<div class="vm-item" data-vm="${it.id}"><i class="${it.ic}"></i> ${it.n}</div>`).join('')).join('');
    const win = createWin('Máquinas Virtuais','<i class="fas fa-server" style="color:#7eb6ff"></i>',`
      <div class="vm-wrap">
        <div class="vm-sb">${sb}</div>
        <div class="vm-main">
          <div class="vm-hero" id="vm-hero">
            <h2>🖥️ Máquinas Virtuais VessieOS</h2>
            <p>Escolha um sistema operacional ou plataforma para iniciar a máquina virtual. Suporta Windows, Linux, Android, Mac OS e jogos clássicos rodando diretamente no navegador via v86, JSLinux e portais web.</p>
          </div>
          <div class="vm-actions" id="vm-actions" style="display:none">
            <button class="vm-btn" id="vm-reload"><i class="fas fa-sync"></i> Reiniciar</button>
            <button class="vm-btn" id="vm-fs"><i class="fas fa-expand"></i> Tela cheia</button>
            <button class="vm-btn" id="vm-open"><i class="fas fa-external-link-alt"></i> Abrir em nova aba</button>
            <button class="vm-btn danger" id="vm-stop"><i class="fas fa-stop"></i> Parar VM</button>
          </div>
          <div class="vm-frame" id="vm-frame">
            <div class="vm-ph"><i class="fas fa-server"></i><h3>Nenhuma VM ativa</h3><p>Selecione um sistema na barra lateral</p></div>
          </div>
        </div>
      </div>
    `, 1000, 640);
    win.dataset.app='vm';
    const frame = win.querySelector('#vm-frame');
    const actions = win.querySelector('#vm-actions');
    const hero = win.querySelector('#vm-hero');
    let currentUrl=null, currentVM=null;
    function startVM(it){
      currentUrl = it.url; currentVM = it;
      hero.innerHTML = `<h2><i class="${it.ic}"></i> ${it.n}</h2><p>${it.desc}</p>`;
      frame.innerHTML = `<iframe src="${it.url}" allow="fullscreen;autoplay;gamepad;microphone;camera;clipboard-read;clipboard-write" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"></iframe>`;
      actions.style.display='flex';
      win.querySelectorAll('.vm-item').forEach(x=>x.classList.toggle('ac', x.dataset.vm===it.id));
      toast('Iniciando '+it.n+'...');
    }
    win.querySelectorAll('.vm-item').forEach(el=>{
      el.onclick = ()=>{
        const id=el.dataset.vm; const it = VMS.flatMap(g=>g.items).find(i=>i.id===id); if(it) startVM(it);
      };
    });
    win.querySelector('#vm-reload').onclick=()=>{ if(currentVM) startVM(currentVM); };
    win.querySelector('#vm-fs').onclick=()=>{ const f=frame.querySelector('iframe'); if(f&&f.requestFullscreen) f.requestFullscreen(); };
    win.querySelector('#vm-open').onclick=()=>{ if(currentUrl) window.open(currentUrl,'_blank'); };
    win.querySelector('#vm-stop').onclick=()=>{
      frame.innerHTML = `<div class="vm-ph"><i class="fas fa-server"></i><h3>VM parada</h3></div>`;
      actions.style.display='none';
      win.querySelectorAll('.vm-item.ac').forEach(x=>x.classList.remove('ac'));
      currentUrl=null; currentVM=null;
    };
  }

  // ---------- TASKBAR SELECTION RECTANGLE ----------
  let selStart=null;
  const selRect=document.createElement('div'); selRect.id='selrect';
  desktop.appendChild(selRect);
  desktop.addEventListener('mousedown', e=>{
    if(e.button!==0 || e.target.closest('.di')||e.target.closest('.win')||e.target.closest('#ctx')) return;
    selStart={x:e.clientX,y:e.clientY};
    Object.assign(selRect.style,{display:'block',left:e.clientX+'px',top:e.clientY+'px',width:'0px',height:'0px'});
    document.querySelectorAll('.di.sel').forEach(x=>x.classList.remove('sel'));
  });
  window.addEventListener('mousemove', e=>{
    if(!selStart) return;
    const x=Math.min(e.clientX,selStart.x), y=Math.min(e.clientY,selStart.y);
    const w=Math.abs(e.clientX-selStart.x), h=Math.abs(e.clientY-selStart.y);
    Object.assign(selRect.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
    const r={x,y,w,h};
    document.querySelectorAll('.di').forEach(el=>{
      const b=el.getBoundingClientRect();
      const hit = b.right>r.x && b.left<r.x+r.w && b.bottom>r.y && b.top<r.y+r.h;
      el.classList.toggle('sel', hit);
    });
  });
  window.addEventListener('mouseup', ()=>{ selStart=null; selRect.style.display='none'; });

  // ---------- KEYBOARD SHORTCUTS ----------
  document.addEventListener('keydown', e=>{
    if(e.key==='Delete'){
      const sels = document.querySelectorAll('.di.sel');
      if(sels.length){
        sels.forEach(el=>{
          const id = el.dataset.appId;
          const app = getDesktopApps().find(a=>a.id===id); if(app) iconCmd('trash', app);
        });
      }
    }
    if(e.key==='F2'){
      const s=document.querySelector('.di.sel'); if(s){ const id=s.dataset.appId; const app=getDesktopApps().find(a=>a.id===id); if(app) iconCmd('rename', app); }
    }
    if(e.key==='F5'){ e.preventDefault(); renderDesktop(); }
    if(e.ctrlKey && e.key.toLowerCase()==='a' && !e.target.closest('input,textarea')){
      e.preventDefault(); document.querySelectorAll('.di').forEach(d=>d.classList.add('sel'));
    }
  });

  // ---------- INITIAL RENDER ----------
  // re-render after a tick to apply if desktop is already shown
  setTimeout(()=>{ if(document.getElementById('desktop').style.display!=='none') renderDesktop(); }, 200);

  console.log('%c💜 VessieOS Ultra v4.0 loaded','background:linear-gradient(90deg,#c46fff,#7a3eb8);color:#fff;padding:6px 14px;border-radius:6px;font-weight:bold');
})();

/* ============================================================
   ULTRA POLISH v5 · Real-app UI + Theme grid + Multi-area Snap
   ============================================================ */
(function polish(){
  const css = document.createElement('style');
  css.textContent = `
  /* Theme grid (Settings) */
  .theme-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:6px}
  .theme-card{background:rgba(255,255,255,.04);border:1px solid var(--hairline);border-radius:10px;padding:8px;cursor:pointer;transition:.16s var(--ease);display:flex;flex-direction:column;gap:6px;align-items:stretch}
  .theme-card:hover{background:rgba(255,255,255,.08);transform:translateY(-2px);border-color:var(--border-strong)}
  .theme-card.ac{border-color:var(--a);box-shadow:0 0 0 2px var(--acc-glow)}
  .theme-card .tc-pre{height:42px;border-radius:7px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 4px 10px rgba(0,0,0,.3)}
  .theme-card span{font-size:.7rem;color:var(--text-2);text-align:center;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

  /* ============ NOTEPAD (Win11 Notepad real-look) ============ */
  .npad{background:#1f1f1f}
  .npad-tb{background:#2b2b2b;border-bottom:1px solid #1a1a1a;padding:6px 10px;gap:4px;display:flex;align-items:center}
  .npad-tb button{background:transparent;border:1px solid transparent;color:#e8e8e8;padding:5px 10px;border-radius:4px;font-size:.78rem;font-weight:400}
  .npad-tb button:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.04)}
  .npad-tb span{color:#9c9c9c;font-size:.74rem}
  .npad-area{background:#1f1f1f;color:#f0f0f0;font-family:'Consolas','Cascadia Mono',monospace;font-size:14px;padding:16px 22px;line-height:1.65;caret-color:#fff}

  /* ============ CALCULATOR (Win11 Calculator real-look) ============ */
  .calc{background:#202020;padding:14px;gap:6px}
  .c-disp{background:transparent;border:none;padding:8px 12px 18px}
  .c-expr{color:#9c9c9c;font-size:.85rem;text-align:right}
  .c-val{color:#fff;font-size:2.6rem;font-weight:600;letter-spacing:-.02em;text-align:right}
  .c-grid{gap:4px}
  .cb{background:#323232;border:none;color:#fff;border-radius:4px;height:52px;font-size:1rem;font-weight:400;transition:background .1s}
  .cb:hover{background:#3d3d3d}
  .cb.op{background:#2b2b2b;color:var(--a)}
  .cb.op:hover{background:#3a3a3a}
  .cb.eq{background:linear-gradient(180deg,var(--a),var(--a3));color:#000;font-weight:600;box-shadow:none}
  .cb.cl{background:#2b2b2b;color:#fff}

  /* ============ TERMINAL (Windows Terminal real-look) ============ */
  .term{background:#0c0c0c}
  .t-out{background:#0c0c0c;color:#cccccc;font-family:'Cascadia Code','Cascadia Mono','Consolas',monospace;font-size:13px;line-height:1.5;padding:14px 18px}
  .t-out .tc2{color:#3a96dd}
  .t-out .te{color:#e74856}
  .t-out .ti{color:#f9f1a5}
  .t-bar{background:#0c0c0c;border-top:1px solid #1f1f1f;padding:6px 18px}
  .t-prompt{color:#16c60c;font-weight:600;font-family:'Cascadia Code',monospace}
  .t-prompt::before{content:'PS '; color:#3a96dd}
  .t-inp{color:#cccccc;font-family:'Cascadia Code',monospace;font-size:13px;caret-color:#fff}
  /* Terminal window chrome tinted */
  .win:has(.term) .wh{background:linear-gradient(180deg,#1a1a1a,#0c0c0c);border-bottom:1px solid #1f1f1f}

  /* ============ FILE EXPLORER (Win11 Explorer real-look) ============ */
  .fexp{background:#202020}
  .fesb{background:#1d1d1d;border-right:1px solid #2b2b2b;padding:8px 6px;width:220px}
  .fesb .fld{padding:7px 12px;border-radius:4px;font-size:.82rem;color:#dcdcdc;font-weight:400}
  .fesb .fld i{color:#dcb67a;width:16px}
  .fesb .fld:hover{background:rgba(255,255,255,.06)}
  .fesb .fld.ac{background:rgba(96,165,250,.18)}
  .fesb .fld.ac i{color:var(--a)}
  .fem{background:#202020;padding:10px 14px}
  .fe-tb{background:#1d1d1d;border:1px solid #2b2b2b;border-radius:4px;padding:6px;gap:4px;align-items:center}
  .fe-path{background:#2b2b2b;border:1px solid transparent;border-radius:4px;color:#e0e0e0;font-family:'Segoe UI Variable',sans-serif;font-size:.8rem;padding:6px 10px}
  .fe-tbtn{background:transparent;border:1px solid transparent;color:#e0e0e0;border-radius:4px;font-size:.78rem;padding:5px 10px}
  .fe-tbtn:hover{background:rgba(255,255,255,.07)}
  .fi i{color:#dcb67a;font-size:2.2rem}
  .fi:hover{background:rgba(255,255,255,.05)}
  .fi.sel{background:rgba(96,165,250,.22);border-color:rgba(96,165,250,.5)}
  .fi span{color:#f0f0f0;font-size:.74rem}

  /* ============ BROWSER (Edge real-look) ============ */
  .brow{background:#202124}
  .brow-bar{background:#323639;border-bottom:1px solid #1a1a1a;padding:8px 10px;gap:6px;display:flex;align-items:center}
  .brow-bar input{background:#202124;border:1px solid transparent;border-radius:22px;padding:8px 18px;color:#e8eaed;font-size:.84rem;height:36px}
  .brow-bar input:focus{background:#202124;border-color:var(--a);box-shadow:0 0 0 2px var(--acc-glow)}
  .bnav{background:transparent;border:none;color:#e8eaed;width:34px;height:34px;border-radius:50%;font-size:.88rem}
  .bnav:hover{background:rgba(255,255,255,.08)}
  .brow-frame{background:#fff}

  /* ============ MUSIC (Spotify-inspired) ============ */
  .mplayer{background:linear-gradient(180deg,#181818,#000);padding:30px 26px;gap:18px;justify-content:flex-start;padding-top:40px}
  .mc-cover{width:200px;height:200px;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04);background:linear-gradient(135deg,var(--a),var(--a2))!important;animation:none!important;font-size:4.2rem}
  .mc-cover.playing{animation:none!important}
  .mc-title{color:#fff;font-size:1.4rem;font-weight:700;letter-spacing:-.02em}
  .mc-art{color:#b3b3b3;font-size:.92rem;font-weight:500}
  .mc-prog-bar{background:rgba(255,255,255,.18);height:5px;border-radius:3px}
  .mc-prog-fill{background:#fff;border-radius:3px}
  .mc-prog-bar:hover .mc-prog-fill{background:#1ed760}
  .mc-time{color:#a7a7a7}
  .mc-ctrl{gap:18px;margin-top:14px}
  .mc-ctrl button{color:#b3b3b3;font-size:1.15rem;width:38px;height:38px}
  .mc-ctrl button:hover{color:#fff;background:transparent;transform:scale(1.08)}
  .mc-play{background:#fff!important;color:#000!important;width:56px!important;height:56px!important;box-shadow:0 4px 14px rgba(0,0,0,.5)!important}
  .mc-play:hover{background:#fff!important;transform:scale(1.06);filter:none}
  .mc-vol input{accent-color:#1ed760}

  /* ============ VESSIE AI (ChatGPT-inspired) ============ */
  .chat-msgs{background:#212121}
  .msg.ai .mb{background:#2f2f2f;border:none;color:#ececec;border-radius:18px;padding:14px 18px;font-size:.9rem;line-height:1.6}
  .msg.u .mb{background:#414158;color:#fff;border-radius:18px;padding:12px 16px;background-image:none}
  .chat-bar{background:#212121;border-top:1px solid #2f2f2f;padding:14px 16px}
  .chat-bar input{background:#2f2f2f;border:1px solid transparent;border-radius:22px;padding:12px 18px}
  .chat-bar input:focus{border-color:var(--a)}
  .chat-send{background:#fff!important;color:#000!important;border-radius:50%!important;box-shadow:none!important}
  .chat-send:hover{filter:brightness(.92);transform:none}
  .vessy-header{background:#212121;border-bottom:1px solid #2f2f2f}

  /* ============ DASHBOARD polish ============ */
  .dash{background:linear-gradient(180deg,rgba(96,165,250,.04),transparent 30%)}

  /* ============ SETTINGS polish (Win11 Settings real-look) ============ */
  .sett{background:transparent;padding:28px 32px}
  .s-sec h3{font-size:1rem;font-weight:600;color:#fff;padding-bottom:12px;margin-bottom:16px}

  /* ============ MULTI-AREA SNAP OVERLAY ============ */
  #snap-ov{position:fixed;inset:0;pointer-events:none;z-index:480;display:none}
  #snap-ov.show{display:block}
  .snap-zone{position:absolute;background:rgba(96,165,250,.18);border:2px solid var(--a);border-radius:10px;opacity:0;transition:opacity .14s var(--ease);box-shadow:0 0 30px var(--acc-glow),inset 0 0 30px rgba(255,255,255,.04);backdrop-filter:blur(10px)}
  .snap-zone.on{opacity:1}
  /* snap hint chip */
  #snap-hint{position:fixed;top:8px;left:50%;transform:translateX(-50%);background:var(--acrylic-strong);backdrop-filter:blur(24px);border:1px solid var(--border-strong);padding:8px 16px;border-radius:24px;color:#fff;font-size:.78rem;font-weight:500;z-index:9999;display:none;box-shadow:var(--shadow-2)}
  #snap-hint.show{display:block;animation:fu .2s var(--ease)}
  #snap-hint kbd{background:rgba(255,255,255,.1);border:1px solid var(--border);padding:1px 6px;border-radius:4px;font-family:inherit;font-size:.74rem;margin:0 2px}
  `;
  document.head.appendChild(css);

  // ---------- SNAP OVERLAY ----------
  const ov = document.createElement('div'); ov.id='snap-ov';
  const TH = 52;
  const mkZone = (l,t,w,h)=>{const z=document.createElement('div');z.className='snap-zone';z.style.cssText=`left:${l};top:${t};width:${w};height:${h}`;ov.appendChild(z);return z;};
  const zL = mkZone('6px','6px','calc(50vw - 9px)',`calc(100vh - ${TH+12}px)`);
  const zR = mkZone('calc(50vw + 3px)','6px','calc(50vw - 9px)',`calc(100vh - ${TH+12}px)`);
  const zT = mkZone('6px','6px','calc(100vw - 12px)',`calc(100vh - ${TH+12}px)`);
  document.body.appendChild(ov);

  // snap functions
  function snapWin(win, side){
    if(!win) return;
    win.classList.remove('maximized');
    win.style.transition='left .18s var(--ease),top .18s var(--ease),width .18s var(--ease),height .18s var(--ease)';
    const H = `calc(100vh - ${TH}px)`;
    if(side==='left'){Object.assign(win.style,{left:'0px',top:'0px',width:'50vw',height:H});}
    else if(side==='right'){Object.assign(win.style,{left:'50vw',top:'0px',width:'50vw',height:H});}
    else if(side==='top'){win.classList.add('maximized');}
    else if(side==='tl'){Object.assign(win.style,{left:'0px',top:'0px',width:'50vw',height:`calc(50vh - ${TH/2}px)`});}
    else if(side==='tr'){Object.assign(win.style,{left:'50vw',top:'0px',width:'50vw',height:`calc(50vh - ${TH/2}px)`});}
    else if(side==='bl'){Object.assign(win.style,{left:'0px',top:`calc(50vh - ${TH/2}px)`,width:'50vw',height:`calc(50vh - ${TH/2}px)`});}
    else if(side==='br'){Object.assign(win.style,{left:'50vw',top:`calc(50vh - ${TH/2}px)`,width:'50vw',height:`calc(50vh - ${TH/2}px)`});}
    setTimeout(()=>{win.style.transition='';},220);
  }

  // Drag-to-edge: monitor mouse during drag of any .wh
  let dragWin=null, hovering=null;
  document.addEventListener('mousedown',(e)=>{
    const hdr=e.target.closest('.wh');
    if(!hdr || e.target.closest('.wctrl')) return;
    dragWin = hdr.closest('.win');
    ov.classList.add('show');
  },true);
  document.addEventListener('mousemove',(e)=>{
    if(!dragWin) return;
    const x=e.clientX, y=e.clientY, w=window.innerWidth, h=window.innerHeight-TH;
    [zL,zR,zT].forEach(z=>z.classList.remove('on'));
    hovering=null;
    if(y<6){hovering='top';zT.classList.add('on');}
    else if(x<12){hovering='left';zL.classList.add('on');}
    else if(x>w-12){hovering='right';zR.classList.add('on');}
  },true);
  document.addEventListener('mouseup',()=>{
    if(dragWin && hovering){snapWin(dragWin, hovering);}
    dragWin=null; hovering=null;
    [zL,zR,zT].forEach(z=>z.classList.remove('on'));
    ov.classList.remove('show');
  },true);

  // ---------- KEYBOARD: Win+Arrow snap (Alt+Arrow as alt) ----------
  function focusedWin(){return document.querySelector('.win.focused')||document.querySelectorAll('.win:not(.minimized)')[document.querySelectorAll('.win:not(.minimized)').length-1];}
  document.addEventListener('keydown',(e)=>{
    const mod = e.metaKey || e.altKey;
    if(!mod || !e.key.startsWith('Arrow')) return;
    const w = focusedWin(); if(!w) return;
    e.preventDefault();
    const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'top',ArrowDown:null};
    if(e.key==='ArrowDown'){w.classList.remove('maximized');Object.assign(w.style,{width:'720px',height:'500px',left:'40px',top:'40px'});return;}
    snapWin(w, map[e.key]);
  });

  // ---------- SNAP HINT (shows briefly first time a window opens) ----------
  const hint = document.createElement('div'); hint.id='snap-hint';
  hint.innerHTML='💡 Arraste para a borda ou use <kbd>Alt</kbd>+<kbd>←→↑</kbd> para dividir a tela';
  document.body.appendChild(hint);
  try{
    if(!localStorage.getItem('vos-snap-hint')){
      setTimeout(()=>{hint.classList.add('show');setTimeout(()=>hint.classList.remove('show'),4500);localStorage.setItem('vos-snap-hint','1');},2500);
    }
  }catch(_){}

  console.log('%c✨ VessieOS Polish v5 — Real-app UI · Themes · Multi-area Snap','background:linear-gradient(90deg,#60a5fa,#a78bfa);color:#fff;padding:6px 14px;border-radius:6px;font-weight:bold');
})();

