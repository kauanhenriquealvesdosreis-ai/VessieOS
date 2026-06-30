// enhanced.ts
// ============================================================================
// SISTEMA UNIFICADO DE MELHORIAS PARA AUTENTICAÇÃO E IA
// ============================================================================
// Este arquivo reúne todas as correções e melhorias solicitadas:
// 1. Corrige login no Brasil (cookies, URLs, trustedOrigins)
// 2. Melhora a coleta de memórias (extração mais rica)
// 3. IA adaptativa que analisa reclamações e corrige respostas
// 4. Simulação de busca de conhecimento
// 5. Histórico de conversa por usuário
// ============================================================================

import { betterAuth, type BetterAuthOptions } from "better-auth";
import { pool } from "@/lib/db";
import { headers } from "next/headers";

// ----------------------------------------------------------------------------
// 1. CONFIGURAÇÃO DE AUTENTICAÇÃO CORRIGIDA
// ----------------------------------------------------------------------------
export function getEnhancedAuthConfig(): BetterAuthOptions {
  // Determina a URL base de forma robusta
  const baseURL =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL) ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);

  if (!baseURL) {
    throw new Error("Base URL não definida. Configure NEXT_PUBLIC_APP_URL ou BETTER_AUTH_URL.");
  }

  // Trusted origins: inclui a base e variações comuns para evitar bloqueios CORS
  const trustedOrigins = [
    baseURL,
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    // Para ambientes de preview, pode adicionar padrões como *.vercel.app
    ...(process.env.VERCEL_URL && process.env.VERCEL_URL.includes(".vercel.app")
      ? [`https://${process.env.VERCEL_URL.replace(/^[^.]+\./, "")}`] // domínio pai
      : []),
  ];

  // Configuração de cookies mais compatível com navegadores brasileiros
  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = baseURL.startsWith("https://");
  // Em produção, usar SameSite=Lax (mais seguro) e Secure se for HTTPS
  // Em desenvolvimento, permitir None apenas se for HTTPS (ex: ngrok)
  const sameSite = isProduction ? ("lax" as const) : (isSecure ? "none" : "lax");
  const secure = isSecure; // sempre true se HTTPS

  return {
    database: pool,
    baseURL,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    trustedOrigins,
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 dias
      updateAge: 60 * 60 * 24, // 1 dia
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite,
        secure,
        // Em desenvolvimento com localhost, podemos definir domain opcionalmente
        ...(process.env.NODE_ENV === "development" && {
          domain: undefined, // usa o domínio atual
        }),
      },
    },
  };
}

// Exporta a instância do auth já configurada (pode ser usada no lugar do original)
export const enhancedAuth = betterAuth(getEnhancedAuthConfig());

// ----------------------------------------------------------------------------
// 2. SISTEMA DE IA MELHORADO
// ----------------------------------------------------------------------------

// ---------- 2.1 Extração de memórias aprimorada ----------
export function enhancedExtractMemories(text: string): string[] {
  const found: string[] = [];
  const patterns: { re: RegExp; label: (m: RegExpMatchArray) => string }[] = [
    // Nome
    { re: /meu nome é\s+([\p{L} ]{2,40})/iu, label: (m) => `O nome do usuário é ${m[1].trim()}.` },
    { re: /me chamo\s+([\p{L} ]{2,40})/iu, label: (m) => `O nome do usuário é ${m[1].trim()}.` },
    { re: /pode me chamar de\s+([\p{L} ]{2,40})/iu, label: (m) => `O usuário prefere ser chamado de ${m[1].trim()}.` },
    // Idade
    { re: /tenho\s+(\d{1,3})\s+anos/iu, label: (m) => `O usuário tem ${m[1]} anos.` },
    // Cidade / localização
    { re: /(?:moro|resido|vivo) em\s+([\p{L} ]{2,60})/iu, label: (m) => `O usuário mora em ${m[1].trim()}.` },
    // Profissão / estudo
    { re: /(?:sou|trabalho como)\s+([\p{L} ]{2,40})/iu, label: (m) => `O usuário é ${m[1].trim()}.` },
    { re: /estudo\s+([\p{L} ]{2,40})/iu, label: (m) => `O usuário estuda ${m[1].trim()}.` },
    // Gostos
    { re: /(?:eu )?(?:gosto|adoro) de\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `O usuário gosta de ${m[1].trim()}.` },
    { re: /(?:eu )?(?:não gosto|odeio) de\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `O usuário não gosta de ${m[1].trim()}.` },
    // Comandos explícitos de memória
    { re: /lembre(?:-se)? (?:que|de que)\s+(.{3,120})/iu, label: (m) => m[1].trim().replace(/\.$/, "") + "." },
    // Hobbies
    { re: /(?:meu hobby|meus hobbies|gosto de fazer)\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `Hobby: ${m[1].trim()}.` },
  ];

  for (const p of patterns) {
    const match = text.match(p.re);
    if (match) found.push(p.label(match));
  }
  return found;
}

// ---------- 2.2 Banco de conhecimento simulado (busca) ----------
const knowledgeBase: Record<string, string[]> = {
  "nextjs": [
    "Next.js é um framework React para produção com renderização híbrida (SSR, SSG, ISR).",
    "Suporta App Router e Pages Router, com suporte a React Server Components.",
    "Possui integração nativa com Vercel e otimizações automáticas."
  ],
  "vercel": [
    "Vercel é uma plataforma de deploy para frontend, com integração contínua e preview deployments.",
    "Oferece edge functions, análise de performance e suporte a monorepos."
  ],
  "better-auth": [
    "Better-auth é uma biblioteca de autenticação para Next.js com suporte a banco de dados, sessões e provedores OAuth.",
    "Permite configurar login com e-mail/senha, magic links e provedores sociais."
  ],
  "react": [
    "React é uma biblioteca para construção de interfaces de usuário com componentes reutilizáveis.",
    "Utiliza JSX, estado local e gerenciamento de efeitos."
  ],
  "tailwind": [
    "Tailwind CSS é um framework de estilização utility-first que permite criar designs personalizados sem sair do HTML."
  ],
};

function searchKnowledge(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  const results: string[] = [];
  for (const [key, facts] of Object.entries(knowledgeBase)) {
    if (normalized.includes(key)) {
      results.push(...facts);
    }
  }
  return results;
}

// ---------- 2.3 Motor de IA com histórico e feedback ----------
export class EnhancedAISystem {
  // Estado por usuário (em produção, persistir em banco)
  private userStates = new Map<string, {
    history: { role: "user" | "assistant"; content: string }[];
    memories: string[];
    lastAssistantMessage?: string; // última resposta da IA
  }>();

  // Mensagens de reclamação (detecção de feedback negativo)
  private complaintPatterns = [
    /(?:não gostei|odiei|detestei) da resposta/i,
    /(?:resposta|respondeu) (?:errada|ruim|péssima|incorreta)/i,
    /você errou/i,
    /não foi isso/i,
    /não é isso que eu perguntei/i,
    /(?:não )?entendeu (?:nada|errado)/i,
    /corrija/i,
    /reavalie/i,
  ];

  private isComplaint(text: string): boolean {
    return this.complaintPatterns.some(p => p.test(text));
  }

  // Processa uma nova mensagem do usuário e retorna a resposta
  processMessage(
    userId: string,
    userMessage: string,
    attachments?: boolean,
    systemPrompt?: string
  ): string {
    // Inicializa estado se não existir
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        history: [],
        memories: [],
      });
    }
    const state = this.userStates.get(userId)!;

    // Adiciona a mensagem do usuário ao histórico
    state.history.push({ role: "user", content: userMessage });

    // Extrai novas memórias
    const newMemories = enhancedExtractMemories(userMessage);
    if (newMemories.length > 0) {
      state.memories.push(...newMemories);
      // Remove duplicatas (simples)
      state.memories = Array.from(new Set(state.memories));
    }

    // Verifica se há reclamação sobre a resposta anterior
    let response: string;
    if (this.isComplaint(userMessage) && state.lastAssistantMessage) {
      // Analisa o erro e gera uma nova resposta corrigida
      response = this.handleComplaint(
        userMessage,
        state.lastAssistantMessage,
        state.memories,
        systemPrompt
      );
    } else {
      // Geração normal
      response = this.generateReply(
        userMessage,
        state.memories,
        attachments || false,
        systemPrompt
      );
      // Busca conhecimento, se necessário
      const knowledge = searchKnowledge(userMessage);
      if (knowledge.length > 0) {
        response += "\n\n🔍 Informações adicionais que encontrei:\n" + knowledge.map(f => `• ${f}`).join("\n");
      }
    }

    // Armazena a resposta para possível correção futura
    state.lastAssistantMessage = response;
    state.history.push({ role: "assistant", content: response });

    return response;
  }

  // Geração padrão de resposta (simulada, mas melhorada)
  private generateReply(
    userMessage: string,
    memories: string[],
    hasAttachments: boolean,
    systemPrompt?: string
  ): string {
    const text = userMessage.toLowerCase().trim();
    const name = this.extractNameFromMemories(memories);
    const greeting = name ? `${name}, ` : "";

    // Saudações
    if (/^(oi|olá|ola|e aí|eai|bom dia|boa tarde|boa noite|hey)\b/.test(text)) {
      return `Olá${name ? `, ${name}` : ""}! Como posso te ajudar hoje?`;
    }

    // Perguntas sobre identidade
    if (/(quem é você|qual seu nome|o que você é|você é uma ia)/.test(text)) {
      return (
        `${greeting}eu sou sua assistente pessoal aprimorada. ` +
        "Utilizo um motor de respostas simulado, mas com capacidade de memória, " +
        "busca de conhecimento e análise de feedback. " +
        "Se você não gostar de uma resposta, me avise que eu tento corrigir. " +
        "Quando um modelo de IA real for conectado, tudo ficará ainda melhor."
      );
    }

    // Pergunta sobre o que a IA lembra
    if (/(o que você (sabe|lembra)|minhas? memórias?|o que sabe sobre mim)/.test(text)) {
      if (memories.length === 0) {
        return `${greeting}ainda não tenho nada guardado sobre você. Conte-me coisas como "meu nome é..." ou "lembre que..." e eu memorizo.`;
      }
      return `${greeting}aqui está o que aprendi sobre você:\n\n` +
        memories.map((m) => `• ${m}`).join("\n");
    }

    // Anexos
    if (hasAttachments) {
      return (
        `${greeting}recebi seu(s) arquivo(s). No momento estou no modo de demonstração, ` +
        "mas a estrutura para análise de imagens e documentos já está pronta."
      );
    }

    // Resposta genérica com uso de memórias e prompt
    const memoryHint = memories.length > 0
      ? ` Lembrando que ${memories.length === 1 ? "você me contou" : "você me contou"} ${memories.length} ${memories.length === 1 ? "coisa" : "coisas"} sobre você, `
      : " ";

    return (
      `${greeting}entendi: "${userMessage.trim()}".${memoryHint}` +
      "esta é uma resposta simulada para demonstrar o fluxo completo. " +
      "Se você achar que algo está errado, pode me dizer que eu reavalio."
    );
  }

  // Tratamento de reclamação: analisa a mensagem do usuário e a resposta anterior,
  // gera uma nova resposta corrigida.
  private handleComplaint(
    complaintMessage: string,
    lastAssistantMessage: string,
    memories: string[],
    systemPrompt?: string
  ): string {
    const name = this.extractNameFromMemories(memories);
    const greeting = name ? `${name}, ` : "";

    // Análise simples: detecta se a reclamação indica que a resposta foi irrelevante,
    // incompleta, ou errada.
    let correctionReason = "";
    if (/errada|incorreta|não foi isso/.test(complaintMessage)) {
      correctionReason = "Parece que minha resposta não correspondeu ao que você esperava. ";
    } else if (/incompleta|faltou|mais detalhes/.test(complaintMessage)) {
      correctionReason = "Sinto que minha resposta foi muito vaga. ";
    } else if (/não gostei|ruim|péssima/.test(complaintMessage)) {
      correctionReason = "Entendo que minha resposta não foi satisfatória. ";
    } else {
      correctionReason = "Percebi que você não ficou satisfeito. ";
    }

    // Gera uma nova resposta mais genérica e pede mais informações
    // (em um sistema real, poderia chamar um modelo para reescrever)
    return (
      `${greeting}${correctionReason}Vou tentar corrigir. ` +
      "Para que eu possa ajudar melhor, poderia me dar mais contexto ou reformular a pergunta? " +
      `Minha resposta anterior foi: "${lastAssistantMessage}"`
    );
  }

  // Helper para extrair o primeiro nome das memórias
  private extractNameFromMemories(memories: string[]): string | null {
    for (const mem of memories) {
      const match = mem.match(/O nome do usuário é ([^\.,]+)/);
      if (match) return match[1].trim().split(" ")[0];
    }
    return null;
  }

  // Obtém memórias de um usuário (para uso externo)
  getMemories(userId: string): string[] {
    return this.userStates.get(userId)?.memories || [];
  }

  // Obtém histórico de um usuário
  getHistory(userId: string): { role: string; content: string }[] {
    return this.userStates.get(userId)?.history || [];
  }
}

// ----------------------------------------------------------------------------
// 3. EXPORTAÇÃO DE FUNÇÕES DE CONVENIÊNCIA
// ----------------------------------------------------------------------------
// Instância singleton do sistema de IA (pode ser usado em toda a aplicação)
export const enhancedAI = new EnhancedAISystem();

// Função para uso em API routes ou server actions
export async function processUserMessage(
  userId: string,
  message: string,
  attachments?: boolean,
  systemPrompt?: string
): Promise<string> {
  return enhancedAI.processMessage(userId, message, attachments, systemPrompt);
}

// Função para obter memórias de um usuário (ex: para exibir no perfil)
export async function getUserMemories(userId: string): Promise<string[]> {
  return enhancedAI.getMemories(userId);
}

// ----------------------------------------------------------------------------
// 4. EXEMPLO DE USO EM UMA ROTA API (NEXT.JS)
// ----------------------------------------------------------------------------
/*
// Exemplo: app/api/chat/route.ts
import { processUserMessage } from "@/lib/enhanced";
import { getUserId } from "@/lib/get-user";

export async function POST(req: Request) {
  const userId = await getUserId();
  const { message, attachments } = await req.json();
  const reply = await processUserMessage(userId, message, attachments);
  return Response.json({ reply });
}
*/
