"use client"

import { useEffect, useRef } from "react"
import type { UIMessage } from "@/components/chat-app"
import { cn } from "@/lib/utils"
import { FileText, Sparkles } from "lucide-react"

type Props = {
  messages: UIMessage[]
  loading: boolean
  userName: string
}

export function ChatMessages({ messages, loading, userName }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!loading && messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="size-7" />
        </div>
        <h2 className="text-xl font-semibold text-balance">Olá, {userName.split(" ")[0]}!</h2>
        <p className="mt-2 max-w-md text-pretty text-sm text-muted-foreground">
          Comece uma conversa. Eu guardo memória sobre você e meu comportamento evolui conforme o seu feedback. Tente
          dizer {'"meu nome é..."'} ou {'"lembre que..."'}.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-medium",
          isUser ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? "Eu" : <Sparkles className="size-4" />}
      </div>
      <div className={cn("flex min-w-0 max-w-[85%] flex-col gap-2", isUser ? "items-end" : "items-start")}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((a, i) =>
              a.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={a.url || "/placeholder.svg"}
                  alt={a.name}
                  className="max-h-48 rounded-lg border border-border object-cover"
                />
              ) : (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="max-w-40 truncate">{a.name}</span>
                </div>
              ),
            )}
          </div>
        )}
        {(message.content || message.streaming) && (
          <div
            className={cn(
              "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isUser ? "bg-secondary text-secondary-foreground" : "bg-card text-card-foreground",
            )}
          >
            {message.content}
            {message.streaming && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />}
          </div>
        )}
      </div>
    </div>
  )
}
