import Link from "next/link";
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, Compass, FolderKanban, ShieldCheck, Target, Wrench } from "lucide-react";
import { all } from "@/lib/db";
import { PublicFooter, PublicNav } from "@/components/PublicNav";

export const dynamic = "force-dynamic";

const STEPS = [
  { icon: Compass, title: "Diagnóstico rápido", text: "Você responde seis perguntas sobre conhecimento, tempo, orçamento e objetivo." },
  { icon: CalendarCheck, title: "Plano de 30 dias", text: "A plataforma organiza aulas, missões e projetos de acordo com a sua realidade." },
  { icon: Target, title: "Aprenda e pratique", text: "Cada aula tem exercício; cada trilha tem missões com checklist e critérios de avaliação." },
  { icon: FolderKanban, title: "Monte seu portfólio", text: "Seus trabalhos viram projetos organizados que você pode apresentar." },
];

export default function LandingPage() {
  const trails = all<{ slug: string; title: string; subtitle: string; level_label: string }>(
    "SELECT slug, title, subtitle, level_label FROM trails ORDER BY sort",
  );
  return (
    <>
      <PublicNav />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="fade-in">
              <span className="badge badge-accent">Para quem está começando no digital</span>
              <h1 style={{ marginTop: 18 }}>
                Transforme a vontade de começar no digital em um <em>plano de ação</em>.
              </h1>
              <p className="lead">
                Trilhas práticas de tráfego pago, sites, vídeo, afiliados e IA. Missões reais, ferramentas acessíveis, um plano de 30
                dias feito para você e um assistente de IA que explica sem complicar.
              </p>
              <div className="row" style={{ marginTop: 28 }}>
                <Link href="/cadastro" className="btn btn-primary">
                  Criar conta gratuita <ArrowRight size={16} />
                </Link>
                <Link href="#como-funciona" className="btn">
                  Ver como funciona
                </Link>
              </div>
              <p className="small faint" style={{ marginTop: 16 }}>
                Sem promessas de dinheiro fácil. Aqui você aprende habilidades reais e coloca em prática.
              </p>
            </div>
            <div className="card fade-in" aria-label="Exemplo ilustrativo do painel">
              <div className="row between">
                <span className="label">Exemplo ilustrativo</span>
                <span className="badge">Semana 1</span>
              </div>
              <h3 style={{ marginTop: 12 }}>Seu plano desta semana</h3>
              <div className="stack" style={{ marginTop: 14 }}>
                {["Aula: Como funciona o marketing digital", "Missão: Monte sua rotina de estudos", "Aula: Como evitar golpes e falsas promessas", "Missão: Mapeie oportunidades no seu bairro"].map(
                  (t, i) => (
                    <div key={t} className="row" style={{ gap: 10 }}>
                      <CheckCircle2 size={18} color={i < 2 ? "var(--success)" : "var(--text-faint)"} />
                      <span className={i < 2 ? "muted" : ""}>{t}</span>
                    </div>
                  ),
                )}
              </div>
              <div className="progress" style={{ marginTop: 18 }}>
                <span style={{ width: "50%" }} />
              </div>
              <p className="tiny faint" style={{ marginTop: 8 }}>
                Ilustração da interface. Seu plano é gerado a partir das suas respostas.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="como-funciona">
          <h2 className="section-title">Como a NovaDigital funciona</h2>
          <p className="section-lead">Você sempre sabe o que estudar, o que praticar e qual é o próximo passo.</p>
          <div className="grid grid-4" style={{ marginTop: 28 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} className="card">
                <div className="icon-box">
                  <s.icon size={18} />
                </div>
                <p className="label" style={{ marginTop: 14 }}>
                  Passo {i + 1}
                </p>
                <h3 style={{ marginTop: 6, fontSize: 17 }}>{s.title}</h3>
                <p className="muted small" style={{ marginTop: 8 }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="trilhas">
          <h2 className="section-title">Trilhas de aprendizagem</h2>
          <p className="section-lead">Do básico ao primeiro cliente, em etapas. Cada trilha tem módulos, aulas, exercícios, materiais e missões.</p>
          <div className="grid grid-auto" style={{ marginTop: 28 }}>
            {trails.map((t, i) => (
              <div key={t.slug} className="card card-hover">
                <div className="row between">
                  <span className="label">Trilha {i + 1}</span>
                  <span className="badge">{t.level_label}</span>
                </div>
                <h3 style={{ marginTop: 10, fontSize: 18 }}>{t.title}</h3>
                <p className="muted small" style={{ marginTop: 6 }}>
                  {t.subtitle}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="grid grid-3">
            <div className="card">
              <div className="icon-box">
                <Target size={18} />
              </div>
              <h3 style={{ marginTop: 14 }}>Central de Missões</h3>
              <p className="muted small" style={{ marginTop: 8 }}>
                Transforme conhecimento em entrega: objetivo, passo a passo, ferramentas, checklist, registro do resultado e critérios
                de avaliação.
              </p>
            </div>
            <div className="card">
              <div className="icon-box">
                <Wrench size={18} />
              </div>
              <h3 style={{ marginTop: 14 }}>Kit de ferramentas</h3>
              <p className="muted small" style={{ marginTop: 8 }}>
                Ferramentas reais organizadas por categoria, com indicação clara de gratuito, freemium ou pago e link oficial.
              </p>
            </div>
            <div className="card">
              <div className="icon-box">
                <Bot size={18} />
              </div>
              <h3 style={{ marginTop: 14 }}>Assistente de IA</h3>
              <p className="muted small" style={{ marginTop: 8 }}>
                Tire dúvidas, crie planos semanais, roteiros, anúncios e propostas, e receba feedback sobre suas missões.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="card" style={{ display: "grid", gap: 18, gridTemplateColumns: "auto 1fr", alignItems: "center" }}>
            <div className="icon-box" style={{ width: 52, height: 52 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3>Nosso compromisso: honestidade</h3>
              <p className="muted" style={{ marginTop: 6 }}>
                Não prometemos renda garantida nem resultados rápidos. Ensinamos habilidades valorizadas pelo mercado, mostramos como
                praticá-las e ajudamos você a se proteger de golpes e falsas promessas.
              </p>
            </div>
          </div>
        </section>

        <section className="section" style={{ textAlign: "center" }}>
          <h2 className="section-title">Comece pelo plano gratuito</h2>
          <p className="section-lead" style={{ marginInline: "auto" }}>
            Introdução ao marketing digital, aulas introdutórias de todas as trilhas, missões iniciais, ferramentas e seu plano de 30
            dias.
          </p>
          <div className="row" style={{ justifyContent: "center", marginTop: 24 }}>
            <Link href="/cadastro" className="btn btn-primary">
              Criar conta gratuita <ArrowRight size={16} />
            </Link>
            <Link href="/planos" className="btn">
              Comparar planos
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
