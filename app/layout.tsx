import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "NovaDigital — Aprenda marketing digital na prática", template: "%s · NovaDigital" },
  description:
    "Plataforma para iniciantes aprenderem marketing digital com trilhas, missões práticas, ferramentas, plano de 30 dias e assistente de IA.",
};

export const viewport: Viewport = { themeColor: "#120b10", width: "device-width", initialScale: 1 };

// Aplica o tema salvo antes da pintura para evitar flash.
const themeScript = `try{var t=localStorage.getItem('nd-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
