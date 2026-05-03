import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell overflow-hidden">
      <Topbar />
      {children}
      <Sidebar />
    </div>
  );
}
