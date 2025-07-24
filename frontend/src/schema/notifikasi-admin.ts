import { z } from "zod"

export const notifikasiSchema = z.object({
  id: z.number().optional(),
  jenis: z.enum(["Absensi", "Pengumuman", "lainnya", "guru", "absensi"]).optional(),
  pesan: z.string().min(1, "Pesan tidak boleh kosong"),
  tanggal: z.string().optional(),
  dibaca: z.boolean().optional(), 
})

export type NotifikasiForm = z.infer<typeof notifikasiSchema>
