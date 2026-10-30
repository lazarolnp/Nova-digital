import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Lock } from "lucide-react";
import { FREE_GUIDE } from "@/lib/guides";
import { requireOnboardedUser } from "@/lib/auth";
import { listTrails } from "@/lib/content";
import { planOf } from "@/lib/access";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/Progress";

export const metadata: Metadata = { title: "Trilhas" };

export default async function TrailsPage() {
  const user = await requireOnboardedUser();
  const plan = await planOf(user);
  const trails = await listTrails(user.id);
  return (
    <>
      <PageHeader title="Trilhas de aprendizagem" subtitle="Seis trilhas, uma para cada forma de trabalhar no digital. Cada uma tem cursos, missões, guia em PDF e uma IA especialista." />
      <div className="card row between">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <div className="icon-box">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="card-title">Guia gratuito: {FREE_GUIDE.title}</h2>
            <p className="small muted">PDF com os caminhos do digital, como escolher o seu e como evitar golpes.</p>
          </div>
        </div>
        <a href={`/api/guias/${FREE_GUIDE.slug}`} className="btn">
          <Download size={15} /> Baixar PDF
        </a>
      </div>
      <div className="stack-lg">
        {trails.map((t, idx) => {
          const lessons = t.courses.reduce((s, c) => s + c.lessons, 0);
          const done = t.courses.reduce((s, c) => s + c.done, 0);
          const pct = lessons ? (done / lessons) * 100 : 0;
          const locked = plan === "free" && t.courses.some((c) => c.is_premium);
          return (
            <article key={t.slug} className="card">
              <div className="grid grid-3" style={{ alignItems: "start" }}>
                <div className="span-2">
                  <div className="row">
                    <span className="label">Trilha {idx + 1}</span>
                    <span className="badge">{t.level_label}</span>
                    {locked ? (
                      <span className="badge badge-warning">
                        <Lock size={11} /> Introdução gratuita · completa no Premium
                      </span>
                    ) : (
                      <span className="badge badge-success">Liberada</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: 20, marginTop: 10 }}>{t.title}</h2>
                  <p className="muted" style={{ marginTop: 6 }}>
                    {t.description}
                  </p>
                  <div className="row" style={{ marginTop: 12 }}>
                    {t.courses.length > 1
                      ? t.courses.map((c) => (
                          <span key={c.id} className="badge">
                            {c.title}
                          </span>
                        ))
                      : t.modules.map((m, i) => (
                          <span key={m} className="badge">
                            Módulo {i + 1}: {m}
                          </span>
                        ))}
                  </div>
                </div>
                <div className="stack">
                  <div className="row between small">
                    <span className="muted">
                      {done}/{lessons} aulas
                    </span>
                    <span className="muted">
                      {t.missions.done}/{t.missions.total} missões
                    </span>
                  </div>
                  <Progress value={pct} label={`Progresso na trilha ${t.title}`} />
                  <Link href={`/trilhas/${t.slug}`} className="btn btn-primary btn-block">
                    {done > 0 ? "Continuar trilha" : "Abrir trilha"}
                  </Link>
                  <Link href={`/assistente?trilha=${t.slug}`} className="btn btn-block">
                    Tirar dúvidas com a IA da trilha
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
