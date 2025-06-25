import { useEffect, useState, useCallback, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getAbsensi } from "@/lib/absensi-api";
import { getSiswa } from "@/lib/siswa-api";
import { getKelas } from "@/lib/kelas-api";

interface AbsensiRawItem {
  id: number;
  id_siswa: number;
  kelas_id: number;
  tanggal: string;
  status: string;
}

interface AbsensiItem {
  id: number;
  nama: string;
  kelas: string;
  tanggal: string;
  status: string;
}

interface SiswaItem {
  id: number;
  nama: string;
  id_kelas: number;
}

interface KelasItem {
  id: number;
  nama_kelas: string;
}

export default function TablesDashboard() {
  const [rawAbsensi, setRawAbsensi] = useState<AbsensiRawItem[]>([]);
  const [siswaList, setSiswaList] = useState<SiswaItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [absensiRes, siswaRes, kelasRes] = await Promise.all([getAbsensi(), getSiswa(), getKelas()]);

      setRawAbsensi(absensiRes.data);
      setSiswaList(siswaRes.data);
      setKelasList(kelasRes.data);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getNamaSiswa = useCallback((id: number) => siswaList.find((s) => s.id === id)?.nama ?? "-", [siswaList]);

  const getNamaKelas = useCallback((id: number) => kelasList.find((k) => k.id === id)?.nama_kelas ?? "-", [kelasList]);

  const formattedAbsensiData: AbsensiItem[] = useMemo(() => {
    return rawAbsensi.map((item) => ({
      id: item.id,
      nama: getNamaSiswa(item.id_siswa),
      kelas: getNamaKelas(item.kelas_id),
      tanggal: item.tanggal,
      status: item.status,
    }));
  }, [rawAbsensi, getNamaSiswa, getNamaKelas]);

  if (formattedAbsensiData.length === 0) {
    return <p className="text-center text-gray-500 py-4">Belum ada data absensi.</p>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption className="text-gray-600 text-sm mb-2">Daftar Data Absensi</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {formattedAbsensiData.map(({ id, tanggal, nama, kelas, status }) => (
            <TableRow key={id}>
              <TableCell className="font-medium">{tanggal}</TableCell>
              <TableCell>{nama}</TableCell>
              <TableCell>{kelas}</TableCell>
              <TableCell>{status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
