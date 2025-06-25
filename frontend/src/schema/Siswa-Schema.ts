
import {z} from "zod"

export const siswaSchema = z.object ({
    id : z.number().optional(), 
    nama: z.string().min(1, "Nama siswa harus diisi"),
    id_kelas: z.number().int().positive("Kelas harus dipilih"),
    nisn: z.string().min(10, "Nisn minimal 10 digit"),
    noTelp: z.string().min(10, "No telp minimal 10 digit").max(15, "No telp maksimal 15 digit").regex(/^[0-9]+$/, "No. telepon harus berupa angka"),
    jenis_kelamin: z.enum(["L", "P"])
});

export type SiswaForm = z.infer<typeof siswaSchema>;