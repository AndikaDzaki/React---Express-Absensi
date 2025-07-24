import { useState, useEffect } from "react";
import {
  getNotifikasiAdmin,
  markNotifikasiAsRead,
  deleteNotifikasi,
  NotifikasiItem,
} from "@/lib/notifikasi-api";
import { io } from "socket.io-client";

const socket = io("http://localhost:8800", {
  withCredentials: true,
  transports: ["websocket"],
});

export default function Notifikasi() {
  const [notifications, setNotifications] = useState<NotifikasiItem[]>([]);

  useEffect(() => {
    const fetchNotifikasi = async () => {
      try {
        const data = await getNotifikasiAdmin();
        setNotifications(data);
      } catch (error) {
        console.error("Gagal mengambil data notifikasi:", error);
      }
    };

    fetchNotifikasi();

    socket.on("notifikasiBaru", (notif: NotifikasiItem) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("notifikasiBaru");
    };
  }, []);

  const markAllAsRead = () => {
    notifications.forEach((notif) => {
      if (!notif.dibaca) {
        markNotifikasiAsRead(notif.id).catch(console.error);
      }
    });

    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, dibaca: true }))
    );
  };

  const clearAll = () => {
    notifications.forEach((notif) => {
      deleteNotifikasi(notif.id).catch(console.error);
    });

    setNotifications([]);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotifikasiAsRead(id);
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
      await deleteNotifikasi(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Gagal hapus notifikasi:", error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left"></h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto">
          Filter
        </button>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={markAllAsRead}
            className="bg-green-500 text-white px-4 py-2 rounded w-full md:w-auto"
          >
            Tandai Semua Sudah Dibaca
          </button>
          <button
            onClick={clearAll}
            className="bg-red-500 text-white px-4 py-2 rounded w-full md:w-auto"
          >
            Hapus Semua
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center">Tidak ada notifikasi.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded border ${
                !notif.dibaca ? "bg-yellow-100" : "bg-gray-100"
              } shadow-sm`}
            >
              <p className="font-semibold text-sm text-gray-700">{notif.jenis || "Tanpa Jenis"}</p>
              <p className="text-base text-gray-800">{notif.pesan}</p>
              <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:justify-between mt-2">
                <span>{notif.tanggal ? new Date(notif.tanggal).toLocaleString() : "Tanggal tidak tersedia"}</span>
                <div className="space-x-2 mt-2 sm:mt-0 sm:text-right">
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
    </div>
  );
}
