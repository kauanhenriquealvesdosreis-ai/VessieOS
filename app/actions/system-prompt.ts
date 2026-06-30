"use server"

import { db } from "@/lib/db"
import { systemPrompt } from "@/lib/db/schema"
import { getUserId } from "@/lib/get-user"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai-sim"

export async function getSystemPrompt() {
  const userId = await getUserId()
  const [row] = await db.select().from(systemPrompt).where(eq(systemPrompt.userId, userId))
  if (!row) {
    return { content: DEFAULT_SYSTEM_PROMPT, version: 1 }
  }
  return { content: row.content, version: row.version }
}

// Salva o prompt de sistema, incrementando a versão (o prompt "evolui").
export async function updateSystemPrompt(content: string) {
  const userId = await getUserId()
  const trimmed = content.trim()
  if (!trimmed) return

  const [existing] = await db.select().from(systemPrompt).where(eq(systemPrompt.userId, userId))
  if (existing) {
    await db
      .update(systemPrompt)
      .set({ content: trimmed, version: existing.version + 1, updatedAt: new Date() })
      .where(eq(systemPrompt.userId, userId))
  } else {
    await db.insert(systemPrompt).values({ userId, content: trimmed, version: 1 })
  }
  revalidatePath("/")
}

// "Ensina" a IA: anexa uma nova instrução ao prompt com base no feedback do usuário.
export async function evolvePromptWithFeedback(feedback: string) {
  const userId = await getUserId()
  const instruction = feedback.trim()
  if (!instruction) return

  const [existing] = await db.select().from(systemPrompt).where(eq(systemPrompt.userId, userId))
  const base = existing?.content ?? DEFAULT_SYSTEM_PROMPT
  const learned = `${base}\n\nInstrução aprendida: ${instruction}`

  if (existing) {
    await db
      .update(systemPrompt)
      .set({ content: learned, version: existing.version + 1, updatedAt: new Date() })
      .where(eq(systemPrompt.userId, userId))
  } else {
    await db.insert(systemPrompt).values({ userId, content: learned, version: 2 })
  }
  revalidatePath("/")
  return { version: (existing?.version ?? 1) + 1 }
}

export async function resetSystemPrompt() {
  const userId = await getUserId()
  const [existing] = await db.select().from(systemPrompt).where(eq(systemPrompt.userId, userId))
  if (existing) {
    await db
      .update(systemPrompt)
      .set({ content: DEFAULT_SYSTEM_PROMPT, version: existing.version + 1, updatedAt: new Date() })
      .where(eq(systemPrompt.userId, userId))
  }
  revalidatePath("/")
}
