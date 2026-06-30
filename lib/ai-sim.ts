// Motor de respostas SIMULADO (sem modelo de IA real por enquanto).
// Gera uma resposta a partir do texto do usuário, das memórias salvas
// e do prompt de sistema que evolui. Quando você plugar um modelo real
// (ex.: Vercel AI Gateway), basta substituir generateReply por uma chamada
// de verdade, mantendo a mesma assinatura.

export const DEFAULT_SYSTEM_PROMPT =
  "Você é uma assistente prestativa, curiosa e direta. Responde em português do Brasil, " +
  "com clareza e um tom amigável. Usa o que sabe sobre o usuário para personalizar as respostas."

// Detecta fatos que valem a pena memorizar a partir da mensagem do usuário.
export function extractMemories(text: string): string[] {
  const found: string[] = []
  const patterns: { re: RegExp; label: (m: RegExpMatchArray) => string }[] = [
    { re: /meu nome é\s+([\p{L} ]{2,40})/iu, label: (m) => `O nome do usuário é ${m[1].trim()}.` },
    { re: /me chamo\s+([\p{L} ]{2,40})/iu, label: (m) => `O nome do usuário é ${m[1].trim()}.` },
    { re: /pode me chamar de\s+([\p{L} ]{2,40})/iu, label: (m) => `O usuário prefere ser chamado de ${m[1].trim()}.` },
    { re: /(?:eu )?(?:gosto|adoro) de\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `O usuário gosta de ${m[1].trim()}.` },
    { re: /(?:eu )?(?:não gosto|odeio) de\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `O usuário não gosta de ${m[1].trim()}.` },
    { re: /(?:eu )?(?:trabalho|sou)\s+([\p{L}0-9 ,]{2,60})/iu, label: (m) => `Sobre o usuário: ${m[0].trim()}.` },
    { re: /lembre(?:-se)? (?:que|de que)\s+(.{3,120})/iu, label: (m) => m[1].trim().replace(/\.$/, "") + "." },
  ]
  for (const p of patterns) {
    const m = text.match(p.re)
    if (m) found.push(p.label(m))
  }
  return found
}

type GenerateArgs = {
  userMessage: string
  systemPrompt: string
  memories: string[]
  userName?: string | null
  hasAttachments?: boolean
}

// Gera o texto da resposta simulada.
export function generateReply({ userMessage, systemPrompt, memories, userName, hasAttachments }: GenerateArgs): string {
  const text = userMessage.toLowerCase().trim()
  const name = userName ? userName.split(" ")[0] : null
  const greeting = name ? `${name}, ` : ""

  // Saudações
  if (/^(oi|olá|ola|e aí|eai|bom dia|boa tarde|boa noite|hey)\b/.test(text)) {
    return `Olá${name ? `, ${name}` : ""}! Como posso te ajudar hoje?`
  }

  // Perguntas sobre identidade
  if (/(quem é você|qual seu nome|o que você é|você é uma ia)/.test(text)) {
    return (
      "Sou sua assistente pessoal. Por enquanto funciono com um motor de respostas simulado, " +
      "mas já guardo memória sobre você e meu comportamento evolui conforme o seu feedback. " +
      "Quando um modelo de IA real for conectado, vou usar tudo isso para respostas muito mais ricas."
    )
  }

  // Pergunta sobre o que a IA lembra
  if (/(o que você (sabe|lembra)|minhas? memórias?|o que sabe sobre mim)/.test(text)) {
    if (memories.length === 0) {
      return "Ainda não tenho nada guardado sobre você. Me conte coisas como \"meu nome é...\" ou \"lembre que...\" e eu memorizo."
    }
    return `${greeting}aqui está o que já aprendi sobre você:\n\n` + memories.map((m) => `• ${m}`).join("\n")
  }

  if (hasAttachments) {
    return (
      `${greeting}recebi seu(s) arquivo(s). No momento estou no modo de demonstração e ainda não consigo ` +
      "analisar o conteúdo deles, mas a estrutura para isso já está pronta — quando um modelo de visão for " +
      "conectado, vou conseguir interpretar imagens e documentos."
    )
  }

  // Resposta genérica que demonstra uso da memória e do prompt de sistema
  const memoryHint =
    memories.length > 0
      ? ` Levando em conta o que sei sobre você (${memories.length} ${memories.length === 1 ? "memória" : "memórias"}), `
      : " "

  return (
    `${greeting}entendi: "${userMessage.trim()}".${memoryHint}` +
    "essa é uma resposta simulada para demonstrar o fluxo completo — streaming, histórico, memória e o prompt que evolui. " +
    "Assim que conectarmos um modelo de IA real, esta mesma conversa passará a gerar respostas de verdade."
  )
}
