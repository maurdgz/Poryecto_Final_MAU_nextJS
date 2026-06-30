"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search } from "lucide-react";

export default function Explore() {
  const { t } = useLanguage();

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-800 p-4">
            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-full border border-transparent focus-within:border-blue-500 focus-within:bg-black transition-all">
              <Search size={18} className="text-zinc-500" />
              <input 
                type="text" 
                placeholder={t("explore") + "..."} 
                className="bg-transparent border-none outline-none w-full text-sm text-white"
              />
            </div>
          </header>

          <div className="p-8 text-center text-zinc-500 italic">
            {t("explore_empty") || "Próximamente: Descubre nuevos proyectos y talentos."}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
