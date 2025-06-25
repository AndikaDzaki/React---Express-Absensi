import TablesDashboard from "@/components/tables-dashboard";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";


interface AbsensiItem {
    id: number;
    nama: string;
    status: string;
    metode: string;
    jumlah: string;
  }

function RekapAbsensi() {
    const [absensiData, setAbsensiData] = useState<AbsensiItem[]>([]);

    useEffect(() => {
      const storedData = localStorage.getItem("absensiData");
      if (storedData) {
        setAbsensiData(JSON.parse(storedData));
      }
    }, []);
  
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(absensiData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "RekapAbsensi");
      XLSX.writeFile(workbook, "rekap-absensi.xlsx");
    };
  
    return (
      <motion.div
        className="bg-white rounded-lg shadow-sm p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Rekap Absensi</h2>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>
  
        <TablesDashboard data={absensiData} />
      </motion.div> 
    )
}

export default RekapAbsensi