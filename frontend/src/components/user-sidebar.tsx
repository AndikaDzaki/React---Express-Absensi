import { Calendar, Home, LogOut, Users, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logoSD from "@/assets/logo-sd.png";

const userItems = [
  { title: "Dashboard", url: "/user/dashboard", icon: Home },
  { title: "Absensi", url: "/user/absensiuser", icon: Users },
  { title: "Rekap Absensi", url: "/user/rekapabsensi", icon: Calendar },
  { title: "Logout", url: "/", icon: LogOut },
];

export default function UserSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingTitle, setLoadingTitle] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setLoadingTitle(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleNavigation = (title: string, url: string) => {
    if (url === "/") {
      setLoggingOut(true);
      setLoadingTitle(title);
      setTimeout(() => {
        sessionStorage.clear();
        setLoggingOut(false);
        navigate("/");
        onNavigate?.();
      }, 700);
    } else if (location.pathname !== url) {
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

  const isActive = (url: string) => location.pathname === url;

  return (
    <aside className="w-60 h-full bg-primary border-r border-border p-4 shadow-lg rounded-r-2xl">
      <div className="flex items-center mb-2 px-1">
        <img src={logoSD} alt="Logo Sekolah" className="w-20 h-20 object-contain" />
        <h2 className="text-sm text-foreground uppercase font-bold tracking-wide">E-Presensi</h2>
      </div>

      <nav className="space-y-3 mt-4">
        {userItems.map((item) => (
          <button
            key={item.title}
            onClick={() => handleNavigation(item.title, item.url)}
            disabled={loadingTitle === item.title}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-300 shadow-sm
              ${isActive(item.url) ? "bg-black/10 text-black ring-2 ring-primary" : "bg-muted hover:bg-muted/80 text-muted-foreground"}
              cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            {(item.title === "Logout" && loggingOut) || loadingTitle === item.title ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : null}
          </button>
        ))}
      </nav>
    </aside>
  );
}
