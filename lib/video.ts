/** Converte links de vídeo em URLs de incorporação seguras (YouTube, Vimeo ou arquivo .mp4/.webm). */
export function videoEmbed(url: string): { type: "iframe" | "file"; src: string } | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v") ?? (u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : null);
    if (id && /^[\w-]{6,20}$/.test(id)) return { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    if (/^[\w-]{6,20}$/.test(id)) return { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean).pop();
    if (id && /^\d+$/.test(id)) return { type: "iframe", src: `https://player.vimeo.com/video/${id}` };
  }
  if (/\.(mp4|webm)$/i.test(u.pathname)) return { type: "file", src: u.toString() };
  return null;
}
