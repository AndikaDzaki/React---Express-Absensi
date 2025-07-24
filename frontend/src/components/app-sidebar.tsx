import { Home, Users, Calendar, User, FileText, CalendarCheck, GraduationCap, QrCode, Database, LogOut, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "@/lib/auth-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import logoSD from "@/assets/logo-sd.png";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Data Kelas", url: "/datakelas", icon: Users },
  { title: "Data Siswa", url: "/datasiswa", icon: Users },
  { title: "Data Jadwal", url: "/datajadwal", icon: Calendar },
  { title: "Data Guru", url: "/dataguru", icon: User },
  { title: "Absensi", url: "/absensi", icon: Calendar },
  { title: "Rekap Absensi", url: "/rekap", icon: FileText },
];

const adminItems = [
  {
    title: "Data Master",
    icon: Database,
    children: [
      { title: "Tahun Ajaran", url: "/datatahunajaran", icon: CalendarCheck },
      { title: "Semester", url: "/datasemester", icon: GraduationCap },
      { title: "Generate Code", url: "/generateqrcode", icon: QrCode },
    ],
  },
  { title: "Logout", url: "/", icon: LogOut },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingTitle, setLoadingTitle] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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
          <img src={logoSD} alt="Logo SD" className="w-25 h-25 object-contain" />
          <h2 className="text-sm text-black font-bold uppercase tracking-wide">E-Presensi</h2>
        </div>

        {/* MAIN ITEMS */}
        <div className="space-y-3">
          {mainItems.map((item) => (
            <button
              key={item.title}
              onClick={() => handleNavigation(item.title, item.url)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all bg-accent-foreground cursor-pointer
              ${isActive(item.url) ? "bg-white/20 text-black ring-1 ring-white" : "text-black hover:bg-white/10"}`}
            >
              <div className="flex items-center gap-3 bg-w">
                <item.icon className="h-5 w-5" />
                {item.title}
              </div>
              {loadingTitle === item.title && <Loader2 className="h-4 w-4 animate-spin text-white" />}
            </button>
          ))}
        </div>

        {/* ADMIN TITLE */}
        <div className="mt-6 px-4 text-xs text-white font-semibold uppercase tracking-wide">Administrasi</div>

        {/* ADMIN ITEMS */}
        <div className="space-y-3 mt-2">
          {adminItems.map((item) => {
            const isDropdown = item.children && item.children.length > 0;
            const isOpen = openDropdown === item.title;

            return (
              <div key={item.title} className="space-y-3">
                <button
                  onClick={() => {
                    if (item.title === "Logout") {
                      handleLogout();
                    } else if (isDropdown) {
                      setOpenDropdown(isOpen ? null : item.title);
                    } else {
                      handleNavigation(item.title, item.url!);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer bg-accent-foreground
                  ${item.url && isActive(item.url) ? "bg-white/20 text-black ring-1 ring-white" : "text-black hover:bg-white/10"}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </div>
                  {item.title === "Logout" && loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : isDropdown ? (
                    isOpen ? (
                      <ChevronUp className="h-4 w-4 text-black" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-black" />
                    )
                  ) : (
                    loadingTitle === item.title && <Loader2 className="h-4 w-4 animate-spin text-white" />
                  )}
                </button>

                {/* DROPDOWN CHILDREN */}
                {isDropdown && isOpen && (
                  <div className="pl-2 space-y-2">
                    {item.children.map((child) => (
                      <button
                        key={child.title}
                        onClick={() => handleNavigation(child.title, child.url!)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition bg-accent-foreground cursor-pointer
                        ${isActive(child.url) ? "bg-white/20 text-black ring-2 ring-white" : "text-black hover:bg-white/10"}`}
                      >
                        <child.icon className="h-4 w-4" />
                        {child.title}
                        {loadingTitle === child.title && <Loader2 className="h-4 w-4 animate-spin ml-auto text-white" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
