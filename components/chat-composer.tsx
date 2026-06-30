"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Attachment } from "@/app/actions/chat"
import { ArrowUp, Paperclip, X, FileText } from "lucide-react"

type Props = {
  onSend: (content: string, attachments: Attachment[]) => void
  disabled?: boolean
}

export function ChatComposer({ onSend, disabled }: Props) {
  const [value, setValue] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const next: Attachment[] = []
    Array.from(files)
      .slice(0, 4)
      .forEach((f) => {
        next.push({ name: f.name, type: f.type, url: URL.createObjectURL(f) })
      })
    setAttachments((prev) => [...prev, ...next].slice(0, 4))
    if (fileRef.current) fileRef.current.value = ""
  }

  function submit() {
    const trimmed = value.trim()
    if ((!trimmed && attachments.length === 0) || disabled) return
    onSend(trimmed, attachments)
    setValue("")
    setAttachments([])
    if (taRef.current) taRef.current.style.height = "auto"
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      submit()
    }
  }

  function autoGrow(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 180) + "px"
  }

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <div className="mx-auto max-w-3xl">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
                {a.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url || "/placeholder.svg"} alt={a.name} className="size-7 rounded object-cover" />
                ) : (
                  <FileText className="size-4 text-muted-foreground" />
                )}
                <span className="max-w-32 truncate">{a.name}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label={"Remover " + a.name}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => fileRef.current?.click()}
            aria-label="Anexar arquivo"
          >
            <Paperclip className="size-5" />
          </Button>
          <Textarea
            ref={taRef}
            value={value}
            onChange={autoGrow}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Envie uma mensagem..."
            className="max-h-44 min-h-9 resize-none border-0 bg-transparent px-1 py-1.5 shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={submit}
            disabled={disabled || (!value.trim() && attachments.length === 0)}
            aria-label="Enviar mensagem"
          >
            <ArrowUp className="size-5" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Modo demonstração — respostas simuladas. A IA aprende com memória e feedback.
        </p>
      </div>
    </div>
  )
}
