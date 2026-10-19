import type { Metadata } from "next";
import { SignupForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignupPage() {
  return (
    <>
      <h1 style={{ fontSize: 22 }}>Comece sua jornada no digital</h1>
      <p className="muted small" style={{ margin: "6px 0 18px" }}>
        Crie sua conta gratuita e receba um plano de 30 dias personalizado.
      </p>
      <SignupForm />
    </>
  );
}
