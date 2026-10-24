import { applyKiwifyEvent, verifyKiwifySignature } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

// Recebe os avisos de pagamento da Kiwify e libera ou remove o acesso.
export async function POST(req: Request) {
  const token = process.env.KIWIFY_WEBHOOK_TOKEN;
  if (!token) return json(503, { error: "KIWIFY_WEBHOOK_TOKEN não configurado." });

  // A assinatura é calculada sobre o corpo bruto: ler como texto antes de interpretar o JSON.
  const raw = await req.text();
  const signature = new URL(req.url).searchParams.get("signature");
  if (!verifyKiwifySignature(raw, signature, token)) return json(401, { error: "Assinatura inválida." });

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("payload");
    body = parsed;
  } catch {
    return json(400, { error: "JSON inválido." });
  }

  try {
    const result = await applyKiwifyEvent(body);
    return json(200, { ok: true, result });
  } catch (err) {
    console.error("[kiwify]", err);
    // 500 faz a Kiwify tentar reenviar o aviso mais tarde.
    return json(500, { error: "Erro ao processar o evento." });
  }
}
