"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Image as ImageIcon, 
  List, 
  Smile, 
  Calendar, 
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  Plus,
  X,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, update } = useSession();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("for-you");
  const [projects, setProjects] = useState([]);
  
  // Post Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [content, setContent] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("WEB");
  const [tech, setTech] = useState("");
  const [projectType, setProjectType] = useState("UNITARY");
  const [maxDevelopers, setMaxDevelopers] = useState("1");
  const [pubDuration, setPubDuration] = useState("7");
  const [paymentMethod, setPaymentMethod] = useState("BCP");
  const [isPosting, setIsPosting] = useState(false);

  const techSuggestions: any = {
    WEB: ["React", "Next.js", "Vue.js", "Angular", "Tailwind CSS", "Node.js", "PHP", "Django", "Laravel"],
    MOBILE: ["React Native", "Flutter", "Swift", "Kotlin", "Ionic", "Xamarin"],
    GAMES: ["Unity", "Unreal Engine", "Godot", "C#", "C++", "Pygame"],
    DESKTOP: ["Electron", "C# / .NET", "Java Swing", "Qt", "Python / Tkinter"],
    OTHER: ["Python", "Java", "C++", "Go", "Rust", "Cloud Computing"]
  };

  const handleTechClick = (suggestion: string) => {
    if (tech.includes(suggestion)) {
      setTech(tech.split(',').map(t => t.trim()).filter(t => t !== suggestion).join(', '));
    } else {
      setTech(tech ? `${tech}, ${suggestion}` : suggestion);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (session?.user) {
      handleRoleFromUrl();
    }
  }, [session?.user]);

  const handleRoleFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get("role");
    
    if (roleParam && session?.user && (session.user as any).role !== roleParam) {
      try {
        await axios.patch(`/api/users/${(session.user as any).id}`, {
          role: roleParam
        });
        
        // Update session immediately
        await update();

        toast.success(language === "ES-LA" ? `Entraste como ${roleParam === 'CLIENT' ? 'Solicitante' : 'Desarrollador'}` : `Logged in as ${roleParam}`);
        // Clean URL
        window.history.replaceState({}, document.title, "/");
      } catch (error) {
        console.error("Error setting role from login");
      }
    }
  };

  const fetchProjects = async () => {
    try {
      const url = session?.user ? `/api/projects?userId=${(session.user as any).id}` : "/api/projects";
      const res = await axios.get(url);
      setProjects(res.data);
    } catch (error) {
      toast.error("Error al cargar proyectos");
    }
  };

  const handlePost = async () => {
    if (!session) return;

    if (!content || !budget || !duration) {
      toast.error(t("publish_error") || "Completa todos los campos");
      return;
    }

    setIsPosting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(pubDuration));

      await axios.post("/api/projects", {
        title: content.slice(0, 50),
        description: content,
        budget,
        duration,
        clientId: (session.user as any).id,
        category,
        technologies: tech,
        type: projectType,
        maxDevelopers: projectType === "GROUP" ? maxDevelopers : 1,
        expiresAt: expiresAt.toISOString(),
        paymentMethod,
      });
      toast.success(t("publish_success") || "Proyecto publicado");
      setShowPostModal(false);
      setContent("");
      setBudget("");
      setDuration("");
      setTech("");
      setMaxDevelopers("1");
      fetchProjects();
    } catch (error) {
      toast.error("Error al publicar");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-800">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-bold">{t("home")}</h1>
              {!session && (
                <Link href="/auth/signin" className="bg-blue-500 text-white px-4 py-1 rounded-full font-bold text-sm">
                  Login
                </Link>
              )}
            </div>
            {session && (
              <div className="px-4 pb-2 text-xs text-green-500 font-bold">
                Conectado como: {session.user?.email} ({(session.user as any).role === 'CLIENT' ? t("role_client") : t("role_developer")})
              </div>
            )}
            <div className="flex w-full">
              <button 
                onClick={() => setActiveTab("for-you")}
                className={`flex-1 py-4 text-center hover:bg-zinc-900 transition-colors relative font-medium ${activeTab === "for-you" ? "text-white" : "text-zinc-500"}`}
              >
                {t("for_you")}
                {activeTab === "for-you" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-500 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab("following")}
                className={`flex-1 py-4 text-center hover:bg-zinc-900 transition-colors relative font-medium ${activeTab === "following" ? "text-white" : "text-zinc-500"}`}
              >
                {t("following")}
                {activeTab === "following" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-blue-500 rounded-full" />}
              </button>
            </div>
          </header>

          {/* Compressed Post Button */}
          {(session?.user as any)?.role === "CLIENT" && (
            <div className="p-4 border-b border-zinc-800">
              <button 
                onClick={() => setShowPostModal(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={20} />
                {t("make_post")}
              </button>
            </div>
          )}

          {/* Post Modal */}
          {showPostModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-black border border-zinc-800 w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                  <button onClick={() => setShowPostModal(false)} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <button 
                    onClick={handlePost}
                    disabled={isPosting}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isPosting ? "..." : t("publish")}
                  </button>
                </div>
                <div className="p-4 overflow-y-auto space-y-4">
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t("post_placeholder")} 
                    className="w-full bg-transparent border-none outline-none text-xl resize-none placeholder:text-zinc-500 min-h-[100px]"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">{t("category")}</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500"
                      >
                        <option value="WEB">{t("web_dev")}</option>
                        <option value="MOBILE">{t("mobile_dev")}</option>
                        <option value="GAMES">{t("games")}</option>
                        <option value="DESKTOP">{t("desktop_dev")}</option>
                        <option value="OTHER">{t("other")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">{t("technologies")}</label>
                      <input 
                        type="text" 
                        placeholder="Unity, Java, React..." 
                        value={tech}
                        onChange={(e) => setTech(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500"
                      />
                      <div className="flex flex-wrap gap-1 mt-1">
                        {techSuggestions[category]?.map((suggestion: string) => (
                          <button
                            key={suggestion}
                            onClick={() => handleTechClick(suggestion)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${tech.includes(suggestion) ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-800 text-zinc-500 hover:border-zinc-600"}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">{t("budget")} (S/)</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">{t("duration")}</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2 semanas" 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">{t("project_type")}</label>
                      <select 
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500"
                      >
                        <option value="UNITARY">{t("unitary")}</option>
                        <option value="GROUP">{t("group")}</option>
                      </select>
                    </div>
                    {projectType === "GROUP" && (
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Número de desarrolladores</label>
                        <input 
                          type="number" 
                          min="1" 
                          placeholder="2" 
                          value={maxDevelopers}
                          onChange={(e) => setMaxDevelopers(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">{t("publication_duration")}</label>
                      <select 
                        value={pubDuration}
                        onChange={(e) => setPubDuration(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500"
                      >
                        <option value="3">3 {t("days")}</option>
                        <option value="7">7 {t("days")}</option>
                        <option value="15">15 {t("days")}</option>
                        <option value="30">30 {t("days")}</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">{t("payment_method")}</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500"
                      >
                        <option value="BCP">BCP</option>
                        <option value="Yape">Yape</option>
                        <option value="Visa">Visa / Mastercard</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Transferencia">Transferencia Bancaria</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {projects.map((project: any) => (
              <ProjectPost 
                key={project.id}
                id={project.id}
                author={project.client?.name || "Usuario"} 
                handle={project.client?.email?.split('@')[0] || "user"} 
                content={project.description}
                budget={`S/ ${project.budget}`}
                duration={project.duration}
                type={project.type}
                category={project.category}
                technologies={project.technologies}
                paymentMethod={project.paymentMethod}
                replies={0}
                reposts={project._count?.reposts || 0}
                likes={project._count?.likes || 0}
                applications={project._count?.applications || 0}
                views="0"
                isLiked={project.isLiked}
                isReposted={project.isReposted}
                canApply={(session?.user as any)?.role === "DEVELOPER"}
                userId={(session?.user as any)?.id}
                t={t}
                onClick={() => router.push(`/projects/${project.id}`)}
                onUpdate={fetchProjects}
              />
            ))}
            {projects.length === 0 && (
              <div className="p-8 text-center text-zinc-500 italic">
                {t("no_projects") || "No hay proyectos disponibles por ahora."}
              </div>
            )}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}

function ProjectPost({ id, author, handle, content, budget, duration, type, category, technologies, paymentMethod, replies, reposts, likes, applications, views, isLiked, isReposted, isProject = true, canApply, userId, t, onClick, onUpdate }: any) {
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyReason, setApplyReason] = useState("");

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    if (!applyReason) {
      toast.error("Debes poner un motivo para postular");
      return;
    }

    setIsApplying(true);
    try {
      await axios.post("/api/applications", {
        projectId: id,
        developerId: userId,
        reason: applyReason,
      });
      toast.success("¡Postulación enviada!");
      setShowApplyModal(false);
      setApplyReason("");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al postular");
    } finally {
      setIsApplying(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await axios.post(`/api/projects/${id}/like`);
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await axios.post(`/api/projects/${id}/repost`);
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div 
        onClick={onClick}
        className="p-4 border-b border-zinc-800 hover:bg-zinc-900/50 cursor-pointer transition-colors flex gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-700 flex-shrink-0" />
        <div className="flex-grow">
          <div className="flex items-center gap-1">
            <span className="font-bold hover:underline">{author}</span>
            <span className="text-zinc-500 text-sm">@{handle}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap">{content}</p>
          
          {isProject && (
            <div className="mt-3 p-3 border border-zinc-700 rounded-2xl bg-zinc-900/50 flex flex-wrap gap-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("budget")}</p>
                <p className="font-bold text-sm text-green-500">{budget}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("duration")}</p>
                <p className="font-bold text-sm">{duration}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("category")}</p>
                <p className="font-bold text-sm text-blue-400">{category}</p>
              </div>
              {technologies && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("technologies")}</p>
                  <p className="font-bold text-sm">{technologies}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("project_type")}</p>
                <p className="font-bold text-sm">{type === 'UNITARY' ? t("unitary") : t("group")}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Postulados</p>
                <p className="font-bold text-sm">{applications}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-zinc-500 max-w-md">
            <div className="flex items-center gap-1 hover:text-blue-500 transition-colors group">
              <div className="p-2 group-hover:bg-blue-500/10 rounded-full"><MessageCircle size={18} /></div>
              <span className="text-xs">{replies}</span>
            </div>
            <div 
              onClick={handleRepost}
              className={`flex items-center gap-1 transition-colors group cursor-pointer ${isReposted ? 'text-green-500' : 'hover:text-green-500'}`}
            >
              <div className={`p-2 rounded-full ${isReposted ? 'bg-green-500/10' : 'group-hover:bg-green-500/10'}`}>
                <Repeat2 size={18} />
              </div>
              <span className="text-xs">{reposts}</span>
            </div>
            <div 
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors group cursor-pointer ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <div className={`p-2 rounded-full ${isLiked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </div>
              <span className="text-xs">{likes}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-blue-500 transition-colors group">
              <div className="p-2 group-hover:bg-blue-500/10 rounded-full"><BarChart3 size={18} /></div>
              <span className="text-xs">{views}</span>
            </div>
            {canApply && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowApplyModal(true);
                }}
                className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
              >
                {t("apply")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold">{t("apply")} - {author}</h2>
            <div className="space-y-1">
              <label className="text-sm text-zinc-500">{t("apply_reason")}</label>
              <textarea 
                value={applyReason}
                onChange={(e) => setApplyReason(e.target.value)}
                placeholder="Hola, me interesa porque..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-blue-500 h-32 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowApplyModal(false)}
                className="flex-1 border border-zinc-700 font-bold py-2 rounded-full hover:bg-zinc-900 transition-colors"
              >
                {t("cancel")}
              </button>
              <button 
                onClick={handleApply}
                disabled={isApplying}
                className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isApplying ? "..." : t("apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
