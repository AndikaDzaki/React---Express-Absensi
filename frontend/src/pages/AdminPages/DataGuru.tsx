import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { searchByKeyword } from "@/lib/SearchHelper";
import SearchBar from "@/components/SearchBar";
import ActionButtons from "@/components/ActionButtons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guruSchema, GuruForm } from "@/schema/guru-schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { getGuru, addGuru, updateGuru, deleteGuru } from "@/lib/Api";

interface GuruItem extends GuruForm {
  id: number;
}

function DataGuru() {
  const [data, setData] = useState<GuruItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");

  const form = useForm<GuruForm>({
    resolver: zodResolver(guruSchema),
    defaultValues: {
      namaGuru: "",
      nik: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    fetchGuru();
  }, []);

  const fetchGuru = async () => {
    try {
      const res = await getGuru();
      setData(res.data);
    } catch {
      toast.error("Gagal mengambil data guru");
    }
  };

  const resetForm = () => {
    form.reset({
      namaGuru: "",
      nik: "",
      email: "",
      password: "",
    });
    setEditMode(false);
    setEditId(null);
  };

  const onSubmit = async (values: GuruForm) => {
    try {
      if (editMode && editId !== null) {
        await updateGuru(editId, values);
        toast.success("Data guru berhasil diperbarui.");
      } else {
        await addGuru(values);
        toast.success("Data guru berhasil ditambahkan.");
      }

      await fetchGuru();
      setIsOpen(false);
      resetForm();
    } catch {
      toast.error("Gagal menyimpan data guru.");
    }
  };

  const handleEdit = (item: GuruItem) => {
    form.reset({ ...item, password: "" }); 
    setEditId(item.id);
    setEditMode(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteGuru(id);
      toast.success("Data guru berhasil dihapus.");
      await fetchGuru();
    } catch {
      toast.error("Gagal menghapus data guru.");
    }
  };

  const filteredData = searchByKeyword(data, keyword, ["namaGuru", "email"]);

  return (
    <div>
      <div className="bg-white p-5 rounded-lg shadow-md mt-6 ml-10 mr-10">
        <div className="mb-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Tambah Guru</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Data Guru" : "Tambah Guru Baru"}</DialogTitle>
                <DialogDescription>Lengkapi seluruh kolom di bawah ini sebelum menyimpan.</DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="namaGuru"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Guru</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Guru" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NUPTK</FormLabel>
                        <FormControl>
                          <Input placeholder="NUPTK" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email Akun" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} />
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
        </div>

        <SearchBar value={keyword} onChange={setKeyword} placeholder="Cari nama atau email guru..." />

        <Table>
          <TableCaption>Daftar Guru & Akun</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>NUPTK</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.namaGuru}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.nik}</TableCell>
                <TableCell>
                  <ActionButtons onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataGuru;
