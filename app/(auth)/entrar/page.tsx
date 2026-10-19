import type { Metadata } from "next";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <h1 style={{ fontSize: 22 }}>Bem-vinda(o) de volta</h1>
      <p className="muted small" style={{ margin: "6px 0 18px" }}>
        Entre para continuar sua jornada.
      </p>
      <LoginForm next={next} />
    </>
  );
}
