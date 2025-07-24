import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AbsensiItem, getAbsensiByKelas, updateAbsensiBatch } from "@/lib/absensi-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { io, Socket } from "socket.io-client";
import { getKelasByGuru } from "@/lib/kelas-api";
import { getMeGuru } from "@/lib/auth-api";
import { ambilSemuaAbsensiOffline, hapusAbsensiOffline, simpanAbsensiOffline } from "@/utils/indexedDB";

const socket: Socket = io("http://localhost:8800", {
  transports: ["websocket"],
  withCredentials: true,
});

const statusList = ["H", "A", "S", "I"] as const;
type Status = (typeof statusList)[number];

const statusLabel: Record<Status, string> = {
  H: "Hadir",
  A: "Alpa",
  S: "Sakit",
  I: "Izin",
};

const normalizeStatus = (status: string): Status => {
  switch (status) {
    case "Hadir":
      return "H";
    case "Izin":
      return "I";
    case "Sakit":
      return "S";
    case "Alpa":
    case "Tidak Hadir":
    default:
      return "A";
  }
};

const mapStatusToLabelLiteral = (status: Status): "Hadir" | "Izin" | "Sakit" | "Alpa" => {
  switch (status) {
    case "H":
      return "Hadir";
    case "I":
      return "Izin";
    case "S":
      return "Sakit";
    default:
      return "Alpa";
  }
};

const HalamanAbsensi = () => {
  const { kelasId } = useParams<{ kelasId: string }>();
  const navigate = useNavigate();

  const [absensiList, setAbsensiList] = useState<AbsensiItem[]>([]);
  const [absensi, setAbsensi] = useState<Record<number, Status>>({});
  const [loading, setLoading] = useState(true);
  const [namaKelas, setNamaKelas] = useState("");
  const [isSelesai, setIsSelesai] = useState(false);

  const tanggalHariIni = new Date().toLocaleDateString("id-ID");

  useEffect(() => {
    const syncOfflineData = async () => {
      const offlineAbsen = await ambilSemuaAbsensiOffline();

      for (const item of offlineAbsen) {
        try {
          const data = [
            {
              id_siswa: item.id_siswa,
              kelas_id: item.kelas_id,
              tanggal: item.tanggal,
              status: item.status,
            },
          ];
          await updateAbsensiBatch(data);
          await hapusAbsensiOffline(item.id);
          toast.success("Berhasil sinkron absensi offline.");
        } catch (e) {
          console.warn("Gagal sync absensi offline:", e);
        }
      }
    };

    window.addEventListener("online", syncOfflineData);
    if (navigator.onLine) {
      syncOfflineData();
    }

    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        if (!kelasId) return;

        const res = await getAbsensiByKelas(Number(kelasId));
        const data = res.data;
        setAbsensiList(data);

        const initialStatus: Record<number, Status> = {};
        data.forEach((item) => {
          initialStatus[item.id_siswa] = normalizeStatus(item.status);
        });
        setAbsensi(initialStatus);

        const userRes = await getMeGuru();
        const idGuru = userRes.data.id;
        const resKelas = await getKelasByGuru(idGuru);
        const kelas = resKelas.data;
        setNamaKelas(kelas.nama_kelas);
        setLoading(false);
      } catch (error) {
        toast.error("Gagal memuat data absensi");
        console.error(error);
        setLoading(false);
      }
    };

    fetchAbsensi();
  }, [kelasId]);

  useEffect(() => {
    if (!kelasId) return;

    const handleBatchUpdated = (dataArray: Array<{ id_siswa: number; status: string }>) => {
      const updated: Record<number, Status> = {};
      dataArray.forEach((item) => {
        updated[item.id_siswa] = normalizeStatus(item.status);
      });

      setAbsensi((prev) => ({
        ...prev,
        ...updated,
      }));

      toast.success("Absensi diperbarui secara realtime");
    };

    socket.on("absensi-batch-updated", handleBatchUpdated);
    return () => {
      socket.off("absensi-batch-updated", handleBatchUpdated);
    };
  }, [kelasId]);

  const handleStatusChange = (id: number, status: Status) => {
    setAbsensi((prev) => ({ ...prev, [id]: status }));
  };

  const handleSimpan = async () => {
    if (!kelasId) return;

    const dataToUpdate = absensiList.map((item) => ({
      id_siswa: item.id_siswa,
      kelas_id: Number(kelasId),
      tanggal: new Date(item.tanggal).toISOString().split("T")[0],
      status: mapStatusToLabelLiteral(absensi[item.id_siswa]),
    }));

    try {
      await updateAbsensiBatch(dataToUpdate);
      toast.success("Absensi berhasil disimpan");
      setIsSelesai(true);
      setTimeout(() => navigate("/user/absensiuser"));
    } catch (error) {
      if (!navigator.onLine) {
        for (const item of dataToUpdate) {
          const offlineData = {
            id: `${kelasId}-${item.id_siswa}`,
            id_siswa: item.id_siswa,
            kelas_id: item.kelas_id,
            tanggal: item.tanggal,
            status: item.status,
          };
          await simpanAbsensiOffline(offlineData);
        }
        toast.success("Data absensi disimpan offline. Akan disinkronkan saat online.");
        setIsSelesai(true);
        setTimeout(() => navigate("/user/absensiuser"));
      } else {
        toast.error("Gagal menyimpan absensi. Silakan coba lagi.");
      }
      console.error(error);
    }
  };

  if (loading) return <div className="p-6 text-center">Memuat data absensi...</div>;

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 ml-10 mr-10">
      <h1 className="text-xl font-semibold mb-4">
        Kelas {namaKelas} - {tanggalHariIni}
      </h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {absensiList.map((item) => {
            const currentStatus = absensi[item.id_siswa] ?? "A";
            return (
              <TableRow key={item.id_siswa}>
                <TableCell>{new Date(item.tanggal).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>{item.siswa?.nama ?? "Tidak diketahui"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {statusList.map((status) => (
                      <Button
                        key={status}
                        variant={currentStatus === status ? "default" : "outline"}
                        size="icon"
                        className="rounded-full h-8 w-8 text-xs p-0"
                        onClick={() => handleStatusChange(item.id_siswa, status)}
                        title={statusLabel[status]}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button className="mt-4" onClick={handleSimpan} disabled={isSelesai}>
        {isSelesai ? "Absensi Selesai" : "Simpan Absensi"}
      </Button>
    </div>
  );
};

export default HalamanAbsensi;
