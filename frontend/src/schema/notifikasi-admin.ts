import {z} from "zod"

export const notifikasiSchema = z.object({
    id: z.number().optional(),
    message: z.string().min(1, "Pesan tidak boleh kosong"),
    category: z.enum(["Absensi", "Pengumuman", "lainnya"]),
    status: z.enum(["unread", "read"]),
    date : z.string().optional(),
    userId: z.number().optional(),
})

export type NotifikasiForm = z.infer<typeof notifikasiSchema>