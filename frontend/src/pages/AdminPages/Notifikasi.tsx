import { useState, useEffect } from "react";
import { notifikasiSchema, NotifikasiForm } from "@/schema/notifikasi-admin";
import { z } from "zod";


interface NotifikasiItem extends NotifikasiForm {
  id: number;
}

export default function Notifikasi() {
  const [notifications, setNotifications] = useState<NotifikasiItem[]>([]);

  useEffect(() => {
    
    const dummyData = [
      {
        id: 1,
        message: "Absensi hari ini belum lengkap untuk beberapa siswa.",
        category: "Absensi",
        status: "unread",
        date: "2025-04-28",
      },
      {
        id: 2,
        message: "Pengumuman: Ujian Tengah Semester besok.",
        category: "Pengumuman",
        status: "read",
        date: "2025-04-28",
      },
      {
        id: 3,
        message: "Siswa X telah mengajukan izin sakit hari ini.",
        category: "Absensi",
        status: "read",
        date: "2025-04-27",
      },
    ];

    
    const result = z.array(notifikasiSchema).safeParse(dummyData);
    if (result.success) {
      setNotifications(result.data as NotifikasiItem[]);
    } else {
      console.error("Data notifikasi tidak valid:", result.error.format());
    }
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, status: "read" }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Notifikasi Admin</h2>

      <div className="flex justify-between mb-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Filter</button>
        <div>
          <button
            onClick={markAllAsRead}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Tandai Semua Sudah Dibaca
          </button>
          <button
            onClick={clearAll}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Hapus Semua
          </button>
        </div>
      </div>

      <div>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 mb-2 rounded border ${
              notif.status === "unread" ? "bg-yellow-100" : "bg-gray-100"
            }`}
          >
            <p className="font-bold">{notif.category}</p>
            <p>{notif.message}</p>
            <div className="text-sm text-gray-500">
              {notif.date} |{" "}
              <button className="text-blue-500 hover:underline">Lihat Detail</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
