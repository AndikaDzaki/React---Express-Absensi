import logoSD from "@/assets/logo-sd.png";
import { Calendar, Home, LogOut, Users, FileText, User, Loader2, ChevronDown, ChevronUp, Database, CalendarCheck, GraduationCap, QrCode } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    setLoadingTitle(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleLogout = () => {
    setLoggingOut(true);
    setLoadingTitle("Logout");
    setTimeout(() => {
      sessionStorage.clear();
      setLoggingOut(false);
      navigate("/");
      onNavigate?.();
    }, 700);
  };

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

  const isActive = (url: string) => location.pathname === url;

  return (
    <aside className="w-60 h-full bg-primary border-r border-border min-h-screen p-4 shadow-lg rounded-r-2xl overflow-y-auto scrollbar-none">
      <div className="flex items-center mb-2 px-1">
      <img src={logoSD} alt="Logo Sekolah" className="w-20 h-20 object-contain" />
        <h2 className="text-sm text-foreground uppercase font-bold tracking-wide">E-Presensi</h2>
      </div>

      <nav className="space-y-3">
        {mainItems.map((item) => (
          <button
            key={item.title}
            onClick={() => handleNavigation(item.title, item.url)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-300 shadow-sm
              ${isActive(item.url) ? "bg-black/10 text-black ring-2 ring-primary" : "bg-muted hover:bg-muted/80 text-muted-foreground"}
              cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            {loadingTitle === item.title && <Loader2 className="h-4 w-4 animate-spin text-black" />}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        <p className="text-xs uppercase font-semibold mb-3 pl-4 tracking-wide bg-primary">Administrasi</p>

        <nav className="space-y-3">
          {adminItems.map((item) => {
            const isDropdown = item.children && item.children.length > 0;
            const isOpen = openDropdown === item.title;

            return (
              <div key={item.title}>
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
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-300 shadow-sm
                    ${item.url && isActive(item.url) ? "bg-black/10 text-black ring-2 ring-primary" : "bg-muted hover:bg-muted/80 text-muted-foreground"}
                    cursor-pointer`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  {item.title === "Logout" && loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                  ) : isDropdown ? (
                    isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    loadingTitle === item.title && <Loader2 className="h-4 w-4 animate-spin text-black" />
                  )}
                </button>

                {isDropdown && isOpen && (
                  <div className="pl-2 mt-2 pr-3 space-y-2">
                    {item.children.map((child) => (
                      <button
                        key={child.title}
                        onClick={() => handleNavigation(child.title, child.url!)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition cursor-pointer
                          ${isActive(child.url) ? "bg-black/10 text-black ring-2 ring-primary" : "bg-muted hover:bg-muted/70 text-muted-foreground"}`}
                      >
                        <child.icon className="h-4 w-4" />
                        <span>{child.title}</span>
                        {loadingTitle === child.title && <Loader2 className="h-4 w-4 animate-spin ml-auto text-black" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
