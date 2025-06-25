import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getKelas } from "@/lib/kelas-api";
import { getSiswa } from "@/lib/siswa-api";
import { getQrToken } from "@/lib/qrCode-api";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SearchBar from "@/components/SearchBar";

interface SiswaItem {
  id: number;
  nama: string;
  nisn: string;
  id_kelas: number;
  noTelp: string;
}

interface KelasItem {
  id: number;
  nama_kelas: string;
}

export default function GenerateQr() {
  const [siswaList, setSiswaList] = useState<SiswaItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [qrMap, setQrMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSiswa, resKelas] = await Promise.all([getSiswa(), getKelas()]);
        const siswaData = resSiswa.data;
        const kelasData = resKelas.data;

        setSiswaList(siswaData);
        setKelasList(kelasData);

        const qrResults = await Promise.all(
          siswaData.map(async (siswa) => {
            try {
              const res = await getQrToken(siswa.id);
              return { id: siswa.id, token: res.data.token };
            } catch (err) {
              console.error(`Gagal ambil token untuk siswa ID ${siswa.id}`, err);
              return { id: siswa.id, token: "" };
            }
          })
        );

        const qrMapTemp: Record<number, string> = {};
        qrResults.forEach(({ id, token }) => {
          qrMapTemp[id] = token;
        });

        setQrMap(qrMapTemp);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getNamaKelas = (id: number) => {
    return kelasList.find((k) => k.id === id)?.nama_kelas || "Tidak Diketahui";
  };

  const handleDownload = (id: number, nama: string) => {
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement | null;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${nama}-qr.png`;
    link.click();
  };

  const filteredData = siswaList.filter((siswa) => {
    const namaKelas = getNamaKelas(siswa.id_kelas);
    const combined = `${siswa.nama} ${siswa.nisn} ${namaKelas}`.toLowerCase();
    return combined.includes(keyword.toLowerCase());
  });

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow mt-10">
      <div className="mb-2 max-w-sm mx-2.5">
        <SearchBar value={keyword} onChange={setKeyword} placeholder="Cari nama, NISN, atau kelas..." />
      </div>

      {loading ? (
        <p className="text-center">Memuat data siswa dan QR token...</p>
      ) : filteredData.length === 0 ? (
        <p className="text-center">Belum ada data yang cocok.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>NISN</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((siswa) => {
              const namaKelas = getNamaKelas(siswa.id_kelas);
              const qrValue = qrMap[siswa.id];

              return (
                <TableRow key={siswa.id}>
                  <TableCell>{siswa.nama}</TableCell>
                  <TableCell>{siswa.nisn}</TableCell>
                  <TableCell>{namaKelas}</TableCell>
                  <TableCell>
                    {qrValue ? (
                      <QRCodeCanvas
                        id={`qr-${siswa.id}`}
                        value={qrValue}
                        size={180}
                        level="M"
                        includeMargin
                      />
                    ) : (
                      <span className="text-sm text-red-500">Token tidak tersedia</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(siswa.id, siswa.nama)}
                      disabled={!qrValue}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
