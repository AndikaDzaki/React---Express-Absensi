import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { siswaSchema, SiswaForm } from "@/schema/Siswa-Schema";
import SearchBar from "@/components/SearchBar";
import ActionButtons from "@/components/ActionButtons";
import { toast } from "sonner";
import { searchByKeyword } from "@/lib/SearchHelper";
import { getSiswa, addSiswa, updateSiswa, deleteSiswa } from "@/lib/siswa-api";
import { getKelas } from "@/lib/kelas-api";

interface SiswaItem extends SiswaForm {
  id: number;
  nama_kelas?: string;
}

interface KelasItem {
  id: number;
  nama_kelas: string;
}

function DataSiswa() {
  const [data, setData] = useState<SiswaItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");

  const form = useForm<SiswaForm>({
    resolver: zodResolver(siswaSchema),
    defaultValues: {
      nama: "",
      nisn: "",
      id_kelas: 0,
      noTelp: "",
      jenis_kelamin: "L" as "L" | "P",
    },
  });

  const fetchData = async () => {
    try {
      const res = await getSiswa();
      setData(res.data);
    } catch {
      toast.error("Gagal memuat data siswa");
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await getKelas();
      setKelasList(res.data);
    } catch {
      toast.error("Gagal memuat data kelas");
    }
  };

  useEffect(() => {
    fetchData();
    fetchKelas();
  }, []);

  const getNamaKelas = (id: number) => {
    return kelasList.find((k) => k.id === id)?.nama_kelas || "Tidak diketahui";
  };

  const filteredData = searchByKeyword(
    data.map((d) => ({ ...d, nama_kelas: getNamaKelas(d.id_kelas) })),
    keyword,
    ["nama", "nisn", "nama_kelas", "noTelp"]
  );

  const resetForm = () => {
    form.reset();
    setEditMode(false);
    setEditingId(null);
  };

  const onSubmit = async (values: SiswaForm) => {
    try {
      if (editMode && editingId !== null) {
        await updateSiswa(editingId, values);
        toast.success("Data siswa berhasil diperbarui");
      } else {
        await addSiswa(values);
        toast.success("Data siswa berhasil ditambahkan");
      }

      setIsOpen(false);
      resetForm();
      fetchData();
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleEdit = (item: SiswaItem) => {
    form.reset({
      nama: item.nama,
      nisn: item.nisn,
      id_kelas: item.id_kelas,
      noTelp: item.noTelp,
      jenis_kelamin: item.jenis_kelamin ?? "L",
    });
    setEditingId(item.id);
    setEditMode(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSiswa(id);
      toast.success("Data siswa berhasil dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 mx-10">
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
          >
            Tambah Siswa
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
            <DialogDescription>Isi nama, NISN, dan kelas siswa sebelum menyimpan.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nisn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NISN</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id_kelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelas</FormLabel>
                    <FormControl>
                      <select className="w-full border rounded px-3 py-2" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))}>
                        <option value={0}>Pilih Kelas</option>
                        {kelasList.map((kelas) => (
                          <option key={kelas.id} value={kelas.id}>
                            {kelas.nama_kelas}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jenis_kelamin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <FormControl>
                      <select className="w-full border rounded px-3 py-2" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)}>
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noTelp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Telepon</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">{editMode ? "Update" : "Simpan"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <SearchBar value={keyword} onChange={setKeyword} placeholder="Cari siswa..." />

      <Table>
        <TableCaption>Daftar Siswa</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>NISN</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Jenis Kelamin</TableHead>
            <TableHead>No. Telepon</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.nama}</TableCell>
              <TableCell>{item.nisn}</TableCell>
              <TableCell>{getNamaKelas(item.id_kelas)}</TableCell>
              <TableCell>{item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</TableCell>
              <TableCell>{item.noTelp}</TableCell>
              <TableCell>
                <ActionButtons onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataSiswa;
