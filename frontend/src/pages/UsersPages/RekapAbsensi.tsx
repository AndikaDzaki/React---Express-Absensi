import { useEffect, useState, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getAbsensi } from "@/lib/absensi-api";
import { getSiswa } from "@/lib/siswa-api";
import { getKelas } from "@/lib/kelas-api";

type AbsensiItem = {
  id: number;
  tanggal: string;
  id_siswa: number;
  kelas_id: number;
  status: string;
};

type SiswaItem = {
  id: number;
  nama: string;
  id_kelas: number;
};

type KelasItem = {
  id: number;
  nama_kelas: string;
};

export default function RekapAbsensi() {
  const [absensiData, setAbsensiData] = useState<AbsensiItem[]>([]);
  const [siswaList, setSiswaList] = useState<SiswaItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | "all">("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [absensiRes, siswaRes, kelasRes] = await Promise.all([getAbsensi(), getSiswa(), getKelas()]);
        setAbsensiData(absensiRes.data);
        setSiswaList(siswaRes.data);
        setKelasList(kelasRes.data);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };

    fetchData();
  }, []);

  const getNamaSiswa = (id: number) => siswaList.find((s) => s.id === id)?.nama || "–";
  const getNamaKelas = (id: number) => kelasList.find((k) => k.id === id)?.nama_kelas || "–";

  const filteredData = useMemo(() => {
    return absensiData.filter((item) => (selectedKelas === "all" ? true : item.kelas_id === selectedKelas));
  }, [absensiData, selectedKelas]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Absensi");

    worksheet.columns = [
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Nama", key: "nama", width: 25 },
      { header: "Kelas", key: "kelas", width: 15 },
      { header: "Status", key: "status", width: 12 },
    ];

    filteredData.forEach((item) => {
      const row = worksheet.addRow({
        tanggal: item.tanggal,
        nama: getNamaSiswa(item.id_siswa),
        kelas: getNamaKelas(item.kelas_id),
        status: item.status,
      });

      const cell = row.getCell("status");
      let fillColor = "";
      switch (item.status.toLowerCase()) {
        case "hadir":
          fillColor = "C6EFCE";
          break;
        case "izin":
          fillColor = "FFEB9C";
          break;
        case "sakit":
          fillColor = "BDD7EE";
          break;
        case "alpa":
          fillColor = "F8CBAD";
          break;
      }

      if (fillColor) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
      }
    });

    // Ringkasan Status
    worksheet.addRow([]);
    const statusCount: Record<string, number> = {};
    filteredData.forEach((item) => {
      statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    });

    worksheet.addRow(["Ringkasan Status"]);
    Object.entries(statusCount).forEach(([status, count]) => {
      worksheet.addRow(["", "", status, count]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `rekap-absensi-${selectedKelas}.xlsx`);
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 ml-10 mr-10">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Rekap Absensi</h2>

        <div className="flex items-center gap-2">
          <select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value === "all" ? "all" : Number(e.target.value))} className="border rounded px-3 py-2">
            <option value="all">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kelas}
              </option>
            ))}
          </select>

          <Button onClick={exportToExcel}>Export ke Excel</Button>
        </div>
      </div>

      <Table>
        <TableCaption>Data Absensi per Kelas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.tanggal}</TableCell>
              <TableCell>{getNamaSiswa(item.id_siswa)}</TableCell>
              <TableCell>{getNamaKelas(item.kelas_id)}</TableCell>
              <TableCell>{item.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
