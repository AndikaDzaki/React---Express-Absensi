import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getJadwalHariIni } from "@/lib/jadwal-api";
import { toast } from "sonner";

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

const JadwalUser = () => {
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getJadwalHariIni();
        setJadwalList(res.data.jadwal);
      } catch (error) {
        console.error("Gagal mengambil jadwal hari ini:", error);
        toast.error("Gagal mengambil jadwal hari ini");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 ml-10 mr-10 ">
      <h2 className="text-xl font-bold">Jadwal Hari Ini</h2>

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
              <TableCell colSpan={5}>Tidak ada jadwal hari ini</TableCell>
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
    </div>
  );
};

export default JadwalUser;
