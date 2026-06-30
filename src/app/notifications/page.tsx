"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Notifications() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      markAllAsRead();
    }
  }, [session?.user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/notifications?userId=${(session?.user as any).id}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`/api/notifications?userId=${(session?.user as any).id}`);
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-800 p-4">
            <h1 className="text-xl font-bold">{t("notifications")}</h1>
          </header>

          <div className="flex flex-col">
            {loading ? (
              <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full" /></div>
            ) : (
              <>
                {notifications.length === 0 && (
                  <div className="p-10 text-center text-zinc-500 italic">
                    {t("notifications_empty")}
                  </div>
                )}
                {notifications.map((notif: any) => (
                  <Link 
                    key={notif.id} 
                    href={notif.link || "#"}
                    className={`p-4 border-b border-zinc-800 flex gap-4 hover:bg-zinc-900 transition-colors ${!notif.read ? "bg-blue-500/5" : ""}`}
                  >
                    <div className={`p-2 rounded-full h-fit ${!notif.read ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                      <Bell size={20} />
                    </div>
                    <div className="flex-grow space-y-1">
                      <p className={`text-sm ${!notif.read ? "font-bold text-white" : "text-zinc-300"}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Clock size={12} />
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {notif.link && <ExternalLink size={16} className="text-zinc-600" />}
                  </Link>
                ))}
              </>
            )}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
