import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import { getConversations } from "@/app/actions/chat"
import { getMemories } from "@/app/actions/memory"
import { getSystemPrompt } from "@/app/actions/system-prompt"
import { ChatApp } from "@/components/chat-app"

export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")

  const [conversations, memories, systemPrompt] = await Promise.all([
    getConversations(),
    getMemories(),
    getSystemPrompt(),
  ])

  return (
    <ChatApp
      user={{ name: user.name, email: user.email }}
      initialConversations={conversations}
      initialMemories={memories}
      initialPrompt={systemPrompt}
    />
  )
}
