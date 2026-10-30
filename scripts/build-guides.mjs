// Gera os PDFs dos guias a partir de content/guides/*.md.
// Uso: npm run build:guides  (opcional: CHROMIUM_PATH=/caminho/do/chrome)
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const SRC = path.join(process.cwd(), "content", "guides");
const OUT = path.join(process.cwd(), "content", "guides-pdf");
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");

function toHtml(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) { i++; continue; }
    if (t.startsWith("# ")) { out.push(`<h1>${inline(t.slice(2))}</h1>`); i++; }
    else if (t.startsWith("## ")) { out.push(`<h2>${inline(t.slice(3))}</h2>`); i++; }
    else if (t.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [h, ...b] = rows;
      out.push(`<table><thead><tr>${h.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${b
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table>`);
    } else if (/^- /.test(t)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i].trim())) items.push(lines[i++].trim().slice(2));
      out.push(`<ul>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`);
    } else if (/^\d+\. /.test(t)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+\. /, ""));
      out.push(`<ol>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</ol>`);
    } else {
      const p = [];
      while (i < lines.length && lines[i].trim() && !/^(#|\||- |\d+\. )/.test(lines[i].trim())) p.push(lines[i++].trim());
      out.push(`<p>${inline(p.join(" "))}</p>`);
    }
  }
  return out.join("\n");
}

const CSS = `
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; }
body { font-family: "Helvetica Neue", Arial, sans-serif; color: #23161b; font-size: 11pt; line-height: 1.55; margin: 0; }
.brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13pt; margin-bottom: 18px; }
.mark { width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(135deg, #ff5b1f, #ff8a3d); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 11pt; }
h1 { font-size: 24pt; line-height: 1.15; margin: 0 0 6px; letter-spacing: -0.01em; }
h1 + p { color: #6a5a61; margin-top: 0; padding-bottom: 14px; border-bottom: 3px solid #ff5b1f; }
h2 { font-size: 14pt; margin: 22px 0 6px; color: #c63d0b; break-after: avoid; }
p, li { orphans: 3; widows: 3; }
ul, ol { padding-left: 20px; margin: 6px 0; }
li { margin: 3px 0; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9.5pt; break-inside: avoid; }
th, td { border: 1px solid #e6d8d2; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #fbeee8; }
em { color: #6a5a61; }
`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".md"))) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="brand"><span class="mark">N</span> NovaDigital</div>
${toHtml(fs.readFileSync(path.join(SRC, file), "utf8"))}
</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  const out = path.join(OUT, file.replace(/\.md$/, ".pdf"));
  await page.pdf({
    path: out,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="font-size:8pt;color:#8f8088;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>NovaDigital · Material educativo</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`,
    margin: { top: "18mm", bottom: "20mm", left: "16mm", right: "16mm" },
  });
  console.log("gerado:", path.relative(process.cwd(), out));
}
await browser.close();
