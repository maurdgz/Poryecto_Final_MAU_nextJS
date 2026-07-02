"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Calendar, Link as LinkIcon, MapPin, Star } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import ProjectPost from "@/components/ProjectPost";

export default function Profile() {
  const { data: session, update } = useSession();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [userLikes, setUserLikes] = useState<any[]>([]);
  const [userSaved, setUserSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("projects");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    role: "CLIENT",
    certificates: "",
    image: "",
    coverImage: ""
  });
  
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isOwnProfile = session?.user && (session.user as any).id === id;

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${id}`);
      setUser(res.data);
      setReviews(res.data.reviewsReceived || []);
      setEditForm({
        name: res.data.name || "",
        bio: res.data.bio || "",
        role: res.data.role || "CLIENT",
        certificates: res.data.certificates || "",
        image: res.data.image || "",
        coverImage: res.data.coverImage || ""
      });
      
      // Fetch user's projects (only their own projects)
      const projectsRes = await axios.get(`/api/projects?userId=${id}&profile=true`);
      setUserProjects(projectsRes.data);
      
      // Fetch user's likes
      const likesRes = await axios.get(`/api/users/${id}/likes`);
      setUserLikes(likesRes.data);
      
      // Fetch user's saved projects (only if viewing own profile)
      if (isOwnProfile) {
        const savedRes = await axios.get(`/api/users/${id}/saved`);
        setUserSaved(savedRes.data);
      }
    } catch (error) {
      console.error("Error fetching user", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const averageStars = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.stars, 0) / reviews.length).toFixed(1)
    : "0.0";

  const generateAvatarGradient = (name: string) => {
    const colors = [
      'from-indigo-400 via-purple-400 to-emerald-400',
      'from-blue-400 via-cyan-400 to-teal-400',
      'from-purple-400 via-pink-400 to-rose-400',
      'from-amber-400 via-orange-400 to-red-400'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check 7-day cooldown for role changes
    if (editForm.role !== user.role && user.lastRoleChange) {
      const lastChange = new Date(user.lastRoleChange);
      const now = new Date();
      const daysSinceChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceChange < 7) {
        const nextAvailableDate = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
        toast.error(
          `Solo puedes cambiar de rol cada 7 días. Próximo cambio disponible: ${nextAvailableDate.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`
        );
        return;
      }
    }
    
    try {
      const res = await axios.patch(`/api/users/${id}`, {
        ...editForm,
        lastRoleChange: editForm.role !== user.role ? new Date().toISOString() : undefined
      });
      setUser(res.data);
      setIsEditing(false);
      toast.success("Perfil actualizado");
      
      // Update session if it's the current user
      if (isOwnProfile) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: editForm.name,
            role: editForm.role
          },
        });
      }
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4">
      <p className="text-zinc-500">Usuario no encontrado</p>
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
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-xs text-zinc-500">{user.role === 'DEVELOPER' ? 'Desarrollador' : 'Cliente'}</p>
            </div>
          </header>

          {/* Banner & Avatar */}
          <div 
            className="h-48 relative"
            style={user.coverImage ? {
              backgroundImage: `url(${user.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {
              background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.5), rgba(79, 70, 229, 0.5), rgba(16, 185, 129, 0.5))'
            }}
          >
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name} 
                className="absolute -bottom-16 left-4 w-32 h-32 rounded-full border-4 border-black object-cover"
              />
            ) : (
              <div className={`absolute -bottom-16 left-4 w-32 h-32 rounded-full border-4 border-black bg-gradient-to-br ${generateAvatarGradient(user.name || 'User')} flex items-center justify-center`}>
                <span className="text-3xl font-black text-white">{getInitials(user.name || 'User')}</span>
              </div>
            )}
            {isOwnProfile && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/20 transition-colors"
              >
                Editar portada
              </button>
            )}
          </div>

          <div className="mt-20 px-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-extrabold">{user.name}</h2>
                <p className="text-zinc-500">@{user.email?.split('@')[0]}</p>
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="border border-zinc-700 font-bold px-4 py-1.5 rounded-full hover:bg-zinc-900 transition-colors"
                >
                  Editar perfil
                </button>
              )}
            </div>

            {/* Edit Modal */}
            {isEditing && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-4">
                  <h2 className="text-xl font-bold">Editar Perfil</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Foto de perfil (URL)</label>
                      <input 
                        type="text" 
                        value={editForm.image}
                        onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Foto de portada (URL)</label>
                      <input 
                        type="text" 
                        value={editForm.coverImage}
                        onChange={(e) => setEditForm({...editForm, coverImage: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Biografía</label>
                      <textarea 
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Rol</label>
                      <select 
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        disabled={user.lastRoleChange && Math.floor((new Date().getTime() - new Date(user.lastRoleChange).getTime()) / (1000 * 60 * 60 * 24)) < 7}
                      >
                        <option value="CLIENT">Solicitante de Software</option>
                        <option value="DEVELOPER">Desarrollador</option>
                      </select>
                      {user.lastRoleChange && Math.floor((new Date().getTime() - new Date(user.lastRoleChange).getTime()) / (1000 * 60 * 60 * 24)) < 7 && (
                        <p className="text-[10px] text-amber-500 mt-1">
                          Cambio disponible en {(7 - Math.floor((new Date().getTime() - new Date(user.lastRoleChange).getTime()) / (1000 * 60 * 60 * 24)))} días
                        </p>
                      )}
                    </div>
                    {editForm.role === 'DEVELOPER' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Certificados (separados por coma)</label>
                        <input 
                          type="text" 
                          value={editForm.certificates}
                          onChange={(e) => setEditForm({...editForm, certificates: e.target.value})}
                          placeholder="Next.js, React, Node.js..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 border border-zinc-700 font-bold py-2 rounded-full hover:bg-zinc-900 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-white text-black font-bold py-2 rounded-full hover:bg-zinc-200 transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <p className="mt-4 text-zinc-200">
              {user.bio || "Sin biografía."}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-zinc-500 text-sm">
              <div className="flex items-center gap-1"><MapPin size={16} /> {t("location")}</div>
              <div className="flex items-center gap-1"><Calendar size={16} /> {t("joined")} Mayo 2026</div>
              {user.role === 'DEVELOPER' && (
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Star size={16} fill="currentColor" /> {averageStars} ({reviews.length} {t("reviews")})
                </div>
              )}
            </div>

            {user.role === 'DEVELOPER' && user.certificates && (
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-2">{t("certificates")}</h3>
                <div className="flex flex-wrap gap-2">
                  {user.certificates.split(',').map((cert: string, i: number) => (
                    <span key={i} className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                      {cert.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-zinc-800 mt-8 flex">
              <button 
                onClick={() => setActiveTab("projects")}
                className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'projects' ? 'border-b-4 border-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                Proyectos
              </button>
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'reviews' ? 'border-b-4 border-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                Reseñas
              </button>
              <button 
                onClick={() => setActiveTab("likes")}
                className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'likes' ? 'border-b-4 border-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                Likes
              </button>
              {isOwnProfile && (
                <button 
                  onClick={() => setActiveTab("saved")}
                  className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'saved' ? 'border-b-4 border-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
                >
                  Guardados
                </button>
              )}
            </div>

            <div className="py-4">
              {activeTab === 'projects' && (
                <div>
                  {userProjects.length === 0 && (
                    <p className="text-center py-10 text-zinc-500 italic">No hay proyectos públicos para mostrar.</p>
                  )}
                  {userProjects.map((project: any) => (
                    <ProjectPost
                      key={project.id}
                      id={project.id}
                      author={project.client?.name || user.name}
                      handle={project.client?.email?.split('@')[0] || user.email?.split('@')[0]}
                      authorId={project.client?.id || user.id}
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
                      isSaved={project.isSaved}
                      canApply={(session?.user as any)?.role === "DEVELOPER"}
                      userId={(session?.user as any)?.id}
                      t={t}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      onUpdate={() => fetchUser()}
                    />
                  ))}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length === 0 && (
                    <p className="text-center py-10 text-zinc-500 italic">Este usuario aún no tiene reseñas.</p>
                  )}
                  {reviews.map((review: any) => (
                    <div key={review.id} className="backdrop-blur-md bg-slate-950/40 border border-white/5 shadow-2xl p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400 flex items-center justify-center">
                            <span className="text-xs font-black text-white">{review.reviewer.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}</span>
                          </div>
                          <span className="font-bold text-sm">{review.reviewer.name}</span>
                        </div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.stars ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 text-sm">{review.comment}</p>
                      <p className="text-[10px] text-zinc-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'likes' && (
                <div>
                  {userLikes.length === 0 && (
                    <p className="text-center py-10 text-zinc-500 italic">Este usuario aún no ha dado likes.</p>
                  )}
                  {userLikes.map((like: any) => (
                    <ProjectPost
                      key={like.project.id}
                      id={like.project.id}
                      author={like.project.client?.name || user.name}
                      handle={like.project.client?.email?.split('@')[0] || user.email?.split('@')[0]}
                      authorId={like.project.client?.id || user.id}
                      content={like.project.description}
                      budget={`S/ ${like.project.budget}`}
                      duration={like.project.duration}
                      type={like.project.type}
                      category={like.project.category}
                      technologies={like.project.technologies}
                      paymentMethod={like.project.paymentMethod}
                      replies={0}
                      reposts={like.project._count?.reposts || 0}
                      likes={like.project._count?.likes || 0}
                      applications={like.project._count?.applications || 0}
                      views="0"
                      isLiked={like.project.isLiked}
                      isReposted={like.project.isReposted}
                      isSaved={like.project.isSaved}
                      canApply={(session?.user as any)?.role === "DEVELOPER"}
                      userId={(session?.user as any)?.id}
                      t={t}
                      onClick={() => router.push(`/projects/${like.project.id}`)}
                      onUpdate={() => fetchUser()}
                    />
                  ))}
                </div>
              )}
              {activeTab === 'saved' && isOwnProfile && (
                <div>
                  {userSaved.length === 0 && (
                    <p className="text-center py-10 text-zinc-500 italic">No tienes proyectos guardados.</p>
                  )}
                  {userSaved.map((saved: any) => (
                    <ProjectPost
                      key={saved.project.id}
                      id={saved.project.id}
                      author={saved.project.client?.name || user.name}
                      handle={saved.project.client?.email?.split('@')[0] || user.email?.split('@')[0]}
                      authorId={saved.project.client?.id || user.id}
                      content={saved.project.description}
                      budget={`S/ ${saved.project.budget}`}
                      duration={saved.project.duration}
                      type={saved.project.type}
                      category={saved.project.category}
                      technologies={saved.project.technologies}
                      paymentMethod={saved.project.paymentMethod}
                      replies={0}
                      reposts={saved.project._count?.reposts || 0}
                      likes={saved.project._count?.likes || 0}
                      applications={saved.project._count?.applications || 0}
                      views="0"
                      isLiked={saved.project.isLiked}
                      isReposted={saved.project.isReposted}
                      isSaved={true}
                      canApply={(session?.user as any)?.role === "DEVELOPER"}
                      userId={(session?.user as any)?.id}
                      t={t}
                      onClick={() => router.push(`/projects/${saved.project.id}`)}
                      onUpdate={() => fetchUser()}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
