"use client";

import { Search, Users, Briefcase, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "projects">("all");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        let endpoint = "";
        if (searchType === "users") {
          endpoint = `/api/search/users?q=${encodeURIComponent(searchQuery)}`;
        } else if (searchType === "projects") {
          endpoint = `/api/search/projects?q=${encodeURIComponent(searchQuery)}`;
        } else {
          endpoint = `/api/search/all?q=${encodeURIComponent(searchQuery)}`;
        }

        const res = await axios.get(endpoint);
        setResults(res.data);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType]);

  const handleResultClick = (result: any) => {
    setShowResults(false);
    setSearchQuery("");
    if (result.type === "user") {
      router.push(`/profile/${result.id}`);
    } else if (result.type === "project") {
      router.push(`/projects/${result.id}`);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-80 xl:w-96 px-4 py-2 h-screen sticky top-0 border-l border-zinc-800">
      <div className="sticky top-2 bg-black py-2" ref={searchRef}>
        <div className="relative">
          <div className="flex items-center gap-3 bg-transparent px-4 py-2 rounded-full border border-transparent focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <Search size={18} className="text-zinc-500" />
            <input 
              type="text" 
              placeholder={t("explore") + "..."} 
              className="bg-transparent border-none outline-none w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setResults([]);
                  setShowResults(false);
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Type Filter */}
          {searchQuery && (
            <div className="flex gap-2 mt-2 px-2">
              <button
                onClick={() => setSearchType("all")}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  searchType === "all" 
                    ? "bg-indigo-500 text-white" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Todo
              </button>
              <button
                onClick={() => setSearchType("users")}
                className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  searchType === "users" 
                    ? "bg-indigo-500 text-white" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                <Users size={12} /> Usuarios
              </button>
              <button
                onClick={() => setSearchType("projects")}
                className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  searchType === "projects" 
                    ? "bg-indigo-500 text-white" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                <Briefcase size={12} /> Proyectos
              </button>
            </div>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
              {loading ? (
                <div className="p-4 text-center text-zinc-500 text-sm">
                  Buscando...
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 text-sm">
                  No se encontraron resultados
                </div>
              ) : (
                results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-4 hover:bg-zinc-800 cursor-pointer transition-colors border-b border-zinc-800 last:border-b-0"
                  >
                    {result.type === "user" ? (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400"
                          style={result.image ? { backgroundImage: `url(${result.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                        >
                          {!result.image && <span className="text-xs font-black text-white">{result.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{result.name}</p>
                          <p className="text-xs text-zinc-500">@{result.email?.split('@')[0]}</p>
                          <p className="text-xs text-zinc-400">{result.role === 'DEVELOPER' ? 'Desarrollador' : 'Cliente'}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400"
                            style={result.client?.image ? { backgroundImage: `url(${result.client.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                          >
                            {!result.client?.image && <span className="text-xs font-black text-white">{result.client?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}</span>}
                          </div>
                          <p className="font-bold text-sm truncate">{result.title}</p>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2">{result.description}</p>
                        <p className="text-xs text-green-500 mt-1">S/ {result.budget}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
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
