import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, LogOut } from "lucide-react";
import { logout } from "@/lib/auth-api";
import { getNotifikasiUser } from "@/lib/notifikasiUser-api";

const getGuruId = (): number | null => {
  const id = sessionStorage.getItem("id");
  return id ? Number(id) : null;
};

const pageTitles: { [key: string]: string } = {
  "/user/dashboard": "Selamat Datang Di Website Absensi",
  "/user/jadwaluser": "Halaman Jadwal Absensi",
  "/user/absensiuser": "Halaman Absensi",
  "/user/rekapabsensi": "Halaman Rekap Absensi",
  "/user/halamanabsensi": "Halaman Absensi Guru",
  "/user/notifikasiuser": "Halaman Notifikasi",
};

export default function NavbarUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const title = pageTitles[currentPath] || "Halaman";

  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const guruId = getGuruId();
      if (!guruId) return;

      try {
        const notifikasi = await getNotifikasiUser(guruId);
        const belumDibaca = notifikasi.filter((n) => !n.dibaca);
        setUnreadCount(belumDibaca.length);
      } catch (err) {
        console.error("Gagal fetch notifikasi user:", err);
      }
    };

    fetchUnread();
  }, []);

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

  const handleOpenNotification = () => {
    navigate("/user/notifikasiuser");

    setUnreadCount(0);
  };

  return (
    <motion.div className="mb-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
      <div className="bg-primary text-black rounded-xl shadow-md px-6 py-4 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          {currentPath === "/user/dashboard" && <p className="text-sm opacity-80">Sekolah Dasar Negeri Uwung Jaya</p>}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleOpenNotification} className="relative text-gray-700 hover:opacity-80 transition">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadCount}</span>}
          </button>

          <button onClick={handleLogout} className="text-gray-700 hover:opacity-80 transition" disabled={loggingOut}>
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
