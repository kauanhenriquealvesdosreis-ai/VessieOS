import { pgTable, text, timestamp, boolean, serial, jsonb, integer } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------

// Uma conversa pertence a um usuário e agrupa mensagens.
export const conversation = pgTable("conversation", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull().default("Nova conversa"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Cada mensagem de uma conversa. attachments guarda metadados de arquivos enviados.
export const message = pgTable("message", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  conversationId: integer("conversationId").notNull(),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<{ name: string; type: string; url: string }[]>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Memória persistente: fatos/preferências que a IA "aprende" sobre o usuário.
export const memory = pgTable("memory", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Prompt de sistema que evolui: uma linha por usuário, com versão incremental.
export const systemPrompt = pgTable("system_prompt", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})
