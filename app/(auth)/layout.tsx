import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (user) redirect(user.onboarded ? "/painel" : "/onboarding");
  return (
    <main className="auth-wrap">
      <div className="auth-card fade-in">
        <Link href="/" className="brand" style={{ justifyContent: "center", paddingBottom: 18 }}>
          <span className="brand-mark">N</span> NovaDigital
        </Link>
        <div className="card">{children}</div>
      </div>
    </main>
  );
}
