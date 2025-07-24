import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, LogOut } from "lucide-react";
import { io } from "socket.io-client";
import { getNotifikasiAdmin } from "@/lib/notifikasi-api"; 
import { logout } from "@/lib/auth-api";

const socket = io("http://localhost:8800");

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Dashboard Admin",
  "/datasiswa": "Kelola Data Siswa",
  "/dataguru": "Kelola Data Guru",
  "/datakelas": "Kelola Data Kelas",
  "/datajadwal": "Kelola Jadwal",
  "/datasemester": "Kelola Semester",
  "/datatahunajaran": "Kelola Tahun Ajaran",
  "/absensi": "Kelola Absensi",
  "/rekap": "Rekap Absensi",
  "/notifikasi": "Notifikasi Admin",
  "/generateqrcode": "Generate QR Code",
};

export default function NavbarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const title = pageTitles[currentPath] || "Halaman ";

  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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


  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const all = await getNotifikasiAdmin();
        const unread = all.filter((n) => !n.dibaca).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Gagal mengambil notifikasi admin:", err);
      }
    };

    fetchUnread();

    socket.on("notifikasiBaru", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("notifikasiBaru");
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/notifikasi") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="bg-primary text-black rounded-xl shadow-md px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/notifikasi")}
            className="relative text-gray-700 hover:opacity-80 transition"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="text-gray-700 hover:opacity-80 transition"
            disabled={loggingOut}
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
