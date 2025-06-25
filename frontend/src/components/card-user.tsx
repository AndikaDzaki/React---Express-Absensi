import { Card, CardContent } from "@/components/ui/card";
import { User, School, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { getSemester, SemesterItem } from "@/lib/semester-api";
import { getTahunAjaran } from "@/lib/tahunAjaran-api";
import { getKelas } from "@/lib/kelas-api";
import { getSiswa } from "@/lib/siswa-api";

interface TahunItem {
  id: number;
  tahun_ajaran: string;
}

function CardUser() {
  const [semesterAktif, setSemesterAktif] = useState<string | null>(null);
  const [jumlahKelas, setJumlahKelas] = useState(0);
  const [jumlahSiswa, setJumlahSiswa] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil semua data secara paralel
        const [semesterRes, tahunRes, kelasRes, siswaRes] = await Promise.all([getSemester(), getTahunAjaran(), getKelas(), getSiswa()]);

        const semesterList = semesterRes.data as SemesterItem[];
        const tahunList = tahunRes.data as TahunItem[];
        const kelasList = kelasRes.data;
        const siswaList = siswaRes.data;

        // Cari semester yang aktif
        const aktif = semesterList.find((s) => s.status === "Aktif");

        if (!aktif) {
          setSemesterAktif(null);
        } else {
          const tahun = tahunList.find((t) => t.id === aktif.tahun_ajaran_id);
          const labelTh = tahun ? tahun.tahun_ajaran : "Tahun tak dikenal";
          setSemesterAktif(`Semester ${aktif.semester} • ${labelTh} (Aktif)`);
        }

        setJumlahKelas(Array.isArray(kelasList) ? kelasList.length : 0);
        setJumlahSiswa(Array.isArray(siswaList) ? siswaList.length : 0);
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: "Semester",
      description: semesterAktif ?? "Semester Tidak Aktif",
      Icon: GraduationCap,
    },
    { title: "Jumlah Kelas", description: jumlahKelas, Icon: School },
    { title: "Jumlah Siswa", description: jumlahSiswa, Icon: User },
  ];

  return (
    <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, description, Icon }) => (
        <Card key={title} className="relative overflow-hidden rounded-xl border bg-white/90 shadow transition hover:shadow-lg">
          <div className="absolute -top-6 -left-6 h-24 w-24 rotate-45 bg-primary/10" />
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
              <Icon className="h-7 w-7 text-primary" />
            </span>
            <p className="text-1xl font-bold text-gray-800 text-center">{description}</p>
            <p className="text-sm font-medium text-gray-500 text-center tracking-wide">{title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CardUser;
