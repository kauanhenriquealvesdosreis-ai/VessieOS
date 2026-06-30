"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  createConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  type Attachment,
} from "@/app/actions/chat"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatMessages } from "@/components/chat-messages"
import { ChatComposer } from "@/components/chat-composer"
import { ChatHeader } from "@/components/chat-header"
import { SidePanel } from "@/components/side-panel"

export type UIMessage = {
  id: number | string
  role: "user" | "assistant"
  content: string
  attachments?: Attachment[] | null
  streaming?: boolean
}

export type Conversation = {
  id: number
  title: string
  updatedAt: Date | string
}

export type Memory = { id: number; content: string }

type Props = {
  user: { name: string; email: string }
  initialConversations: Conversation[]
  initialMemories: Memory[]
  initialPrompt: { content: string; version: number }
}

export function ChatApp({ user, initialConversations, initialMemories, initialPrompt }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeId, setActiveId] = useState<number | null>(initialConversations[0]?.id ?? null)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [panel, setPanel] = useState<"memory" | "prompt" | null>(null)
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [promptVersion, setPromptVersion] = useState(initialPrompt.version)
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadMessages = useCallback(async (conversationId: number) => {
    setLoadingMessages(true)
    try {
      const rows = await getMessages(conversationId)
      setMessages(
        rows.map((r) => ({
          id: r.id,
          role: r.role as "user" | "assistant",
          content: r.content,
          attachments: r.attachments,
        })),
      )
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (activeId) loadMessages(activeId)
    else setMessages([])
  }, [activeId, loadMessages])

  useEffect(() => {
    return () => {
      if (streamRef.current) clearInterval(streamRef.current)
    }
  }, [])

  async function handleNewConversation() {
    const conv = await createConversation()
    setConversations((prev) => [conv as Conversation, ...prev])
    setActiveId(conv.id)
    setMessages([])
    setSidebarOpen(false)
  }

  async function handleDelete(id: number) {
    await deleteConversation(id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeId === id) {
      const next = conversations.find((c) => c.id !== id)
      setActiveId(next?.id ?? null)
    }
  }

  // Revela o texto gradualmente para simular streaming.
  function streamIn(messageId: string, fullText: string) {
    if (streamRef.current) clearInterval(streamRef.current)
    const words = fullText.split(" ")
    let i = 0
    streamRef.current = setInterval(() => {
      i += 1
      const partial = words.slice(0, i).join(" ")
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: partial } : m)))
      if (i >= words.length) {
        if (streamRef.current) clearInterval(streamRef.current)
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, streaming: false } : m)))
      }
    }, 28)
  }

  async function handleSend(content: string, attachments: Attachment[]) {
    if (sending) return
    let convId = activeId
    if (!convId) {
      const conv = await createConversation()
      setConversations((prev) => [conv as Conversation, ...prev])
      convId = conv.id
      setActiveId(conv.id)
    }

    const tempUser: UIMessage = {
      id: `tmp-u-${Date.now()}`,
      role: "user",
      content,
      attachments: attachments.length ? attachments : null,
    }
    const tempAssistant: UIMessage = {
      id: `tmp-a-${Date.now()}`,
      role: "assistant",
      content: "",
      streaming: true,
    }
    setMessages((prev) => [...prev, tempUser, tempAssistant])
    setSending(true)

    try {
      const res = await sendMessage({ conversationId: convId, content, attachments })
      // Atualiza o id da mensagem do usuário com o real.
      setMessages((prev) =>
        prev.map((m) => (m.id === tempUser.id ? { ...m, id: res.userMsg.id } : m)),
      )
      // Faz o streaming da resposta.
      streamIn(tempAssistant.id as string, res.assistantMsg.content)

      if (res.newMemories.length) {
        setMemories((prev) => [
          ...res.newMemories.map((c, idx) => ({ id: Date.now() + idx, content: c })),
          ...prev,
        ])
      }
      // Atualiza título da conversa ativa.
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: res.title, updatedAt: new Date() } : c)),
      )
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAssistant.id
            ? { ...m, content: "Ops, algo deu errado ao gerar a resposta.", streaming: false }
            : m,
        ),
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background text-foreground">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(id) => {
          setActiveId(id)
          setSidebarOpen(false)
        }}
        onNew={handleNewConversation}
        onDelete={handleDelete}
        onOpenPanel={(p) => {
          setPanel(p)
          setSidebarOpen(false)
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          user={user}
          promptVersion={promptVersion}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onOpenPanel={setPanel}
        />
        <ChatMessages messages={messages} loading={loadingMessages} userName={user.name} />
        <ChatComposer onSend={handleSend} disabled={sending} />
      </div>

      <SidePanel
        panel={panel}
        onClose={() => setPanel(null)}
        memories={memories}
        setMemories={setMemories}
        promptVersion={promptVersion}
        setPromptVersion={setPromptVersion}
        initialPromptContent={initialPrompt.content}
      />
    </div>
  )
}
