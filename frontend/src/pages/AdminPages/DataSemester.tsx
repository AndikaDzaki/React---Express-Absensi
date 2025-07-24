import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActionButtons from "@/components/ActionButtons";

import { SemesterForm, semesterSchema } from "@/schema/semester-schema";
import { getSemester, addSemester, updateSemester, deleteSemester } from "@/lib/semester-api";
import { getTahunAjaran } from "@/lib/tahunAjaran-api";

interface TahunItem {
  id: number;
  tahun_ajaran: string;
}

interface SemesterItem extends SemesterForm {
  id: number;
  tahun_ajaran: string;
}

const formatTanggal = (tanggal: string) => {
  return new Date(tanggal).toISOString().split("T")[0]; 
};

const DataSemester = () => {
  const [semesterList, setSemesterList] = useState<SemesterItem[]>([]);
  const [tahunList, setTahunList] = useState<TahunItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SemesterForm>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      tahun_ajaran_id: 0,
      semester: "",
      status: "Aktif",
      startDate: "",
      endDate: "",
    },
  });

  const fetchSemester = async () => {
    const semesterRes = await getSemester();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = semesterRes.data.map((item: any) => ({
      id: item.id,
      tahun_ajaran_id: item.tahun_ajaran_id,
      tahun_ajaran: item.tahun_ajaran,
      semester: item.semester,
      startDate: item.start_date,
      endDate: item.end_date,
      status: item.status,
    }));
    setSemesterList(mapped);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
       
        await fetchSemester();

        
        const tahunResponse = await getTahunAjaran();
        const tahunData: TahunItem[] = tahunResponse.data;

        
        setTahunList(tahunData);
      } catch (err) {
        toast.error("Gagal memuat data semester atau tahun ajaran");
        console.error("Error saat fetch data:", err);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: SemesterForm) => {
    try {
      if (editId !== null) {
        await updateSemester(editId, data);
        toast.success("Semester berhasil diperbarui!");
      } else {
        await addSemester(data);
        toast.success("Semester berhasil ditambahkan!");
      }

      await fetchSemester();
      setOpen(false);
      reset();
      setEditId(null);
    } catch (err) {
      toast.error("Gagal menyimpan data semester");
      console.error(err);
    }
  };

  const handleEdit = (item: SemesterItem) => {
    reset({
      tahun_ajaran_id: item.tahun_ajaran_id,
      semester: item.semester,
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
    });
    setEditId(item.id);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSemester(id);
      await fetchSemester();
      toast.success("Semester berhasil dihapus!");
    } catch (err) {
      toast.error("Gagal menghapus semester");
      console.error(err);
    }
  };

  const getTahunLabel = (id: number) => tahunList.find((t) => t.id === id)?.tahun_ajaran || "-";

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 ml-10 mr-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Data Semester</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                reset();
                setEditId(null);
              }}
            >
              Tambah Semester
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Semester" : "Tambah Semester"}</DialogTitle>
              <DialogDescription>Isi data dengan benar</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <Label htmlFor="tahun">Tahun Ajaran</Label>
              <select id="tahun" className="w-full border rounded px-3 py-2" {...register("tahun_ajaran_id", { valueAsNumber: true })}>
                <option value={0}>-- Pilih Tahun Ajaran --</option>
                {tahunList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tahun_ajaran}
                  </option>
                ))}
              </select>
              {errors.tahun_ajaran_id && <p className="text-red-500 text-sm">{errors.tahun_ajaran_id.message}</p>}

              <Label htmlFor="semester">Semester</Label>
              <Input id="semester" {...register("semester")} />
              {errors.semester && <p className="text-red-500 text-sm">{errors.semester.message}</p>}

              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}

              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}

              <Label htmlFor="status">Status</Label>
              <select id="status" className="w-full border rounded px-3 py-2" {...register("status")}>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}

              <Button className="mt-2 w-full" type="submit">
                {editId ? "Simpan Perubahan" : "Tambah"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>Daftar Semester</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Tahun Ajaran</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {semesterList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Belum ada data
              </TableCell>
            </TableRow>
          ) : (
            semesterList.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{getTahunLabel(item.tahun_ajaran_id)}</TableCell>
                <TableCell>{item.semester}</TableCell>
                <TableCell>{formatTanggal(item.startDate)}</TableCell>
                <TableCell>{formatTanggal(item.endDate)}</TableCell>
                <TableCell>{item.status}</TableCell>
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

export default DataSemester;
