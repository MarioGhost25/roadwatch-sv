import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Vialidad SV — Tráfico en tiempo real",
  description:
    "Monitoreo en tiempo real del estado del tráfico y vialidades en El Salvador.",
  keywords: ["vialidad", "tráfico", "El Salvador", "monitoreo", "accidentes"],
};

export const viewport: Viewport = {
  themeColor: "#0f1923",
  colorScheme: "dark",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${jetbrainsMono.variable} bg-bg-base antialiased`}
    >
      <body className="font-sans text-text-primary overflow-hidden">
        <div className="app-shell">
          <Topbar />
          {children}
          <Sidebar />
        </div>
      </body>
    </html>
  );
}
