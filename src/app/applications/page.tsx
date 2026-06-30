"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";
import { Clock, CheckCircle2, XCircle, Briefcase, DollarSign } from "lucide-react";

export default function Applications() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchApplications();
    }
  }, [session]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/applications/my-applications?developerId=${(session?.user as any).id}`);
      setApplications(res.data);
    } catch (error) {
      toast.error("Error al cargar tus postulaciones");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen p-4">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">{t("applications")} / {t("history")}</h1>
          </header>

          {loading ? (
            <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full" /></div>
          ) : (
            <div className="space-y-4">
              {applications.length === 0 && (
                <p className="text-zinc-500 italic text-center py-10">No te has postulado a ningún proyecto aún.</p>
              )}
              {applications.map((app: any) => (
                <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-700 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg">{app.project.title}</h3>
                        <p className="text-xs text-zinc-500">Publicado por: {app.project.client.name}</p>
                      </div>
                    </div>
                    <StatusBadge status={app.project.status} t={t} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <DollarSign size={16} className="text-green-500" />
                      <span>S/ {app.project.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock size={16} className="text-blue-500" />
                      <span>{app.project.duration}</span>
                    </div>
                  </div>

                  {app.project.status === 'COMPLETED' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                      <CheckCircle2 className="text-green-500" size={20} />
                      <div>
                        <p className="text-sm font-bold text-green-500">¡Proyecto Finalizado!</p>
                        <p className="text-xs text-green-400">Pago de S/ {app.project.budget} procesado vía {app.project.paymentMethod || 'BCP'}.</p>
                      </div>
                    </div>
                  )}

                  {app.project.status === 'CANCELLED' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <XCircle className="text-red-500" size={20} />
                        <p className="text-sm font-bold text-red-500">Proyecto Cancelado</p>
                      </div>
                      <p className="text-xs text-red-400"><span className="font-bold">Motivo:</span> {app.project.cancelReason || 'Sin motivo especificado'}</p>
                    </div>
                  )}

                  {app.project.status === 'OPEN' && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      Tu postulación está siendo revisada...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}

function StatusBadge({ status, t }: any) {
  const styles: any = {
    OPEN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    IN_PROGRESS: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
}
