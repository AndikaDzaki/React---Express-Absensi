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
import { getMeGuru } from "@/lib/auth-api";
import { simpanAbsensiOffline, ambilSemuaAbsensiOffline, hapusAbsensiOffline } from "@/utils/indexedDB";

const DaftarKelasUser = () => {
  const navigate = useNavigate();
  const [kelasData, setKelasData] = useState<{
    id: number;
    nama_kelas: string;
    wali_kelas: string;
    jumlah_siswa: number;
  } | null>(null);
  const [absenSelesai, setAbsenSelesai] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    const syncOfflineData = async () => {
      const offlineAbsen = await ambilSemuaAbsensiOffline();

      for (const item of offlineAbsen) {
        try {
          await scanAbsensi(item.scan);
          await hapusAbsensiOffline(item.id);
          toast.success("Berhasil sinkron absensi offline.");
        } catch (e) {
          console.warn("Gagal sync absensi offline:", e);
        }
      }
    };

    window.addEventListener("online", syncOfflineData);
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getMeGuru();
        const idGuru = userRes.data.id;

        const [resKelas, resSiswa] = await Promise.all([getKelasByGuru(idGuru), getSiswa()]);
        const kelas = resKelas.data;
        const siswaList: SiswaItem[] = resSiswa.data;

        const jumlah_siswa = siswaList.filter((s) => s.id_kelas === kelas.id).length;

        setKelasData({
          id: kelas.id,
          nama_kelas: kelas.nama_kelas,
          wali_kelas: kelas.namaGuru || "Anda",
          jumlah_siswa,
        });

        // Cek absensi hari ini
        const resAbsensi = await getAbsensiByKelas(kelas.id);
        const today = new Date().toISOString().split("T")[0];
        const absensiHariIni = resAbsensi.data.filter((item: any) => item.tanggal === today && item.status !== "Belum");

        const semuaSudahAbsen = absensiHariIni.length === jumlah_siswa;
        setAbsenSelesai(semuaSudahAbsen);
      } catch (error) {
        console.error("Gagal memuat data kelas:", error);
        toast.error("Gagal memuat data kelas Anda");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleScanSuccess = async (result: string) => {
    if (!kelasData) return;

    try {
      const response = await scanAbsensi(result);
      toast.success(response.data.message);

      // Cek ulang setelah scan
      const resAbsensi = await getAbsensiByKelas(kelasData.id);
      const today = new Date().toISOString().split("T")[0];
      const absensiHariIni = resAbsensi.data.filter((item: any) => item.tanggal === today && item.status !== "Belum");

      const semuaSudahAbsen = absensiHariIni.length === kelasData.jumlah_siswa;
      setAbsenSelesai(semuaSudahAbsen);
    } catch (error: any) {
      if (!navigator.onLine) {
        const offlineData = {
          id: `${kelasData.id}-${result}`,
          scan: result,
          kelas_id: kelasData.id,
          tanggal: new Date().toISOString().split("T")[0],
          waktu: new Date().toISOString(),
        };
        await simpanAbsensiOffline(offlineData);
        toast.success("Data absensi disimpan offline!");
      } else {
        toast.error("Gagal memproses absensi.");
      }
      console.error("Scan error:", error);
    }
  };

  if (loading) return <div className="p-6">Memuat data kelas...</div>;

  if (!kelasData) {
    return <div className="p-6 text-red-600">Anda belum ditugaskan ke kelas manapun.</div>;
  }

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 mx-10">
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
                  <Button onClick={() => navigate(`/user/halamanabsensi/${kelasData.id}`)} variant="default" size="sm">
                    Isi Absen
                  </Button>
                  <Button onClick={() => setIsScannerOpen(true)} variant="outline" size="sm">
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
