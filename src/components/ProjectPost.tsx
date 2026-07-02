"use client";

import { useState } from "react";
import axios from "axios";
import { 
  Image as ImageIcon, 
  List, 
  Smile, 
  Calendar, 
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  Bookmark
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ProjectPostProps {
  id: string;
  author: string;
  handle: string;
  authorId: string;
  content: string;
  budget: string;
  duration: string;
  type: string;
  category?: string;
  technologies?: string;
  paymentMethod?: string;
  replies: number;
  reposts: number;
  likes: number;
  applications: number;
  views: string;
  isLiked: boolean;
  isReposted: boolean;
  isSaved: boolean;
  isProject?: boolean;
  canApply?: boolean;
  userId?: string;
  t: (key: string) => string;
  onClick?: () => void;
  onUpdate?: () => void;
}

export default function ProjectPost({
  id,
  author,
  handle,
  authorId,
  content,
  budget,
  duration,
  type,
  category,
  technologies,
  paymentMethod,
  replies,
  reposts,
  likes,
  applications,
  views,
  isLiked,
  isReposted,
  isSaved,
  isProject = true,
  canApply,
  userId,
  t,
  onClick,
  onUpdate
}: ProjectPostProps) {
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyReason, setApplyReason] = useState("");
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localReposted, setLocalReposted] = useState(isReposted);
  const [localSaved, setLocalSaved] = useState(isSaved);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localReposts, setLocalReposts] = useState(reposts);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${authorId}`);
  };

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
      onUpdate?.();
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
      setLocalLiked(!localLiked);
      setLocalLikes(localLiked ? localLikes - 1 : localLikes + 1);
      onUpdate?.();
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await axios.post(`/api/projects/${id}/repost`);
      setLocalReposted(!localReposted);
      setLocalReposts(localReposted ? localReposts - 1 : localReposts + 1);
      onUpdate?.();
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await axios.post(`/api/projects/${id}/save`);
      setLocalSaved(!localSaved);
      onUpdate?.();
      router.refresh();
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
        <div 
          onClick={handleProfileClick}
          className={`w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all flex items-center justify-center bg-gradient-to-br ${author ? 'from-indigo-400 via-purple-400 to-emerald-400' : 'from-zinc-600 to-zinc-700'}`}
        >
          <span className="text-xs font-black text-white">{author ? author.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?'}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span 
              onClick={handleProfileClick}
              className="font-bold hover:underline cursor-pointer"
            >
              {author}
            </span>
            <span className="text-zinc-500">@{handle}</span>
          </div>
          
          <div className="mt-2">
            <p className="text-zinc-200 whitespace-pre-wrap">{content}</p>
          </div>

          {isProject && (
            <div className="flex flex-wrap gap-2 mt-3">
              {technologies && (
                <div className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full text-xs font-medium flex flex-col items-center">
                  <span className="text-[9px] uppercase opacity-70">{t("technologies")}</span>
                  <span className="font-bold">{technologies}</span>
                </div>
              )}
              <div className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-full text-xs font-semibold flex flex-col items-center">
                <span className="text-[9px] uppercase opacity-70">{t("project_type")}</span>
                <span className="font-bold">{type === 'UNITARY' ? t("unitary") : t("group")}</span>
              </div>
              <div className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-semibold flex flex-col items-center">
                <span className="text-[9px] uppercase opacity-70">Postulados</span>
                <span className="font-bold">{applications}</span>
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
              className={`flex items-center gap-1 transition-colors group cursor-pointer ${localReposted ? 'text-green-500' : 'hover:text-green-500'}`}
            >
              <div className={`p-2 rounded-full ${localReposted ? 'bg-green-500/10' : 'group-hover:bg-green-500/10'}`}>
                <Repeat2 size={18} />
              </div>
              <span className="text-xs">{localReposts}</span>
            </div>
            <div 
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors group cursor-pointer ${localLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <div className={`p-2 rounded-full ${localLiked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
                <Heart size={18} fill={localLiked ? 'currentColor' : 'none'} />
              </div>
              <span className="text-xs">{localLikes}</span>
            </div>
            <div 
              onClick={handleSave}
              className={`flex items-center gap-1 transition-colors group cursor-pointer ${localSaved ? 'text-amber-500' : 'hover:text-amber-500'}`}
            >
              <div className={`p-2 rounded-full ${localSaved ? 'bg-amber-500/10' : 'group-hover:bg-amber-500/10'}`}>
                <Bookmark size={18} fill={localSaved ? 'currentColor' : 'none'} />
              </div>
              <span className="text-xs">Guardar</span>
            </div>
            <div className="flex items-center gap-1 hover:text-blue-500 transition-colors group">
              <div className="p-2 group-hover:bg-blue-500/10 rounded-full"><BarChart3 size={18} /></div>
              <span className="text-xs">{views}</span>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold">Postular al proyecto</h2>
            <textarea
              value={applyReason}
              onChange={(e) => setApplyReason(e.target.value)}
              placeholder="¿Por qué eres el mejor candidato?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-blue-500 min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setApplyReason("");
                }}
                className="px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isApplying ? "Enviando..." : "Postular"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
