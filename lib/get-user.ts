import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Usar uma variável de ambiente para ativar o modo "sempre autorizado"
const ALWAYS_AUTHORIZED = process.env.ALWAYS_AUTHORIZED === "true";

// Dados de usuário fictício para usar quando ALWAYS_AUTHORIZED estiver ativo
const MOCK_USER = {
  id: "mock-user-id",
  name: "Usuário de Teste",
  email: "teste@exemplo.com",
  // outras propriedades que seu sistema espera
};

export async function getUserId() {
  if (ALWAYS_AUTHORIZED) {
    return MOCK_USER.id;
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autorizado");
  return session.user.id;
}

export async function getCurrentUser() {
  if (ALWAYS_AUTHORIZED) {
    return MOCK_USER;
  }

  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}