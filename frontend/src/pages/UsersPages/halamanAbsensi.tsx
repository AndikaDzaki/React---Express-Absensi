import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AbsensiItem, getAbsensiByKelas, updateAbsensiBatch } from "@/lib/absensi-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { io, Socket } from "socket.io-client";


const socket: Socket = io("http://localhost:8800", {
  transports: ["websocket"],
  withCredentials: true,
});

const statusList = ["H", "A", "S", "I"] as const;
type Status = (typeof statusList)[number];

const statusLabel: Record<Status, string> = {
  H: "Hadir",
  A: "Alfa",
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
      return "A";
    default:
      return "A";
  }
};

const HalamanAbsensi = () => {
  const { kelasId } = useParams<{ kelasId: string }>();
  const navigate = useNavigate();

  const [absensiList, setAbsensiList] = useState<AbsensiItem[]>([]);
  const [absensi, setAbsensi] = useState<Record<number, Status>>({});
  const [loading, setLoading] = useState(true);

  const tanggalHariIni = new Date().toLocaleDateString("id-ID");

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
        setLoading(false);
      } catch (error) {
        toast.error("Gagal memuat data absensi");
        console.error(error);
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
  try {
    const dataToUpdate = absensiList.map((item) => ({
      id_siswa: item.id_siswa,
      tanggal: new Date(item.tanggal).toISOString().split("T")[0],
      status: statusLabel[absensi[item.id_siswa]],
    }));

    console.log("Data yang akan dikirim ke backend:", dataToUpdate);

    await updateAbsensiBatch(dataToUpdate);
    toast.success("Absensi berhasil disimpan");
    navigate("/user/absensiuser");
  } catch (error) {
    toast.error("Gagal menyimpan absensi");
    console.error("Gagal menyimpan:", error);
  }
};


  if (loading) return <div className="p-6">Memuat data absensi...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Kelas {kelasId} - {tanggalHariIni}
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
          {absensiList.map((item) => (
            <TableRow key={item.id_siswa}>
              <TableCell>{new Date(item.tanggal).toLocaleDateString("id-ID")}</TableCell>
              <TableCell>{item.siswa?.nama}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {statusList.map((status) => (
                    <Button
                      key={status}
                      variant={absensi[item.id_siswa] === status ? "default" : "outline"}
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
          ))}
        </TableBody>
      </Table>

      <Button className="mt-4" onClick={handleSimpan}>
        Simpan Absensi
      </Button>
    </div>
  );
};

export default HalamanAbsensi;
