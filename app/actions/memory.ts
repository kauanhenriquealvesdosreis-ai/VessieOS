"use server"

import { db } from "@/lib/db"
import { memory } from "@/lib/db/schema"
import { getUserId } from "@/lib/get-user"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getMemories() {
  const userId = await getUserId()
  return db.select().from(memory).where(eq(memory.userId, userId)).orderBy(desc(memory.createdAt))
}

export async function addMemory(content: string) {
  const userId = await getUserId()
  const trimmed = content.trim()
  if (!trimmed) return
  await db.insert(memory).values({ userId, content: trimmed })
  revalidatePath("/")
}

export async function deleteMemory(id: number) {
  const userId = await getUserId()
  await db.delete(memory).where(and(eq(memory.id, id), eq(memory.userId, userId)))
  revalidatePath("/")
}
