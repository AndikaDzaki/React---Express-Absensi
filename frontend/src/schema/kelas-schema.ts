import {z} from "zod"

export const kelasSchema = z.object({
    nama_kelas: z.string().min(1, "Nama kelas wajib di isi"),
    id_guru: z.coerce.number().min(1, "Wali kelas harus dipilih!")
})

export type KelasFormData = z.infer<typeof kelasSchema> 