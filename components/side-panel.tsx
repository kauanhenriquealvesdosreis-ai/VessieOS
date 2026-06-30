"use client"

import type { Dispatch, SetStateAction } from "react"
import { useState, useTransition } from "react"
import type { Memory } from "@/components/chat-app"
import { addMemory, deleteMemory } from "@/app/actions/memory"
import { evolvePromptWithFeedback, getSystemPrompt, resetSystemPrompt, updateSystemPrompt } from "@/app/actions/system-prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Brain, GraduationCap, Plus, RotateCcw, Save, Trash2, X } from "lucide-react"

type Props = {
  panel: "memory" | "prompt" | null
  onClose: () => void
  memories: Memory[]
  setMemories: Dispatch<SetStateAction<Memory[]>>
  promptVersion: number
  setPromptVersion: Dispatch<SetStateAction<number>>
  initialPromptContent: string
}

export function SidePanel({
  panel,
  onClose,
  memories,
  setMemories,
  promptVersion,
  setPromptVersion,
  initialPromptContent,
}: Props) {
  const open = panel !== null
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-card text-card-foreground transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            {panel === "memory" ? <Brain className="size-5 text-primary" /> : <GraduationCap className="size-5 text-primary" />}
            <h2 className="font-semibold">{panel === "memory" ? "Memórias da IA" : "Treinar a IA"}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar painel">
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          {panel === "memory" && <MemoryPanel memories={memories} setMemories={setMemories} />}
          {panel === "prompt" && (
            <PromptPanel
              promptVersion={promptVersion}
              setPromptVersion={setPromptVersion}
              initialPromptContent={initialPromptContent}
            />
          )}
        </div>
      </aside>
    </>
  )
}

function MemoryPanel({
  memories,
  setMemories,
}: {
  memories: Memory[]
  setMemories: Dispatch<SetStateAction<Memory[]>>
}) {
  const [value, setValue] = useState("")
  const [pending, start] = useTransition()

  function handleAdd() {
    const content = value.trim()
    if (!content) return
    const optimistic = { id: Date.now(), content }
    setMemories((prev) => [optimistic, ...prev])
    setValue("")
    start(async () => {
      await addMemory(content)
    })
  }

  function handleDelete(id: number) {
    setMemories((prev) => prev.filter((m) => m.id !== id))
    start(async () => {
      await deleteMemory(id)
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <p className="mb-3 text-sm text-muted-foreground text-pretty">
          Fatos que a IA guarda sobre você e usa para personalizar as respostas. Ela também aprende sozinha durante as
          conversas.
        </p>
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) handleAdd()
            }}
            placeholder="Ex.: Prefiro respostas curtas"
          />
          <Button onClick={handleAdd} size="icon" disabled={pending} aria-label="Adicionar memória">
            <Plus className="size-5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        {memories.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma memória ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {memories.map((m) => (
              <li
                key={m.id}
                className="group flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <Brain className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 text-pretty">{m.content}</span>
                <button
                  onClick={() => handleDelete(m.id)}
                  aria-label="Excluir memória"
                  className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  )
}

function PromptPanel({
  promptVersion,
  setPromptVersion,
  initialPromptContent,
}: {
  promptVersion: number
  setPromptVersion: Dispatch<SetStateAction<number>>
  initialPromptContent: string
}) {
  const [content, setContent] = useState(initialPromptContent)
  const [feedback, setFeedback] = useState("")
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)

  async function refreshPrompt() {
    const sp = await getSystemPrompt()
    setContent(sp.content)
    setPromptVersion(sp.version)
  }

  function handleSave() {
    start(async () => {
      await updateSystemPrompt(content)
      await refreshPrompt()
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    })
  }

  function handleTeach() {
    const fb = feedback.trim()
    if (!fb) return
    setFeedback("")
    start(async () => {
      await evolvePromptWithFeedback(fb)
      await refreshPrompt()
    })
  }

  function handleReset() {
    start(async () => {
      await resetSystemPrompt()
      await refreshPrompt()
    })
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-5 p-4">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Versão do prompt</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {"v" + promptVersion}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground text-pretty">
            Cada ajuste ou ensinamento incrementa a versão. É assim que a IA {'"evolui"'} ao longo do tempo.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="teach" className="text-sm font-medium">
            Ensinar com feedback
          </label>
          <p className="text-xs text-muted-foreground text-pretty">
            Diga como você quer que ela se comporte. A instrução é anexada ao comportamento dela.
          </p>
          <div className="flex gap-2">
            <Input
              id="teach"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) handleTeach()
              }}
              placeholder="Ex.: Seja mais formal e use exemplos"
            />
            <Button onClick={handleTeach} disabled={pending} className="shrink-0 gap-1.5">
              <GraduationCap className="size-4" />
              Ensinar
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="prompt" className="text-sm font-medium">
            Prompt de sistema (comportamento)
          </label>
          <Textarea
            id="prompt"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="resize-none font-mono text-xs leading-relaxed"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={pending} className="flex-1 gap-1.5">
              <Save className="size-4" />
              {saved ? "Salvo!" : "Salvar"}
            </Button>
            <Button onClick={handleReset} variant="outline" disabled={pending} className="gap-1.5 bg-transparent">
              <RotateCcw className="size-4" />
              Restaurar
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
