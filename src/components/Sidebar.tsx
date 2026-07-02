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
  Globe
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const role = (session?.user as any)?.role;

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
        <SidebarItem icon={Search} label={t("explore")} href="/explore" active={pathname === "/explore"} />
        
        {session && (
          <>
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
