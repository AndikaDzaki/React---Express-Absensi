import { Home, Calendar, Users, FileText, LogOut, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "@/lib/auth-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import logoSD from "@/assets/logo-sd.png";

const userItems = [
  { title: "Dashboard", url: "/user/dashboard", icon: Home },
  { title: "Jadwal Absensi", url: "/user/jadwaluser", icon: Calendar },
  { title: "Absensi", url: "/user/absensiuser", icon: Users },
  { title: "Rekap Absensi", url: "/user/rekapabsensi", icon: FileText },
];

export default function UserSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingTitle, setLoadingTitle] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (url: string) => location.pathname === url;

  useEffect(() => {
    setLoadingTitle(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleNavigation = (title: string, url: string) => {
    if (location.pathname !== url) {
      setLoadingTitle(title);
      setTimeout(() => {
        navigate(url);
        onNavigate?.();
      }, 400);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      onNavigate?.();
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Gagal logout:", err);
    }
    sessionStorage.clear();
    setLoggingOut(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="w-60 h-full border-r bg-primary min-h-screen shadow-lg rounded-r-2xl">
      <ScrollArea className="h-full p-4">
        <div className="flex flex-col items-center mb-6 gap-2">
          <img src={logoSD} alt="Logo SD" className="w-24 h-24 object-contain" />
          <h2 className="text-sm text-black font-bold uppercase tracking-wide">E-Presensi</h2>
        </div>

        {/* MENU UTAMA */}
        <div className="space-y-3">
          {userItems.map((item) => (
            <button
              key={item.title}
              onClick={() => handleNavigation(item.title, item.url)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all bg-accent-foreground cursor-pointer
                ${isActive(item.url) ? "bg-white/20 text-black ring-1 ring-white" : "text-black hover:bg-white/10"}
              `}
              disabled={loadingTitle === item.title}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                {item.title}
              </div>
              {loadingTitle === item.title && <Loader2 className="h-4 w-4 animate-spin text-white" />}
            </button>
          ))}
        </div>

        {/* LOGOUT */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all bg-accent-foreground cursor-pointer
              text-black hover:bg-white/10`}
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              Logout
            </div>
            {loggingOut && <Loader2 className="h-4 w-4 animate-spin text-white" />}
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}
