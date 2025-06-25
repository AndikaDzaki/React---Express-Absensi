import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getJadwal } from "@/lib/jadwal-api";
import { getGuru } from "@/lib/Api";
import { getKelas } from "@/lib/kelas-api";
import { toast } from "sonner";

interface JadwalItem {
  id: number;
  id_guru: number;
  id_kelas: number;
  tanggal: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
}

interface GuruItem {
  id: number;
  namaGuru: string;
}

interface KelasItem {
  id: number;
  nama_kelas: string;
}

const JadwalUser = () => {
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jadwalRes, guruRes, kelasRes] = await Promise.all([getJadwal(), getGuru(), getKelas()]);
        setJadwalList(jadwalRes.data);
        setGuruList(guruRes.data);
        setKelasList(kelasRes.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal mengambil data dari server");
      }
    };

    fetchData();
  }, []);

  const getGuruLabel = (id: number) => guruList.find((g) => g.id === id)?.namaGuru || "Tidak Diketahui";

  const getKelasLabel = (id: number) => kelasList.find((k) => k.id === id)?.nama_kelas || "Tidak Diketahui";

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Jadwal Pelajaran</h2>

      <Table>
        <TableCaption>Daftar Jadwal</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Guru</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Hari</TableHead>
            <TableHead>Jam Mulai</TableHead>
            <TableHead>Jam Selesai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jadwalList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>Belum ada data</TableCell>
            </TableRow>
          ) : (
            jadwalList.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{getGuruLabel(item.id_guru)}</TableCell>
                <TableCell>{getKelasLabel(item.id_kelas)}</TableCell>
                <TableCell>{item.tanggal}</TableCell>
                <TableCell>{item.hari}</TableCell>
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
