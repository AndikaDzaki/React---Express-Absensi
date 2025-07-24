import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getMeGuru } from "@/lib/auth-api";
import { getJadwalHariIni } from "@/lib/jadwal-api";
import { toast } from "sonner";
import CardUser from "@/components/card-user";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import ButtonNotifikasi from "@/components/ButtonNotifikasi";

interface JadwalItem {
  id: number;
  id_kelas: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  kelas: {
    nama_kelas: string;
  };
}

function DashboardUser() {
  const [userName, setUserName] = useState("Guru");
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const deferredPrompt = useInstallPrompt();

  useEffect(() => {
    if (deferredPrompt) {
      console.log("deferredPrompt detected");

      toast("Aplikasi tersedia untuk diinstal!", {
        action: {
          label: "Pasang",
          onClick: () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === "accepted") {
                toast.success("Instalasi berhasil dimulai!");
              } else {
                toast.warning("Instalasi dibatalkan.");
              }
            });
          },
        },
      });
    }
  }, [deferredPrompt]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUser = await getMeGuru();
        setUserName(resUser.data.name?.trim() || "Guru");

        const resJadwal = await getJadwalHariIni();
        setJadwalList(resJadwal.data.jadwal);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal mengambil data jadwal hari ini");
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div className="p-6 md:p-8 flex flex-col gap-5 max-w-screen-xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
            👋 Hi, <span className="text-primary font-bold">{userName}</span>!
          </h1>
          <ButtonNotifikasi />
        </div>

        <div className="flex justify-center">
          <CardUser />
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-lg shadow-sm p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
        <h2 className="text-lg font-semibold mb-4">Jadwal Hari Ini</h2>

        <Table>
          <TableCaption>Daftar Jadwal Anda Hari Ini</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Kelas</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jam Mulai</TableHead>
              <TableHead>Jam Selesai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jadwalList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Tidak ada jadwal hari ini
                </TableCell>
              </TableRow>
            ) : (
              jadwalList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.kelas.nama_kelas}</TableCell>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.jam_mulai}</TableCell>
                  <TableCell>{item.jam_selesai}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}

export default DashboardUser;
