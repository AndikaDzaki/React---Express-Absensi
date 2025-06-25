import { Calendar, Home, LogOut, Users, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const items = [
  { title: "Dashboard", url: "/user/dashboard", Icon: Home },
  { title: "Jadwal Absensi", url: "/user/jadwaluser", Icon: Calendar },
  { title: "Absensi", url: "/user/absensiuser", Icon: Users },
  { title: "Rekap Absensi", url: "/user/rekapabsensi", Icon: Calendar },
  { title: "Profile", url: "/user/profile", Icon: User },
  { title: "Logout", url: "/", Icon: LogOut },
];

function UserSidebar() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleNavigation = async (title: string, url: string) => {
    setActiveItem(title);
    await new Promise((res) => setTimeout(res, 500));
    navigate(url);
    setActiveItem(null);
  };

  return (
    <aside className="w-64 bg-primary border-r border-border min-h-screen p-6 shadow-lg rounded-r-3xl">
      <div className="flex items-center mb-2 px-1">
        <img src="/src/assets/logo-sd.png" alt="Logo Sekolah" className="w-20 h-20 object-contain" />
        <h2 className="text-sm text-foreground uppercase font-bold tracking-wide">E-Presensi</h2>
      </div>
      <nav className="space-y-3">
        {items.map(({ title, url, Icon }) => {
          const isActive = activeItem === title;

          return (
            <button
              key={title}
              onClick={() => handleNavigation(title, url)}
              disabled={isActive}
              className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-300 shadow-sm ${
                isActive ? "bg-black/10 text-black ring-2 ring-primary" : "bg-muted hover:bg-muted/80 text-muted-foreground"
              } cursor-pointer`}
            >
              <div className="flex items-center gap-4">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{title}</span>
              </div>
              {isActive && <Loader2 className="h-4 w-4 animate-spin text-black" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default UserSidebar;
