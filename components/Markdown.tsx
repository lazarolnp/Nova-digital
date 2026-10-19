import { Fragment, type ReactNode } from "react";

// Renderizador de Markdown mínimo e seguro: gera elementos React (sem HTML bruto).
// Suporta: ## / ### títulos, listas (- e 1.), tabelas, parágrafos, **negrito**, *itálico* e [links](https://...).

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((https?:\/\/[^\s)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyBase}-${i++}`;
    if (token.startsWith("**")) out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      out.push(
        <a key={key} href={m[2]} target="_blank" rel="noopener noreferrer">
          {label}
        </a>,
      );
    } else out.push(<em key={key}>{token.slice(1, -1)}</em>);
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function splitRow(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const key = `b${k++}`;
    if (!trimmed) {
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(<h3 key={key}>{inline(trimmed.slice(4), key)}</h3>);
      i++;
    } else if (trimmed.startsWith("## ")) {
      blocks.push(<h2 key={key}>{inline(trimmed.slice(3), key)}</h2>);
      i++;
    } else if (trimmed.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = splitRow(lines[i]);
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <table key={key}>
          <thead>
            <tr>{head?.map((c, ci) => <th key={ci}>{inline(c, `${key}h${ci}`)}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri}>{r.map((c, ci) => <td key={ci}>{inline(c, `${key}r${ri}c${ci}`)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      );
    } else if (/^[-*] /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) items.push(lines[i++].trim().slice(2));
      blocks.push(
        <ul key={key}>
          {items.map((it, ii) => <li key={ii}>{inline(it, `${key}-${ii}`)}</li>)}
        </ul>,
      );
    } else if (/^\d+\. /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+\. /, ""));
      blocks.push(
        <ol key={key}>
          {items.map((it, ii) => <li key={ii}>{inline(it, `${key}-${ii}`)}</li>)}
        </ol>,
      );
    } else {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3} |\||[-*] |\d+\. )/.test(lines[i].trim())) para.push(lines[i++].trim());
      blocks.push(
        <p key={key}>
          {para.map((p, pi) => (
            <Fragment key={pi}>
              {pi > 0 ? <br /> : null}
              {inline(p, `${key}-${pi}`)}
            </Fragment>
          ))}
        </p>,
      );
    }
  }
  return <div className="prose">{blocks}</div>;
}
