import Link from "next/link";
import { getUser } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

export async function PublicNav() {
  const user = await getUser();
  return (
    <header className="landing-nav">
      <Link href="/" className="brand" style={{ padding: 0 }}>
        <span className="brand-mark">N</span> NovaDigital
      </Link>
      <nav className="row" aria-label="Navegação do site">
        <Link href="/#como-funciona" className="btn btn-ghost btn-sm hide-sm">
          Como funciona
        </Link>
        <Link href="/#trilhas" className="btn btn-ghost btn-sm hide-sm">
          Trilhas
        </Link>
        <Link href="/planos" className="btn btn-ghost btn-sm hide-sm">
          Planos
        </Link>
        <ThemeToggle />
        {user ? (
          <Link href="/painel" className="btn btn-primary btn-sm">
            Ir para o painel
          </Link>
        ) : (
          <>
            <Link href="/entrar" className="btn btn-sm">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn btn-primary btn-sm">
              Começar grátis
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} NovaDigital. Educação prática em marketing digital.</span>
        <span>Resultados dependem de dedicação, prática e mercado. Não prometemos renda.</span>
      </div>
    </footer>
  );
}
