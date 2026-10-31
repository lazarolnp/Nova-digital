import fs from "node:fs/promises";
import path from "node:path";
import { getUser } from "@/lib/auth";
import { accessOf, canAccessTrail } from "@/lib/access";
import { guideBySlug } from "@/lib/guides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Download dos guias em PDF. O guia gratuito exige apenas login; os guias das trilhas seguem o acesso ao conteúdo premium.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return new Response("Guia não encontrado.", { status: 404 });

  const user = await getUser();
  if (!user) return Response.redirect(new URL("/entrar", req.url), 303);
  if (!guide.free && !canAccessTrail(await accessOf(user), guide.slug)) {
    return Response.redirect(new URL("/planos", req.url), 303);
  }

  const file = await fs.readFile(path.join(process.cwd(), "content", "guides-pdf", `${guide.slug}.pdf`));
  return new Response(new Uint8Array(file), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="NovaDigital - ${guide.slug}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
