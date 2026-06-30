"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Code2, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

import { Suspense } from "react";

function SignInContent() {
  const { t, language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"CLIENT" | "DEVELOPER">("CLIENT");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = mounted ? searchParams.get("error") : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && error === "Callback") {
      toast.error(language === "ES-LA" 
        ? "Error de conexión con Google. Intenta de nuevo." 
        : "Google connection error. Try again.");
    }
  }, [error, language, mounted]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // We pass the role in the callback URL or store it in a cookie/localStorage
      // For simplicity, we'll use a callbackUrl with the role as a param that we can handle in the callback
      await signIn("google", { callbackUrl: `/?role=${role}` });
    } catch (error) {
      toast.error("Error Google Auth");
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(language === "ES-LA" ? "Credenciales inválidas" : "Invalid credentials");
      } else {
        router.push(`/?role=${role}`);
        router.refresh();
      }
    } catch (error) {
      toast.error("Error Login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900 p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => setLanguage("ES-LA")}
          className={`px-3 py-1 rounded-full text-xs font-bold border ${language === "ES-LA" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"}`}
        >
          ES-LA
        </button>
        <button 
          onClick={() => setLanguage("EN-US")}
          className={`px-3 py-1 rounded-full text-xs font-bold border ${language === "EN-US" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"}`}
        >
          EN-US
        </button>
      </div>

      <div className="w-full max-w-md space-y-6 flex flex-col items-center">
        <div className="flex flex-col items-center mb-2">
          <div className="bg-zinc-900 p-3 rounded-2xl mb-4">
            <Code2 size={48} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">
            {t("welcome")}
          </h1>
        </div>

        {/* Role Selector Tabs */}
        <div className="w-full bg-zinc-100 p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setRole("CLIENT")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === "CLIENT" ? "bg-white text-[#1a5f7a] shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            {t("role_client")}
          </button>
          <button 
            onClick={() => setRole("DEVELOPER")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === "DEVELOPER" ? "bg-white text-[#1a5f7a] shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            {t("role_developer")}
          </button>
        </div>

        <p className="text-zinc-400 text-xs font-medium -mt-2">
          {t("login_role_select")}
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-300 text-zinc-700 font-medium py-2.5 rounded-lg hover:bg-zinc-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t("login_google")}
        </button>

        <div className="w-full flex items-center gap-4 py-2">
          <div className="h-[1px] bg-zinc-200 flex-grow" />
          <span className="text-zinc-400 text-sm font-medium">
            {t("login_prompt")}
          </span>
          <div className="h-[1px] bg-zinc-200 flex-grow" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="w-full space-y-4">
          <div className="space-y-1">
            <input
              type="email"
              placeholder={t("login_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-300 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400"
              required
            />
          </div>
          <div className="space-y-1 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("login_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-zinc-300 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-left">
            <button type="button" className="text-sm text-blue-600 hover:underline font-medium">
              {t("login_forgot")}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1a5f7a] text-white font-bold py-3.5 rounded-lg hover:bg-[#154d63] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "..." : t("login_button")}
          </button>
        </form>

        <div className="w-full pt-4 flex flex-col items-center gap-4">
          <div className="w-full flex items-center gap-4">
            <div className="h-[1px] bg-zinc-200 flex-grow" />
            <span className="text-zinc-300 text-xs">or</span>
            <div className="h-[1px] bg-zinc-200 flex-grow" />
          </div>
          
          <button 
            type="button"
            className="w-full border-2 border-[#1a5f7a] text-[#1a5f7a] font-bold py-3 rounded-lg hover:bg-zinc-50 transition-all active:scale-[0.98]"
          >
            {t("login_create")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <SignInContent />
    </Suspense>
  );
}
