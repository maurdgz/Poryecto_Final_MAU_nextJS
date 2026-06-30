"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";

export function RightSidebar() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-80 xl:w-96 px-4 py-2 h-screen sticky top-0 border-l border-zinc-800">
      <div className="sticky top-2 bg-black py-2">
        <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-full border border-transparent focus-within:border-blue-500 focus-within:bg-black transition-all">
          <Search size={18} className="text-zinc-500" />
          <input 
            type="text" 
            placeholder={t("explore") + "..."} 
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-2">MVPcode</h2>
        <p className="text-sm text-zinc-500">
          La plataforma para conectar desarrolladores con proyectos reales.
        </p>
      </div>
    </aside>
  );
}

const TrendItem = ({ category, title, posts }: any) => (
  <div className="hover:bg-zinc-800/50 cursor-pointer transition-colors -mx-4 px-4 py-2">
    <p className="text-xs text-zinc-500">{category} · Tendencia</p>
    <p className="font-bold">{title}</p>
    <p className="text-xs text-zinc-500">{posts}</p>
  </div>
);

const UserSuggestion = ({ name, role, stars }: any) => (
  <div className="flex items-center gap-3 hover:bg-zinc-800/50 cursor-pointer transition-colors -mx-4 px-4 py-2">
    <div className="w-10 h-10 rounded-full bg-zinc-700" />
    <div className="flex-grow">
      <p className="font-bold text-sm">{name}</p>
      <p className="text-xs text-zinc-500">{role}</p>
    </div>
    <div className="text-yellow-500 text-xs font-bold">
      ★ {stars}
    </div>
  </div>
);
