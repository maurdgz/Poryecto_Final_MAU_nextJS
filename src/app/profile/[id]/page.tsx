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

export default function Profile() {
  const { data: session, update } = useSession();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("projects");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    role: "CLIENT",
    certificates: ""
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
        certificates: res.data.certificates || ""
      });
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`/api/users/${id}`, editForm);
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
          },
          role: editForm.role
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
          <div className="h-48 bg-zinc-800 relative">
            <div className="absolute -bottom-16 left-4 w-32 h-32 rounded-full border-4 border-black bg-zinc-700" />
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
                      >
                        <option value="CLIENT">Solicitante de Software</option>
                        <option value="DEVELOPER">Desarrollador</option>
                      </select>
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
            </div>

            <div className="py-4">
              {activeTab === 'projects' && (
                <div className="text-center py-10 text-zinc-500 italic">
                  No hay proyectos públicos para mostrar.
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length === 0 && (
                    <p className="text-center py-10 text-zinc-500 italic">Este usuario aún no tiene reseñas.</p>
                  )}
                  {reviews.map((review: any) => (
                    <div key={review.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-700" />
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
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
