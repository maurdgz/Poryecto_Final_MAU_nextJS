"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";

const CrownIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className="w-12 h-12"
  >
    <defs>
      <linearGradient id="crownGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path 
      d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM5 16V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V16H5Z" 
      fill="url(#crownGradientRight)"
    />
  </svg>
);

export function RightSidebar() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-80 xl:w-96 px-4 py-2 h-screen sticky top-0 border-l border-zinc-800">
      <div className="sticky top-2 bg-black py-2">
        <div className="flex items-center gap-3 bg-transparent px-4 py-2 rounded-full border border-transparent focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
          <Search size={18} className="text-zinc-500" />
          <input 
            type="text" 
            placeholder={t("explore") + "..."} 
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col items-center">
        <CrownIcon />
        <h2 className="text-5xl font-black mt-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
          MVPcode
        </h2>
        <p className="text-lg text-slate-400 leading-relaxed text-center mt-2">
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
