import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle2, Bell, LogOut } from "lucide-react";

const unreadNotifications = 1;

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Selamat Datang Di Website Absensi!",
  "/datasiswa": "Halaman Data Siswa",
  "/dataguru": "Halaman Data Guru",
  "/absensi": "Halaman Absensi",
  "/datajadwal": "Halaman Data Jadwal",
  "/datakelas": "Halaman Data Kelas",
  "/rekap": "Halaman Rekap Absensi",
  "/notifikasi": "Halaman Notifikasi",
  "/settings": "Pengaturan",
  "/datatahunajaran": "Halaman Tahun Ajaran",
  "/datasemester": "Halaman Semester",
  "/user/dashboard": "Selamat Datang Di Website Absensi",
  "/user/jadwaluser": "Halaman Jadwal Absensi",
  "/user/absensiuser": "Halaman Absensi",
  "/user/rekapabsensi": "Halaman Rekap Absensi",
  "/user/profile": "Halaman Profile",
  "/generateqrcode": "Halaman Generate Qr Code",
  "/user/halamanabsensi" : "Halaman Absensi Guru",
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const title = pageTitles[currentPath] || "Halaman";

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      sessionStorage.clear();
      setLoggingOut(false);
      navigate("/");
    }, 700);
  };

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="bg-primary text-black rounded-xl shadow-md px-6 py-4 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          {currentPath === "/dashboard" && (
            <p className="text-sm opacity-80">Sekolah Dasar Negeri Uwung Jaya</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Notifikasi */}
          <button
            onClick={() => navigate("/notifikasi")}
            className="relative text-gray-700 hover:opacity-80 transition"
            aria-label="Notifikasi"
          >
            <Bell className="w-6 h-6" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Profil */}
          <button
            onClick={() => navigate("/user/profile")}
            className="text-gray-700 hover:opacity-80 transition"
            aria-label="Profil User"
          >
            <UserCircle2 className="w-6 h-6" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-gray-700 hover:opacity-80 transition"
            aria-label="Logout"
            disabled={loggingOut}
          >
            <LogOut className={`w-6 h-6 ${loggingOut ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
