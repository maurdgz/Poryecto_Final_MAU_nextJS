"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  Bell, 
  User, 
  MoreHorizontal,
  Code2,
  Briefcase,
  History,
  LogOut,
  Globe,
  X,
  Users,
  Briefcase as BriefcaseIcon
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
  <Link 
    href={href} 
    className={`flex items-center gap-4 p-3 rounded-full hover:bg-zinc-900 transition-colors w-fit ${active ? "font-bold" : ""}`}
  >
    <Icon size={26} />
    <span className="text-xl hidden xl:block">{label}</span>
  </Link>
);

const CrownIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className="w-8 h-8"
  >
    <defs>
      <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path 
      d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM5 16V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V16H5Z" 
      fill="url(#crownGradient)"
    />
  </svg>
);

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const role = (session?.user as any)?.role;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "projects">("all");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowSearchInput(false);
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
    setShowSearchInput(false);
    setSearchQuery("");
    if (result.type === "user") {
      router.push(`/profile/${result.id}`);
    } else if (result.type === "project") {
      router.push(`/projects/${result.id}`);
    }
  };

  return (
    <aside className="flex flex-col h-screen sticky top-0 px-2 xl:px-4 py-4 w-20 xl:w-64 border-r border-zinc-800">
      <div className="mb-4 px-3 flex items-center justify-between">
        <Link href="/">
          <CrownIcon />
        </Link>
        <button 
          onClick={() => setLanguage(language === "ES-LA" ? "EN-US" : "ES-LA")}
          className="hidden xl:flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors border border-zinc-800 rounded px-1"
        >
          <Globe size={10} />
          {language}
        </button>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        <SidebarItem icon={Home} label={t("home")} href="/" active={pathname === "/"} />
        
        {/* Search Button */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className={`flex items-center gap-4 p-3 rounded-full hover:bg-zinc-900 transition-colors w-fit ${showSearchInput ? "bg-zinc-900" : ""}`}
          >
            <Search size={26} />
            <span className="text-xl hidden xl:block">{t("explore")}</span>
          </button>

          {/* Search Input and Results */}
          {showSearchInput && (
            <div className="absolute left-0 top-12 z-50 w-72 xl:w-80">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2">
                <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                  <Search size={16} className="text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="bg-transparent border-none outline-none w-full text-sm text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
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
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Search Type Filter */}
                {searchQuery && (
                  <div className="flex gap-2 mt-2 px-1">
                    <button
                      onClick={() => setSearchType("all")}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        searchType === "all"
                          ? "bg-indigo-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      Todo
                    </button>
                    <button
                      onClick={() => setSearchType("users")}
                      className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
                        searchType === "users"
                          ? "bg-indigo-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      <Users size={10} /> Usuarios
                    </button>
                    <button
                      onClick={() => setSearchType("projects")}
                      className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
                        searchType === "projects"
                          ? "bg-indigo-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      <BriefcaseIcon size={10} /> Proyectos
                    </button>
                  </div>
                )}

                {/* Search Results */}
                {showResults && (
                  <div className="mt-2 max-h-64 overflow-y-auto">
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
                          className="p-3 hover:bg-zinc-800 cursor-pointer transition-colors border-b border-zinc-800 last:border-b-0"
                        >
                          {result.type === "user" ? (
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400"
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
                                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400"
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
          )}
        </div>

        <SidebarItem icon={Bell} label={t("notifications")} href="/notifications" active={pathname === "/notifications"} />
            
            {role === "CLIENT" ? (
              <SidebarItem icon={Briefcase} label={t("my_projects")} href="/my-projects" active={pathname === "/my-projects"} />
            ) : (
              <SidebarItem icon={History} label={t("applications")} href="/applications" active={pathname === "/applications"} />
            )}
            
            <SidebarItem icon={User} label={t("profile")} href={`/profile/${(session?.user as any)?.id}`} active={pathname.startsWith("/profile")} />
          </>
        )}

        <div className="mt-auto">
          {session ? (
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-4 p-3 rounded-full hover:bg-zinc-900 transition-colors w-full text-left"
            >
              <LogOut size={26} />
              <span className="text-xl hidden xl:block">{t("logout")}</span>
            </button>
          ) : (
            <Link 
              href="/auth/signin"
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full transition-colors w-full"
            >
              <span className="hidden xl:block text-lg">Login</span>
              <User size={26} className="xl:hidden" />
            </Link>
          )}
        </div>
      </nav>

      {session?.user && (
        <div className="mt-4 p-3 flex items-center gap-3 hover:bg-zinc-900 rounded-full cursor-pointer transition-colors">
          {session.user.image ? (
            <img src={session.user.image} alt={session.user.name || ""} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-700 flex-shrink-0" />
          )}
          <div className="hidden xl:block overflow-hidden">
            <p className="font-bold truncate">{session.user.name}</p>
            <p className="text-zinc-500 text-sm truncate">@{session.user.email?.split('@')[0]}</p>
          </div>
          <MoreHorizontal className="ml-auto hidden xl:block" size={20} />
        </div>
      )}
    </aside>
  );
}
