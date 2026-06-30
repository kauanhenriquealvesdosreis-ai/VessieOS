// lib/unified.ts
import { betterAuth } from "better-auth";
import { pool } from "@/lib/db";
import { headers } from "next/headers";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================
// 1. UTILITÁRIOS (cn e outros)
// ============================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// 2. AUTENTICAÇÃO MELHORADA (corrige login no Brasil)
// ============================================================

/**
 * Detecta a base URL de forma robusta, inclusive para domínios .br
 * e ambientes como Vercel, V0 ou desenvolvimento local.
 */
function detectBaseURL(): string {
  // Prioridade: variável explícita
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  const v0Url = process.env.V0_RUNTIME_URL;
  if (v0Url) return v0Url;

  // Fallback para desenvolvimento local
  return "http://localhost:3000";
}

/**
 * Lista de origens confiáveis (para CORS e CSRF) incluindo todas as variações
 * possíveis do domínio (com e sem www, http/https).
 */
function getTrustedOrigins(): string[] {
  const origins: string[] = [];
  const base = detectBaseURL();

  // Adiciona a base
  origins.push(base);

  // Se for HTTPS, adiciona versão com HTTP (para desenvolvimento)
  if (base.startsWith("https://")) {
    origins.push(base.replace("https://", "http://"));
  }

  // Extrai o domínio principal para adicionar variações com www
  try {
    const url = new URL(base);
    const host = url.hostname;
    const protocol = url.protocol;
    const port = url.port ? `:${url.port}` : "";

    if (!host.startsWith("www.")) {
      origins.push(`${protocol}//www.${host}${port}`);
    } else {
      const withoutWww = host.replace(/^www\./, "");
      origins.push(`${protocol}//${withoutWww}${port}`);
    }
  } catch {
    // ignora se a URL for inválida
  }

  // Adiciona origens de ambiente (Vercel, V0) que podem não estar na base
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (process.env.V0_RUNTIME_URL) {
    origins.push(process.env.V0_RUNTIME_URL);
  }

  // Remove duplicatas
  return [...new Set(origins)];
}

/**
 * Configuração do Better Auth com correções para funcionar em qualquer região,
 * incluindo Brasil. Ajusta cookies, CORS e trustedOrigins.
 */
export const auth = betterAuth({
  database: pool,
  baseURL: detectBaseURL(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: getTrustedOrigins(),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
  },
  // Configuração de cookies adaptada ao ambiente
  ...(process.env.NODE_ENV === "production"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "lax" as const, // mais seguro e compatível com redirecionamentos
            secure: true,
            httpOnly: true,
          },
        },
      }
    : {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "lax" as const, // permite testes locais sem problemas
            secure: false, // localhost não precisa de HTTPS
            httpOnly: true,
          },
        },
      }),
});

// ============================================================
// 3. FUNÇÕES PARA OBTER USUÁRIO (com cache e fallback)
// ============================================================

// Cache simples em memória para evitar múltiplas chamadas durante uma requisição
const sessionCache = new WeakMap<Headers, any>();

export async function getSession() {
  const headersList = await headers();
  // Verifica se já temos a sessão em cache para este objeto headers
  if (sessionCache.has(headersList)) {
    return sessionCache.get(headersList);
  }

  try {
    const session = await auth.api.getSession({ headers: headersList });
    sessionCache.set(headersList, session);
    return session;
  } catch (error) {
    console.error("Erro ao buscar sessão:", error);
    return null;
  }
}

export async function getUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

// ============================================================
// 4. MOTOR DE IA SIMULADO (com melhor extração de memórias e coleta de prompts)
// ============================================================

export const DEFAULT_SYSTEM_PROMPT =
  "Você é uma assistente prestativa, curiosa e direta. Responde em português do Brasil, " +
  "com clareza e um tom amigável. Usa o que sabe sobre o usuário para personalizar as respostas.";

/**
 * Padrões aprimorados para extrair memórias do texto do usuário.
 * Agora inclui mais variações e captura informações como idade, cidade, etc.
 */
export function extractMemories(text: string): string[] {
  const found: string[] = [];

  const patterns: { re: RegExp; label: (m: RegExpMatchArray) => string }[] = [
    // Nome
    {
      re: /(?:meu nome é|me chamo|pode me chamar de|sou o|sou a)\s+([\p{L} ]{2,40})/iu,
      label: (m) => `O nome do usuário é ${m[1].trim()}.`,
    },
    // Gostos
    {
      re: /(?:eu )?(?:gosto|adoro|curto|amo) (?:de )?([\p{L}0-9 ,]{2,60})/iu,
      label: (m) => `O usuário gosta de ${m[1].trim()}.`,
    },
    // Não gostos
    {
      re: /(?:eu )?(?:não gosto|odeio|detesto|não curto) (?:de )?([\p{L}0-9 ,]{2,60})/iu,
      label: (m) => `O usuário não gosta de ${m[1].trim()}.`,
    },
    // Profissão / estudo
    {
      re: /(?:eu )?(?:trabalho|sou|estudo|faço faculdade de)\s+([\p{L}0-9 ,]{2,60})/iu,
      label: (m) => `Sobre o usuário: ${m[0].trim()}.`,
    },
    // Idade
    {
      re: /(?:eu )?(?:tenho|estou com)\s+(\d{1,3})\s+anos/iu,
      label: (m) => `O usuário tem ${m[1]} anos.`,
    },
    // Cidade
    {
      re: /(?:eu )?(?:moro|vivo|estou) (?:em|no|na)\s+([\p{L} ]{2,50})/iu,
      label: (m) => `O usuário mora em ${m[1].trim()}.`,
    },
    // Comandos explícitos de memorização
    {
      re: /lembre(?:-se)? (?:que|de que)\s+(.{3,120})/iu,
      label: (m) => m[1].trim().replace(/\.$/, "") + ".",
    },
  ];

  for (const p of patterns) {
    const match = text.match(p.re);
    if (match) found.push(p.label(match));
  }

  // Remove duplicatas (case insensitive)
  const unique = new Set(found.map((f) => f.toLowerCase()));
  return Array.from(unique);
}

/**
 * Registra o prompt e o contexto para coleta e análise futura.
 * Pode ser integrado a um banco de dados ou serviço de logging.
 */
export function collectPrompt(
  userId: string | null,
  userMessage: string,
  systemPrompt: string,
  memories: string[],
  response: string
) {
  // Exemplo: log em console com timestamp
  console.log(`[${new Date().toISOString()}] Prompt coletado:`);
  console.log(`  Usuário: ${userId || "anônimo"}`);
  console.log(`  Mensagem: ${userMessage}`);
  console.log(`  Sistema: ${systemPrompt}`);
  console.log(`  Memórias: ${memories.length}`);
  console.log(`  Resposta: ${response.substring(0, 100)}...`);
  console.log("---");

  // Aqui você pode enviar para um banco de dados, arquivo, serviço externo etc.
  // Exemplo com pool (se quiser salvar):
  // await pool.query(
  //   "INSERT INTO prompt_logs (user_id, message, system_prompt, memories, response, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
  //   [userId, userMessage, systemPrompt, JSON.stringify(memories), response]
  // );
}

type GenerateArgs = {
  userMessage: string;
  systemPrompt?: string; // opcional, usa DEFAULT_SYSTEM_PROMPT se não fornecido
  memories?: string[];
  userName?: string | null;
  hasAttachments?: boolean;
  userId?: string | null; // para coleta
};

/**
 * Gera uma resposta simulada, mas com melhor aproveitamento do contexto,
 * e com coleta automática do prompt.
 */
export function generateReply({
  userMessage,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  memories = [],
  userName,
  hasAttachments = false,
  userId = null,
}: GenerateArgs): string {
  const text = userMessage.toLowerCase().trim();
  const name = userName ? userName.split(" ")[0] : null;
  const greeting = name ? `${name}, ` : "";

  let response = "";

  // --- Lógica de respostas simuladas (mais rica) ---

  // 1. Saudações
  if (/^(oi|olá|ola|e aí|eai|bom dia|boa tarde|boa noite|hey|fala|opa)\b/.test(text)) {
    response = `Olá${name ? `, ${name}` : ""}! Como posso te ajudar hoje?`;
  }
  // 2. Perguntas sobre a IA
  else if (/(quem é você|qual seu nome|o que você é|você é uma ia|como você funciona)/.test(text)) {
    response =
      "Sou sua assistente pessoal. Por enquanto funciono com um motor de respostas simulado, " +
      "mas já guardo memória sobre você e meu comportamento evolui conforme o seu feedback. " +
      "Quando um modelo de IA real for conectado, vou usar tudo isso para respostas muito mais ricas.";
  }
  // 3. Pergunta sobre memórias
  else if (/(o que você (sabe|lembra)|minhas? memórias?|o que sabe sobre mim)/.test(text)) {
    if (memories.length === 0) {
      response =
        "Ainda não tenho nada guardado sobre você. Me conte coisas como \"meu nome é...\" ou \"lembre que...\" e eu memorizo.";
    } else {
      response =
        `${greeting}aqui está o que já aprendi sobre você:\n\n` +
        memories.map((m) => `• ${m}`).join("\n");
    }
  }
  // 4. Anexos
  else if (hasAttachments) {
    response =
      `${greeting}recebi seu(s) arquivo(s). No momento estou no modo de demonstração e ainda não consigo ` +
      "analisar o conteúdo deles, mas a estrutura para isso já está pronta — quando um modelo de visão for " +
      "conectado, vou conseguir interpretar imagens e documentos.";
  }
  // 5. Resposta genérica com contexto
  else {
    const memoryHint =
      memories.length > 0
        ? ` Levando em conta o que sei sobre você (${memories.length} memórias), `
        : " ";
    response =
      `${greeting}entendi: "${userMessage.trim()}".${memoryHint}` +
      "essa é uma resposta simulada para demonstrar o fluxo completo — streaming, histórico, memória e o prompt que evolui. " +
      "Assim que conectarmos um modelo de IA real, esta mesma conversa passará a gerar respostas de verdade.";
  }

  // --- Coleta de prompts (para análise e melhoria contínua) ---
  collectPrompt(userId, userMessage, systemPrompt, memories, response);

  return response;
}

// ============================================================
// 5. EXPORTAÇÃO AGREGADA (para facilitar importação)
// ============================================================

export default {
  auth,
  getUserId,
  getCurrentUser,
  getSession,
  cn,
  extractMemories,
  generateReply,
  DEFAULT_SYSTEM_PROMPT,
  collectPrompt,
};