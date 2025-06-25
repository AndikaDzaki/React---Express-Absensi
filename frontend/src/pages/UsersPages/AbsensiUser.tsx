/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getSiswa } from "@/lib/siswa-api";
import { getKelasByGuru } from "@/lib/kelas-api"; 
import { getAbsensiByKelas, scanAbsensi } from "@/lib/absensi-api";
import { toast } from "sonner";
import NativeQRScanner from "@/components/scanner";
import type { SiswaItem } from "@/types/absensi";

const DaftarKelasUser = () => {
  const navigate = useNavigate();
  const [kelasData, setKelasData] = useState<any | null>(null);
  const [absenSelesai, setAbsenSelesai] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tanggalHariIni = new Date();
        tanggalHariIni.setHours(0, 0, 0, 0);

        const [resKelas, resSiswa] = await Promise.all([
          getKelasByGuru(),
          getSiswa(),
        ]);

        const kelas = resKelas.data;
        const siswaList: SiswaItem[] = resSiswa.data;

        const jumlah_siswa = siswaList.filter((s) => s.id_kelas === kelas.id).length;

        const kelasGabung = {
          id: kelas.id,
          nama_kelas: kelas.nama_kelas,
          wali_kelas: kelas.namaGuru || "Anda",
          jumlah_siswa,
        };

        setKelasData(kelasGabung);

        const resAbsensi = await getAbsensiByKelas(kelas.id);
        const absensiHariIni = resAbsensi.data.filter((item: any) => {
          const tgl = new Date(item.tanggal);
          tgl.setHours(0, 0, 0, 0);
          return tgl.getTime() === tanggalHariIni.getTime();
        });

        const semuaSudahAbsen =
          absensiHariIni.length > 0 && absensiHariIni.every((item: any) => item.status !== "Belum");

        setAbsenSelesai(semuaSudahAbsen);
        setLoading(false);
      } catch (error) {
        toast.error("Gagal memuat data kelas Anda");
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleScanSuccess = async (result: string) => {
    try {
      const response = await scanAbsensi(result);
      toast.success(response.data.message);

      if (kelasData) {
        const resAbsensi = await getAbsensiByKelas(kelasData.id);
        const tanggalHariIni = new Date();
        tanggalHariIni.setHours(0, 0, 0, 0);

        const absensiHariIni = resAbsensi.data.filter((item: any) => {
          const tgl = new Date(item.tanggal);
          tgl.setHours(0, 0, 0, 0);
          return tgl.getTime() === tanggalHariIni.getTime();
        });

        const semuaSudahAbsen =
          absensiHariIni.length > 0 && absensiHariIni.every((item: any) => item.status !== "Belum");

        setAbsenSelesai(semuaSudahAbsen);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses scan");
      console.error(error);
    }
  };

  if (loading) return <div className="p-6">Memuat data kelas...</div>;

  if (!kelasData) {
    return <div className="p-6 text-red-600">Anda belum ditugaskan ke kelas manapun.</div>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Kelas Anda</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kelas</TableHead>
            <TableHead>Wali Kelas</TableHead>
            <TableHead>Jumlah Siswa</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow key={kelasData.id}>
            <TableCell>{kelasData.nama_kelas}</TableCell>
            <TableCell>{kelasData.wali_kelas}</TableCell>
            <TableCell>{kelasData.jumlah_siswa}</TableCell>
            <TableCell className="flex gap-2">
              {absenSelesai ? (
                <span className="text-green-600 font-medium">Absensi Selesai</span>
              ) : (
                <>
                  <Button
                    onClick={() => navigate(`/user/halamanabsensi/${kelasData.id}`)}
                    variant="default"
                    size="sm"
                  >
                    Isi Absen
                  </Button>
                  <Button
                    onClick={() => setIsScannerOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Scan Barcode
                  </Button>
                </>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {isScannerOpen && (
        <NativeQRScanner
          onDetected={(data) => {
            handleScanSuccess(data);
            setIsScannerOpen(false);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
};

export default DaftarKelasUser;
