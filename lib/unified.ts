// unified-system.ts
// ============================================================================
// 1. IMPORTS
// ============================================================================
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { betterAuth } from 'better-auth'
import { createAuthClient } from 'better-auth/react'
import { headers } from 'next/headers'
import { pool } from '@/lib/db' // ajuste conforme seu projeto

// ============================================================================
// 2. UTILITIES (cn)
// ============================================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// 3. AUTHENTICATION (corrigido para funcionar no Brasil)
// ============================================================================
// Determina a baseURL de forma robusta, inclusive para domínios locais
const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.V0_RUNTIME_URL) return process.env.V0_RUNTIME_URL
  // Fallback para desenvolvimento local (funciona com http e https)
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://seu-dominio.com'
}

// Trusted origins – inclui todas as variações possíveis
const getTrustedOrigins = () => {
  const origins: string[] = []
  const url = getBaseURL()
  if (url) origins.push(url)
  if (process.env.V0_RUNTIME_URL) origins.push(process.env.V0_RUNTIME_URL)
  if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  // Para desenvolvimento local, adiciona localhost com portas comuns
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000', 'http://localhost:3001')
    origins.push('http://127.0.0.1:3000', 'http://127.0.0.1:3001')
  }
  return origins
}

// Configuração do BetterAuth com cookies ajustados para o Brasil
export const auth = betterAuth({
  database: pool,
  baseURL: getBaseURL(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: getTrustedOrigins(),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24,     // 1 dia
  },
  // Configuração de cookies para cross-origin e ambiente local
  advanced: {
    defaultCookieAttributes: {
      // sameSite: 'lax' é mais compatível com redirecionamentos no Brasil
      sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
    },
  },
})

// Client de autenticação para uso no frontend
export const authClient = createAuthClient()
export const { signIn, signUp, signOut, useSession } = authClient

// ============================================================================
// 4. FUNÇÕES DE USUÁRIO (com fallback para anônimo)
// ============================================================================
/**
 * Obtém o ID do usuário logado, ou null se não autenticado.
 * Nunca lança exceção – permite acesso público ao site.
 */
export async function getUserId() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

/**
 * Obtém o objeto do usuário atual ou null.
 */
export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user ?? null
  } catch {
    return null
  }
}

// ============================================================================
// 5. MOTOR DE IA MELHORADO COM AUTOANÁLISE E VALIDAÇÃO
// ============================================================================
export const DEFAULT_SYSTEM_PROMPT =
  "Você é uma assistente prestativa, curiosa e direta. Responde em português do Brasil, " +
  "com clareza e um tom amigável. Usa o que sabe sobre o usuário para personalizar as respostas. " +
  "Sempre dê respostas completas e objetivas, sem fazer perguntas desnecessárias."

// Histórico de conversas para análise de erros (em produção, salve em banco)
const conversationHistory: {
  userMessage: string
  assistantReply: string
  feedback?: 'positive' | 'negative'
  errorAnalysis?: string
}[] = []

// Padrões estendidos para extração de memórias
export function extractMemories(text: string): string[] {
  const found: string[] = []
  const patterns: { re: RegExp; label: (m: RegExpMatchArray) => string }[] = [
    { re: /meu nome é\s+([\p{L} ]{2,40})/iu, label: (m) => `O nome do usuário é ${m[1].trim()}.` },
    { re: /me chamo\s+([\p{L} ]{2,40})/iu, label: (m) => `O usuário se chama ${m[1].trim()}.` },
    { re: /pode me chamar de\s+([\p{L} ]{2,40})/iu, label: (m) => `O usuário prefere ser chamado de ${m[1].trim()}.` },
    { re: /(?:eu )?(?:gosto|adoro) de\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `O usuário gosta de ${m[1].trim()}.` },
    { re: /(?:eu )?(?:não gosto|odeio) de\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `O usuário não gosta de ${m[1].trim()}.` },
    { re: /(?:eu )?(?:trabalho|sou)\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `Sobre o usuário: ${m[0].trim()}.` },
    { re: /lembre(?:-se)? (?:que|de que)\s+(.{3,120})/iu, label: (m) => m[1].trim().replace(/\.$/, '') + '.' },
    { re: /moro (?:em|no|na)\s+([\p{L} ]{2,40})/iu, label: (m) => `O usuário mora em ${m[1].trim()}.` },
    { re: /(?:eu )?(?:estudo|curso)\s+([\p{L}0-9 ]{2,60})/iu, label: (m) => `O usuário estuda ${m[1].trim()}.` },
    { re: /(?:meu|minha) (?:objetivo|meta) é\s+(.{3,80})/iu, label: (m) => `Objetivo do usuário: ${m[1].trim()}.` },
  ]
  for (const p of patterns) {
    const m = text.match(p.re)
    if (m) found.push(p.label(m))
  }
  return found
}

// Valida se a ação do usuário é segura/adequada
export function validateUserAction(text: string): { valid: boolean; warning?: string } {
  const lower = text.toLowerCase()
  if (lower.includes('delete') || lower.includes('excluir') || lower.includes('apagar')) {
    if (lower.includes('all') || lower.includes('tudo')) {
      return { valid: false, warning: 'Você está prestes a executar uma ação irreversível. Confirme que deseja continuar.' }
    }
  }
  if (lower.includes('senha') || lower.includes('password')) {
    return { valid: false, warning: 'Nunca compartilhe suas senhas. Se precisar alterar, use o painel de segurança.' }
  }
  if (lower.includes('comprar') || lower.includes('pagar')) {
    return { valid: false, warning: 'Transações financeiras devem ser feitas apenas em canais oficiais. Desconfie de links.' }
  }
  return { valid: true }
}

// Analisa feedback negativo e tenta identificar a causa
function analyzeError(userMessage: string, reply: string): string {
  // Simulação: poderia chamar uma IA real para análise
  const analysis = []
  if (reply.length < 10) analysis.push('Resposta muito curta, talvez não tenha entendido a pergunta.')
  if (userMessage.includes('?')) analysis.push('Pergunta direta, resposta pode não ter sido objetiva.')
  if (!reply.includes(userMessage.split(' ').slice(0, 3).join(' '))) {
    analysis.push('A resposta não parece relacionada ao tópico da mensagem.')
  }
  // Detecção de tom
  if (userMessage.match(/não|errado|ruim|péssimo|odeio/i)) {
    analysis.push('Usuário expressou insatisfação com o conteúdo ou tom.')
  }
  return analysis.length > 0 ? analysis.join(' ') : 'Erro não identificado. Recomenda-se revisar o prompt do sistema.'
}

// Geração de resposta com autoanálise e validação integrada
type GenerateArgs = {
  userMessage: string
  systemPrompt?: string
  memories?: string[]
  userName?: string | null
  hasAttachments?: boolean
}

export function generateReply({
  userMessage,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  memories = [],
  userName,
  hasAttachments = false,
}: GenerateArgs): { reply: string; analysis?: string } {
  // 1. Validar ação do usuário
  const validation = validateUserAction(userMessage)
  if (!validation.valid) {
    return { reply: `⚠️ ${validation.warning} Como posso ajudar de forma segura?` }
  }

  // 2. Construir resposta (simulada, mas com lógica mais rica)
  const text = userMessage.toLowerCase().trim()
  const name = userName ? userName.split(' ')[0] : null
  const greeting = name ? `${name}, ` : ''

  // Detecção de reclamação
  const isComplaint = /não gostei|erro|ruim|péssimo|não funcionou|não respondeu|não entendi|inútil|horrível/.test(text)
  if (isComplaint) {
    // Analisar erro com base no histórico recente
    const lastEntry = conversationHistory[conversationHistory.length - 1]
    let analysis = 'Desculpe, não foi minha intenção causar frustração. '
    if (lastEntry) {
      const errorCause = analyzeError(lastEntry.userMessage, lastEntry.assistantReply)
      analysis += `Analisei a conversa anterior: ${errorCause} Vou ajustar minha abordagem.`
      // Armazena o feedback para evolução futura
      lastEntry.feedback = 'negative'
      lastEntry.errorAnalysis = errorCause
    } else {
      analysis += 'Por favor, me explique o que aconteceu para que eu possa melhorar.'
    }
    // Resposta direta sem perguntas
    return { reply: `${greeting}${analysis}`, analysis: analysis }
  }

  // Respostas padrão (sem perguntas)
  if (/^(oi|olá|ola|e aí|eai|bom dia|boa tarde|boa noite|hey)\b/.test(text)) {
    return { reply: `Olá${name ? `, ${name}` : ''}! Como posso te ajudar hoje?` }
  }

  if (/(quem é você|qual seu nome|o que você é|você é uma ia)/.test(text)) {
    return {
      reply:
        'Sou sua assistente pessoal, baseada em um motor de IA que aprende com você. ' +
        'Minha missão é fornecer respostas úteis e diretas, sempre evoluindo com seu feedback.',
    }
  }

  if (/(o que você (sabe|lembra)|minhas? memórias?|o que sabe sobre mim)/.test(text)) {
    if (memories.length === 0) {
      return {
        reply:
          'Ainda não tenho memórias sobre você. Compartilhe informações como "meu nome é..." ou "lembre que..." e eu as guardarei.',
      }
    }
    return {
      reply: `${greeting}aqui está o que já aprendi sobre você:\n\n` + memories.map((m) => `• ${m}`).join('\n'),
    }
  }

  if (hasAttachments) {
    return {
      reply:
        `${greeting}recebi seu(s) arquivo(s). No momento não posso analisar o conteúdo, mas a estrutura está pronta para futura integração com modelos de visão.`,
    }
  }

  // Resposta genérica com uso de memória e prompt
  const memoryHint =
    memories.length > 0
      ? ` Levando em conta suas preferências (${memories.length} ${memories.length === 1 ? 'memória' : 'memórias'}), `
      : ' '

  const reply = `${greeting}entendi: "${userMessage.trim()}".${memoryHint}minha resposta simulada demonstra o fluxo completo. Em breve, com um modelo real, as respostas serão ainda mais precisas.`

  // 3. Armazenar no histórico para análise futura
  conversationHistory.push({ userMessage, assistantReply: reply })

  return { reply }
}

// Função para evoluir o prompt do sistema com base no histórico de feedback negativo
export function evolveSystemPrompt(): string {
  const negativeFeedbacks = conversationHistory.filter((c) => c.feedback === 'negative')
  if (negativeFeedbacks.length === 0) return DEFAULT_SYSTEM_PROMPT

  const commonIssues = negativeFeedbacks
    .map((c) => c.errorAnalysis)
    .filter((a) => a)
    .join(' ')

  let newPrompt = DEFAULT_SYSTEM_PROMPT
  if (commonIssues.includes('curta')) {
    newPrompt += ' Forneça respostas mais detalhadas e completas.'
  }
  if (commonIssues.includes('relacionada')) {
    newPrompt += ' Certifique-se de que a resposta está diretamente ligada à pergunta do usuário.'
  }
  if (commonIssues.includes('tom')) {
    newPrompt += ' Mantenha um tom empático e paciente, mesmo em situações difíceis.'
  }
  return newPrompt
}

// ============================================================================
// 6. SISTEMA DE UI DINÂMICA (temas e adaptação em tempo real)
// ============================================================================
// Hook simples para gerenciar tema (pode ser usado com Context)
export const themes = {
  light: {
    background: '#ffffff',
    foreground: '#000000',
    primary: '#3b82f6',
    secondary: '#f3f4f6',
  },
  dark: {
    background: '#1a1a2e',
    foreground: '#e2e8f0',
    primary: '#60a5fa',
    secondary: '#2d3748',
  },
  highContrast: {
    background: '#000000',
    foreground: '#ffffff',
    primary: '#ffcc00',
    secondary: '#333333',
  },
}

export type ThemeKey = keyof typeof themes

// Função para aplicar tema dinamicamente (no lado cliente)
export function applyTheme(theme: ThemeKey) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const t = themes[theme]
  Object.entries(t).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  // Também pode salvar no localStorage para persistência
  localStorage.setItem('theme', theme)
}

// Função para carregar tema salvo
export function loadTheme(): ThemeKey {
  if (typeof localStorage === 'undefined') return 'light'
  return (localStorage.getItem('theme') as ThemeKey) || 'light'
}

// Adaptação inteligente da UI baseada no comportamento (exemplo: detectar se é dia/noite)
export function suggestThemeByTime(): ThemeKey {
  const hour = new Date().getHours()
  if (hour < 6 || hour > 18) return 'dark'
  return 'light'
}

// ============================================================================
// 7. EXPORTAÇÕES AGREGADAS PARA FÁCIL IMPORTAÇÃO
// ============================================================================
export default {
  auth,
  authClient,
  getUserId,
  getCurrentUser,
  generateReply,
  extractMemories,
  validateUserAction,
  evolveSystemPrompt,
  applyTheme,
  loadTheme,
  suggestThemeByTime,
  themes,
  cn,
}