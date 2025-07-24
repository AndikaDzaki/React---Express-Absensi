import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ActionButtons from "@/components/ActionButtons";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { tahunSchema, tahunFormSchema } from "@/schema/Tahun-Schema";
import { getTahunAjaran, addTahunAjaran, updateTahunAjaran, deleteTahunAjaran } from "@/lib/tahunAjaran-api";

export type StatusTahun = "Aktif" | "Tidak Aktif";

export interface TahunItem extends tahunFormSchema {
  id: number;
}

const TahunAjaranFormModal = ({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  editMode,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  defaultValues?: Partial<tahunFormSchema>;
  onSubmit: (values: tahunFormSchema) => void;
  editMode: boolean;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<tahunFormSchema>({
    resolver: zodResolver(tahunSchema),
    defaultValues: {
      tahun_ajaran: "",
      status: "Tidak Aktif",
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      tahun_ajaran: defaultValues?.tahun_ajaran ?? "",
      status: defaultValues?.status ?? "Tidak Aktif",
    });
  }, [defaultValues, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit" : "Tambah"} Tahun Ajaran</DialogTitle>
          <DialogDescription>Isi form tahun ajaran di bawah ini.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data);
            onOpenChange(false);
          })}
          className="space-y-4"
        >
          <div>
            <Input {...register("tahun_ajaran")} placeholder="Contoh: 2023/2024" />
            {errors.tahun_ajaran && <p className="text-sm text-red-500 mt-1">{errors.tahun_ajaran.message}</p>}
          </div>

          <div>
            <Select value={defaultValues?.status ?? "Tidak Aktif"} onValueChange={(val) => setValue("status", val as StatusTahun)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">{editMode ? "Simpan Perubahan" : "Tambah"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function DataAjaran() {
  const [data, setData] = useState<TahunItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<TahunItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getTahunAjaran();
      setData(res.data);
    } catch {
      toast.error("Gagal memuat data.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (values: tahunFormSchema) => {
    try {
      if (editMode && form) {
        await updateTahunAjaran(form.id, values);
        toast.success("Data berhasil diperbarui!");
      } else {
        await addTahunAjaran(values);
        toast.success("Data berhasil ditambahkan!");
      }
      fetchData();
      setIsOpen(false);
      setEditMode(false);
      setForm(null);
    } catch {
      toast.error("Gagal menyimpan data.");
    }
  };

  const handleEdit = (item: TahunItem) => {
    setForm(item);
    setEditMode(true);
    setIsOpen(true);
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    try {
      await deleteTahunAjaran(confirmDeleteId);
      toast.success("Data berhasil dihapus!");
      fetchData();
    } catch {
      toast.error("Gagal menghapus data.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const toggleStatus = async (id: number) => {
    const item = data.find((item) => item.id === id);
    if (!item) return;

    const newStatus: StatusTahun = item.status === "Aktif" ? "Tidak Aktif" : "Aktif";
    try {
      await updateTahunAjaran(id, {
        tahun_ajaran: item.tahun_ajaran,
        status: newStatus,
      });
      toast.success(`Status diubah menjadi ${newStatus}`);
      fetchData();
    } catch {
      toast.error("Gagal mengubah status.");
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 ml-10 mr-10">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Tahun Ajaran</h2>
        <Button
          onClick={() => {
            setForm(null);
            setEditMode(false);
            setIsOpen(true);
          }}
        >
          Tambah Tahun Ajaran
        </Button>
      </div>

      <TahunAjaranFormModal open={isOpen} onOpenChange={setIsOpen} defaultValues={form ?? { tahun_ajaran: "", status: "Tidak Aktif" }} onSubmit={handleSubmit} editMode={editMode} />

      {confirmDeleteId !== null && (
        <Dialog open={true} onOpenChange={() => setConfirmDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
            </DialogHeader>
            <p className="mb-4">Yakin ingin menghapus data ini?</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Ya, Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Table>
        <TableCaption className="text-gray-600 text-sm mb-2">Daftar Tahun Ajaran</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Tahun Ajaran</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Belum ada data
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.tahun_ajaran}</TableCell>
                <TableCell>
                  <Button variant={item.status === "Aktif" ? "default" : "outline"} size="sm" onClick={() => toggleStatus(item.id)}>
                    {item.status}
                  </Button>
                </TableCell>
                <TableCell>
                  <ActionButtons onEdit={() => handleEdit(item)} onDelete={() => setConfirmDeleteId(item.id)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
