"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Clock, DollarSign, Users, Code, CheckCircle2, MessageCircle, Repeat2, Heart, Bookmark, BarChart3 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";
import CommentItem from "@/components/CommentItem";

export default function ProjectDetail() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [repostsCount, setRepostsCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data);
      setLikesCount(res.data._count?.likes || 0);
      setRepostsCount(res.data._count?.reposts || 0);
      setIsLiked(res.data.isLiked || false);
      setIsReposted(res.data.isReposted || false);
      setIsSaved(res.data.isSaved || false);
    } catch (error) {
      toast.error("Error al cargar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDeveloper = async (developerId: string, developerName: string) => {
    try {
      await axios.patch(`/api/projects/${id}`, {
        status: "IN_PROGRESS",
        developerId: developerId
      });
      
      // Create notification for developer
      await axios.post("/api/notifications/create-manual", {
        userId: developerId,
        type: "SELECTION",
        message: `¡Felicidades! Has sido seleccionado para el proyecto: ${project.title}`,
        link: `/applications`
      });

      toast.success(`Has seleccionado a ${developerName}`);
      fetchProject();
    } catch (error) {
      toast.error("Error al seleccionar desarrollador");
    }
  };

  const handleLike = async () => {
    if (!session?.user) return;
    try {
      await axios.post(`/api/projects/${id}/like`);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      router.refresh();
    } catch (error) {
      toast.error("Error al dar like");
    }
  };

  const handleRepost = async () => {
    if (!session?.user) return;
    try {
      await axios.post(`/api/projects/${id}/repost`);
      setIsReposted(!isReposted);
      setRepostsCount(isReposted ? repostsCount - 1 : repostsCount + 1);
      router.refresh();
    } catch (error) {
      toast.error("Error al repostear");
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;
    try {
      await axios.post(`/api/projects/${id}/save`);
      setIsSaved(!isSaved);
      router.refresh();
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  const isOwner = session?.user && (session.user as any).id === project?.clientId;

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
    </div>
  );

  if (!project) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-zinc-500 italic">Proyecto no encontrado</p>
      <button onClick={() => router.back()} className="text-blue-500 hover:underline">Volver</button>
    </div>
  );

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-800 flex items-center gap-6 px-4 py-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">{t("project_details")}</h1>
          </header>

          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400 flex-shrink-0 flex items-center justify-center">
                <span className="text-sm font-black text-white">{project.client.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}</span>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">{project.title}</h2>
                <p className="text-zinc-500">Publicado por {project.client.name}</p>
              </div>
            </div>

            <p className="text-lg text-zinc-200 whitespace-pre-wrap">{project.description}</p>

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 hover:text-indigo-400 transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-500'}`}
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                  <span className="text-sm">{likesCount}</span>
                </button>
                <button 
                  onClick={handleRepost}
                  className={`flex items-center gap-2 hover:text-green-400 transition-colors ${isReposted ? 'text-green-500' : 'text-zinc-500'}`}
                >
                  <Repeat2 size={20} fill={isReposted ? "currentColor" : "none"} />
                  <span className="text-sm">{repostsCount}</span>
                </button>
                <button className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors">
                  <MessageCircle size={20} />
                  <span className="text-sm">0</span>
                </button>
                <button 
                  onClick={handleSave}
                  className={`flex items-center gap-2 hover:text-amber-400 transition-colors ${isSaved ? 'text-amber-500' : 'text-zinc-500'}`}
                >
                  <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <BarChart3 size={16} />
                <span className="text-sm">0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="backdrop-blur-md bg-slate-950/40 border border-white/5 shadow-2xl rounded-2xl p-4 space-y-1">
                <p className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2">
                  <DollarSign size={14} className="text-green-500" /> {t("budget")}
                </p>
                <p className="text-xl font-bold text-green-500">S/ {project.budget}</p>
              </div>
              <div className="backdrop-blur-md bg-slate-950/40 border border-white/5 shadow-2xl rounded-2xl p-4 space-y-1">
                <p className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" /> {t("duration")}
                </p>
                <p className="text-xl font-bold">{project.duration}</p>
              </div>
              <div className="backdrop-blur-md bg-slate-950/40 border border-white/5 shadow-2xl rounded-2xl p-4 space-y-1">
                <p className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2">
                  <Code size={14} className="text-purple-500" /> {t("technologies")}
                </p>
                <p className="text-lg font-bold">{project.technologies || "No especificado"}</p>
              </div>
              <div className="backdrop-blur-md bg-slate-950/40 border border-white/5 shadow-2xl rounded-2xl p-4 space-y-1">
                <p className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2">
                  <Users size={14} className="text-orange-500" /> {t("project_type")}
                </p>
                <p className="text-lg font-bold">{project.type === 'UNITARY' ? t("unitary") : t("group")}</p>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users size={20} /> {t("applicants")} ({project.applications?.length || 0})
              </h3>
              
              <div className="space-y-4">
                {project.applications?.length === 0 && (
                  <p className="text-zinc-500 italic text-center py-4">No hay postulantes aún.</p>
                )}
                {project.applications?.map((app: any) => (
                  <div key={app.id} className="backdrop-blur-md bg-slate-950/40 border border-white/5 shadow-2xl rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Link href={`/profile/${app.developer.id}`} className="flex gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-white">{app.developer.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}</span>
                        </div>
                        <div>
                          <p className="font-bold flex items-center gap-2">
                            {app.developer.name}
                            {app.developer.role === 'DEVELOPER' && <CheckCircle2 size={14} className="text-blue-500" />}
                          </p>
                          <p className="text-xs text-zinc-500">@{app.developer.email.split('@')[0]}</p>
                        </div>
                      </Link>
                      {isOwner && project.status === 'OPEN' && (
                        <button 
                          onClick={() => handleSelectDeveloper(app.developer.id, app.developer.name)}
                          className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
                        >
                          Seleccionar
                        </button>
                      )}
                    </div>
                    <div className="backdrop-blur-md bg-slate-950/40 border border-white/5 shadow-2xl p-3 rounded-xl">
                      <p className="text-sm text-zinc-300 italic">"{app.reason || "Sin mensaje"}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle size={20} /> Comentarios
              </h3>
              
              <div className="space-y-0">
                <CommentItem
                  id="1"
                  author="Usuario Ejemplo"
                  handle="usuario"
                  authorId="example-id"
                  content="Este proyecto se ve muy interesante, me gustaría saber más detalles."
                  likes={5}
                  isLiked={false}
                  userId={(session?.user as any)?.id}
                />
                <CommentItem
                  id="2"
                  author="Dev Profesional"
                  handle="devpro"
                  authorId="dev-id"
                  content="Tengo experiencia con las tecnologías mencionadas, estoy disponible."
                  likes={12}
                  isLiked={true}
                  userId={(session?.user as any)?.id}
                />
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
