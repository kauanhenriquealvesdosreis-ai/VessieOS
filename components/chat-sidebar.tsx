"use client"

import type { Conversation } from "@/components/chat-app"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Brain, MessageSquarePlus, PanelRight, Trash2, X } from "lucide-react"

type Props = {
  conversations: Conversation[]
  activeId: number | null
  open: boolean
  onClose: () => void
  onSelect: (id: number) => void
  onNew: () => void
  onDelete: (id: number) => void
  onOpenPanel: (p: "memory" | "prompt") => void
}

export function ChatSidebar({
  conversations,
  activeId,
  open,
  onClose,
  onSelect,
  onNew,
  onDelete,
  onOpenPanel,
}: Props) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between px-3">
          <span className="px-1 text-sm font-medium text-muted-foreground">Conversas</span>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose} aria-label="Fechar menu">
            <X className="size-5" />
          </Button>
        </div>

        <div className="px-3">
          <Button onClick={onNew} className="w-full justify-start gap-2">
            <MessageSquarePlus className="size-4" />
            Nova conversa
          </Button>
        </div>

        <ScrollArea className="mt-3 flex-1 px-2">
          <ul className="flex flex-col gap-1 pb-3">
            {conversations.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma conversa ainda.</li>
            )}
            {conversations.map((c) => (
              <li key={c.id}>
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    activeId === c.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60",
                  )}
                >
                  <button onClick={() => onSelect(c.id)} className="min-w-0 flex-1 truncate text-left">
                    {c.title}
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    aria-label="Excluir conversa"
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <div className="border-t border-border p-2">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => onOpenPanel("memory")}>
            <Brain className="size-4" />
            Memórias
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => onOpenPanel("prompt")}>
            <PanelRight className="size-4" />
            Treinar IA
          </Button>
        </div>
      </aside>
    </>
  )
}
