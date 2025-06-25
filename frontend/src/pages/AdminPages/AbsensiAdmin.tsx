import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import { searchByKeyword } from "@/lib/SearchHelper";
import { toast } from "sonner";
import ActionButtons from "@/components/ActionButtons";
import { absensiSchema, absensiForm } from "@/schema/absensi-admin";
import { addAbsensi, updateAbsensi, deleteAbsensi as apiDeleteAbsensi, getAbsensi, generateAbsensiHarian } from "@/lib/absensi-api";
import { getGuru } from "@/lib/Api";
import { getSiswa } from "@/lib/siswa-api";
import { getKelas } from "@/lib/kelas-api";
import { getSemester } from "@/lib/semester-api";
import { SemesterForm } from "@/schema/semester-schema";

interface KelasItem {
  id: number;
  nama_kelas: string;
  id_guru: number;
}

interface SiswaItem {
  id: number;
  nama: string;
  id_kelas: number;
}

interface AbsensiItem extends absensiForm {
  id: number;
}

interface GuruItem {
  id: number;
  namaGuru: string;
}

interface SemesterItem extends SemesterForm {
  id: number;
}

export default function Absensi() {
  const [absensi, setAbsensi] = useState<AbsensiItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [siswaList, setSiswaList] = useState<SiswaItem[]>([]);
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<KelasItem | null>(null);
  const [keyword, setKeyword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [semesterAktif, setSemesterAktif] = useState<SemesterItem | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<absensiForm>({
    resolver: zodResolver(absensiSchema),
    defaultValues: {
      id_siswa: 0,
      kelas_id: 0,
      status: "Hadir",
      tanggal: today,
    },
  });

  const selectedKelasId = watch("kelas_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSemester = await getSemester();
        const aktif = resSemester.data.find((s: SemesterItem) => s.status === "Aktif");
        if (!aktif) {
          toast.warning("Tidak ada semester aktif. Silakan aktifkan semester terlebih dahulu.");
          return;
        }
        setSemesterAktif(aktif);

        await generateAbsensiHarian();

        const [resGuru, resSiswa, resKelas, resAbsensi] = await Promise.all([getGuru(), getSiswa(), getKelas(), getAbsensi()]);

        setGuruList(resGuru.data);
        setSiswaList(resSiswa.data);
        setKelasList(resKelas.data);
        setAbsensi(resAbsensi.data);
      } catch (error) {
        toast.error("Gagal memuat data dari server");
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const getNamaGuruById = (id: number) => guruList.find((g) => g.id === id)?.namaGuru || "–";

  const tableData = useMemo(() => {
    const withLabel = absensi.map((a) => {
      const siswa = siswaList.find((s) => s.id === a.id_siswa);
      const kelas = kelasList.find((k) => k.id === a.kelas_id);
      return {
        ...a,
        nama: siswa?.nama || "–",
        nama_kelas: kelas?.nama_kelas || "–",
      };
    });

    const filtered = selectedKelas ? withLabel.filter((a) => a.kelas_id === selectedKelas.id) : withLabel;

    return searchByKeyword(filtered, keyword, ["nama", "nama_kelas", "status", "tanggal"]);
  }, [absensi, siswaList, kelasList, selectedKelas, keyword]);

  const openAddDialog = () => {
    reset({
      id_siswa: 0,
      kelas_id: kelasList.length > 0 ? kelasList[0].id : 0,
      status: "Hadir",
      tanggal: today,
    });
    setEditingId(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEditDialog = (item: AbsensiItem) => {
    reset(item);
    setEditingId(item.id);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const onSubmit = async (data: absensiForm) => {
    try {
      if (isEditing && editingId) {
        await updateAbsensi(editingId, data);
        toast.success("Data diperbarui");
      } else {
        await addAbsensi(data);
        toast.success("Data ditambahkan");
      }
      setDialogOpen(false);
      const res = await getAbsensi();
      setAbsensi(res.data);
    } catch (e) {
      toast.error("Gagal menyimpan absensi");
      console.error(e);
    }
  };

  const deleteAbsensi = async (id: number) => {
    try {
      await apiDeleteAbsensi(id);
      toast.success("Data absensi dihapus");
      const res = await getAbsensi();
      setAbsensi(res.data);
    } catch (error) {
      toast.error("Gagal menghapus absensi");
      console.error(error);
    }
  };

  const handleOpenDetail = (kelas: KelasItem) => {
    setSelectedKelas(kelas);
    setKeyword("");
  };

  if (!semesterAktif) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Absensi per Kelas</h1>
        <p className="text-red-600">Tidak ada semester aktif. Silakan aktifkan semester terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Absensi per Kelas</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kelas</TableHead>
            <TableHead>Wali Kelas</TableHead>
            <TableHead>Jumlah Siswa</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kelasList.map((kelas) => {
            const jumlah = siswaList.filter((s) => s.id_kelas === kelas.id).length;
            return (
              <TableRow key={kelas.id}>
                <TableCell>{kelas.nama_kelas}</TableCell>
                <TableCell>{getNamaGuruById(kelas.id_guru)}</TableCell>
                <TableCell>{jumlah}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenDetail(kelas)}>Lihat Detail</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedKelas && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Detail Absensi - {selectedKelas.nama_kelas}</h2>

          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <Button onClick={openAddDialog}>Tambah Absensi</Button>
            <SearchBar value={keyword} onChange={setKeyword} placeholder="Cari nama / status / tanggal" />
            <Button variant="ghost" onClick={() => setSelectedKelas(null)}>
              Kembali
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.tanggal}</TableCell>
                  <TableCell>{row.nama}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    <ActionButtons onEdit={() => openEditDialog(row)} onDelete={() => deleteAbsensi(row.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Absensi" : "Tambah Absensi"}</DialogTitle>
            <DialogDescription>Lengkapi data absensi siswa.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label>Kelas</label>
              <select {...register("kelas_id", { valueAsNumber: true })} className="border p-2 rounded w-full">
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
              {errors.kelas_id && <p className="text-red-500 text-sm">{errors.kelas_id.message}</p>}
            </div>

            <div>
              <label>Siswa</label>
              <select {...register("id_siswa", { valueAsNumber: true })} className="border p-2 rounded w-full">
                {siswaList
                  .filter((s) => s.id_kelas === selectedKelasId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
              </select>
              {errors.id_siswa && <p className="text-red-500 text-sm">{errors.id_siswa.message}</p>}
            </div>

            <div>
              <label>Tanggal</label>
              <input type="date" {...register("tanggal")} className="border p-2 rounded w-full" max={today} />
              {errors.tanggal && <p className="text-red-500 text-sm">{errors.tanggal.message}</p>}
            </div>

            <div>
              <label>Status</label>
              <select {...register("status")} className="border p-2 rounded w-full">
                {["Hadir", "Izin", "Sakit", "Alpa", "Belum", "Libur"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>

            <DialogFooter>
              <Button type="submit">{isEditing ? "Simpan" : "Tambah"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
