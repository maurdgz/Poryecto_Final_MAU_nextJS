"use client";

import { useState } from "react";
import axios from "axios";
import { MessageCircle, Repeat2, Heart, Bookmark, Reply } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CommentItemProps {
  id: string;
  author: string;
  handle: string;
  authorId: string;
  authorImage?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  userId?: string;
  onReply?: () => void;
}

export default function CommentItem({
  id,
  author,
  handle,
  authorImage,
  authorId,
  content,
  likes,
  isLiked,
  userId,
  onReply
}: CommentItemProps) {
  const router = useRouter();
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikes, setLocalLikes] = useState(likes);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await axios.post(`/api/comments/${id}/like`, { userId });
      setLocalLiked(!localLiked);
      setLocalLikes(localLiked ? localLikes - 1 : localLikes + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply?.();
  };

  return (
    <div className="p-4 border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors">
      <div className="flex gap-3">
        <Link href={`/profile/${authorId}`} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-indigo-500/50 transition-all ${authorImage ? '' : 'bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400'}`} style={authorImage ? { backgroundImage: `url(${authorImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {!authorImage && <span className="text-xs font-black text-white">{author.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}</span>}
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${authorId}`} className="font-bold text-sm hover:underline hover:text-indigo-400 transition-colors">
              {author}
            </Link>
            <span className="text-zinc-500 text-xs">@{handle}</span>
          </div>
          <p className="text-zinc-200 text-sm mt-1">{content}</p>
          
          <div className="flex items-center gap-4 mt-2 text-zinc-500">
            <button 
              onClick={handleReply}
              className="flex items-center gap-1 hover:text-blue-400 transition-colors text-xs"
            >
              <Reply size={14} />
              Responder
            </button>
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors text-xs ${localLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <Heart size={14} fill={localLiked ? 'currentColor' : 'none'} />
              {localLikes}
            </button>
            <button className="flex items-center gap-1 hover:text-green-400 transition-colors text-xs">
              <Repeat2 size={14} />
              Repostear
            </button>
            <button className="flex items-center gap-1 hover:text-amber-400 transition-colors text-xs">
              <Bookmark size={14} />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
