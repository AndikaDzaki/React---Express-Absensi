import { useState, useEffect } from "react";
import {
  getNotifikasiUser,
  tandaiNotifikasiUser,
  hapusNotifikasiUser,
} from "@/lib/notifikasiUser-api";
import { NotifikasiUser } from "@/schema/notifikasi-user-schema";
import { getMeGuru } from "@/lib/auth-api";

export default function NotifikasiUserr() {
  const [notifications, setNotifications] = useState<NotifikasiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifikasi = async () => {
      try {
        const meResponse = await getMeGuru();
        const me = meResponse.data;
        const data = await getNotifikasiUser(me.id);
        setNotifications(data);
      } catch (error) {
        console.error("Gagal mengambil data notifikasi user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifikasi();
  }, []);

  const markAllAsRead = () => {
    notifications.forEach((notif) => {
      if (!notif.dibaca) {
        tandaiNotifikasiUser(notif.id).catch(console.error);
      }
    });

    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, dibaca: true }))
    );
  };

  const clearAll = () => {
    notifications.forEach((notif) => {
      hapusNotifikasiUser(notif.id).catch(console.error);
    });

    setNotifications([]);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await tandaiNotifikasiUser(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, dibaca: true } : notif
        )
      );
    } catch (error) {
      console.error("Gagal tandai notifikasi:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await hapusNotifikasiUser(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Gagal hapus notifikasi:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">
        Notifikasi Anda
      </h2>

      {loading ? (
        <p className="text-sm text-gray-500">Memuat notifikasi...</p>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
              Filter
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={markAllAsRead}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm"
              >
                Tandai Semua Sudah Dibaca
              </button>
              <button
                onClick={clearAll}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm"
              >
                Hapus Semua
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-600">Tidak ada notifikasi.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded border shadow-sm transition-all ${
                    !notif.dibaca
                      ? "bg-yellow-100 border-yellow-300"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-base mb-1">Notifikasi</p>
                  <p className="text-sm sm:text-base">
                    {notif.pesan.replace(/pukul (.+)/, (_, jam) => {
                      const parsedTime = new Date(jam);
                      const jamFormatted = parsedTime.toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );
                      return `pukul ${jamFormatted}`;
                    })}
                  </p>
                  <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap justify-between items-center mt-3 gap-2">
                    <span>
                      {notif.tanggal
                        ? new Date(notif.tanggal).toLocaleString("id-ID")
                        : "Tanggal tidak tersedia"}
                    </span>
                    <div className="flex gap-2">
                      {!notif.dibaca && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-green-600 hover:underline"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
