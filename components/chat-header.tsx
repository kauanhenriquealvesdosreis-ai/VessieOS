"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Brain, LogOut, Menu, PanelRight, Sparkles } from "lucide-react"

type Props = {
  user: { name: string; email: string }
  promptVersion: number
  onToggleSidebar: () => void
  onOpenPanel: (p: "memory" | "prompt") => void
}

export function ChatHeader({ user, promptVersion, onToggleSidebar, onOpenPanel }: Props) {
  const router = useRouter()
  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="flex h-14 items-center gap-2 border-b border-border px-3 sm:px-4">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar} aria-label="Abrir menu">
        <Menu className="size-5" />
      </Button>

      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <span className="font-semibold tracking-tight">Nexa</span>
        <span className="hidden rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground sm:inline">
          {"prompt v" + promptVersion}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onOpenPanel("memory")} aria-label="Memórias" title="Memórias">
          <Brain className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenPanel("prompt")}
          aria-label="Treinar IA"
          title="Treinar IA"
        >
          <PanelRight className="size-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Conta">
              <Avatar className="size-7">
                <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate">{user.name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
