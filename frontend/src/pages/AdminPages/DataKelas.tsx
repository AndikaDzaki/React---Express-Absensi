import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import SearchBar from "@/components/SearchBar";
import ActionButtons from "@/components/ActionButtons";
import { searchByKeyword } from "@/lib/SearchHelper";

import { getKelas, addKelas, updateKelas, deleteKelas } from "@/lib/kelas-api";
import { getGuru } from "@/lib/Api";

import { kelasSchema, KelasFormData } from "@/schema/kelas-schema";

interface KelasItem extends KelasFormData {
  id: number;
  namaGuru?: string;
}

interface GuruItem {
  id: number;
  namaGuru: string;
}

interface RawKelas {
  id: number;
  nama_kelas: string;
  id_guru: number;
  guru?: {
    namaGuru: string;
  };
}

function DataKelas() {
  const [data, setData] = useState<KelasItem[]>([]);
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedKelas, setSelectedKelas] = useState<"all" | number>("all");

  const form = useForm<KelasFormData>({
    resolver: zodResolver(kelasSchema),
    defaultValues: {
      nama_kelas: "",
      id_guru: 0,
    },
  });

  const resetForm = () => {
    form.reset();
    setEditMode(false);
    setEditingId(null);
  };

  const fetchKelas = async () => {
    try {
      const res = await getKelas();
      const formatted = res.data.map((item: RawKelas): KelasItem => {
        return {
          id: item.id,
          nama_kelas: item.nama_kelas,
          id_guru: item.id_guru,
          namaGuru: item.guru?.namaGuru ?? "-",
        };
      });
      setData(formatted);
    } catch {
      toast.error("Gagal mengambil data kelas");
    }
  };

  const fetchGuru = async () => {
    try {
      const res = await getGuru();
      setGuruList(res.data);
    } catch {
      toast.error("Gagal mengambil data guru");
    }
  };

  useEffect(() => {
    fetchKelas();
    fetchGuru();
  }, []);

  const filteredData = searchByKeyword(data, keyword, ["nama_kelas", "namaGuru"]).filter((item) =>
    selectedKelas === "all" ? true : item.id === selectedKelas
  );

  const onSubmit = async (values: KelasFormData) => {
    try {
      if (editMode && editingId !== null) {
        await updateKelas(editingId, values);
        toast.success("Data kelas berhasil diperbarui");
      } else {
        await addKelas(values);
        toast.success("Data kelas berhasil ditambahkan");
      }
      await fetchKelas();
      setIsOpen(false);
      resetForm();
    } catch {
      toast.error("Gagal menyimpan data kelas");
    }
  };

  const handleEdit = (item: KelasItem) => {
    form.reset({
      nama_kelas: item.nama_kelas,
      id_guru: item.id_guru,
    });
    setEditingId(item.id);
    setEditMode(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteKelas(id);
      await fetchKelas();
      toast.success("Data kelas berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus data kelas");
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mt-6 mx-10">
      <div className="mb-4">
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
              Tambah Kelas
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle>
              <DialogDescription>Isi nama kelas dan pilih wali kelas sebelum menyimpan.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="nama_kelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kelas</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Kelas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="id_guru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wali Kelas</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Wali Kelas" />
                          </SelectTrigger>
                          <SelectContent>
                            {guruList.map((guru) => (
                              <SelectItem key={guru.id} value={guru.id.toString()}>
                                {guru.namaGuru}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                      {guruList.length === 0 && <p className="text-sm text-red-500 mt-1">Data guru belum tersedia. Tambahkan data guru terlebih dahulu.</p>}
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
      </div>

    
      <div className="flex items-center justify-between my-4 ">
        <SearchBar key="kelas-search" value={keyword} onChange={setKeyword} placeholder="Cari kelas atau nama wali kelas..." />
        <select
          value={selectedKelas}
          onChange={(e) =>
            setSelectedKelas(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="border rounded px-3 py-2"
        >
          <option value="all">Semua Kelas</option>
          {data.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama_kelas}
            </option>
          ))}
        </select>
      </div>

      <Table>
        <TableCaption>Daftar Kelas & Wali</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Kelas</TableHead>
            <TableHead>Wali Kelas</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Tidak ada data ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nama_kelas}</TableCell>
                <TableCell>{item.namaGuru}</TableCell>
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
}

export default DataKelas;