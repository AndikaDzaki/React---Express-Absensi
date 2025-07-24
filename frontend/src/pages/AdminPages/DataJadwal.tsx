import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ActionButtons from "@/components/ActionButtons";
import { jadwalSchema, JadwalForm } from "@/schema/jadwalAdmin";
import { getJadwal, addJadwal, updateJadwal, deleteJadwal } from "@/lib/jadwal-api";
import { getGuru } from "@/lib/Api";
import { getKelas } from "@/lib/kelas-api";

interface GuruItem {
  id: number;
  namaGuru: string;
}

interface KelasItem {
  id: number;
  nama_kelas: string;
}

interface JadwalItem extends JadwalForm {
  id: number;
}

interface Libur {
  holiday_date: string;
  holiday_name: string;
  is_national_holiday: boolean;
}

const DataJadwal = () => {
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [liburList, setLiburList] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JadwalForm>({
    resolver: zodResolver(jadwalSchema),
    defaultValues: {
      id_guru: 0,
      id_kelas: 0,
      tanggal: "",
      jam_mulai: "",
      jam_selesai: "",
    },
  });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [jadwalRes, guruRes, kelasRes] = await Promise.all([getJadwal(), getGuru(), getKelas()]);
        setJadwalList(jadwalRes.data);
        setGuruList(guruRes.data);
        setKelasList(kelasRes.data);
      } catch (err) {
        console.error("Gagal ambil data dari API:", err);
        toast.error("Gagal mengambil data dari server");
      }

      try {
        const res = await fetch("https://api-harilibur.vercel.app/api");
        const data: Libur[] = await res.json();
        const liburTanggal = data.map((item) => item.holiday_date);
        setLiburList(liburTanggal);
      } catch (error) {
        console.error(error);
        toast.error("Gagal mengambil data hari libur nasional");
      }
    };

    loadAll();
  }, []);

  const onSubmit = async (data: JadwalForm) => {
    const hariArray = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const hariDipilih = hariArray[new Date(data.tanggal).getDay()];

    if (hariDipilih === "Minggu" || liburList.includes(data.tanggal)) {
      toast.warning("Tanggal yang dipilih adalah hari libur (Minggu atau libur nasional).");
      return;
    }

    try {
      if (editId !== null) {
        await updateJadwal(editId, data);
        toast.success("Jadwal berhasil diperbarui!");
      } else {
        await addJadwal(data);
        toast.success("Jadwal berhasil ditambahkan!");
      }

      const res = await getJadwal();
      setJadwalList(res.data);

      setOpen(false);
      reset();
      setEditId(null);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan jadwal");
    }
  };

  const handleEdit = (item: JadwalItem) => {
    reset({
      id_guru: item.id_guru,
      id_kelas: item.id_kelas,
      tanggal: item.tanggal,
      jam_mulai: item.jam_mulai,
      jam_selesai: item.jam_selesai,
    });
    setEditId(item.id);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteJadwal(id);
      const res = await getJadwal();
      setJadwalList(res.data);
      toast.success("Jadwal berhasil dihapus!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus jadwal");
    }
  };

  const getGuruLabel = (id: number) => guruList.find((g) => g.id === id)?.namaGuru || "Tidak Diketahui";
  const getKelasLabel = (id: number) => kelasList.find((k) => k.id === id)?.nama_kelas || "Tidak Diketahui";

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 ml-10 mr-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Data Jadwal</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                reset();
                setEditId(null);
              }}
            >
              Tambah Jadwal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
              <DialogDescription>Isi data dengan benar</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <Label>Guru</Label>
              <select {...register("id_guru", { valueAsNumber: true })} className="w-full border rounded px-3 py-2">
                <option value={0}>-- Pilih Guru --</option>
                {guruList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.namaGuru}
                  </option>
                ))}
              </select>
              {errors.id_guru && <p className="text-red-500 text-sm">{errors.id_guru.message}</p>}

              <Label>Kelas</Label>
              <select {...register("id_kelas", { valueAsNumber: true })} className="w-full border rounded px-3 py-2">
                <option value={0}>-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
              {errors.id_kelas && <p className="text-red-500 text-sm">{errors.id_kelas.message}</p>}

              <Label>Tanggal</Label>
              <Input type="date" {...register("tanggal" as const)} />
              {errors.tanggal && <p className="text-red-500 text-sm">{errors.tanggal.message}</p>}

              <Label>Jam Mulai</Label>
              <Input placeholder="HH:mm" {...register("jam_mulai" as const)} />
              {errors.jam_mulai && <p className="text-red-500 text-sm">{errors.jam_mulai.message}</p>}

              <Label>Jam Selesai</Label>
              <Input placeholder="HH:mm" {...register("jam_selesai" as const)} />
              {errors.jam_selesai && <p className="text-red-500 text-sm">{errors.jam_selesai.message}</p>}

              <Button className="mt-2 w-full" type="submit">
                {editId ? "Simpan Perubahan" : "Tambah"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>Daftar Jadwal</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Guru</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Jam Mulai</TableHead>
            <TableHead>Jam Selesai</TableHead>
            <TableHead>Aksi</TableHead>
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
                <TableCell>{item.jam_mulai}</TableCell>
                <TableCell>{item.jam_selesai}</TableCell>
                <TableCell>
                  <ActionButtons onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataJadwal;
