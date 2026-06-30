"use server"

import { db } from "@/lib/db"
import { conversation, message, memory, systemPrompt } from "@/lib/db/schema"
import { getUserId, getCurrentUser } from "@/lib/get-user"
import { and, asc, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { DEFAULT_SYSTEM_PROMPT, extractMemories, generateReply } from "@/lib/ai-sim"

export type Attachment = { name: string; type: string; url: string }

export async function getConversations() {
  const userId = await getUserId()
  return db
    .select()
    .from(conversation)
    .where(eq(conversation.userId, userId))
    .orderBy(desc(conversation.updatedAt))
}

export async function createConversation() {
  const userId = await getUserId()
  const [row] = await db.insert(conversation).values({ userId }).returning()
  revalidatePath("/")
  return row
}

export async function deleteConversation(id: number) {
  const userId = await getUserId()
  await db.delete(message).where(and(eq(message.conversationId, id), eq(message.userId, userId)))
  await db.delete(conversation).where(and(eq(conversation.id, id), eq(conversation.userId, userId)))
  revalidatePath("/")
}

export async function renameConversation(id: number, title: string) {
  const userId = await getUserId()
  await db
    .update(conversation)
    .set({ title: title.slice(0, 80), updatedAt: new Date() })
    .where(and(eq(conversation.id, id), eq(conversation.userId, userId)))
  revalidatePath("/")
}

export async function getMessages(conversationId: number) {
  const userId = await getUserId()
  return db
    .select()
    .from(message)
    .where(and(eq(message.conversationId, conversationId), eq(message.userId, userId)))
    .orderBy(asc(message.createdAt))
}

// Envia uma mensagem do usuário, salva, atualiza memória e gera a resposta simulada.
export async function sendMessage(input: {
  conversationId: number
  content: string
  attachments?: Attachment[]
}) {
  const userId = await getUserId()
  const user = await getCurrentUser()
  const { conversationId, content, attachments } = input

  // Garante que a conversa pertence ao usuário.
  const [conv] = await db
    .select()
    .from(conversation)
    .where(and(eq(conversation.id, conversationId), eq(conversation.userId, userId)))
  if (!conv) throw new Error("Conversa não encontrada")

  // 1. Salva a mensagem do usuário.
  const [userMsg] = await db
    .insert(message)
    .values({
      userId,
      conversationId,
      role: "user",
      content,
      attachments: attachments && attachments.length ? attachments : null,
    })
    .returning()

  // 2. Extrai e salva novas memórias detectadas no texto.
  const detected = extractMemories(content)
  if (detected.length) {
    await db.insert(memory).values(detected.map((c) => ({ userId, content: c })))
  }

  // 3. Carrega memórias e prompt de sistema do usuário.
  const memRows = await db.select().from(memory).where(eq(memory.userId, userId)).orderBy(desc(memory.createdAt))
  const [sp] = await db.select().from(systemPrompt).where(eq(systemPrompt.userId, userId))
  const prompt = sp?.content ?? DEFAULT_SYSTEM_PROMPT

  // 4. Gera a resposta simulada.
  const replyText = generateReply({
    userMessage: content,
    systemPrompt: prompt,
    memories: memRows.map((m) => m.content),
    userName: user?.name,
    hasAttachments: !!(attachments && attachments.length),
  })

  // 5. Salva a resposta da assistente.
  const [assistantMsg] = await db
    .insert(message)
    .values({ userId, conversationId, role: "assistant", content: replyText })
    .returning()

  // 6. Se for a primeira troca, define o título da conversa.
  const count = (
    await db.select().from(message).where(eq(message.conversationId, conversationId))
  ).length
  let newTitle = conv.title
  if (count <= 2) {
    newTitle = content.slice(0, 50) || "Nova conversa"
    await db.update(conversation).set({ title: newTitle }).where(eq(conversation.id, conversationId))
  }
  await db.update(conversation).set({ updatedAt: new Date() }).where(eq(conversation.id, conversationId))

  revalidatePath("/")
  return { userMsg, assistantMsg, newMemories: detected, title: newTitle }
}
