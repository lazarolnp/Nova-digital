"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("nd-theme", next);
    } catch {
      // armazenamento indisponível: o tema vale apenas para esta sessão
    }
  }

  return (
    <button type="button" className="btn btn-sm" onClick={toggle} aria-label={`Ativar tema ${theme === "dark" ? "claro" : "escuro"}`}>
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      Tema
    </button>
  );
}
